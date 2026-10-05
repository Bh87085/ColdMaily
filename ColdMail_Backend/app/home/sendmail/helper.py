import logging
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal
from app.models import FollowUp, Mail, MailStatus, Subscriber, User, MailAttachment, Campaign, CampaignStatus
import secrets
from googleapiclient.errors import HttpError
from app.helper.ai import generate_followup
from app.helper.crypto_utils import encrypt_content
from sqlalchemy.orm import Session
from app.auth.gmail import send_initial_email
from app.auth.dependencies import ensure_valid_token, refresh_access_token
from app.helper.crypto_utils import decrypt_user_key, decrypt_content
from app.reply_detection.reply_to import generate_reply_to

logger = logging.getLogger(__name__)

from typing import List
import re


PREBUILT_STRATEGIES = {
    "standard": [2, 4, 7, 11, 16, 22, 30, 40, 55, 75]
}

def generate_delays(strategy: str, count: int) -> List[int]:

    if count <= 0:
        return []

    # 1️⃣ Handle prebuilt strategies
    if strategy in PREBUILT_STRATEGIES:
        return PREBUILT_STRATEGIES[strategy][:count]

    # 2️⃣ Handle dynamic strategies like every_1, every_2
    match = re.match(r"^every_(\d+)$", strategy)

    if match:
        interval = int(match.group(1))

        if interval <= 0:
            raise ValueError("Interval must be greater than 0")

        return [interval * i for i in range(1, count + 1)]

    # 3️⃣ Invalid strategy
    raise ValueError(f"Invalid follow-up strategy: {strategy}")

def generate_and_save_followups(
    mail_id: int,
    user_id: int,
    delays: list[int],
    number_of_followups: int,
    category: str,
    subject: str,
    body: str,
    user_key: str
):
    db = SessionLocal()
    try:
        logger.info(f"Generating {number_of_followups} follow-ups for mail_id={mail_id} user_id={user_id}")

        # Step 1: Generate follow-up messages
        messages = generate_followup(
            subject=subject,
            body=body,
            category=category,
            number_of_followups=number_of_followups
        )

        # Step 2: Validate counts
        if len(messages) != number_of_followups:
            raise ValueError(
                f"Expected {number_of_followups} follow-ups, but got {len(messages)} from GPT."
            )

        if len(delays) != number_of_followups:
            raise ValueError("Mismatch between number_of_followups and delays.")

        now = datetime.utcnow()

        # Step 3: Save each follow-up message
        for i in range(number_of_followups):
            encrypted_body = encrypt_content(messages[i], user_key)
            followup = FollowUp(
                user_id=user_id,
                mail_id=mail_id,
                follow_up_no=i + 1,
                follow_up_message=encrypted_body,
                status=MailStatus.scheduled,
                scheduled_for=now + timedelta(days=delays[i]),
                created_at=now,
                updated_at=now,
            )
            db.add(followup)
            logger.info(f"[FollowUp-{i+1}] Scheduled: {messages[i]}")

        db.commit()

        # Step 4: Update parent mail's next follow-up schedule
        if number_of_followups > 0:
            mail = db.query(Mail).filter(Mail.mail_id == mail_id).first()
            if mail:
                mail.upcoming_schedule_time = now + timedelta(days=delays[0])
                mail.upcoming_status = MailStatus.scheduled.value
                mail.updated_at = datetime.utcnow()
                db.commit()
                logger.info(f"Updated mail {mail_id} upcoming schedule to {mail.upcoming_schedule_time}")

    except Exception as e:
        db.rollback()
        logger.error(f"[FollowUp Error] {e}", exc_info=True)
    finally:
        db.close()

def check_or_create_subscriber(db: Session, user_id: int, to_email: str):
    """    
    Logic:
    - If subscriber exists and unsubscribed=True -> return can_send=False
    - If subscriber exists and unsubscribed=False -> return can_send=True
    - If subscriber does not exist -> create it with a token and return can_send=True
    """
    
    try:
        # Normalize email
        to_email = to_email.strip().lower()
        logger.debug(f"Checking subscriber for user_id={user_id}, email={to_email}")

        # Check if subscriber exists
        subscriber = db.query(Subscriber).filter_by(
            user_id=user_id,
            email=to_email
        ).first()
        
        if subscriber:
            if subscriber.unsubscribed:
                logger.info(f"Recipient {to_email} has unsubscribed. Cannot send email.")
                return {
                    "can_send": False,
                    "message": f"Cannot send email to {to_email} — recipient has unsubscribed."
                }
            else:
                logger.debug(f"Subscriber exists and is active: {subscriber.email}")
                return {
                    "can_send": True,
                    "subscriber": subscriber
                }
        else:
            # Create new subscriber
            token = secrets.token_urlsafe(16)
            user = db.query(User).filter(User.user_id == user_id).first()

            new_subscriber = Subscriber(
                user_id=user_id,
                email=to_email,
                sender_email=user.email,
                unsubscribe_token=token,
                unsubscribed=False,
                unsubscribed_at=None
            )
            db.add(new_subscriber)
            db.commit()
            db.refresh(new_subscriber)
            logger.info(f"Created new subscriber for {to_email} with token {token}")
            
            return {
                "can_send": True,
                "subscriber": new_subscriber
            }

    except Exception as e:
        logger.error(f"Error in check_or_create_subscriber: {e}", exc_info=True)
        raise

def stop_scheduled_unsubscribe_followups(db: Session, user_id: int, to_email: str):
    """
    Stops all scheduled follow-ups for a given user and email when they unsubscribe.
    """
    try:
        to_email = to_email.strip().lower()
        logger.info(f"Stopping scheduled follow-ups for user_id={user_id}, to email={to_email}")

        # Fetch mails sent to this email by the user
        mails = db.query(Mail).filter(
            Mail.user_id == user_id,
            Mail.to_email == to_email
        ).all()

        mail_ids = [mail.mail_id for mail in mails]

        if not mail_ids:
            logger.info(f"No mails found for user_id={user_id} and email={to_email}")
            return

        # Update follow-ups to cancelled
        updated_count = db.query(FollowUp).filter(
            FollowUp.mail_id.in_(mail_ids),
            FollowUp.status == MailStatus.scheduled
        ).update({FollowUp.status: MailStatus.blocked_by_unsubscribe}, synchronize_session=False)

        # Step 2: Set upcoming_schedule_time = None in Mail table
        updated_mails = db.query(Mail).filter(
            Mail.mail_id.in_(mail_ids)
        ).update({Mail.upcoming_schedule_time: None}, synchronize_session=False)

        db.commit()
        logger.info(f"Cancelled {updated_count} scheduled follow-ups for {to_email}")
        logger.info(f"Updated {updated_mails} upcoming_schedule_time to None in Mail table for {to_email}")

    except Exception as e:
        db.rollback()
        logger.error(f"Error in stop_scheduled_unsubscribe_followups: {e}", exc_info=True)
        raise

def push_scheduled_mails():
    db = SessionLocal()

    try:
        logger.info("[CRON] Checking for scheduled mails to send...")

        # 🔑 Step 1: find users with due mails
        active_user_ids = (
            db.query(Mail.user_id)
            .join(Campaign, Campaign.campaign_id == Mail.campaign_id)
            .filter(
                Mail.status == MailStatus.scheduled,
                Mail.scheduled_for <= datetime.now(timezone.utc),
                Campaign.status == CampaignStatus.running,
            )
            .distinct()
            .all()
        )

        active_user_ids = [row[0] for row in active_user_ids]

        logger.info(f"[CRON] Active users with due mails: {len(active_user_ids)}")

        # 🔑 Step 2: send ONE mail per user
        for user_id in active_user_ids:
            mail = (
                db.query(Mail)
                .filter(
                    Mail.user_id == user_id,
                    Mail.status == MailStatus.scheduled,
                    Mail.scheduled_for <= datetime.now(timezone.utc),
                )
                .order_by(Mail.scheduled_for)
                .first()
            )

            if not mail:
                continue

            logger.info(
                f"[CRON] Sending mail_id={mail.mail_id} for user_id={user_id}"
            )

            send_scheduled_mail(mail.mail_id)

    except Exception as e:
        logger.error(
            f"[CRON] Error in push_scheduled_mails: {e}",
            exc_info=True
        )
    finally:
        db.close()

def send_scheduled_mail(mail_id: int):
    db = SessionLocal()

    mail = db.query(Mail).filter(Mail.mail_id == mail_id).first()
    if not mail:
        return

    if mail.status != MailStatus.scheduled:
        return  # idempotency

    user = db.query(User).filter(User.user_id == mail.user_id).first()
    access_token = ensure_valid_token(user, db)

    # 🔍 Unsubscribe check
    sub_check = check_or_create_subscriber(
        db,
        user_id=user.user_id,
        to_email=mail.to_email
    )
    if not sub_check["can_send"]:
        mail.status = MailStatus.blocked_by_unsubscribe
        db.commit()
        return

    # 🔐 Decrypt content
    user_key = decrypt_user_key(user.encrypted_key)
    body = decrypt_content(mail.body, user_key)  # already encrypted → decrypt if needed

    unsubscribe_link = (
        f"https://coldmaily.com/preferences/"
        f"{sub_check['subscriber'].unsubscribe_token}"
    )

    # 🏷 Generate Reply-To address using mail_id as the unique identifier.
    reply_to = generate_reply_to(mail.mail_id, user)

    try:
        send_result = send_initial_email(
            access_token=access_token,
            sender_email=user.email,
            to_email=mail.to_email,
            subject=mail.subject,
            body=body + f"\n\nUnsubscribe: {unsubscribe_link}",
            attachments=[],  # attachments later
            attachment_filenames=[],
            reply_to=reply_to,
        )

    except HttpError as error:
        if error.status_code == 401:
            new_token = refresh_access_token(user.refresh_token)
            user.access_token = new_token
            db.commit()

            send_result = send_initial_email(
                access_token=new_token,
                sender_email=user.email,
                to_email=mail.to_email,
                subject=mail.subject,
                body=body,
                attachments=[],
                attachment_filenames=[],
                reply_to=reply_to,
            )
        else:
            mail.status = MailStatus.failed
            db.commit()
            return

    # ✅ Update mail state
    now = datetime.now(timezone.utc)
    mail.status = MailStatus.sent
    mail.sent_at = now
    mail.thread_id = send_result["thread_id"]
    mail.message_id = send_result["api_message_id"]
    mail.reply_to_address = reply_to
    mail.latest_message_id_header = send_result["generated_message_id_header"]
    mail.latest_references_header = send_result["generated_references_header"]

    user.total_mail += 1
    db.commit()

    follow_up_delays = generate_delays(mail.follow_up_strategy, mail.no_of_follow_up)

    if mail.no_of_follow_up > 0:
        generate_and_save_followups(
            mail_id=mail.mail_id,
            user_id=user.user_id,
            delays=follow_up_delays,                  
            number_of_followups=mail.no_of_follow_up,
            category=mail.mail_category,
            subject=mail.subject,
            body=body,
            user_key=user_key,
        )

