import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user_id, get_user_from_db
from app.models import User, MailStatus, Mail, FollowUp
from app.inbox.schemas import (
    MailPreview, ScheduledFollowUpPreview, SentFollowUpPreview, FollowUpPreview,
    MailDetailResponse, FollowUpUpdate, AttachmentPreview
)
from app.helper.crypto_utils import decrypt_content, decrypt_user_key, encrypt_content
from app.utils.serializer import serialize_datetime

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/mails", response_model=list[MailPreview])
def get_my_mails(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        logger.info(f"Fetching mails for user_id={user_id}")
        user = get_user_from_db(user_id, db)

        user_key = decrypt_user_key(user.encrypted_key)
        sorted_mails = sorted(user.mails, key=lambda m: m.sent_at or m.created_at, reverse=True)
        logger.info(f"Found {len(sorted_mails)} mails for user_id={user_id}")

        return [
            MailPreview(
                mail_id=mail.mail_id,
                to_email=mail.to_email,
                subject=mail.subject,
                body=decrypt_content(mail.body, user_key),
                status=mail.status.value,
                sent_at = serialize_datetime(mail.sent_at)
            )
            for mail in sorted_mails
        ]

    except Exception as e:
        logger.error(f"Error fetching mails for user_id={user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mails/scheduled-followups", response_model=list[ScheduledFollowUpPreview])
def get_scheduled_mails(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        logger.info(f"Fetching scheduled follow-ups for user_id={user_id}")
        user = get_user_from_db(user_id, db)

        user_key = decrypt_user_key(user.encrypted_key)

        scheduled_mails = []
        for mail in user.mails:
            if mail.status.value in {MailStatus.replied, MailStatus.completed}:
                continue

            for followup in mail.followups:
                if followup.status == MailStatus.scheduled:
                    scheduled_mails.append(ScheduledFollowUpPreview(
                        mail_id=mail.mail_id,
                        to_email=mail.to_email,
                        subject=mail.subject,
                        body=decrypt_content(followup.follow_up_message, user_key),
                        status=followup.status.value,
                        scheduled_for=followup.scheduled_for.isoformat() + "Z"
                    ))

        scheduled_mails.sort(key=lambda x: x.scheduled_for)
        logger.info(f"Returning {len(scheduled_mails)} scheduled follow-ups for user_id={user_id}")

        return scheduled_mails

    except Exception as e:
        logger.error(f"Error fetching scheduled follow-ups for user_id={user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mails/sent-followups", response_model=list[SentFollowUpPreview])
def get_sent_followups(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        logger.info(f"Fetching sent follow-ups for user_id={user_id}")
        user = get_user_from_db(user_id, db)

        user_key = decrypt_user_key(user.encrypted_key)

        sent_followups = []
        for mail in user.mails:
            for followup in mail.followups:
                if followup.status == MailStatus.sent:
                    sent_followups.append(SentFollowUpPreview(
                        mail_id=mail.mail_id,
                        to_email=mail.to_email,
                        subject=mail.subject,
                        body=decrypt_content(followup.follow_up_message, user_key),
                        status=followup.status.value,
                        sent_at=followup.sent_at.isoformat() + "Z"
                    ))

        sent_followups.sort(key=lambda f: f.sent_at or f.created_at, reverse=True)
        logger.info(f"Returning {len(sent_followups)} sent follow-ups for user_id={user_id}")

        return sent_followups

    except Exception as e:
        logger.error(f"Error fetching sent follow-ups for user_id={user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mails/{mail_id}", response_model=MailDetailResponse)
def get_mail_detail(mail_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        logger.info(f"Fetching mail detail mail_id={mail_id} for user_id={user_id}")
        user = get_user_from_db(user_id, db)

        user_key = decrypt_user_key(user.encrypted_key)
        mail = next((m for m in user.mails if m.mail_id == mail_id), None)

        if not mail:
            logger.warning(f"Mail id={mail_id} not found for user_id={user_id}")
            raise HTTPException(status_code=404, detail="Mail not found")

        attachments_meta = mail.attachments

        logger.info(f"Returning detail of mail_id={mail_id} for user_id={user_id}")
        return MailDetailResponse(
            mail_id=mail.mail_id,
            to_email=mail.to_email,
            subject=mail.subject,
            status=mail.status.value,
           sent_at = serialize_datetime(mail.sent_at),
            mail_category=mail.mail_category,
            follow_up_strategy=mail.follow_up_strategy,
            no_of_follow_up=mail.no_of_follow_up,
            cur_follow_up=mail.cur_follow_up,
            message_id=mail.message_id,
            body=decrypt_content(mail.body, user_key),
            reply_body=decrypt_content(mail.reply_body, user_key) if mail.reply_body else None,
            followups=[
                FollowUpPreview(
                    followup_id=f.followup_id,
                    follow_up_message=decrypt_content(f.follow_up_message, user_key),
                    status=f.status.value,
                    scheduled_for=f.scheduled_for.isoformat() + "Z",
                    sent_at=f.sent_at.isoformat() + "Z" if f.sent_at else "None"
                )
                for f in sorted(
                    mail.followups,
                    key=lambda x: x.scheduled_for or x.sent_at or x.created_at
                )
            ],
            attachments=[
                AttachmentPreview(
                    attachment_id=a.id,
                    filename=a.filename,
                    mime_type=a.mime_type,
                    size=a.size
                )
                for a in attachments_meta
            ]
        )

    except Exception as e:
        logger.error(f"Error fetching mail detail mail_id={mail_id} user_id={user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/mails/followup/{followup_id}")
def update_follow_up(followup_id: int, update_data: FollowUpUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    try:
        logger.info(f"User {user_id} requested update on follow-up {followup_id}")
        followup = db.query(FollowUp).filter(FollowUp.followup_id == followup_id).first()
        user = get_user_from_db(user_id, db)

        if not followup:
            logger.warning(f"Follow-up {followup_id} not found")
            raise HTTPException(status_code=404, detail="Follow-up not found")

        if followup.user_id != user_id:
            logger.warning(f"User {user_id} unauthorized to update follow-up {followup_id}")
            raise HTTPException(status_code=403, detail="You are not authorized to update this follow-up")

        if followup.status != MailStatus.scheduled:
            logger.warning(f"Follow-up {followup_id} update attempted but status is {followup.status}")
            raise HTTPException(status_code=400, detail="Follow-up can only be updated when status is 'scheduled'")

        user_key = decrypt_user_key(user.encrypted_key)
        encrypted_body_follow_up = encrypt_content(update_data.follow_up_message, user_key)

        if update_data.follow_up_message is not None:
            followup.follow_up_message = encrypted_body_follow_up
        if update_data.scheduled_for is not None:
            followup.scheduled_for = update_data.scheduled_for

        db.commit()
        db.refresh(followup)

        logger.info(f"Follow-up {followup_id} updated successfully for user {user_id}")
        return {
            "message": "Follow-up updated successfully",
            "followup_id": followup.followup_id
        }

    except Exception as e:
        logger.error(f"Error updating follow-up {followup_id} for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mails/stop-followups/{mail_id}")
def stop_followups(mail_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    try:
        logger.info(f"🛑 Request received to stop follow-ups for mail_id={mail_id}, user_id={user_id}")

        # 1️⃣ Verify user exists
        user = get_user_from_db(user_id, db)

        # 2️⃣ Check mail ownership
        mail = db.query(Mail).filter(
            Mail.mail_id == mail_id,
            Mail.user_id == user.user_id
        ).first()

        if not mail:
            logger.warning(f"❌ Unauthorized or mail not found for mail_id={mail_id}, user_id={user.user_id}")
            raise HTTPException(status_code=404, detail="Mail not found or access denied")

        # 3️⃣ Stop all scheduled follow-ups for that mail
        updated_count = db.query(FollowUp).filter(
            FollowUp.mail_id == mail_id,
            FollowUp.status == MailStatus.scheduled
        ).update(
            {FollowUp.status: MailStatus.stopped},
            synchronize_session=False
        )

        # 4️⃣ Reset upcoming_schedule_time in Mail table
        mail.upcoming_schedule_time = None
        db.commit()

        logger.info(f"✅ Stopped {updated_count} follow-ups for mail_id={mail_id} by user_id={user.user_id}")

        return {
            "message": f"Stopped {updated_count} follow-ups",
            "mail_id": mail_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error while stopping follow-ups for mail_id={mail_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
