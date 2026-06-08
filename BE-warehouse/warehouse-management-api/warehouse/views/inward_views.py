import logging
import traceback

from django.db import transaction
from django.utils import timezone
from django.db.models import Count, Sum
from rest_framework.exceptions import APIException, ErrorDetail
from rest_framework.generics import UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from warehouse.models import Inward, InwardItem
from warehouse.serializers.inward_serializers import InwardSerializer, InwardItemUpdateSerializer
import pandas as pd
from warehouse.services.inventory_services import update_inventory

logger = logging.getLogger(__name__)


def _normalize_error_payload(value):
    if isinstance(value, ErrorDetail):
        return str(value)
    if isinstance(value, dict):
        return {key: _normalize_error_payload(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_normalize_error_payload(item) for item in value]
    return value


class InwardAPIView(APIView):

    def get(self, request, pk=None):
        try:
            if pk:
                inward = Inward.objects.prefetch_related("items").get(id=pk)

                serializer = InwardSerializer(inward)

                return Response(
                    {
                        "message": "Inward fetched successfully",
                        "data": serializer.data
                    },
                    status=status.HTTP_200_OK
                )


            inward_data = Inward.objects.prefetch_related("items").all().order_by("-id")

            serializer = InwardSerializer(inward_data, many=True)

            return Response(
                {
                    "message": "Inward list fetched successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Inward.DoesNotExist:
            return Response(
                {
                    "message": "Inward not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )



    def post(self, request):
        serializer = InwardSerializer(data=request.data)

        if not serializer.is_valid():
            logger.warning(
                "Inward creation validation failed. payload=%s errors=%s",
                request.data,
                serializer.errors
            )
            return Response(
                {
                    "message": "Validation failed",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                inward = serializer.save()

                for item in inward.items.all():
                    update_inventory(
                        product_code=item.product_code,
                        plant=inward.plant,
                        sub_inventory=item.sub_inventory,
                        quantity=item.quantity,
                        inventory_type="stock_inward"
                    )

            return Response(
                {
                    "message": "Inward created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as exc:
            traceback_lines = traceback.format_exc().splitlines()
            if isinstance(exc, APIException):
                error_payload = _normalize_error_payload(exc.detail)
            elif exc.args and isinstance(exc.args[0], dict):
                error_payload = _normalize_error_payload(exc.args[0])
            else:
                error_payload = str(exc)

            upstream_error_code = None
            if isinstance(error_payload, dict):
                upstream_error_code = (
                    error_payload.get("mdm_status_code")
                    or error_payload.get("inventory_status_code")
                    or error_payload.get("status_code")
                )

            logger.exception(
                "Inward creation failed. payload=%s serializer_data=%s",
                request.data,
                serializer.validated_data if hasattr(serializer, "validated_data") else {}
            )
            return Response(
                {
                    "message": "Inward creation failed",
                    "error": error_payload,
                    "error_code": upstream_error_code or (exc.code if hasattr(exc, "code") else None),
                    "traceback": traceback_lines
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InwardItemUpdateAPIView(UpdateAPIView):

    queryset = InwardItem.objects.all()
    serializer_class = InwardItemUpdateSerializer
    lookup_field = "pk"

    def get(self, request, *args, **kwargs):

        pk = kwargs.get("pk")
        if pk:
            instance = self.get_object()

            return Response(
                {
                    "message": "Single inward item fetched successfully",
                    "data": self.get_serializer(instance).data
                },
                status=status.HTTP_200_OK
            )

        queryset = self.get_queryset()

        return Response(
            {
                "message": "All inward items fetched successfully",
                "count": queryset.count(),
                "data": self.get_serializer(queryset, many=True).data
            },
            status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        current_quantity = float(instance.quantity)
        entered_quantity = float(request.data.get("quantity", 0))

        request.data["quantity"] = current_quantity + entered_quantity

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )

        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            updated_item = serializer.save()

            plant_value = (
                updated_item.inward.plant.plant_code
                if hasattr(updated_item.inward.plant, "plant_code")
                else str(updated_item.inward.plant)
            )

            if entered_quantity > 0:
                update_inventory(
                    product_code=updated_item.product_code,
                    plant=plant_value,
                    sub_inventory=updated_item.sub_inventory,
                    quantity=entered_quantity,
                    transaction_type="IN"
                )

        updated_item.refresh_from_db()

        return Response(
            {
                "message": "Quantity added successfully",
                "quantity": entered_quantity,
                "data": self.get_serializer(updated_item).data
            },
            status=status.HTTP_200_OK
        )

class InwardStatsAPIView(APIView):

    def get(self, request):
        try:
            inward_qs = Inward.objects.all()
            total_requests = inward_qs.count()

            has_status_field = any(field.name == "status" for field in Inward._meta.fields)

            if has_status_field:
                pending = inward_qs.filter(status__iexact="PENDING").count()
                posted = inward_qs.filter(status__iexact="POSTED").count()
                rejected = inward_qs.filter(status__iexact="REJECTED").count()
                overdue = inward_qs.filter(
                    status__iexact="PENDING",
                    created_on__lt=timezone.now() - timezone.timedelta(days=2)
                ).count()
            else:
                # Current Inward model has no workflow state field.
                pending = 0
                posted = total_requests
                rejected = 0
                overdue = 0

            return Response(
                {
                    "message": "Inward stats fetched successfully",
                    "data": {
                        "total_requests": total_requests,
                        "pending": pending,
                        "posted": posted,
                        "rejected": rejected,
                        "overdue": overdue
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "message": "Something went wrong",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InwardDashboardAPIView(APIView):

    def get(self, request):
        try:
            inward_qs = Inward.objects.all()
            today = timezone.localdate()
            inward_fields = {field.name for field in Inward._meta.fields}

            # Use rolling windows so week metrics are stable across weekdays.
            week_start = today - timezone.timedelta(days=6)
            month_start = today.replace(day=1)

            total_grns = inward_qs.count()
            # Use created_on date for dashboard counters because inward_date is auto-generated.
            today_grns = inward_qs.filter(created_on__date=today).count()
            this_week_grns = inward_qs.filter(
                created_on__date__gte=week_start,
                created_on__date__lte=today
            ).count()
            this_month_grns = inward_qs.filter(
                created_on__date__gte=month_start,
                created_on__date__lte=today
            ).count()

            items_qs = InwardItem.objects.all()
            total_quantity_received = items_qs.aggregate(
                total=Sum("quantity")
            ).get("total") or 0
            unique_products_received = items_qs.values(
                "product_code"
            ).exclude(product_code__isnull=True).exclude(product_code="").distinct().count()

            unique_suppliers = inward_qs.values(
                "supplier"
            ).exclude(supplier__isnull=True).exclude(supplier="").distinct().count()
            if "location_code" in inward_fields:
                unique_locations = inward_qs.values(
                    "location_code"
                ).exclude(location_code__isnull=True).exclude(location_code="").distinct().count()
            else:
                unique_locations = 0

            top_supplier_row = inward_qs.values("supplier").exclude(
                supplier__isnull=True
            ).exclude(
                supplier=""
            ).annotate(
                inward_count=Count("id")
            ).order_by("-inward_count").first()

            top_product_row = items_qs.values("product_code").exclude(
                product_code__isnull=True
            ).exclude(
                product_code=""
            ).annotate(
                total_quantity=Sum("quantity")
            ).order_by("-total_quantity").first()

            return Response(
                {
                    "message": "Inward dashboard fetched successfully",
                    "data": {
                        "total_grns": total_grns,
                        "today_grns": today_grns,
                        "this_week_grns": this_week_grns,
                        "this_month_grns": this_month_grns,
                        "total_quantity_received": total_quantity_received,
                        "unique_products_received": unique_products_received,
                        "unique_suppliers": unique_suppliers,
                        "unique_locations": unique_locations,
                        "top_supplier": {
                            "supplier": top_supplier_row.get("supplier") if top_supplier_row else None,
                            "inward_count": top_supplier_row.get("inward_count") if top_supplier_row else 0
                        },
                        "top_product": {
                            "product_code": top_product_row.get("product_code") if top_product_row else None,
                            "total_quantity": top_product_row.get("total_quantity") if top_product_row else 0
                        }
                    }
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "message": "Something went wrong",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class InwardBulkUploadAPIView(APIView):

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {"message": "Excel file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = pd.read_excel(file)

            created_inwards = []

            with transaction.atomic():

                grouped = df.groupby(
                    ["plant", "supplier", "remarks"],
                    dropna=False
                )

                for (plant, supplier, remarks), group in grouped:

                    inward = Inward.objects.create(
                        plant=plant,
                        supplier=supplier,
                        remarks=remarks
                    )

                    items = [
                        InwardItem(
                            inward=inward,
                            product_code=row["product_code"],
                            quantity=row["quantity"],
                            sub_inventory=row["sub_inventory"],
                            inventory_type=row["inventory_type"]
                        )
                        for _, row in group.iterrows()
                    ]


                    InwardItem.objects.bulk_create(items)

                    for item in items:
                        update_inventory(
                            product_code=item.product_code,
                            plant=plant,
                            sub_inventory=item.sub_inventory,
                            quantity=item.quantity
                        )

                    created_inwards.append(inward.inward_number)

            return Response(
                {
                    "message": "Bulk inward uploaded successfully",
                    "inward_numbers": created_inwards
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    "message": "Bulk upload failed",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )