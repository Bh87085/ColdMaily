import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.auth.dependencies import get_current_user_id, get_user_from_db
from app.reply_detection.domain_verify import (
    verify_mx_record,
    save_verified_domain,
    initiate_ses_domain_verification,
    check_ses_domain_verified,
    SES_INBOUND_HOST,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reply-detection")


class DomainRequest(BaseModel):
    domain: str


@router.post("/setup-domain")
def setup_domain(
    body: DomainRequest,
    user_id: int = Depends(get_current_user_id),
):
    """
    Step 1 of domain onboarding.

    Registers the domain with AWS SES and returns the two DNS records
    the user needs to add in their registrar:
      - TXT record  → proves domain ownership to SES
      - MX record   → routes inbound replies into SES
    """
    try:
        txt_token = initiate_ses_domain_verification(body.domain)
    except Exception as e:
        logger.error(f"Failed to initiate SES verification for {body.domain}: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate domain verification with AWS SES")

    logger.info(f"Setup domain initiated | user_id={user_id} | domain={body.domain}")
    return {
        "domain": body.domain,
        "dns_records": [
            {
                "type": "TXT",
                "host": f"_amazonses.{body.domain}",
                "value": txt_token,
                "purpose": "Proves domain ownership to AWS SES",
            },
            {
                "type": "MX",
                "host": f"replies.{body.domain}",
                "value": SES_INBOUND_HOST,
                "priority": 10,
                "purpose": "Routes reply emails into AWS SES",
            },
        ],
    }


@router.post("/check-verification")
def check_verification(
    body: DomainRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Step 2 of domain onboarding. Call this after the user has added both DNS records.

    Checks:
      1. SES TXT verification (domain ownership confirmed by AWS)
      2. MX record points to SES inbound host

    If both pass, the domain is saved and reply tracking is enabled.
    """
    ses_verified = check_ses_domain_verified(body.domain)
    mx_verified = verify_mx_record(body.domain)

    logger.info(
        f"Verification check | user_id={user_id} | domain={body.domain} "
        f"| ses={ses_verified} | mx={mx_verified}"
    )

    if ses_verified and mx_verified:
        save_verified_domain(user_id, body.domain, db)

    return {
        "domain": body.domain,
        "ses_verified": ses_verified,
        "mx_verified": mx_verified,
        "ready": ses_verified and mx_verified,
    }


@router.post("/toggle")
def toggle_reply_tracking(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Toggle reply tracking on/off for the logged-in user.
    When disabling, domain and domain_verified are also cleared.
    """
    user = get_user_from_db(user_id, db)
    user.reply_tracking_enabled = not user.reply_tracking_enabled

    if not user.reply_tracking_enabled:
        user.domain = None
        user.domain_verified = False

    db.commit()
    logger.info(f"Reply tracking toggled | user_id={user_id} | enabled={user.reply_tracking_enabled}")
    return {"reply_tracking_enabled": user.reply_tracking_enabled}


@router.get("/domain-status")
def domain_status(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return the full reply tracking status for the logged-in user."""
    user = get_user_from_db(user_id, db)
    return {
        "reply_tracking_enabled": user.reply_tracking_enabled,
        "domain": user.domain,
        "domain_verified": user.domain_verified,
    }
