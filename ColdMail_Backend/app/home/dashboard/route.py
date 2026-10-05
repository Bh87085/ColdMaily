import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user_id
from app.models import Mail, User, MailStatus
from app.home.dashboard.schemas import RecentMailOut, UpcomingMailOut

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/recent-mails", response_model=list[RecentMailOut])
def get_recent_mails(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):

    logger.info(f"Fetching recent mails for user_id={user_id}")

    mails = db.query(Mail).filter(
        Mail.user_id == user_id,
        Mail.status != MailStatus.scheduled
    ).order_by(Mail.updated_at.desc()).limit(5).all()

    logger.debug(f"Found {len(mails)} recent mails for user_id={user_id}")

    return [RecentMailOut.from_orm_model(mail) for mail in mails]

@router.get("/upcoming-mails", response_model=list[UpcomingMailOut])
def get_upcoming_mails(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):

    logger.info(f"Fetching upcoming mails for user_id={user_id}")

    mails = db.query(Mail).filter(
        Mail.user_id == user_id,
        Mail.upcoming_schedule_time != None,
        Mail.reply_received == False
    ).order_by(Mail.upcoming_schedule_time.asc()).limit(5).all()

    logger.debug(f"Found {len(mails)} upcoming mails for user_id={user_id}")

    return [UpcomingMailOut.from_orm_model(mail) for mail in mails]

@router.get("/mail-count")
def get_mail_statistics(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):

    logger.info(f"Fetching mail statistics for user_id={user_id}")

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        logger.warning(f"User with user_id={user_id} not found for mail statistics")
        return {"total_mails": 0, "follow_up_mails": 0}
    
    logger.debug(f"User {user.email} stats: total_mails={user.total_mail}, follow_up_mails={user.total_follow_up_mail}")

    return {
        "total_mails": user.total_mail,
        "follow_up_mails": user.total_follow_up_mail
    }
