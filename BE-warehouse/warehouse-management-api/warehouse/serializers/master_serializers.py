# from rest_framework import serializers
# from warehouse.models import Location, Plant, Store, Warehouse
#
#
# # ================== LOCATION ==================
# class LocationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Location
#         fields = "__all__"
#
#
# # ================== PLANT ==================
# class PlantSerializer(serializers.ModelSerializer):
#     location_code = serializers.CharField(write_only=True)
#     location_code_display = serializers.CharField(source="location.code", read_only=True)
#
#     class Meta:
#         model = Plant
#         fields = [
#             "id",
#             "plant_name",
#             "plant_code",
#             "location",
#             "location_code",
#             "location_code_display",
#             "description"
#         ]
#         read_only_fields = ["location"]
#
#     def create(self, validated_data):
#         location_code = validated_data.pop("location_code")
#
#         try:
#             location = Location.objects.get(code=location_code)
#         except Location.DoesNotExist:
#             raise serializers.ValidationError({
#                 "location_code": "Invalid location_code"
#             })
#
#         validated_data["location"] = location
#         return super().create(validated_data)
#
#
# # ================== STORE ==================
# class StoreSerializer(serializers.ModelSerializer):
#     plant_code = serializers.CharField(write_only=True)
#     plant_code_display = serializers.CharField(source="plant.plant_code", read_only=True)
#
#     class Meta:
#         model = Store
#         fields = [
#             "id",
#             "store_name",
#             "store_code",
#             "plant",
#             "plant_code",
#             "plant_code_display",
#             "description"
#         ]
#         read_only_fields = ["plant"]
#
#     def create(self, validated_data):
#         plant_code = validated_data.pop("plant_code")
#
#         try:
#             plant = Plant.objects.get(plant_code=plant_code)
#         except Plant.DoesNotExist:
#             raise serializers.ValidationError({
#                 "plant_code": "Invalid plant_code"
#             })
#
#         validated_data["plant"] = plant
#         return super().create(validated_data)
#
#
# # ================== WAREHOUSE ==================
# class WarehouseSerializer(serializers.ModelSerializer):
#     plant_code = serializers.CharField(write_only=True)
#     plant_code_display = serializers.CharField(source="plant.plant_code", read_only=True)
#
#     class Meta:
#         model = Warehouse
#         fields = [
#             "id",
#             "warehouse_name",
#             "warehouse_code",
#             "plant",
#             "plant_code",
#             "plant_code_display",
#             "description"
#         ]
#         read_only_fields = ["plant"]
#
#     def create(self, validated_data):
#         plant_code = validated_data.pop("plant_code")
#
#         try:
#             plant = Plant.objects.get(plant_code=plant_code)
#         except Plant.DoesNotExist:
#             raise serializers.ValidationError({
#                 "plant_code": "Invalid plant_code"
#             })
#
#         validated_data["plant"] = plant
#         return super().create(validated_data)