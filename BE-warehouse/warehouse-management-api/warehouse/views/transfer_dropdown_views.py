from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from core.services.mdm_service import MDMService
from warehouse.models.product_transfer import TransferTypeChoices


def safe_mdm_call(url):
    response = MDMService.get(url)

    if hasattr(response, "data"):
        response = response.data

    if isinstance(response, dict):
        data = response.get("data")
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
        return []

    if isinstance(response, list):
        return [item for item in response if isinstance(item, dict)]

    return []


class TransferDropdownAPIView(APIView):

    def get(self, request):

        transfer_type = request.query_params.get("transfer_type")

        if not transfer_type:
            return Response(
                {"error": "transfer_type is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            stores = safe_mdm_call("/api/warehouse/stores/")
            subinventories = safe_mdm_call("/api/warehouse/subinventories/")
            zones = safe_mdm_call("/api/warehouse/zones/")
            locations = safe_mdm_call("/api/warehouse/locations/")
            plants = safe_mdm_call("/api/warehouse/plants/")

            # MAPS
            plant_map = {p["id"]: p for p in plants if isinstance(p, dict)}
            location_map = {l["id"]: l for l in locations if isinstance(l, dict)}

            # ---------------- COMMON FILTERED DATA ----------------
            active_stores = [s for s in stores if s.get("is_active")]
            active_subinv = [s for s in subinventories if s.get("is_active")]
            active_zones = [z for z in zones if z.get("is_active")]
            active_locations = [l for l in locations if l.get("is_active")]
            active_plants = [p for p in plants if p.get("is_active")]

            # ---------------- ENRICH STORES ----------------
            enriched_stores = []
            for store in active_stores:
                plant = plant_map.get(store.get("plant"))
                location = location_map.get(plant.get("location")) if plant else None

                s = dict(store)
                s["plant_name"] = plant.get("plant_name") if plant else None
                s["location"] = location.get("id") if location else None
                s["location_name"] = location.get("name") if location else None
                s["location_code"] = location.get("code") if location else None

                enriched_stores.append(s)

            # ---------------- ENRICH SUBINVENTORY ----------------
            enriched_subinv = []
            for sub in active_subinv:
                store = next(
                    (s for s in active_stores if s.get("store_code") == sub.get("store_code_display")),
                    None
                )

                plant = plant_map.get(store.get("plant")) if store else None
                location = location_map.get(plant.get("location")) if plant else None

                s = dict(sub)
                s["plant"] = plant.get("id") if plant else None
                s["plant_name"] = plant.get("plant_name") if plant else None
                s["plant_code"] = plant.get("plant_code") if plant else None
                s["location"] = location.get("id") if location else None
                s["location_name"] = location.get("name") if location else None
                s["location_code"] = location.get("code") if location else None

                enriched_subinv.append(s)

            # ---------------- RESPONSE BASE ----------------
            response_fields = {
                "plants": active_plants,
                "locations": active_locations,
                "from_store": [],
                "to_store": [],
                "from_subinventory": [],
                "to_subinventory": [],
                "zones": active_zones,

                # extra fields (non-breaking)
                "from_plant": [],
                "to_plant": [],
                "from_location": [],
                "to_location": [],
            }

            # ---------------- DYNAMIC MAPPING ----------------
            if transfer_type == TransferTypeChoices.STORE_TO_SUBINVENTORY:
                response_fields["from_store"] = enriched_stores
                response_fields["to_subinventory"] = enriched_subinv

            elif transfer_type == TransferTypeChoices.SUBINVENTORY_TO_SUBINVENTORY:
                response_fields["from_subinventory"] = enriched_subinv
                response_fields["to_subinventory"] = enriched_subinv

            elif transfer_type == TransferTypeChoices.PLANT_TO_LOCATION:
                response_fields["from_plant"] = active_plants
                response_fields["to_location"] = active_locations

            elif transfer_type == TransferTypeChoices.LOCATION_TO_PLANT:
                response_fields["from_location"] = active_locations
                response_fields["to_plant"] = active_plants

            elif transfer_type == TransferTypeChoices.PLANT_TO_PLANT:
                response_fields["from_plant"] = active_plants
                response_fields["to_plant"] = active_plants
                response_fields["plants"] = active_plants

            elif transfer_type == TransferTypeChoices.LOCATION_TO_LOCATION:
                response_fields["from_location"] = active_locations
                response_fields["to_location"] = active_locations
                response_fields["locations"] = active_locations

            elif transfer_type == TransferTypeChoices.ZONE:
                response_fields["zones"] = active_zones

            elif transfer_type == TransferTypeChoices.SUBINVENTORY_TO_ZONE:
                response_fields["from_subinventory"] = enriched_subinv
                response_fields["zones"] = active_zones

            elif transfer_type == TransferTypeChoices.ZONE_TO_SUBINVENTORY:
                response_fields["to_subinventory"] = enriched_subinv
                response_fields["zones"] = active_zones

            else:
                return Response(
                    {"error": "Invalid transfer type"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {
                    "message": "Dropdown data fetched successfully",
                    "data": {
                        "transfer_type": transfer_type,
                        "fields": response_fields
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )