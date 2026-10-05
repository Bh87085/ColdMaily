import logging
from app.models import User
from app.database import SessionLocal
from app.auth.gmail import check_gmail_history_for_user

logger = logging.getLogger(__name__)

def auto_reply_checker():
    logger.info("Starting auto reply checker for all users.")
    db = SessionLocal()
    try:
        users = db.query(User).all()
        logger.info(f"Found {len(users)} users to check.")
        for user in users:
            check_gmail_history_for_user(user, db)
        logger.info("Completed auto reply check for all users.")
    except Exception as e:
        logger.error(f"[ReplyChecker Error] {e}", exc_info=True)
    finally:
        db.close()
