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


class BinDashboardAPIView(APIView):
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
            # 🔹 Inventory API
            inventory_res = InventoryService.get("/inventory-stock/")
            inventory_data = extract_data(inventory_res)

            # 🔹 Aggregate sub_inventory quantity
            subinv_qty = {}
            for item in inventory_data:
                sub = item.get("sub_inventory")
                qty = float(item.get("quantity", 0))
                if sub:
                    subinv_qty[sub] = subinv_qty.get(sub, 0) + qty

            # 🔹 Allocation mapping (sub_inventory → rack → bin)
            allocations = Allocation.objects.values(
                "sub_inventory", "rack_code", "bin_code"
            )

            rack_bin_map = {}

            for a in allocations:
                sub = a["sub_inventory"]
                rack = a["rack_code"]
                bin_code = a["bin_code"]

                qty = subinv_qty.get(sub, 0)

                if rack not in rack_bin_map:
                    rack_bin_map[rack] = {}

                rack_bin_map[rack][bin_code] = (
                    rack_bin_map[rack].get(bin_code, 0) + qty
                )

            # 🔹 MDM Bin API
            bin_res = MDMService.get("/warehouse/bins/")
            bin_data = extract_data(bin_res)

            bin_map = {
                i.get("bin_code"): i.get("bin_name")
                for i in bin_data
            }

            # 🔹 MDM Rack API
            rack_res = MDMService.get("/warehouse/racks/")
            rack_data = extract_data(rack_res)

            rack_map = {
                i.get("rack_code"): i.get("rack_name")
                for i in rack_data
            }

            # 🔹 Final Response Build
            final_data = []

            for rack_code, bins in rack_bin_map.items():
                rack_obj = {
                    "rack_code": rack_code,
                    "rack_name": rack_map.get(rack_code, rack_code),
                    "bins": []
                }

                for bin_code, qty in bins.items():
                    rack_obj["bins"].append({
                        "bin_code": bin_code,
                        "bin_name": bin_map.get(bin_code, bin_code),
                        "total_qty": qty
                    })

                final_data.append(rack_obj)

            return Response({"data": final_data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)