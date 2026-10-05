from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models import Mail, MailStatus  # Assuming this is your ORM model

class RecentMailOut(BaseModel):
    mail_id: int
    subject: str
    email: str
    status: str
    time: str

    @classmethod
    def from_orm_model(cls, mail: Mail):
        return cls(
            mail_id=mail.mail_id,
            subject=mail.subject,
            email=mail.to_email,
            status = mail.status or "unknown",
            time=mail.updated_at.isoformat() + "Z" if mail.updated_at else ""
        )


class UpcomingMailOut(BaseModel):
    mail_id: int
    subject: str
    email: str
    status: str
    time: str

    @classmethod
    def from_orm_model(cls, mail: Mail):
        return cls(
            mail_id=mail.mail_id,
            subject=mail.subject,
            email=mail.to_email,
            status = mail.upcoming_status or "unknown",
            time=mail.upcoming_schedule_time.isoformat() + "Z" if mail.upcoming_schedule_time else ""
        )
