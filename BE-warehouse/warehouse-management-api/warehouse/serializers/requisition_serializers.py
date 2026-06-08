from django.db import transaction
from django.db.models import FloatField, Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.serializers import ModelSerializer

from core.services.inventory_service import InventoryService
from core.services.mdm_service import MDMService
from core.views.base import logger
from warehouse.choices import RequisitionStatusChoices
from warehouse.models.requisition import Requisition, RequisitionIssue
from warehouse.querysets import (
    with_requisition_issue_rows_parent_totals,
    with_requisition_issue_totals,
)


class RequisitionIssueSerializer(ModelSerializer):
    requested_quantity = serializers.FloatField(read_only=True)
    requisition_remaining_quantity = serializers.FloatField(read_only=True)

    class Meta:
        model = RequisitionIssue
        fields = "__all__"


    def get_available_qty(self, obj:Requisition):
        params = {
            "product_code": obj.product,
            "sub_inventory": obj.from_sub_inventory,
            "plant": "Plant 1", # By default, plant 1 will be fetched as plant management is not discussed
        }
        inventory_response =  InventoryService.get("/inventory-stock/", params=params)
        print("Inventory response URL: ", InventoryService.URL)
        print("Inventory response : ", inventory_response)
        logger.info(
            inventory_response
        )
        return inventory_response[0].get("quantity") if inventory_response else None

    def to_representation(self, instance):
        if getattr(instance, "requested_quantity", None) is None:
            instance = (
                with_requisition_issue_rows_parent_totals(
                    RequisitionIssue.objects.filter(pk=instance.pk)
                ).first()
                or instance
            )
        return super().to_representation(instance)

    @transaction.atomic
    def create(self, validated_data):
        requisition_ref = validated_data.get("requisition")
        requisition_pk = (
            requisition_ref.pk
            if isinstance(requisition_ref, Requisition)
            else requisition_ref
        )
        accepted_quantity = validated_data.get("quantity")
        if accepted_quantity is None:
            raise ValidationError({"message": "Accepted quantity is required."})
        if accepted_quantity <= 0:
            raise ValidationError({"message": "Accepted quantity must be greater than zero."})

        requisition = get_object_or_404(
            Requisition.objects.select_for_update(),
            pk=requisition_pk,
        )

        available = self.get_available_qty(requisition)
        if available is None:
            raise ValidationError(
                {
                    "message": (
                        "Could not determine available inventory for this product "
                        "and sub-inventory."
                    )
                }
            )
        if available < accepted_quantity:
            raise ValidationError(
                {
                    "message": (
                        "Accepted quantity must not exceed available quantity "
                        f"({available})."
                    )
                }
            )
        issued = RequisitionIssue.objects.filter(requisition=requisition).aggregate(
            total=Coalesce(Sum("quantity"), Value(0.0), output_field=FloatField())
        )["total"]
        issued = float(issued or 0.0)
        remaining = float(requisition.quantity) - issued
        if accepted_quantity > remaining:
            raise ValidationError(
                {
                    "quantity": (
                        f"Accepted quantity ({accepted_quantity}) exceeds remaining "
                        f"requisition quantity ({remaining})."
                    )
                }
            )

        #-------- MDM queries -----------
        mdm_query_params = {
            "code": requisition.product

        }
        mdm_response = MDMService.get("/mdm/products/", params=mdm_query_params)
        if isinstance(mdm_response, dict) and mdm_response.get("success") is False:
            raise ValidationError(
                {
                    "requisition": {
                        "message": "MDM API returned client error",
                        "product_code": requisition.product,
                        "mdm_status_code": mdm_response.get("status_code"),
                        "mdm_error_response": mdm_response.get("response"),
                        "mdm_request_url": mdm_response.get("url"),
                    }
                }
            )

        # ----------------- Inventory Services --------------
        params = {
            "product_code": requisition.product,
            "sub_inventory": requisition.from_sub_inventory,
            "plant": "Plant 1", # By default, plant 1 will be fetched as plant management is not discussed
        }
        inventory_response = InventoryService.get("/inventory-stock/", params=params)
        if not inventory_response:
            raise ValidationError(
                "Inventory might be not working, as not getting response"
            )

        inventory_response = inventory_response[0]
        requested_quantity = inventory_response.get("quantity")
        inventory_payload = dict(
            sub_inventory=requisition.from_sub_inventory,
            quantity=requested_quantity - accepted_quantity # become remaining quantity
        )
        InventoryService.patch(f"/inventory-stock/{inventory_response.get('id')}/", payload=inventory_payload)

        # Create or update to sub inventory for which we are adding raw materials
        if mdm_response["data"]:
            mdm_response = mdm_response["data"][0]

        inventory_payload = {
            "product_code": requisition.product,
            "product_name": mdm_response.get("name"),
            "product_id": mdm_response.get("id"),
            "plant": "Plant 1",  # hardcoded currently, as per discussed this will be removed in-future.
            "sub_inventory": requisition.to_sub_inventory,
            "quantity": accepted_quantity
        }

        InventoryService.post(f"/inventory-stock/", payload=inventory_payload)

        issue = super().create(validated_data)

        new_total_issued = issued + float(accepted_quantity)
        new_remaining = float(requisition.quantity) - new_total_issued
        if new_remaining <= 1e-6:
            requisition.status = RequisitionStatusChoices.ACCEPTED.value
        else:
            requisition.status = RequisitionStatusChoices.PARTIAL_ACCEPTED.value
        requisition.save(update_fields=["status"])

        return issue


