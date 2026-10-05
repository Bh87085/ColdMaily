import hmac
import hashlib
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# HMAC signature length in bytes; 3 bytes = 6 hex chars — sweet spot between length and security
_SIG_BYTES = 3


def _encode_mail_id(mail_id: int) -> str:
    """
    Encode mail_id into a short HMAC-signed token.

    Format: {mail_id_hex}{hmac_hex}
    Example: mail_id=42 → "2a" + "a1b2c3d4e5f6" → "2aa1b2c3d4e5f6"

    The HMAC prevents anyone from forging a valid reply address by guessing
    or enumerating mail IDs.
    """
    secret = os.getenv("SECRET_KEY", "").encode()
    mail_hex = format(mail_id, "x")
    sig = hmac.new(secret, mail_hex.encode(), hashlib.sha256).digest()[:_SIG_BYTES]
    return mail_hex + sig.hex()


def decode_mail_id(token: str) -> Optional[int]:
    """
    Decode a token back to its original mail_id, verifying the HMAC.
    Returns None if the token is malformed or the signature is invalid.
    Used by the SES inbound webhook to resolve a reply address to a mail record.
    """
    sig_len = _SIG_BYTES * 2  # hex chars
    if len(token) <= sig_len:
        return None

    mail_hex = token[:-sig_len]
    sig_hex = token[-sig_len:]

    try:
        mail_id = int(mail_hex, 16)
    except ValueError:
        return None

    secret = os.getenv("SECRET_KEY", "").encode()
    expected = hmac.new(secret, mail_hex.encode(), hashlib.sha256).digest()[:_SIG_BYTES].hex()
    if not hmac.compare_digest(sig_hex, expected):
        logger.warning(f"HMAC verification failed for reply token: {token}")
        return None

    return mail_id


def generate_reply_to(mail_id: int, user) -> Optional[str]:
    """
    Generate the Reply-To address for an outgoing email.
    Returns None if the user has not opted in to reply tracking.

    Format: reply+{hmac_token}@{domain}
    The token encodes the mail_id and is verifiable without a DB lookup.

    Domain selection:
    - user.domain_verified = True  → replies.{user.domain}  (custom business domain)
    - user.domain_verified = False → reply.coldmaily.com     (shared coldmaily domain)
    """
    if not user.reply_tracking_enabled:
        logger.debug(f"Reply tracking disabled for user_id={user.user_id}; skipping Reply-To")
        return None

    if user.domain_verified and user.domain:
        domain = f"replies.{user.domain}"
    else:
        domain = "reply.coldmaily.com"

    token = _encode_mail_id(mail_id)
    address = f"reply+{token}@{domain}"
    logger.debug(f"Generated reply-to address: {address} for mail_id={mail_id}")
    return address
