from rest_framework import serializers


class PlantByLocationSerializer(serializers.Serializer):
    """
    Serializer for Plant data coming from MDMService
    """

    plant_code = serializers.CharField()
    plant_name = serializers.CharField()
    location_code = serializers.CharField()

    # Optional fields (MDM may or may not return)
    location_name = serializers.CharField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)


