from fastapi import APIRouter, Depends, BackgroundTasks
import json
from typing import List
from datetime import datetime, timedelta

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Campaign, Mail, CampaignStatus, MailStatus
from app.auth.dependencies import get_current_user_id, get_user_from_db
from app.helper.crypto_utils import decrypt_user_key, encrypt_content
from app.campaign.validations.request import validate_request
from app.campaign.validations.csv_structure import parse_and_validate_csv
from app.campaign.validations.template import validate_templates, render_template
from app.campaign.validations.rows import validate_rows
from app.home.sendmail.helper import send_scheduled_mail
from app.campaign.campaign_detail import get_campaign, get_mails_for_campaign, build_permissions, compute_runtime
from app.helper.crypto_utils import decrypt_content
import logging

logger = logging.getLogger(__name__)

PREVIEW_LIMIT = 3

router = APIRouter()

@router.post("/create")
async def create_campaign(
    name: str = Form(...),
    subject: str = Form(...),
    body: str = Form(...),
    no_of_follow_up: int = Form(0),
    category: str = Form("default"),
    follow_up_strategy: str = Form("standard"),
    file: UploadFile = File(...),
    is_attachment: bool = Form(False),
    attachments: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_id),
):
    logger.info(f"🚀 Creating campaign | user_id={current_user} | name={name}")

    # -----------------------
    # 2️⃣ Run validations
    # -----------------------
    try:
        logger.debug("🔎 Running request validation")
        validate_request(
            name=name,
            subject=subject,
            body=body,
            no_of_follow_up=no_of_follow_up,
        )

        logger.debug("📄 Reading and parsing CSV file")
        file_bytes = await file.read()
        headers, rows = parse_and_validate_csv(file_bytes)

        logger.info(f"📊 CSV parsed successfully | rows={len(rows)}")

        logger.debug("🧠 Validating templates")
        variables = validate_templates(subject, body, headers)

        logger.debug("🧪 Running row-level validation")
        validate_rows(rows, variables)

    except ValueError as e:
        logger.warning(f"❌ Validation failed | user_id={current_user} | error={e}")
        raise HTTPException(status_code=400, detail=e.args[0])

    # -----------------------
    # 4️⃣ Atomic DB transaction
    # -----------------------
    try:
        logger.debug("👤 Fetching user from DB")
        user = get_user_from_db(current_user, db)

        logger.debug("🔐 Decrypting user key")
        user_key = decrypt_user_key(user.encrypted_key)

        logger.info("🗂 Creating campaign record")

        campaign = Campaign(
            user_id=current_user,
            name=name,
            status=CampaignStatus.draft,
            subject=subject,
            body=encrypt_content(body, user_key),
            total_recipients=len(rows) if rows else 0,
            sent_count=0,
            pending_count=len(rows) if rows else 0,
            opened_count=0,
            replied_count=0,
            bounced_count=0,
        )

        db.add(campaign)
        db.flush()

        logger.info(f"📌 Campaign created | campaign_id={campaign.campaign_id}")

        mail_count = 0

        for row in rows:
            rendered_subject = render_template(subject, row)
            rendered_body = render_template(body, row)
            encrypted_body = encrypt_content(rendered_body, user_key)

            mail = Mail(
                user_id=current_user,
                campaign_id=campaign.campaign_id,
                to_email=row["email"],
                subject=rendered_subject,
                body=encrypted_body,
                mail_category=category,
                follow_up_strategy=follow_up_strategy,
                no_of_follow_up=no_of_follow_up,
                status=MailStatus.scheduled,
                created_at=datetime.utcnow(),
            )

            db.add(mail)
            mail_count += 1

        logger.info(f"✉ Created {mail_count} scheduled mails")

        db.commit()

        logger.info(f"✅ Campaign creation successful | campaign_id={campaign.campaign_id}")

    except Exception as e:
        logger.error(
            f"❌ Failed to create campaign | user_id={current_user} | error={str(e)}",
            exc_info=True,
        )
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create campaign",
        )

    # -----------------------
    # 5️⃣ Response
    # -----------------------
    return {
        "campaign_id": campaign.campaign_id,
        "state": "draft",
    }

@router.get("")
def list_campaigns(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.user_id == user_id)
        .order_by(Campaign.created_at.desc())
        .all()
    )

    response = []

    for campaign in campaigns:
        sent = campaign.sent_count or 0
        opened = campaign.opened_count or 0
        replied = campaign.replied_count or 0

        open_rate = (opened / sent * 100) if sent > 0 else 0
        reply_rate = (replied / sent * 100) if sent > 0 else 0

        response.append({
            "campaign_id": campaign.campaign_id,
            "name": campaign.name,
            "status": campaign.status,
            "total_recipients": campaign.total_recipients,
            "sent_count": sent,
            "pending_count": campaign.pending_count,
            "open_rate": round(open_rate, 2),
            "reply_rate": round(reply_rate, 2),
            "next_action": None,
            "throttle": campaign.throttle_per_day,
            "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
            # "updated_at": campaign.updated_at.isoformat() if campaign.updated_at else None,
        })

    return response

@router.get("/{campaign_id}")
def get_campaign_detail(
    campaign_id: str,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user_id),
):
    campaign = get_campaign(campaign_id, user_id, db)

    mail = get_mails_for_campaign(campaign_id, db)      # we need to optimize it coz calling all mails might be expensive db calls

    user = get_user_from_db(user_id, db)

    user_key = decrypt_user_key(user.encrypted_key)

    return {
        "campaign_id": campaign.campaign_id,
        "state": campaign.status,

        "permissions": build_permissions(campaign.status),

        "campaign": {
            "name": campaign.name,
            "category": mail.mail_category,
            "recipients_count": campaign.total_recipients,
            "no_of_follow_up": mail.no_of_follow_up,
            "follow_up_strategy": mail.follow_up_strategy,
        },

        "email": {
            "subject_template": campaign.subject,
            "subject_text_preview": mail.subject,
            "body_template": decrypt_content(campaign.body, user_key),
            "body_text_preview": decrypt_content(mail.body, user_key),
        },

        "runtime": compute_runtime(campaign),

        "validation": {
            "blocking_errors": [],
            "warnings": []
        },

        "meta": {
            "created_at": campaign.created_at.isoformat(),
            "updated_at": campaign.updated_at.isoformat(),
        }
    }

@router.post("/{campaign_id}/launch")
def launch_campaign(
    campaign_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user_id),
):
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.user_id == user_id,
        Campaign.status == CampaignStatus.draft
    ).first()

    if not campaign:
        raise HTTPException(404, "Campaign not found")

    campaign.status = CampaignStatus.running
    campaign.sending_started_at = datetime.utcnow()
    db.commit()

    mails = db.query(Mail).filter(
        Mail.campaign_id == campaign_id,
        Mail.status == MailStatus.scheduled
    ).all()

    send_at = datetime.utcnow()

    for mail in mails:
        mail.scheduled_for = send_at
        send_at += timedelta(seconds=30)

    db.commit()

    return {"message": "Campaign launched"}

@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user_id),
):
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id,
        Campaign.user_id == user_id
    ).first()

    if not campaign:
        raise HTTPException(404, "Campaign not found")

    db.delete(campaign)
    db.commit()

    return {"message": "Campaign deleted"}