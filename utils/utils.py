# utils.py
from rest_framework.response import Response
from rest_framework import status
import uuid
from functools import wraps
from rest_framework.request import Request
from django.views.generic import View
import logging

# Set up a logger specifically for this module
logger = logging.getLogger('app')

def success_response(message, data=None, status_code=status.HTTP_200_OK):
    """
    Returns a standardized success response.
    """
    logger.info(f"Success response: {message} - Data: {data}")
    response = {
        "success": True,
        "message": message,
        "data": data or {}
    }
    return Response(response, status=status_code)

def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Returns a standardized error response.
    """
    logger.error(f"Error response: {message} - Errors: {errors}")
    response = {
        "success": False,
        "message": message,
        "errors": errors or {}
    }
    return Response(response, status=status_code)

def validation_error_response(errors, message="Validation error"):
    """
    Returns a standardized validation error response.
    """
    logger.warning(f"Validation error response: {message} - Errors: {errors}")
    response = {
        "success": False,
        "message": message,
        "errors": errors
    }
    return Response(response, status=status.HTTP_400_BAD_REQUEST)


def exceptionAPI(msg="An error occurred"):
    """
    A decorator to wrap view functions and log exceptions if they occur.
    Logs request details and errors in a standardized format.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Using the default logger
            logger = logging.getLogger(__name__)
            request_id = str(uuid.uuid4())
            try:
                # Log the start of the function with request_id
                logger.info(f"Start Function: {func.__name__}", extra={'request_id': request_id})

                # Execute the function
                response = func(self, request, *args, **kwargs)

                # Log the response on success
                logger.info(f"End Function: {func.__name__}",
                            extra={'response': response.data, 'request_id': request_id})
                return response

            except Exception as e:
                # Log the exception with request_id
                error_msg = {"msg": msg, "msg_details": str(e)}
                logger.exception(f"Exception in {func.__name__}: {e}", extra={'request_id': request_id})

                # Return a standardized error response using error_response utility
                return error_response(message=error_msg, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return wrapper

    return decorator
