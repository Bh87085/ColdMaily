import logging
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Form, File, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from googleapiclient.errors import HttpError
from app.helper.crypto_utils import decrypt_user_key, encrypt_content
from app.database import get_db
from app.models import Mail, User, MailStatus, MailAttachment
from app.home.sendmail.schemas import SendMailRequest
from app.auth.dependencies import get_current_user_id, get_user_from_db, ensure_valid_token, refresh_access_token
from app.auth.gmail import send_initial_email
from app.home.sendmail.helper import generate_and_save_followups, check_or_create_subscriber, generate_delays
from app.reply_detection.reply_to import generate_reply_to

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send-mail")
async def send_mail(
    request: Request,
    background_tasks: BackgroundTasks,

    to_email: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    no_of_follow_up: int = Form(0),
    category: str = Form("default"),
    follow_up_strategy: str = Form("standard"),
    is_attachment: bool = Form(False),
    attachments: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):
    try:
        logger.info("🚀 Starting /send-mail")

        user_id = get_current_user_id(request)
        logger.debug(f"🔐 Retrieved user_id: {user_id}")

        user = get_user_from_db(user_id, db)
        logger.debug(f"👤 Fetched user from DB: {user.email}")

        access_token = ensure_valid_token(user, db)
        logger.debug("✅ Access token is valid")

        # 🔍 Check or create subscriber
        sub_check = check_or_create_subscriber(db, user_id=user_id, to_email=to_email)
        if not sub_check["can_send"]:
            logger.warning(f"❌ Cannot send: {sub_check['message']}")
            raise HTTPException(status_code=400, detail=sub_check["message"])

        subscriber = sub_check["subscriber"]
        unsubscribe_link = f"https://coldmaily.com/preferences/{subscriber.unsubscribe_token}"
        logger.debug(f"🔗 Unsubscribe link for recipient: {unsubscribe_link}")

        follow_up_delays = generate_delays(follow_up_strategy, no_of_follow_up)
        logger.debug(f"calculed follow-up delays : {follow_up_delays}")

        payload = SendMailRequest(
            to_email=to_email,
            subject=subject,
            body=body,
            no_of_follow_up=no_of_follow_up,
            follow_up_delays=follow_up_delays,
            category=category,
            follow_up_strategy=follow_up_strategy,
            is_attachment=is_attachment
        )
        logger.debug("📦 Form data parsed into SendMailRequest")

        # 📎 Handle attachments
        attachment_bytes = []
        attachment_filenames = []
        for file in attachments:
            content = await file.read()
            attachment_bytes.append(content)
            attachment_filenames.append(file.filename)
        logger.debug(f"📎 Received {len(attachments)} attachments")

        logger.debug(f"Encrypted key from DB: {user.encrypted_key}")
        user_key = decrypt_user_key(user.encrypted_key)

        logger.info("🔒 Encrypting email body...")
        encrypted_body = encrypt_content(payload.body, user_key)
        now = datetime.now(timezone.utc)

        # 💾 Flush Mail record first so we have mail_id before sending.
        # This lets us embed the mail_id into the Reply-To address without
        # a second round-trip after the Gmail API call.
        mail = Mail(
            user_id=user.user_id,
            to_email=payload.to_email,
            subject=payload.subject,
            body=encrypted_body,
            mail_category=payload.category,
            follow_up_strategy=payload.follow_up_strategy,
            status=MailStatus.scheduled,   # temporary — updated to sent below
            scheduled_for=None,
            cur_follow_up=0,
            no_of_follow_up=payload.no_of_follow_up,
            is_attachment=payload.is_attachment,
            created_at=now,
            updated_at=now,
        )
        db.add(mail)
        db.flush()   # populates mail.mail_id without committing
        logger.debug(f"📌 Mail flushed with ID: {mail.mail_id}")

        # 🏷 Generate Reply-To address using mail_id as identifier
        reply_to = generate_reply_to(mail.mail_id, user)
        logger.debug(f"📬 Reply-To: {reply_to}")

        # ✉️ Send the email
        try:
            logger.info("📤 Sending initial email...")
            send_result = send_initial_email(
                access_token=access_token,
                sender_email=user.email,
                to_email=payload.to_email,
                subject=payload.subject,
                body=payload.body + f"\n\n\nTo stop receiving further emails, manage your communication preferences here: {unsubscribe_link}",
                attachments=attachment_bytes,
                attachment_filenames=attachment_filenames,
                reply_to=reply_to,
            )
            logger.info("✅ Email sent successfully")

        except HttpError as error:
            if error.status_code == 401:
                logger.warning("🔁 Access token expired. Refreshing...")
                new_token = refresh_access_token(user.refresh_token)
                user.access_token = new_token
                # do not commit yet — stay in the same transaction

                logger.info("🔁 Retrying email send with new token...")
                send_result = send_initial_email(
                    access_token=new_token,
                    sender_email=user.email,
                    to_email=payload.to_email,
                    subject=payload.subject,
                    body=payload.body + f"\n\n\nTo stop receiving further emails, manage your communication preferences here: {unsubscribe_link}",
                    attachments=attachment_bytes,
                    attachment_filenames=attachment_filenames,
                    reply_to=reply_to,
                )
                logger.info("✅ Email sent on retry")
            else:
                logger.error(f"❌ Failed to send email: {error}")
                raise

        # ✏️ Update mail record with Gmail API results
        mail.status = MailStatus.sent
        mail.sent_at = now
        mail.thread_id = send_result["thread_id"]
        mail.message_id = send_result["api_message_id"]
        mail.reply_to_address = reply_to
        mail.latest_message_id_header = send_result["generated_message_id_header"]
        mail.latest_references_header = send_result["generated_references_header"]

        user.total_mail += 1

        db.commit()
        db.refresh(mail)
        logger.info(f"💾 Mail saved to DB with ID: {mail.mail_id}")

        # 💾 Save attachments metadata
        if attachments:
            for i, file in enumerate(attachments):
                attachment_meta = MailAttachment(
                    mail_id=mail.mail_id,
                    filename=file.filename,
                    mime_type=file.content_type,
                    size=len(attachment_bytes[i]),
                    gmail_attachment_id=None,
                    part_id=None,
                    message_id=send_result["api_message_id"]
                )
                db.add(attachment_meta)
            db.commit()

        # 🛠️ Schedule background follow-ups
        background_tasks.add_task(
            generate_and_save_followups,
            mail_id=mail.mail_id,
            user_id=user.user_id,
            delays=follow_up_delays,
            number_of_followups=payload.no_of_follow_up,
            category=payload.category,
            subject=payload.subject,
            body=payload.body,
            user_key=user_key
        )

        logger.info("✅ All done. Returning response.")
        return {"message": "Mail sent and saved", "mail_id": mail.mail_id}

    except HTTPException as http_exc:
        # ✅ Preserve original HTTP status (like 400 from unsubscribed)
        logger.warning(f"⚠️ HTTPException: {http_exc.status_code} - {http_exc.detail}")
        raise http_exc

    except Exception as e:
        # 🔴 Handle unexpected internal errors only
        logger.error(f"❌ Internal error occurred in /send-mail: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
