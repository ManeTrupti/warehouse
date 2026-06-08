from calendar import month_name, month_abbr

from rest_framework.views import APIView
from rest_framework.response import Response
from core.services.inventory_service import InventoryService
from core.services.mdm_service import MDMService
from core.utils.month_year_filter import MonthYearFilter


def extract_data(response):
    if hasattr(response, "data"):
        response = response.data

    if isinstance(response, dict) and "data" in response:
        return response["data"]

    if isinstance(response, list):
        return response

    return []

class SubInventoryDashboardAPIView(APIView):

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

            # 🔹 Inventory Data
            inventory_res = InventoryService.get("/inventory-stock/")
            inventory_data = extract_data(inventory_res)

            # 🔹 Aggregate
            subinv_map = {}
            for item in inventory_data:
                sub = item.get("sub_inventory")
                qty = float(item.get("quantity", 0))

                subinv_map[sub] = subinv_map.get(sub, 0) + qty

            # 🔹 MDM Data
            mdm_res = MDMService.get("/warehouse/subinventories/")
            mdm_data = extract_data(mdm_res)

            mdm_map = {
                i.get("subinventory_code"): i.get("subinventory_name")
                for i in mdm_data
            }

            # 🔹 Final Response
            data = [
                {
                    "sub_inventory_code": k,
                    "sub_inventory_name": mdm_map.get(k, k),
                    "total_qty": v
                }
                for k, v in subinv_map.items()
            ]

            return Response({"data": data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)