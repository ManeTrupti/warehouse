from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.services.mdm_service import MDMService
from core.services.mdm_service_validations import MDMValidationService


def extract_data(response):
    if hasattr(response, "data"):
        response = response.data

    if isinstance(response, dict) and "data" in response:
        return response["data"]

    return response if isinstance(response, list) else []


def normalize(value):
    if isinstance(value, str):
        return value.strip().upper()
    return value


class PlantsByLocationAPIView(APIView):
    """
    Get plants by location_code using MDM APIs
    """

    def get(self, request):
        try:
            location_code = request.query_params.get("location_code")

            if not location_code:
                return Response(
                    {"message": "location_code is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            location_code = normalize(location_code)

            # ✅ Step 1: Validate location
            MDMValidationService.validate_location(location_code)

            # ✅ Step 2: Fetch locations
            locations = extract_data(MDMService.get("/api/warehouse/locations/"))

            # ✅ Step 3: Find location object using CODE
            location_obj = next(
                (
                    loc for loc in locations
                    if normalize(loc.get("code")) == location_code
                ),
                None
            )

            if not location_obj:
                return Response(
                    {"message": "Location not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            location_id = location_obj.get("id")

            # ✅ Step 4: Fetch plants
            plants = extract_data(MDMService.get("/api/warehouse/plants/"))

            # ✅ Step 5: Filter using LOCATION ID (IMPORTANT FIX)
            filtered_plants = [
                plant for plant in plants
                if plant.get("location") == location_id
            ]

            return Response(
                {
                    "location_code": location_code,
                    "plants": filtered_plants
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "message": "Something went wrong",
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )