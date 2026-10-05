import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models import Mail, MailStatus, FollowUp, Notification, User
from app.helper.crypto_utils import encrypt_content, decrypt_user_key

logger = logging.getLogger(__name__)


def handle_detected_reply(db: Session, mail_id: int, reply_time: datetime, reply_body: Optional[str] = None) -> None:
    """
    Core reply handler. Marks the mail as replied, cancels all scheduled
    follow-ups, and creates a notification for the user.

    Called by both the Gmail polling cron (gmail.py) and the SES inbound
    webhook (webhook.py). Callers are responsible for any pre-validation
    (sender check, reply-time check, etc.) before calling this.
    """
    mail = db.query(Mail).filter(Mail.mail_id == mail_id).first()
    if not mail:
        logger.warning(f"No mail record found for mail_id={mail_id}")
        return

    if mail.reply_received:
        logger.info(f"Reply already recorded for mail_id={mail_id}; skipping")
        return

    mail.reply_received = True
    mail.reply_received_at = reply_time
    mail.status = MailStatus.replied.value
    mail.updated_at = reply_time
    if reply_body:
        user = db.query(User).filter(User.user_id == mail.user_id).first()
        user_key = decrypt_user_key(user.encrypted_key)
        mail.reply_body = encrypt_content(reply_body, user_key)
    logger.info(f"Marked mail_id={mail_id} as replied")

    cancelled = db.query(FollowUp).filter(
        FollowUp.mail_id == mail_id,
        FollowUp.status == MailStatus.scheduled.value,
    ).update(
        {FollowUp.status: MailStatus.blocked_by_reply.value},
        synchronize_session=False,
    )
    logger.info(f"Cancelled {cancelled} follow-up(s) for mail_id={mail_id}")

    db.add(Notification(
        user_id=mail.user_id,
        message=f"🎉 Reply received from {mail.to_email}. Pending follow-ups have been cancelled.",
        link=f"/mails/{mail.mail_id}",
    ))

    db.commit()
    logger.info(f"Reply processing complete | mail_id={mail_id}")
