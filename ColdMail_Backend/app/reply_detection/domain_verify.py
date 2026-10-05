import logging
import os

import boto3
import dns.resolver
from botocore.exceptions import ClientError
from sqlalchemy.orm import Session

from app.models import User

logger = logging.getLogger(__name__)

AWS_REGION = os.getenv("AWS_SES_REGION", "us-east-1")
SES_INBOUND_HOST = f"inbound-smtp.{AWS_REGION}.amazonaws.com"


def _ses_client():
    return boto3.client("ses", region_name=AWS_REGION)


def initiate_ses_domain_verification(domain: str) -> str:
    """
    Register the domain with SES and return the TXT verification token.
    Safe to call multiple times — SES returns the same token for the same domain.
    """
    client = _ses_client()
    response = client.verify_domain_identity(Domain=domain)
    token = response["VerificationToken"]
    logger.info(f"SES domain verification initiated for {domain}")
    return token


def check_ses_domain_verified(domain: str) -> bool:
    """
    Return True if SES has confirmed ownership of the domain (TXT record check passed).
    """
    try:
        client = _ses_client()
        response = client.get_identity_verification_attributes(Identities=[domain])
        attrs = response["VerificationAttributes"].get(domain, {})
        verified = attrs.get("VerificationStatus") == "Success"
        logger.info(f"SES verification status for {domain}: {attrs.get('VerificationStatus')}")
        return verified
    except ClientError as e:
        logger.error(f"SES verification check failed for {domain}: {e}")
        return False


def verify_mx_record(domain: str) -> bool:
    """
    Check whether the MX record for replies.{domain} points to amazonaws.com.
    Returns True if a matching MX record is found, False otherwise.
    """
    target = f"replies.{domain}"
    try:
        answers = dns.resolver.resolve(target, "MX")
        for rdata in answers:
            exchange = str(rdata.exchange).lower().rstrip(".")
            if "amazonaws.com" in exchange:
                logger.info(f"MX record for {target} verified: {exchange}")
                return True
        logger.info(f"MX record for {target} found but does not point to amazonaws.com")
        return False
    except dns.resolver.NXDOMAIN:
        logger.warning(f"No DNS record found for {target}")
        return False
    except dns.resolver.NoAnswer:
        logger.warning(f"No MX record found for {target}")
        return False
    except Exception as e:
        logger.warning(f"MX lookup failed for {target}: {e}")
        return False


def save_verified_domain(user_id: int, domain: str, db: Session) -> None:
    """
    Mark the user's custom domain as verified on the User row.
    Also enables reply tracking if it wasn't already on.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.domain = domain
        user.domain_verified = True
        user.reply_tracking_enabled = True
        db.commit()
        logger.info(f"Saved verified domain '{domain}' for user_id={user_id}")
