import base64
import os
import logging
import traceback
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# Load the master key from environment
MASTER_KEY = os.getenv("MASTER_KEY")
if not MASTER_KEY:
    raise ValueError("MASTER_KEY environment variable is not set")

# Convert string master key to bytes if needed
if isinstance(MASTER_KEY, str):
    MASTER_KEY = MASTER_KEY.encode()

fernet = Fernet(MASTER_KEY)

def generate_user_key() -> str:
    try:
        return Fernet.generate_key().decode()
    except Exception as e:
        logger.error(f"generate_user_key error: {e}")
        logger.debug(traceback.format_exc())
        raise

def encrypt_user_key(user_key: str) -> str:
    try:
        encrypted_bytes = fernet.encrypt(user_key.encode())
        return encrypted_bytes.decode()
    except Exception as e:
        logger.error(f"encrypt_user_key error: {e}")
        logger.debug(traceback.format_exc())
        raise

def decrypt_user_key(encrypted_user_key: str) -> str:
    """Decrypts the encrypted user key using the master key and returns it as a base64 string"""
    try:
        decrypted_bytes = fernet.decrypt(encrypted_user_key.encode())
        return decrypted_bytes.decode()  # Convert bytes to base64 string
    except Exception as e:
        logger.error(f"decrypt_user_key error: {e}")
        logger.debug(traceback.format_exc())
        raise

def encrypt_content(plain_text: str, user_key: str) -> str:
    try:
        user_fernet = Fernet(user_key.encode())
        encrypted_bytes = user_fernet.encrypt(plain_text.encode())
        return encrypted_bytes.decode()
    except Exception as e:
        logger.error(f"encrypt_content error: {e}")
        logger.debug(traceback.format_exc())
        raise

def decrypt_content(cipher_text: str, user_key: str) -> str:
    try:
        user_fernet = Fernet(user_key.encode())
        decrypted_bytes = user_fernet.decrypt(cipher_text.encode())
        return decrypted_bytes.decode()
    except Exception as e:
        logger.error(f"decrypt_content error: {e}")
        logger.debug(traceback.format_exc())
        raise
