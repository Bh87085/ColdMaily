from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from app.auth.routes import router as auth_router
from app.home.dashboard.route import router as dashboard_router
from app.home.sendmail.route import router as send_mail_router
from app.campaign.route import router as campaign_router
from app.utils.notifications.route import router as notifcations_router
from app.inbox.route import router as inbox_router
from app.utils.route import router as unsubscribe_router
from app.reply_detection.routes import router as reply_detection_router
from app.reply_detection.webhook import router as reply_webhook_router
from apscheduler.schedulers.background import BackgroundScheduler
from app.home.sendmail.followup_sender import send_due_followups
from app.home.mailHelper.reply_tracker_cron import auto_reply_checker
from app.home.sendmail.helper import push_scheduled_mails
from dotenv import load_dotenv
import os
from app.database import engine, Base, SessionLocal  # import your db setup
from app import models  # import models so tables are created

from app.logging_config import setup_logging
import logging

# Load environment variables
load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


setup_logging()
logger = logging.getLogger("coldmaily")

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://coldmaily.com",
        "https://www.coldmaily.com",
        "https://mango-cliff-038e72c00.1.azurestaticapps.net"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware (important for storing 'state')
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

# Create all tables in the DB (run once on startup)
Base.metadata.create_all(bind=engine)

# Dependency to get DB session in routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register routes
app.include_router(auth_router)

# dashboard api routes
app.include_router(dashboard_router, prefix="/dashboard")

# inbox send mail routers
app.include_router(send_mail_router)

# notifications router
app.include_router(notifcations_router)

# inbox mail routers
app.include_router(inbox_router)

# unsubcribe routes
app.include_router(unsubscribe_router)

# campaign routes
app.include_router(campaign_router, prefix="/campaign")

# reply detection: domain verification (protected) + SES inbound webhook (public, no auth)
app.include_router(reply_detection_router)
app.include_router(reply_webhook_router)

# Start scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(send_due_followups, 'interval', minutes=2, max_instances=1, coalesce=True, misfire_grace_time=30 )
# scheduler.add_job(auto_reply_checker, 'interval', minutes=15)
scheduler.add_job(push_scheduled_mails, 'interval', minutes=2, max_instances=1, coalesce=True, misfire_grace_time=30)
scheduler.start()