class RequisitionSerializer(ModelSerializer):
    available_qty = serializers.SerializerMethodField(required=False, read_only=True)
    issued_quantity = serializers.FloatField(read_only=True)
    remaining_quantity = serializers.FloatField(read_only=True)
    requisition_issues = RequisitionIssueSerializer(many=True, read_only=True, required=False)

    class Meta:
        model = Requisition
        fields = "__all__"

    def to_representation(self, instance):
        if getattr(instance, "issued_quantity", None) is None:
            instance = (
                with_requisition_issue_totals(Requisition.objects.filter(pk=instance.pk))
                .first()
                or instance
            )
        return super().to_representation(instance)

    REQUISITION_PREFIX = "REQ-"
    REQUISITION_PADDING = 4


    def get_available_qty(self, obj:Requisition):
        params = {
            "product_code": obj.product,
            "sub_inventory": obj.from_sub_inventory,
            "plant": "Plant 1", # By default, plant 1 will be fetched as plant management is not discussed
        }
        inventory_response =  InventoryService.get("/inventory-stock/", params=params)
        print("Inventory response URL: ", InventoryService.URL)
        print("Inventory response : ", inventory_response)
        logger.info(
            inventory_response
        )
        return inventory_response[0].get("quantity") if inventory_response else None

    def _format_requisition_num(self, record_id):
        return f"{self.REQUISITION_PREFIX}{str(record_id).zfill(self.REQUISITION_PADDING)}"

    @transaction.atomic
    def create(self, validated_data):
        requisition = Requisition.objects.filter(
            product=validated_data.get("product"),
            workstation=validated_data.get("workstation"),
            from_sub_inventory=validated_data.get("from_sub_inventory"),
            to_sub_inventory=validated_data.get("to_sub_inventory"),
            status=RequisitionStatusChoices.OPEN.value,
        ).first()

        if requisition:
            requisition.quantity += validated_data.get("quantity", 0)
            # requisition.remaining_quantity = requisition.quantity
            requisition.save(update_fields=["quantity"])
        else:
            requisition = super().create(validated_data)

            if not requisition.requisition_num:
                requisition.requisition_num = self._format_requisition_num(requisition.id)
                # requisition.remaining_quantity = requisition.quantity
                requisition.save(update_fields=["requisition_num"])
        return requisition