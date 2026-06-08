# utils/exceptions.py
import traceback

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


def custom_exception_handler(exc, context):
    # Call DRF's default handler first to get the standard error response
    response = exception_handler(exc, context)
    tb = traceback.format_exc()

    # If response is None, it means DRF didn't recognize the error (like a DB crash)
    if response is None:
        data = {
            "message": "Something went wrong",
            "error": str(exc)
        }
        if settings.DEBUG:
            data["traceback"] = tb
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # If it's a known error (like your MDMServiceError), format it cleanly
    data = {
        "message": "Error occurred",
        "details": response.data
    }
    if settings.DEBUG:
        data["traceback"] = tb

    response.data = data

    return response
