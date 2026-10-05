from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.models import User
import os, requests
from dotenv import load_dotenv
from app.database import SessionLocal
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import logging
logger = logging.getLogger(__name__)

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

def get_current_user_id(request: Request) -> int:
    token = request.cookies.get("app_access_token")
    if not token:
        logger.warning("Missing token in request cookies")
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            logger.warning("User ID not found in token payload")
            raise HTTPException(status_code=401, detail="User ID not found in token")
        return user_id
    except JWTError:
        logger.warning("Invalid or expired token")
        raise HTTPException(status_code=401, detail="Invalid or expired, Kindly Relogin")

def get_user_from_db(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        logger.error(f"User not found for user_id: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_google_access_token(user_id: int, db: Session) -> str:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        logger.error(f"User not found for user_id: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    if not user.google_access_token:
        logger.warning(f"Google access token not available for user_id: {user_id}")
        raise HTTPException(status_code=401, detail="Google access token not available for this user")
    return user.access_token

def is_access_token_valid(access_token: str) -> bool:
    logger.debug("Checking if access token is valid...")
    url = f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={access_token}"
    response = requests.get(url)
    if response.status_code == 200:
        logger.debug("Access token is valid.")
        return True
    else:
        logger.warning(f"Access token is invalid. Status code: {response.status_code}")
        logger.debug(f"Google response: {response.text}")
        return False

def ensure_valid_token(user, db) -> str:
    logger.info(f"Ensuring valid access token for user: {user.email}")

    if is_access_token_valid(user.access_token):
        logger.info("Token is valid. Proceeding with request.")
        return user.access_token
    else:
        logger.warning("Token expired or invalid. Refreshing token...")
        new_token = refresh_access_token(user.refresh_token)
        user.access_token = new_token
        db.commit()
        logger.info("New access token saved to database.")
        return new_token

def refresh_access_token(refresh_token: str) -> str:
    logger.info("Requesting new access token from Google OAuth server...")
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    response = requests.post(url, data=payload)
    if response.status_code == 200:
        logger.info("Token refreshed successfully.")
        return response.json()["access_token"]
    else:
        logger.error(f"Failed to refresh token. Status code: {response.status_code}")
        logger.debug(f"Response: {response.text}")
        raise Exception(f"Failed to refresh access token: {response.status_code} — {response.text}")

def get_authorized_service(user: User):
    db = SessionLocal()
    try:
        if not is_access_token_valid(user.access_token):
            new_token = refresh_access_token(user.refresh_token)
            user.access_token = new_token
            db.commit()
        credentials = Credentials(token=user.access_token)
        return build("gmail", "v1", credentials=credentials)
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to get authorized Gmail service: {e}")
        raise
    finally:
        db.close()
