from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Campaign, Mail, CampaignStatus, MailStatus

def get_campaign(campaign_id: int, user_id: int, db: Session):
    campaign = db.query(Campaign).filter(
        Campaign.campaign_id == campaign_id, 
        Campaign.user_id == user_id,
    ).first()

    if not campaign:
        raise HTTPException(404, "Campaign not found")
    
    return campaign

def get_mails_for_campaign(campaign_id: int, db:Session):
    mails = db.query(Mail).filter(
        Mail.campaign_id == campaign_id
    ).first()

    if not mails:
        raise HTTPException(404, "No mails found for this campaign")
    
    return mails

def build_permissions(campaign_status: CampaignStatus):
    permissions = {
        "can_edit": campaign_status == CampaignStatus.draft,
        "can_launch": campaign_status == CampaignStatus.draft,
        "can_pause": campaign_status == CampaignStatus.running,
        "can_resume": campaign_status == CampaignStatus.paused,
        "can_stop": campaign_status in [CampaignStatus.running, CampaignStatus.paused],
    }
    return permissions

def compute_runtime(campaign):
    if campaign.status == CampaignStatus.draft:
        return {
            "started_at": None,
            "completed_at": None,
            "sent_count": 0,
            "pending_count": 0,
            "opened_count": 0,
            "replied_count": 0,
            "bounced_count": 0,
            "next_scheduled_follow_up": None,
        }

    return {
        "started_at": campaign.sending_started_at.isoformat()
        if campaign.sending_started_at
        else None,

        "completed_at": campaign.sending_completed_at.isoformat()
        if campaign.sending_completed_at
        else None,

        "sent_count": campaign.sent_count or 0,
        "pending_count": campaign.pending_count or 0,
        "opened_count": campaign.opened_count or 0,
        "replied_count": campaign.replied_count or 0,
        "bounced_count": campaign.bounced_count or 0,
        "total_recipients": campaign.total_recipients or 0,
        "next_scheduled_follow_up": campaign.next_scheduled_follow_up.isoformat()
        if campaign.next_scheduled_follow_up
        else None,
    }


