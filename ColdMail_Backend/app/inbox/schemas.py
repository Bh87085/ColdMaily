from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ✅ For main sent mail preview
class MailPreview(BaseModel):
    mail_id: int
    to_email: EmailStr
    subject: str
    body: str
    status: str
    sent_at: Optional[str] = None

    class Config:
        from_attributes = True


# ✅ For scheduled follow-up preview
class ScheduledFollowUpPreview(BaseModel):
    mail_id: int
    to_email: EmailStr
    subject: str
    body: str  # follow_up_message
    status: str
    scheduled_for: str

    class Config:
        from_attributes = True


# ✅ For sent follow-up preview
class SentFollowUpPreview(BaseModel):
    mail_id: int
    to_email: EmailStr
    subject: str
    body: str  # follow_up_message
    status: str
    sent_at: str

    class Config:
        from_attributes = True


# ✅ For the detailed info of follow up
class FollowUpPreview(BaseModel):
    followup_id: int
    follow_up_message: str
    status: str
    scheduled_for: str
    sent_at: str

    class Config:
        from_attributes = True


# ✅ For attachment preview
class AttachmentPreview(BaseModel):
    attachment_id: int
    filename: str
    mime_type: str
    size: int
    gmail_attachment_id: Optional[str] = None
    part_id: Optional[str] = None

    class Config:
        from_attributes = True


# ✅ For the detailed info of mails
class MailDetailResponse(BaseModel):
    mail_id: int
    to_email: EmailStr
    subject: str
    status: str
    sent_at: Optional[str] = None
    mail_category: Optional[str]
    follow_up_strategy: Optional[str]
    no_of_follow_up: int
    cur_follow_up: int
    message_id: Optional[str]
    body: str
    reply_body: Optional[str] = None
    followups: list[FollowUpPreview]
    attachments: list[AttachmentPreview]  # 📎 Added attachments here

    class Config:
        from_attributes = True


# ✅ For updated data of follow up
class FollowUpUpdate(BaseModel):
    follow_up_message: Optional[str] = None
    scheduled_for: Optional[datetime] = None
