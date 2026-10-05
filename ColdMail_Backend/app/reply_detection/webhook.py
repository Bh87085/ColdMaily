import email as email_lib
import json
import logging
import re
from datetime import datetime, timezone

import requests as http_requests
from fastapi import APIRouter, Request
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.reply_detection.reply_to import decode_mail_id
from app.home.mailHelper.reply_tracker import handle_detected_reply

logger = logging.getLogger(__name__)

router = APIRouter()


def _extract_reply_body(raw_content: str) -> str | None:
    """
    Parse the raw RFC 2822 email string from the SES payload and return
    the plain-text body. Falls back to HTML body if no plain-text part exists.
    """
    try:
        msg = email_lib.message_from_string(raw_content)
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain" and part.get("Content-Disposition") != "attachment":
                    return part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
        else:
            if msg.get_content_type() == "text/plain":
                return msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", errors="replace")
    except Exception as e:
        logger.warning(f"Failed to extract reply body: {e}")
    return None


@router.post("/webhooks/reply-inbound")
async def reply_inbound(request: Request):
    """
    AWS SNS webhook for inbound email replies routed via SES.

    SNS retries on any non-200 response, so we always return 200 and log
    errors internally rather than surfacing them as HTTP errors.

    Two SNS message types we handle:
    - SubscriptionConfirmation: auto-confirm by GETing the SubscribeURL
    - Notification: process the inbound email and mark reply detected
    """
    try:
        body = await request.json()
    except Exception:
        # Body may arrive as text/plain from SNS; try raw bytes fallback
        try:
            raw = await request.body()
            body = json.loads(raw)
        except Exception:
            logger.warning("Could not parse SNS webhook body")
            return {"status": "ok"}

    notification_type = body.get("Type")

    # ── SNS subscription confirmation ──────────────────────────────────────
    if notification_type == "SubscriptionConfirmation":
        subscribe_url = body.get("SubscribeURL")
        if subscribe_url:
            try:
                http_requests.get(subscribe_url, timeout=10)
                logger.info(f"Confirmed SNS subscription via: {subscribe_url}")
            except Exception as e:
                logger.error(f"Failed to confirm SNS subscription: {e}")
        return {"status": "ok"}

    if notification_type != "Notification":
        logger.debug(f"Ignoring SNS message type: {notification_type}")
        return {"status": "ok"}

    # ── Parse the SES notification inside the SNS wrapper ──────────────────
    try:
        message = json.loads(body.get("Message", "{}"))
    except Exception:
        logger.warning("Could not parse SNS Message field as JSON")
        return {"status": "ok"}

    # Build a lowercase header dict for easy lookup
    mail_headers: dict[str, str] = {
        h["name"].lower(): h["value"]
        for h in message.get("mail", {}).get("headers", [])
        if "name" in h and "value" in h
    }

    # ── Auto-reply guard ────────────────────────────────────────────────────
    # RFC 3834: auto-replies set Auto-Submitted to anything other than "no"
    auto_submitted = mail_headers.get("auto-submitted", "no").lower().strip()
    if auto_submitted != "no":
        logger.info(f"Ignoring auto-submitted inbound message (Auto-Submitted: {auto_submitted})")
        return {"status": "ok"}

    # ── Extract the reply+ token from the To header ────────────────────────
    to_header = mail_headers.get("to", "")
    # Handle both bare address and "Display Name <addr>" formats
    match = re.search(r"reply\+([\w.\-]+)@[\w.\-]+", to_header, re.IGNORECASE)
    if not match:
        logger.warning(f"No reply+ address found in To header: '{to_header}'")
        return {"status": "ok"}

    token = match.group(1).lower()
    logger.info(f"Inbound reply token: {token}")

    # ── Decode token → mail_id (HMAC verified, no DB lookup needed) ─────────
    mail_id = decode_mail_id(token)
    if mail_id is None:
        logger.warning(f"Invalid or tampered reply token: {token}")
        return {"status": "ok"}

    # ── Extract reply body from raw SES email content ───────────────────────
    reply_body = _extract_reply_body(message.get("content", ""))

    # ── Database work ───────────────────────────────────────────────────────
    db: Session = SessionLocal()
    try:
        handle_detected_reply(db=db, mail_id=mail_id, reply_time=datetime.now(timezone.utc), reply_body=reply_body)
    except Exception as e:
        logger.error(f"Error processing reply webhook: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

    return {"status": "ok"}
