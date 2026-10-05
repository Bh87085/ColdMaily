import base64
import logging
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import uuid  # For generating Message-ID headers
from app.auth.dependencies import get_authorized_service
from app.models import User
from sqlalchemy.orm import Session
from datetime import datetime
from app.home.mailHelper.reply_tracker import handle_detected_reply

logger = logging.getLogger(__name__)

def convert_text_to_html(text: str) -> str:
    paragraphs = text.split("\n\n")
    html = "".join(f"<p>{p.replace('\n', '<br>')}</p>" for p in paragraphs)
    return html

def _build_gmail_service(access_token: str):
    """Builds and returns a Gmail API service object."""
    creds = Credentials(token=access_token)
    return build("gmail", "v1", credentials=creds)

def send_initial_email(
    access_token: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str,
    attachments: Optional[List[bytes]] = None,
    attachment_filenames: Optional[List[str]] = None,
    reply_to: Optional[str] = None,
) -> Dict[str, str]:
    """
    Sends the very first email in a new conversation thread.
    Supports optional file attachments passed as byte streams.
    """
    try:
        logger.debug(f"Building Gmail service for sending initial email to {to_email} with subject '{subject}'")
        service = _build_gmail_service(access_token)

        html_body = convert_text_to_html(body)

        if not attachments:
            logger.debug("No attachments found, sending simple alternative email.")
            message = MIMEMultipart("alternative")
            message.attach(MIMEText(body, "plain"))
            message.attach(MIMEText(html_body, "html"))
        else:
            logger.debug(f"Attachments detected: {len(attachments)} files.")
            message = MIMEMultipart("mixed")
            alt_part = MIMEMultipart("alternative")
            alt_part.attach(MIMEText(body, "plain"))
            alt_part.attach(MIMEText(html_body, "html"))
            message.attach(alt_part)

            for file_bytes, filename in zip(attachments, attachment_filenames):
                logger.debug(f"Attaching file: {filename}")
                part = MIMEApplication(file_bytes)
                part.add_header("Content-Disposition", f"attachment; filename={filename}")
                message.attach(part)

        message["To"] = to_email
        message["From"] = sender_email
        message["Subject"] = subject

        domain = sender_email.split('@')[1] if '@' in sender_email else 'localhost.localdomain'
        current_message_id_header = f"<{uuid.uuid4().hex}@{domain}>"
        message["Message-ID"] = current_message_id_header
        message["References"] = current_message_id_header

        if reply_to:
            message["Reply-To"] = reply_to

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        payload = {"raw": raw_message}

        sent = service.users().messages().send(userId="me", body=payload).execute()
        logger.info(f"Initial email sent to {to_email} with Message-ID: {current_message_id_header} and API message ID: {sent.get('id')}")

        return {
            "api_message_id": sent.get("id"),
            "thread_id": sent.get("threadId"),
            "generated_message_id_header": current_message_id_header,
            "generated_references_header": message["References"]
        }

    except HttpError as error:
        logger.error(f"Gmail API error sending initial email: {error}")
        raise Exception(f"Gmail API error: {error}")
    except Exception as e:
        logger.error(f"Unexpected error sending initial email: {e}")
        raise Exception(f"Failed to send initial email: {str(e)}")


