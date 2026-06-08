from rest_framework import serializers
from warehouse.models.product_issue import ProductIssue


class ProductIssueSerializer(serializers.ModelSerializer):

    plant = serializers.CharField(source="request.plant_code", read_only=True)


    class Meta:
        model = ProductIssue
        fields = "__all__"

    def validate(self, data):

        if data["quantity"] <= 0:
            raise serializers.ValidationError("Quantity must be > 0")

        return data