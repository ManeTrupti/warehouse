from django.db import transaction
from django.db.models import OuterRef, Sum, FloatField, Subquery, Value, CharField
from django.db.models.functions import Coalesce, Cast
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.services.inventory_service import InventoryService
from core.views.base import BaseConfigAPIView
from warehouse.models.putaway_models import Allocation
from warehouse.serializers.putaway_serializers import AllocationSerializer


class AllocationAPIView(BaseConfigAPIView):
    model = Allocation
    serializer_class = AllocationSerializer
    filterfields = Allocation.get_filter_fields()
    search_fields = (
        "grn_number",
        "product_code",
        "sub_inventory",
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(allocated_qty__gt=0)


    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data.copy()

        sub_inventory = data.get("sub_inventory")
        product_code = data.get("product_code")
        qty = float(data.get("allocated_qty") or 0)

        inventory_response = InventoryService.get("/inventory-stock/")

        total_qty = 0

        for item in inventory_response:
            if (
                item.get("sub_inventory") == sub_inventory
                and item.get("product_code") == product_code
            ):
                total_qty = float(item.get("quantity") or 0)
                break

        allocated_total = Allocation.objects.filter(
            sub_inventory=sub_inventory,
            product_code=product_code
        ).aggregate(
            total=Coalesce(
                Sum("allocated_qty"),
                Value(0.0),
                output_field=FloatField()
            )
        )["total"]

        if allocated_total >= total_qty:
            return Response(
                {
                    "message": "Available qty already fully allocated"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if allocated_total + qty > total_qty:
            remaining = total_qty - allocated_total

            return Response(
                {
                    "message": f"Only {remaining} qty available"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        lookup_data = {
            "product_code": product_code,
            "sub_inventory": sub_inventory,
            "aisle_code": data.get("aisle_code"),
            "rack_code": data.get("rack_code"),
            "bin_code": data.get("bin_code"),
            "zone_code": data.get("zone_code"),
        }

        obj = Allocation.objects.filter(**lookup_data).first()

        if obj:
            obj.allocated_qty = float(obj.allocated_qty or 0) + qty
            obj.save(update_fields=["allocated_qty"])

            return Response(
                {
                    "message": "Allocation updated successfully",
                    "data": self.serializer_class(obj).data,
                },
                status=status.HTTP_200_OK,
            )

        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Allocation created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class AllocationStatusAPIView(APIView):

    def get(self, request):
        try:
            inventory_params = {
                "sub_inventory": "RM_STORE",
                "quantity__gt": 0
            }

            inventory_response = InventoryService.get(
                "/inventory-stock/", params=inventory_params
            )

            allocation_queryset = Allocation.objects.values(
                "sub_inventory",
                "product_code"
            ).annotate(
                allocated_qty=Coalesce(
                    Sum("allocated_qty"),
                    Value(0.0),
                    output_field=FloatField()
                )
            )

            allocation_map = {}

            for row in allocation_queryset:
                key = (
                    row["sub_inventory"],
                    row["product_code"]
                )
                allocation_map[key] = float(row["allocated_qty"])

            response_data = []

            for item in inventory_response:

                total_qty = float(item.get("quantity") or 0)

                if total_qty <= 0:
                    continue

                sub_inventory = item.get("sub_inventory")
                product_code = item.get("product_code")
                plant = item.get("plant")

                key = (sub_inventory, product_code)

                allocated_qty = allocation_map.get(key, 0.0)

                unallocated_qty = total_qty - allocated_qty

                status_value = (
                    "Allocated"
                    if allocated_qty >= total_qty
                    else "Unallocated"
                )

                response_data.append({
                    "sub_inventory": sub_inventory,
                    "plant": plant,
                    "product_code": product_code,
                    "quantity": total_qty,
                    "allocated_qty": allocated_qty,
                    "unallocated_qty": unallocated_qty,
                    "status": status_value
                })

            return Response({
                "message": "Status fetched successfully",
                "data": response_data
            }, status=200)

        except Exception as e:
            return Response({
                "message": "Something went wrong",
                "error": str(e)
            }, status=400)