def send_follow_up_email(
    access_token: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str,
    gmail_api_thread_id: str,
    in_reply_to_message_id_header: str,
    previous_references_header: str,
    reply_to: Optional[str] = None,
) -> Dict[str, str]:
    """Sends a follow-up email that threads correctly with a previous message."""
    try:
        logger.debug(f"Building Gmail service for sending follow-up email to {to_email} with subject '{subject}'")
        service = _build_gmail_service(access_token)

        if not in_reply_to_message_id_header.startswith("<"):
            in_reply_to_message_id_header = f"<{in_reply_to_message_id_header}>"
            logger.debug(f"Formatted In-Reply-To header: {in_reply_to_message_id_header}")

        html_body = convert_text_to_html(body)

        message = MIMEMultipart("alternative")
        message.attach(MIMEText(body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        message["To"] = to_email
        message["From"] = sender_email
        message["Subject"] = subject if subject.upper().startswith("RE:") else f"Re: {subject}"

        domain = sender_email.split('@')[1] if '@' in sender_email else 'localhost.localdomain'
        current_message_id_header = f"<{uuid.uuid4().hex}@{domain}>"
        message["Message-ID"] = current_message_id_header
        message["In-Reply-To"] = in_reply_to_message_id_header

        if reply_to:
            message["Reply-To"] = reply_to

        new_references_header = (
            f"{previous_references_header} {current_message_id_header}"
            if previous_references_header else current_message_id_header
        )
        message["References"] = new_references_header

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        payload = {"raw": raw, "threadId": gmail_api_thread_id}

        sent = service.users().messages().send(userId="me", body=payload).execute()
        logger.info(f"Follow-up email sent to {to_email} with Message-ID: {current_message_id_header} and API message ID: {sent.get('id')}")

        return {
            "api_message_id": sent.get("id"),
            "thread_id": sent.get("threadId"),
            "generated_message_id_header": current_message_id_header,
            "generated_references_header": new_references_header
        }

    except HttpError as error:
        logger.error(f"Gmail API error sending follow-up email: {error}")
        raise Exception(f"Gmail API error: {error}")
    except Exception as e:
        logger.error(f"Unexpected error sending follow-up email: {e}")
        raise Exception(f"Failed to send follow-up email: {str(e)}")


from googleapiclient.errors import HttpError

def check_gmail_history_for_user(user: User, db: Session):
    """
    Checks Gmail history for a user and updates mails that have received replies.
    """
    try:
        logger.info(f"Checking Gmail history for user: {user.email}")
        service = get_authorized_service(user)

        if not user.last_history_id:
            logger.info("No previous history ID found. Fetching profile to initialize tracking.")
            profile = service.users().getProfile(userId='me').execute()
            user.last_history_id = profile.get("historyId")
            db.commit()
            logger.info(f"Initialized last_history_id to {user.last_history_id}")
            return

        logger.info(f"Fetching Gmail history since history ID: {user.last_history_id}")
        try:
            history_response = service.users().history().list(
                userId='me',
                startHistoryId=user.last_history_id,
                historyTypes=['messageAdded']
            ).execute()
        except HttpError as e:
            if e.resp.status == 404:  # historyId expired
                logger.warning(f"History ID {user.last_history_id} expired for {user.email}. Resetting sync...")
                # Reset by fetching latest profile
                profile = service.users().getProfile(userId='me').execute()
                user.last_history_id = profile.get("historyId")
                db.commit()
                logger.info(f"Resynced last_history_id to {user.last_history_id}")
                return
            else:
                raise  # rethrow if it's not the 404 case

        histories = history_response.get('history', [])
        logger.info(f"Found {len(histories)} history records")

        for record in histories:
            for message_data in record.get('messagesAdded', []):
                message = message_data.get('message', {})
                message_id = message.get('id')
                thread_id = message.get('threadId')

                logger.debug(f"Inspecting message ID: {message_id}, thread ID: {thread_id}")
                full_msg = service.users().messages().get(userId='me', id=message_id).execute()

                headers = {
                    h['name']: h['value']
                    for h in full_msg.get('payload', {}).get('headers', [])
                }
                sender = headers.get('From', '')
                logger.debug(f"Message sender: {sender}")
                
                internal_date = int(full_msg.get('internalDate', 0)) / 1000
                reply_time = datetime.utcfromtimestamp(internal_date)
                logger.debug(f"Message time: {reply_time}")

                logger.debug("Passing message to reply handler...")
                handle_detected_reply(
                    db=db,
                    user=user,
                    sender=sender,
                    thread_id=thread_id,
                    reply_time=reply_time
                )

        if 'historyId' in history_response:
            new_history_id = history_response['historyId']
            logger.info(f"Updating last_history_id to {new_history_id}")
            user.last_history_id = new_history_id
            db.commit()

        logger.info(f"Finished checking Gmail history for user: {user.email}")

    except Exception as e:
        logger.error(f"Error checking Gmail history for user {user.email}: {str(e)}")
