import requests
import logging
import re
from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import APIException
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class InventoryService:

    BASE_URL = settings.INVENTORY_SERVICE_URL
    TIMEOUT = settings.API_CALLING_SERVICE_TIMEOUT

    URL = None
    MAX_ERROR_RESPONSE_CHARS = 2000

    @staticmethod
    def _parse_response_content(response):
        if not response.content:
            return None
        try:
            return response.json()
        except ValueError:
            return response.text

    @classmethod
    def _summarize_error_response(cls, response_data):
        if not isinstance(response_data, str):
            return response_data, None

        trimmed = response_data[:cls.MAX_ERROR_RESPONSE_CHARS]
        if "<html" in response_data.lower():
            match = re.search(r'<pre class="exception_value">(.*?)</pre>', response_data, re.IGNORECASE | re.DOTALL)
            if match:
                summary = re.sub(r"\s+", " ", match.group(1)).strip()
            else:
                summary = "HTML error page returned from inventory service"
            return trimmed, summary

        return trimmed, None

    @classmethod
    def _request(cls, method, endpoint, params=None, payload=None):
        url = f"{cls.BASE_URL}{endpoint}"
        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                json=payload,
                verify=False,
                timeout=cls.TIMEOUT
            )
            cls.URL = response.url

            response_data = cls._parse_response_content(response)
            safe_response_data, response_summary = cls._summarize_error_response(response_data)

            if response.status_code >= 500:
                raise APIException(detail={
                    "message": "Inventory service not working",
                    "status_code": response.status_code,
                    "url": response.url,
                    "method": method,
                    "params": params,
                    "payload": payload,
                    "response": safe_response_data,
                    "response_summary": response_summary
                }, code=response.status_code)

            if response.status_code >= 400:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "url": response.url,
                    "method": method,
                    "params": params,
                    "payload": payload,
                    "response": safe_response_data,
                    "response_summary": response_summary
                }

            return response_data

        except requests.exceptions.RequestException as e:
            response = getattr(e, "response", None)
            upstream_status_code = response.status_code if response is not None else None
            upstream_body = cls._parse_response_content(response) if response is not None else None
            logger.exception(
                "Inventory service request failed. url=%s method=%s params=%s payload=%s status_code=%s body=%s",
                url,
                method,
                params,
                payload,
                upstream_status_code,
                upstream_body
            )
            print("\n========== INVENTORY SERVICE ERROR ==========")
            print("URL:", url)
            print("METHOD:", method)
            print("PARAMS:", params)
            print("PAYLOAD:", payload)
            print("ERROR:", str(e))
            print("=======================================\n")

            raise APIException(detail={
                "message": "Inventory service not working",
                "error": str(e),
                "inventory_status_code": upstream_status_code,
                "inventory_response_body": upstream_body
            }, code=upstream_status_code or status.HTTP_503_SERVICE_UNAVAILABLE)

    @classmethod
    def get(cls, endpoint, params=None):

        return cls._request(
            method="GET",
            endpoint=endpoint,
            params=params
        )

    @classmethod
    def post(cls, endpoint, payload):

        return cls._request(
            method="POST",
            endpoint=endpoint,
            payload=payload
        )

    @classmethod
    def patch(cls, endpoint, payload):

        return cls._request(
            method="PATCH",
            endpoint=endpoint,
            payload=payload
        )

    @classmethod
    def delete(cls, endpoint):

        response = cls._request(
            method="DELETE",
            endpoint=endpoint
        )

        return response is None


