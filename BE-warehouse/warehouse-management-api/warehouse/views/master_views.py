# from core.views.base import BaseConfigAPIView
# from warehouse.models import Location, Plant, Store, Warehouse
# from warehouse.serializers.master_serializers import (
#     LocationSerializer,
#     PlantSerializer,
#     StoreSerializer,
#     WarehouseSerializer,
# )
#
#
# class LocationAPIView(BaseConfigAPIView):
#     """
#     CRUD API for main locations like Pune, Mumbai, Chennai.
#     """
#     model = Location
#     serializer_class = LocationSerializer
#     search_fields = ["name", "code"]
#     filter_fields = ["is_active"]
#
#
# class PlantAPIView(BaseConfigAPIView):
#     """
#     CRUD API for plants under a location.
#     """
#     model = Plant
#     serializer_class = PlantSerializer
#     search_fields = ["plant_name", "plant_code"]
#     filter_fields = ["location", "is_active"]
#
#
# class StoreAPIView(BaseConfigAPIView):
#     """
#     CRUD API for stores under a plant.
#     """
#     model = Store
#     serializer_class = StoreSerializer
#     search_fields = ["store_name", "store_code"]
#     filter_fields = ["plant", "is_active"]
#
#
# class WarehouseAPIView(BaseConfigAPIView):
#     """
#     CRUD API for warehouses under a plant.
#     """
#     model = Warehouse
#     serializer_class = WarehouseSerializer
#     search_fields = ["warehouse_name", "warehouse_code"]
#     filter_fields = ["plant", "is_active"]