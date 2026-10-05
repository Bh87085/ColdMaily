from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Subscriber
from datetime import datetime
import logging
from app.home.sendmail.helper import stop_scheduled_unsubscribe_followups

router = APIRouter()
logger = logging.getLogger(__name__)

@router.put("/unsubscribe/{token}", status_code=status.HTTP_200_OK)
def unsubscribe(token: str, db: Session = Depends(get_db)):
    """
    Endpoint to unsubscribe a subscriber using the token.
    """
    logger.info(f"Received unsubscribe request for token: {token}")
    
    # Fetch subscriber by token
    subscriber = db.query(Subscriber).filter(Subscriber.unsubscribe_token == token).first()
    
    if not subscriber:
        logger.warning(f"Unsubscribe failed: token {token} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid unsubscribe token."
        )
    
    if subscriber.unsubscribed:
        logger.info(f"Subscriber {subscriber.sender_email} already unsubscribed")
        return {"message": f"{subscriber.sender_email} is already unsubscribed."}
    
    # Update the unsubscribed status
    subscriber.unsubscribed = True
    subscriber.unsubscribed_at = datetime.utcnow()

    # Stop scheduled follow-ups
    stop_scheduled_unsubscribe_followups(db, subscriber.user_id, subscriber.email)
    
    db.commit()
    db.refresh(subscriber)
    
    logger.info(f"Subscriber {subscriber.sender_email} unsubscribed successfully at {subscriber.unsubscribed_at} by {subscriber.email}")
    
    return {"message": f"Your are unsubscribed successfully from {subscriber.sender_email}"}
