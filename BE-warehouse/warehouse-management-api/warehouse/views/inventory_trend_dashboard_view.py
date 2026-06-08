from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Sum
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response

from core.utils.month_year_filter import MonthYearFilter
from warehouse.models.product_issue import ProductIssue
from warehouse.models.product_transfer import ProductTransfer
from warehouse.models.inward import Inward,InwardItem

from core.services.inventory_service import InventoryService
from warehouse.models.requisition import RequisitionIssue


def extract_data(response):
    if hasattr(response, "data"):
        response = response.data

    if isinstance(response, dict):
        if response.get("success") is False:
            return []
        if "data" in response:
            return response["data"]
        if "results" in response:
            return response["results"]

    if isinstance(response, list):
        return response

    return []


class InventoryDashboardAPIView(APIView):
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
            # ==============================
            # 🔹 1. CURRENT STOCK (Inventory Service)
            # ==============================
            inventory_res = InventoryService.get("/inventory-stock/")
            inventory_data = extract_data(inventory_res)

            total_qty = sum(
                float(item.get("quantity", 0))
                for item in inventory_data
            )

            # ==============================
            # 🔹 2. TREND (Warehouse DB)
            # ==============================
            days = int(request.GET.get("days", 7))
            start_date = now().date() - timedelta(days=days)

            inward_data = (
                InwardItem.objects
                .filter(created_on__date__gte=start_date)
                .annotate(date=TruncDate("created_on"))
                .values("date")
                .annotate(total=Sum("quantity"))
            )

            transfer_data = (
                ProductTransfer.objects
                .filter(transfer_date__gte=start_date)
                .annotate(date=TruncDate("transfer_date"))
                .values("date")
                .annotate(total=Sum("quantity"))
            )

            issue_data = (
                RequisitionIssue.objects
                .filter(created_on__date__gte=start_date)
                .annotate(date=TruncDate("created_on"))
                .values("date")
                .annotate(total=Sum("quantity"))
            )

            trend_map = {}

            for row in inward_data:
                date = str(row["date"])
                trend_map.setdefault(date, {
                    "date": date,
                    "inward_qty": 0,
                    "issued_qty": 0,
                    "transfer_qty": 0,
                    "net_qty": 0
                })
                trend_map[date]["inward_qty"] = row["total"] or 0

            for row in issue_data:
                date = str(row["date"])
                trend_map.setdefault(date, {
                    "date": date,
                    "inward_qty": 0,
                    "issued_qty": 0,
                    "transfer_qty": 0,
                    "net_qty": 0
                })
                trend_map[date]["issued_qty"] = row["total"] or 0

            for row in transfer_data:
                date = str(row["date"])
                trend_map.setdefault(date, {
                    "date": date,
                    "inward_qty": 0,
                    "issued_qty": 0,
                    "transfer_qty": 0,
                    "net_qty": 0
                })
                trend_map[date]["transfer_qty"] = row["total"] or 0

            # 🔹 Calculate net movement
            for date, data in trend_map.items():
                data["net_qty"] = data["inward_qty"] - data["issued_qty"]

            trend = sorted(trend_map.values(), key=lambda x: x["date"])

            # ==============================
            # 🔹 FINAL RESPONSE
            # ==============================
            return Response({
                "total_qty": int(total_qty),
                "days": days,
                "trend": trend
            })

        except Exception as e:
            return Response({
                "error": "Something went wrong",
                "details": str(e)
            }, status=500)