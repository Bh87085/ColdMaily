import logging
import os
from fastapi import APIRouter, Request, HTTPException, Depends, Response
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
from app.auth.dependencies import get_user_from_db, get_current_user_id
from app.auth.google_oauth import get_google_auth_flow, fetch_token
from app.database import get_db
from app.models import User
from app.helper.crypto_utils import generate_user_key, encrypt_user_key

load_dotenv()
logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
FRONTEND_BASE = os.getenv("FRONTEND_BASE")

logger.debug(f"JWT_SECRET loaded: {JWT_SECRET!r}") 

router = APIRouter()

# Utility: Generate JWT for user
def generate_app_access_token(user):
    payload = {
        "sub": user.google_id,
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture,  # add picture in JWT
        "access_token": user.access_token,
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM) 

def generate_app_refresh_token(user):
    payload = {
        "user_id": user.user_id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# app_access_token refresh 
@router.post("/refresh/token")
async def refresh_app_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    logger.info("Received request to refresh access token.")

    refresh_token = request.cookies.get("app_refresh_token")
    logger.debug(f"Refresh token from cookies: {refresh_token}")

    if not refresh_token:
        logger.warning("No refresh token found in cookies.")
        raise HTTPException(status_code=401, detail="No refresh token found")

    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        logger.info(f"Refresh token decoded payload: {payload}")

        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id or not email:
            logger.warning("Invalid payload in refresh token.")
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Optionally validate user exists
        user = get_user_from_db(user_id, db)
        if not user:
            logger.warning(f"No user found in DB for user_id: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")

        new_app_access_token = generate_app_access_token(user)
        logger.info("New access token generated.")

        response.set_cookie(
            key="app_access_token",
            value=new_app_access_token,
            httponly=True,
            max_age=30 * 60,
            secure=True,  # Required when using SameSite=None
            samesite="None",
            # domain=".coldmaily.com"  # Enables cookie sharing between subdomains
        )

        logger.info("New access token set in cookies.")
        return {"message": "Access token refreshed"}

    except Exception as e:
        logger.error(f"Error while refreshing token: {e}")
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Route: Initiate Google login (always show account selector)
@router.get("/google/login")
async def google_login(request: Request):
    logger.info("/google/login route hit")

    flow = get_google_auth_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"
    )

    logger.debug(f"Redirecting to Google OAuth URL: {auth_url}")
    logger.debug(f"Generated OAuth state: {state}")

    request.session['state'] = state
    return RedirectResponse(auth_url)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    logger.info("/google/callback route hit")

    state = request.session.get('state')
    if not state:
        logger.warning("Missing state in session")
        return RedirectResponse(f"{FRONTEND_BASE}/")

    authorization_response_url = str(request.url)
    logger.debug(f"Google redirected back with URL: {authorization_response_url}")

    try:
        credentials = fetch_token(state, authorization_response_url)
        logger.info("Token fetched successfully")
    except Exception as e:
        logger.error(f"Error fetching token: {e}")
        return RedirectResponse(f"{FRONTEND_BASE}/")

    try:
        raw_id_token = credentials.id_token
        access_token = credentials.token
        refresh_token = credentials.refresh_token

        id_info = google_id_token.verify_oauth2_token(
            raw_id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        logger.info("ID token verified")
    except Exception as e:
        logger.error(f"Invalid ID Token: {e}")
        return RedirectResponse(f"{FRONTEND_BASE}/")

    # Extract user info
    google_id = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name", "")
    picture = id_info.get("picture", "")
    now = datetime.utcnow()

    logger.info(f"Google user info: {email}, {google_id}")

    # Create or update user
    user = db.query(User).filter(User.google_id == google_id).first()
    if user:
        logger.info("Existing user found. Updating tokens...")
        user.access_token = access_token
        user.refresh_token = refresh_token or user.refresh_token
        user.updated_at = now
        user.picture = picture
        db.commit()
        app_access_token = generate_app_access_token(user)
        app_refresh_token = generate_app_refresh_token(user)
    else:
        logger.info("New user. Creating record...")
        new_user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture,
            access_token=access_token,
            refresh_token=refresh_token,
            created_at=now,
            updated_at=now,
            has_confirmed_consent=False,
            encrypted_key=encrypt_user_key(generate_user_key())
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        app_access_token = generate_app_access_token(new_user)
        app_refresh_token = generate_app_refresh_token(new_user)

    logger.info("App tokens generated")
    logger.debug(f"Setting cookies for: {email}")

    response = RedirectResponse(f"{FRONTEND_BASE}/home")
    response.set_cookie(
        key="app_access_token",
        value=app_access_token,
        httponly=True,
        max_age=30 * 60,
        secure=True,
        samesite="None",
        # domain=".coldmaily.com"  # Include subdomains
    )

    response.set_cookie(
        key="app_refresh_token",
        value=app_refresh_token,
        httponly=True,
        max_age=30 * 24 * 60 * 60,
        secure=True,
        samesite="None",
        # domain=".coldmaily.com"  # Match domain
    )

    logger.info("Cookies set. Redirecting to frontend /home")
    return response

@router.get("/auth/me")
async def get_user_info(request: Request):
    token = request.cookies.get("app_access_token")
    if not token:
        logger.warning("Token missing in /auth/me request")
        raise HTTPException(status_code=401, detail="Token missing")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "picture": payload.get("picture")
        }
    
    except jwt.ExpiredSignatureError:
        logger.warning("Expired token in /auth/me request")
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        logger.warning("Invalid token in /auth/me request")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/api/test")
def test_cookies(request: Request):
    token = request.cookies.get("app_access_token")
    return {"jwt": token}

@router.post("/logout")
def logout_user(response: Response):
    # ❌ Properly delete the cookie with the same path as set_cookie
    response.delete_cookie(key="app_access_token", path="/")
    response.delete_cookie(key="app_refresh_token", path="/")
    logger.info("User logged out, cookies deleted")
    return {"message": "Logged out successfully"}

@router.get("/user/consent")
def get_user_consent(user_id: User = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = get_user_from_db(user_id, db)
    return {"has_confirmed_consent": user.has_confirmed_consent}

@router.put("/user/consent")
def update_user_consent(consent: bool, user_id: User = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = get_user_from_db(user_id, db)
    user.has_confirmed_consent = consent
    db.commit()
    db.refresh(user)
    return {"message": "Consent updated successfully", "has_confirmed_consent": consent}
