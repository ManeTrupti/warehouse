
from rest_framework import serializers
from warehouse.models.inward import Inward, InwardItem


class InwardItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = InwardItem
        fields = [
            "id",
            "product_code",
            "quantity",
            "sub_inventory",
            "inventory_type",
        ]


class InwardSerializer(serializers.ModelSerializer):

    items = InwardItemSerializer(many=True)

    class Meta:
        model = Inward
        fields = [
            "id",
            "inward_number",
            "plant",
            "supplier",
            "inward_date",
            "remarks",
            "items"
        ]

        read_only_fields = ["inward_number"]

    def create(self, validated_data):

        items_data = validated_data.pop("items")

        inward = Inward.objects.create(**validated_data)

        item_list = []

        for item in items_data:

            item_list.append(
                InwardItem(
                    inward=inward,
                    **item
                )
            )

        InwardItem.objects.bulk_create(item_list)

        return inward

class InwardItemUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = InwardItem
        fields = "__all__"