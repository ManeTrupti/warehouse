from calendar import month_name, month_abbr

from rest_framework.views import APIView
from rest_framework.response import Response
from core.services.inventory_service import InventoryService
from core.services.mdm_service import MDMService
from core.utils.month_year_filter import MonthYearFilter
from warehouse.models.putaway_models import Allocation


def extract_data(response):
    if hasattr(response, "data"):
        response = response.data

    if isinstance(response, dict) and "data" in response:
        return response["data"]

    if isinstance(response, list):
        return response

    return []


class RackDashboardAPIView(APIView):

    def _normalize_month_input(self, raw_month: str) -> str:
        raw = raw_month.strip().lower()
        for i in range(1, 13):
            if raw in month_name[i].lower() or raw in month_abbr[i].lower():
                return i  # return month number

        return raw

    def get(self, request):
        try:
            query_params = request.query_params.copy()
            try:
                if query_params.get("financial_year"):
                    query_params = MonthYearFilter.apply_financial_year_filter(
                        query_params,
                        financial_year=query_params.get("financial_year")
                    )
                else:
                    query_params = MonthYearFilter.apply_month_year_filter(
                        query_params,
                        month=query_params.get("month"),
                        year=query_params.get("year"),
                        field="created_at"
                    )
            except ValueError as e:
                return Response({"error": str(e)}, status=400)
            # 🔹 Inventory API Call
            inventory_res = InventoryService.get("/inventory-stock/")
            inventory_data = extract_data(inventory_res)

            # 🔹 Aggregate sub-inventory quantities
            subinv_qty = {}
            for item in inventory_data:
                sub = item.get("sub_inventory")
                qty = float(item.get("quantity", 0))
                if sub:
                    subinv_qty[sub] = subinv_qty.get(sub, 0) + qty

            # 🔹 Allocation Data (sub_inventory → rack → zone)
            allocations = Allocation.objects.values(
                "sub_inventory", "rack_code", "zone_code"
            )

            zone_rack_map = {}

            for a in allocations:
                sub = a["sub_inventory"]
                rack = a["rack_code"]
                zone = a["zone_code"]

                qty = subinv_qty.get(sub, 0)

                if zone not in zone_rack_map:
                    zone_rack_map[zone] = {}

                zone_rack_map[zone][rack] = zone_rack_map[zone].get(rack, 0) + qty

            # 🔹 MDM Rack API
            rack_res = MDMService.get("/warehouse/racks/")
            rack_data = extract_data(rack_res)

            rack_map = {
                i.get("rack_code"): i.get("rack_name")
                for i in rack_data
            }

            # 🔹 MDM Zone API
            zone_res = MDMService.get("/warehouse/zones/")
            zone_data = extract_data(zone_res)

            zone_map = {
                i.get("zone_code"): i.get("zone_name")
                for i in zone_data
            }

            # 🔹 Final Response Build
            final_data = []

            for zone_code, racks in zone_rack_map.items():
                zone_obj = {
                    "zone_code": zone_code,
                    "zone_name": zone_map.get(zone_code, zone_code),
                    "racks": []
                }

                for rack_code, qty in racks.items():
                    zone_obj["racks"].append({
                        "rack_code": rack_code,
                        "rack_name": rack_map.get(rack_code, rack_code),
                        "total_qty": qty
                    })

                final_data.append(zone_obj)

            return Response({"data": final_data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)