# serializers.py

from rest_framework import serializers

from warehouse.models.putaway_models import Allocation


class AllocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Allocation
        fields = "__all__"

        read_only_fields = ["unallocated_qty"]

    def validate_allocated_qty(self, value):
        if value <= 0:
            raise serializers.ValidationError("Allocated qty must be greater than 0")
        return value