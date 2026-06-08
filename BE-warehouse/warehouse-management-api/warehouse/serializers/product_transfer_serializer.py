from django.db import transaction
from rest_framework import serializers
from warehouse.models.product_transfer import ProductTransfer


class ProductTransferSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductTransfer
        fields = "__all__"

    PREFIX = "TR-"
    PADDING = 4

    def _format_requisition_num(self, record_id):
        return f"{self.PREFIX}{str(record_id).zfill(self.PADDING)}"

    def validate(self, data):
        if self.instance:
            return data
        if data["quantity"] <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")

        return data

    @transaction.atomic
    def create(self, validated_data):
        product_transfer = super().create(validated_data)

        if not product_transfer.transfer_id:
            product_transfer.transfer_id = self._format_requisition_num(product_transfer.id)
            product_transfer.save(update_fields=["transfer_id"])

        return product_transfer