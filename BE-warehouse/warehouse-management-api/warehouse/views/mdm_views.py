from core.services.mdm_service import MDMService
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.services.inventory_service import InventoryService

class MDMLocationAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            location_response = MDMService.get("/warehouse/locations/", query_params)

            if hasattr(location_response, "status_code") and location_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return location_response

            return Response(location_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch locations from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMPlantAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            plants_response = MDMService.get("/warehouse/plants/", query_params)

            if hasattr(plants_response, "status_code") and plants_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return plants_response

            return Response(plants_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch plants from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMStoreAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            stores_response = MDMService.get("/warehouse/stores/", query_params)

            if hasattr(stores_response, "status_code") and stores_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return stores_response

            return Response(stores_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch stores from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMSubInventoryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            subinventories_response = MDMService.get("/warehouse/subinventories/", query_params)

            if hasattr(subinventories_response, "status_code") and subinventories_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return subinventories_response

            return Response(subinventories_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch subinventories from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )





class MDMZoneAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            zones_response = MDMService.get("/warehouse/zones/", query_params)

            if hasattr(zones_response, "status_code") and zones_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return zones_response

            return Response(zones_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch zones from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMProductAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            products_response = MDMService.get("/mdm/products/", query_params)

            if hasattr(products_response, "status_code") and products_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return products_response

            return Response(products_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch products from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMSubzoneAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            subzones_response = MDMService.get("/warehouse/subzones/", query_params)

            if hasattr(subzones_response, "status_code") and subzones_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return subzones_response

            return Response(subzones_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch subzones from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MDMSupplierAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params
            suppliers_response = MDMService.get("/mdm/suppliers/", query_params)

            if hasattr(suppliers_response, "status_code") and suppliers_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return suppliers_response

            return Response(suppliers_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch suppliers from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class MDMAisleAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params

            aisles_response = MDMService.get(
                "/warehouse/aisles/",
                query_params
            )

            if hasattr(aisles_response, "status_code") and aisles_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return aisles_response

            return Response(aisles_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch aisles from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MDMRackAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params

            racks_response = MDMService.get(
                "/warehouse/racks/",
                query_params
            )

            if hasattr(racks_response, "status_code") and racks_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return racks_response

            return Response(racks_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch racks from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class MDMBinAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params

            bins_response = MDMService.get(
                "/warehouse/bins/",
                query_params
            )

            if hasattr(bins_response, "status_code") and bins_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return bins_response

            return Response(bins_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch bins from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MDMWorkstationsListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            query_params = request.query_params

            bins_response = MDMService.get(
                "/mdm/workstations/list/",
                query_params
            )

            if hasattr(bins_response, "status_code") and bins_response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                return bins_response

            return Response(bins_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "Failed to fetch bins from MDM", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InventoryStockAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            inventory_response = InventoryService.get(
                "/inventory-stock/",
                params=request.query_params
            )

            return Response(inventory_response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    "message": "Failed to fetch inventory data",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )