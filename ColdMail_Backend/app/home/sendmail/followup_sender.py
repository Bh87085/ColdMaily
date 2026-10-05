import logging
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models import FollowUp, Mail, User, MailStatus, Notification
from app.auth.gmail import send_follow_up_email
from app.auth.dependencies import ensure_valid_token
from app.helper.crypto_utils import decrypt_content, decrypt_user_key, encrypt_content

logger = logging.getLogger(__name__)

def send_due_followups():
    logger.info(f"[CRON] Follow-up scheduler running at {datetime.now(timezone.utc)}")
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        logger.info(f"[CRON] Current UTC Time: {now}")

        # Fetch all due follow-ups
        followups = db.query(FollowUp).filter(
            FollowUp.scheduled_for <= now,
            FollowUp.status == MailStatus.scheduled
        ).all()
        
        logger.info(f"[CRON] Follow-ups due now: {len(followups)}")

        for followup in followups:
            logger.info(f"[CRON] Processing follow-up ID: {followup.followup_id}")

            # Fetch mail & user info
            mail = db.query(Mail).filter(Mail.mail_id == followup.mail_id).first()
            user = db.query(User).filter(User.user_id == followup.user_id).first()

            user_key = decrypt_user_key(user.encrypted_key)

            if not mail or not user:
                logger.error(f"[CRON] ❌ Mail or User not found for FollowUp ID: {followup.followup_id}")
                continue

            if not mail.latest_message_id_header or not mail.latest_references_header:
                logger.warning(
                    f"[CRON] ⚠️ Skipped Follow-up ID {followup.followup_id}: "
                    "Missing latest_message_id_header or latest_references_header in Mail record."
                )
                continue

            # Re-use the same Reply-To address from the initial send so any
            # reply to a follow-up is also routed through our webhook.
            reply_to = mail.reply_to_address

            logger.info(f"[CRON] Sending follow-up to: {mail.to_email}")
            logger.info(f"[CRON] Using thread ID: {mail.thread_id}, In-Reply-To Header: {mail.latest_message_id_header}")
            logger.info(f"[CRON] Using References Header: {mail.latest_references_header}")

            try:
                access_token = ensure_valid_token(user, db)

                result = send_follow_up_email(
                    access_token=access_token,
                    sender_email=user.email,
                    to_email=mail.to_email,
                    subject=mail.subject,
                    body=decrypt_content(followup.follow_up_message, user_key),
                    gmail_api_thread_id=mail.thread_id,
                    in_reply_to_message_id_header=mail.latest_message_id_header,
                    previous_references_header=mail.latest_references_header,
                    reply_to=reply_to,
                )

                followup.status = MailStatus.sent
                followup.sent_at = datetime.now(timezone.utc)
                followup.message_id = result["api_message_id"]

                mail.latest_message_id_header = result["generated_message_id_header"]
                mail.latest_references_header = result["generated_references_header"]
                mail.cur_follow_up += 1
                mail.updated_at = datetime.now(timezone.utc)
                user.total_follow_up_mail += 1

                if mail.cur_follow_up == mail.no_of_follow_up:
                    mail.status = MailStatus.completed  # or whatever final status you use
                    mail.upcoming_status = MailStatus.completed.value
                    mail.upcoming_schedule_time = None
                
                else:
                    # ✅ Fetch the next follow-up for this mail
                    logger.info(
                        f"[CRON] Looking for next follow-up for Mail ID: {mail.mail_id}, "
                        f"excluding FollowUp ID: {followup.followup_id}"
                    )

                    next_followup = (
                        db.query(FollowUp)
                        .filter(
                            FollowUp.mail_id == mail.mail_id,
                            FollowUp.followup_id != followup.followup_id,
                            FollowUp.status == MailStatus.scheduled
                        )
                        .order_by(FollowUp.scheduled_for.asc())
                        .first()
                    )

                    if next_followup:
                        logger.info(
                            f"[CRON] ✅ Next follow-up found: ID={next_followup.followup_id}, "
                            f"scheduled_for={next_followup.scheduled_for}"
                        )
                        mail.upcoming_status = MailStatus.scheduled.value
                        mail.upcoming_schedule_time = next_followup.scheduled_for
                        logger.info(
                            f"[CRON] Mail {mail.mail_id} updated with upcoming_schedule_time={mail.upcoming_schedule_time}, "
                            f"status={mail.upcoming_status}"
                        )
                    else:
                        logger.info(
                            f"[CRON] ⚠️ No more scheduled follow-ups for Mail ID: {mail.mail_id}"
                        )
                        mail.upcoming_status = MailStatus.completed.value
                        mail.upcoming_schedule_time = None


                notification = Notification(
                    user_id=user.user_id,
                    message=f"✅ Follow-up {followup.follow_up_no} to {mail.to_email} sent successfully",
                    link=f"/mails/{mail.mail_id}"
                )

                db.add(notification)

                db.commit()

                logger.info(f"[CRON] ✅ Follow-up sent successfully. Gmail API Msg ID: {result['api_message_id']}")
                logger.info(f"[CRON] Mail record updated with new latest headers: Msg ID Header: {mail.latest_message_id_header}")

            except Exception as send_error:
                logger.error(f"[CRON] ❌ Failed to send follow-up ID {followup.followup_id}: {send_error}")

                followup.status = MailStatus.failed
                followup.updated_at = datetime.now(timezone.utc)

                db.add(Notification(
                    user_id=user.user_id,
                    message=f"❌ Failed to send follow-up {followup.follow_up_no} to {mail.to_email}",
                    link=f"/mails/{mail.mail_id}"
                ))

                db.commit()

    except Exception as e:
        logger.error(f"[CRON] ❌ Global Error in Follow-Up Scheduler: {e}")
        db.rollback()
    finally:
        db.close()
        logger.info("[CRON] Scheduler execution finished.\n")
