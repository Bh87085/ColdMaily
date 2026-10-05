from sqlalchemy.orm import Session
from app.models import Notification

def create_notification(db: Session, user_id: int, message: str, link: str = None):
    notification = Notification(user_id=user_id, message=message, link=link)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
