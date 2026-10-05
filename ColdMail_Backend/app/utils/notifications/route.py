from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Notification, User
from app.utils.notifications.schemas import NotificationSchema
from app.auth.dependencies import get_current_user_id

router = APIRouter()

@router.get("/notifications", response_model=List[NotificationSchema])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user_id)
):
    """
    Fetch all notifications for the logged-in user, ordered by newest first.
    """
    return db.query(Notification).filter(
        Notification.user_id == current_user
    ).order_by(Notification.created_at.desc(), Notification.id.desc()).all()


@router.put("/notifications/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user_id)
):
    """
    Mark all unread notifications as read for the current user.
    """
    updated_count = db.query(Notification).filter(
        Notification.user_id == current_user,
        Notification.is_read == False
    ).update({Notification.is_read: True})

    db.commit()

    return {"message": f"{updated_count} notifications marked as read."}


@router.put("/notifications/{notification_id}/read")
def mark_single_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user_id)
):
    """
    Mark a specific notification as read.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if not notification.is_read:
        notification.is_read = True
        db.commit()

    return {"message": f"Notification {notification_id} marked as read."}


