from django.urls import path, include
from rest_framework.routers import DefaultRouter

from warehouse.views.putaway_views import AllocationAPIView, AllocationStatusAPIView
from warehouse.views.requisition_views import RequisitionAPIView, RequisitionIssueAPIView
from warehouse.views.transfer_dropdown_views import TransferDropdownAPIView
from warehouse.services.product_issue import ProductIssueProcessAPIView
from warehouse.views.inward_views import InwardAPIView, InwardStatsAPIView, InwardDashboardAPIView, \
    InwardBulkUploadAPIView, InwardItemUpdateAPIView
from warehouse.views.mdm_views import MDMLocationAPIView, MDMPlantAPIView, MDMStoreAPIView, MDMSubInventoryAPIView, \
    MDMZoneAPIView, MDMProductAPIView, MDMSubzoneAPIView, MDMSupplierAPIView, MDMAisleAPIView, MDMRackAPIView, \
    MDMBinAPIView, MDMWorkstationsListAPIView,InventoryStockAPIView
# from warehouse.views.master_views import (
#     LocationAPIView,
#     PlantAPIView,
#     StoreAPIView,
#     WarehouseAPIView,
# )
from warehouse.views.product_issue import  ProductIssueAPIView
from warehouse.views.product_transfer_api import ProductTransferAPIView
from warehouse.views.plantbylocations_views import PlantsByLocationAPIView
from warehouse.views.inventory_views import FetchInventoryStock
from warehouse.views.subinventory_dashboard_view import SubInventoryDashboardAPIView
from warehouse.views.dashboard_api_view import DashboardAPIView
from warehouse.views.rack_dashboard_view import RackDashboardAPIView
from warehouse.views.bin_dashboard_view import BinDashboardAPIView
from warehouse.views.zone_dashboard_view import ZoneDashboardAPIView
from warehouse.views.inventory_trend_dashboard_view import InventoryDashboardAPIView



# router = DefaultRouter()
# router.register("requisition",RequisitionAPIView ,basename="requisition")


urlpatterns = [

    # path("locations/", LocationAPIView.as_view(), name="locations"),
    # path("locations/<int:pk>/", LocationAPIView.as_view(), name="location-detail"),
    #
    # path("plants/", PlantAPIView.as_view(), name="plants"),
    # path("plants/<int:pk>/", PlantAPIView.as_view(), name="plant-detail"),
    #
    # path("stores/", StoreAPIView.as_view(), name="stores"),
    # path("stores/<int:pk>/", StoreAPIView.as_view(), name="store-detail"),
    #
    # path("warehouses/", WarehouseAPIView.as_view(), name="warehouses"),
    # path("warehouses/<int:pk>/", WarehouseAPIView.as_view(), name="warehouse-detail"),




    path("inward/",InwardAPIView.as_view(), name="inward"),
    path("inward-item/",InwardItemUpdateAPIView.as_view()),
    path("inward-item/<int:pk>/",InwardItemUpdateAPIView.as_view()),
    path("inward/<int:pk>/",InwardAPIView.as_view(), name="inward"),
    path("inward/bulk-upload/", InwardBulkUploadAPIView.as_view()),
    path("inward/stats/", InwardStatsAPIView.as_view(), name="inward-stats"),
    path("inward/dashboard/", InwardDashboardAPIView.as_view(), name="inward-dashboard"),


    path("mdm-locations/",MDMLocationAPIView.as_view(), name="mdm-locations"),
    path("mdm-plants/",MDMPlantAPIView.as_view(), name="mdm-plants"),
    path("mdm-stores/",MDMStoreAPIView.as_view(), name="mdm-stores"),
    path("mdm-subinventories/",MDMSubInventoryAPIView.as_view(), name="mdm-subinventories"),
    path("mdm-zones/",MDMZoneAPIView.as_view(), name="mdm-zones"),
    path("mdm-products/",MDMProductAPIView.as_view(), name="mdm-products"),
    path("mdm-subzones/",MDMSubzoneAPIView.as_view(), name="mdm-subzones"),
    path("mdm-suppliers/",MDMSupplierAPIView.as_view(), name="mdm-suppliers"),
    path("mdm-aisles/", MDMAisleAPIView.as_view(), name="mdm-aisles"),
    path("mdm-racks/", MDMRackAPIView.as_view(), name="mdm-racks"),
    path("mdm-bins/", MDMBinAPIView.as_view(), name="mdm-bins"),
    path("mdm-workstations-list/", MDMWorkstationsListAPIView.as_view(), name="mdm-workstations-list"),
    path("inventory-stock/", InventoryStockAPIView.as_view(), name="inventory-stock"),
    path("product-transfer/",ProductTransferAPIView.as_view(),name="product-transfer"),
    path("product-transfer/<int:pk>/",ProductTransferAPIView.as_view(),name="product-transfer"),
    path("transfer-dropdowns/", TransferDropdownAPIView.as_view()),
    path("plants-by-location/", PlantsByLocationAPIView.as_view(), name="plants-by-location"),

    path("allocations/", AllocationAPIView.as_view(),name="products-allocation"),
    path("allocations/<int:pk>/", AllocationAPIView.as_view(),name="products-allocation"),
    path("allocation-status/", AllocationStatusAPIView.as_view(),name="allocation-status"),

    path("requisition/", RequisitionAPIView.as_view(), name="requisition"),
    path("requisition/<int:pk>/", RequisitionAPIView.as_view(), name="requisition-pk"),
    path("requisition/issue/", RequisitionIssueAPIView.as_view(), name="requisition-issue"),
    path("requisition/issue/<int:pk>/", RequisitionIssueAPIView.as_view(), name="requisition-issue-pk"),

    path("fetch-inventory-stock/", FetchInventoryStock.as_view(), name="fetch_inventory_stock"),
    
    path("dashboard/", DashboardAPIView.as_view()), 
    path("dashboard/subinventory/", SubInventoryDashboardAPIView.as_view()),
    path("dashboard/zone/", ZoneDashboardAPIView.as_view()),
    path("dashboard/rack/", RackDashboardAPIView.as_view()),
    path("dashboard/bin/", BinDashboardAPIView.as_view()),
    path("dashboard/movement-trend/", InventoryDashboardAPIView.as_view()),



    # path("", include(router.urls)),


]