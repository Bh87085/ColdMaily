import logging
from dotenv import load_dotenv
import os
from google_auth_oauthlib.flow import Flow

load_dotenv()

logger = logging.getLogger(__name__)

# Load environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

logger.debug(f"Loaded Google Client ID: {GOOGLE_CLIENT_ID[:6]}...")  # Partial for safety
logger.debug(f"Using redirect URI: {GOOGLE_REDIRECT_URI}")

# Define required OAuth scopes
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]

# Step 1: Create the Google OAuth2 Flow object
def get_google_auth_flow():
    logger.debug("Initializing Google OAuth2 Flow object...")
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )

# Step 2: Generate the authorization URL for login
def get_authorization_url():
    logger.debug("Generating Google authorization URL...")
    flow = get_google_auth_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",             # Required for refresh tokens
        include_granted_scopes="true",     # Reuse previously granted scopes
        prompt="select_account",           # Always show account chooser
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    logger.debug(f"Generated Auth URL: {auth_url}")
    logger.debug(f"OAuth state: {state}")
    return auth_url, state

# Step 3: Fetch tokens using the code in the callback
def fetch_token(state, authorization_response_url):
    logger.debug("Fetching token from Google...")
    logger.debug(f"Auth response URL: {authorization_response_url}")
    flow = get_google_auth_flow()
    flow.fetch_token(authorization_response=authorization_response_url)
    logger.debug("Successfully fetched token!")
    return flow.credentials
