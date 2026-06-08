from rest_framework import serializers

from tenants.models.tenants import Client


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "schema_name",
            "name",
            "paid_until",
            "on_trial",
            "created_on",
        ]
        read_only_fields = ["created_on"]
