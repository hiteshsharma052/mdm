# email_utils.py
import logging
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from .utils import success_response, error_response

logger = logging.getLogger('app')

def send_custom_email(subject, message, recipient_list, from_email=None):
    """
    Sends an email and logs success or error details.
    """
    from_email = from_email or settings.DEFAULT_FROM_EMAIL
    try:
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"Email sent to {recipient_list} - Subject: {subject}")
        return success_response("Email sent successfully")
    except BadHeaderError:
        logger.error(f"Failed to send email: Bad header in email to {recipient_list}")
        return error_response("Invalid header found.")
    except Exception as e:
        logger.error(f"Error sending email to {recipient_list} - Error: {str(e)}")
        return error_response("Failed to send email.")
