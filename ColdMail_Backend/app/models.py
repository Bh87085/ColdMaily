from datetime import datetime
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base
import enum
from sqlalchemy import Enum
from sqlalchemy.orm import relationship
import uuid
from sqlalchemy.dialects.postgresql import UUID

# ----------------------
# ENUM
# ----------------------
class MailStatus(enum.Enum):
    scheduled = "scheduled"
    sent = "sent"
    failed = "failed"
    blocked_by_reply = "blocked_by_reply"
    completed = "completed"
    replied = "replied"
    blocked_by_unsubscribe = "blocked_by_unsubscribe"
    stopped = "stopped"

# ----------------------
# CAMPAIGN ENUM
# ----------------------
class CampaignStatus(enum.Enum):
    draft = "draft"
    running = "running"
    paused = "paused"
    completed = "completed"


# ----------------------
# USER MODEL
# ----------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    total_mail = Column(Integer, default=0, nullable=False)
    total_follow_up_mail = Column(Integer, default=0, nullable=False)
    last_history_id = Column(String, nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    has_confirmed_consent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    encrypted_key = Column(String, nullable=True)
    # Reply tracking
    reply_tracking_enabled = Column(Boolean, default=False)  # user must opt in
    domain = Column(String, nullable=True)                   # custom domain (business users only)
    domain_verified = Column(Boolean, default=False)         # MX record confirmed

    # ✅ Relationships
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    mails = relationship("Mail", back_populates="user", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="user", cascade="all, delete-orphan")
    subscribers = relationship("Subscriber", back_populates="user", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="user", cascade="all, delete-orphan")

# ----------------------
# MAIL MODEL
# ----------------------
class Mail(Base):
    __tablename__ = "mails"

    mail_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.campaign_id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    to_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    mail_category = Column(String, nullable=True)
    follow_up_strategy = Column(String, nullable=True)
    status = Column(Enum(MailStatus, name="mail_status_enum"), nullable=False)
    scheduled_for = Column(DateTime)
    sent_at = Column(DateTime)
    opened = Column(Boolean, default=False)
    opened_at = Column(DateTime)
    reply_received = Column(Boolean, default=False)
    reply_received_at = Column(DateTime, nullable=True)
    reply_body = Column(Text, nullable=True)
    thread_id = Column(String)
    message_id = Column(String)
    reply_to_address = Column(String, nullable=True, unique=True, index=True)
    latest_message_id_header = Column(String, nullable=True)
    latest_references_header = Column(Text, nullable=True)
    upcoming_schedule_time = Column(DateTime)
    upcoming_status = Column(String)
    no_of_follow_up = Column(Integer, default=0)
    cur_follow_up = Column(Integer, default=0)
    is_attachment = Column(Boolean, default=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # ✅ Relationships
    user = relationship("User", back_populates="mails")
    followups = relationship("FollowUp", back_populates="mail", cascade="all, delete-orphan")
    attachments = relationship("MailAttachment", back_populates="mail", cascade="all, delete-orphan")
    campaign = relationship("Campaign", back_populates="mails")

# ----------------------
# FOLLOWUP MODEL
# ----------------------
class FollowUp(Base):
    __tablename__ = "followups"

    followup_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    mail_id = Column(Integer, ForeignKey("mails.mail_id"), nullable=False)
    follow_up_no = Column(Integer, nullable=False)
    follow_up_message = Column(Text, nullable=False)
    status = Column(Enum(MailStatus, name="mail_status_enum"), nullable=True)
    scheduled_for = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    message_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ✅ Relationships
    user = relationship("User", back_populates="followups")
    mail = relationship("Mail", back_populates="followups")

# ----------------------
# NOTIFICATION MODEL
# ----------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    message = Column(String, nullable=False)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# ----------------------
# Attachment Files MODEL
# ----------------------
class MailAttachment(Base):
    __tablename__ = "mail_attachments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mail_id = Column(Integer, ForeignKey("mails.mail_id", ondelete="CASCADE"), nullable=False)

    filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)

    gmail_attachment_id = Column(String, nullable=True)  # Gmail API attachmentId
    part_id = Column(String, nullable=True)              # Gmail API partId
    message_id = Column(String, nullable=False)           # Gmail messageId

    # Relationship to Mail
    mail = relationship("Mail", back_populates="attachments")

# ----------------------
# Unsubscribe Mails MODEL
# ----------------------

class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    sender_email = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    unsubscribe_token = Column(String, unique=True, nullable=False, index=True)
    unsubscribed = Column(Boolean, default=False, nullable=False)
    unsubscribed_at = Column(DateTime, nullable=True)

    # relationship with User
    user = relationship("User", back_populates="subscribers")

# ----------------------
# CAMPAIGN MODEL
# ----------------------
class Campaign(Base):
    __tablename__ = "campaigns"

    campaign_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(Enum(CampaignStatus, name="campaign_status_enum"), nullable=False, default=CampaignStatus.draft)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    # 🟢 Aggregated Counters (Dashboard Optimization)
    total_recipients = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    pending_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    replied_count = Column(Integer, default=0)
    bounced_count = Column(Integer, default=0)
    # 🟢 Scheduling / Throttle
    throttle_per_day = Column(Integer, default=50)
    next_scheduled_follow_up = Column(DateTime(timezone=True), nullable=True)
    # 🟢 Meta
    sending_started_at = Column(DateTime, nullable=True)
    sending_completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ✅ Relationships
    user = relationship("User", back_populates="campaigns")
    mails = relationship("Mail", back_populates="campaign", cascade="all, delete-orphan")
