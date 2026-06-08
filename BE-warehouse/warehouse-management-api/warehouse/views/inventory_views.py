from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.services.inventory_service import InventoryService

class FetchInventoryStock(APIView):

    def post(self, request):
        try:
            plant = request.data.get("plant")
            product_code = request.data.get("product_code")
            sub_inventory = request.data.get("sub_inventory")

            if not all([plant, product_code, sub_inventory]):
                return Response(
                    {"error": "Missing required fields"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data = InventoryService.get(
                endpoint="/inventory-stock/",
                params={
                    "product_code": product_code,
                    "plant": plant,
                    "sub_inventory": sub_inventory
                }
            )
            quantity = data[0].get("quantity", 0) if data else 0

            return Response({
                "product_code": product_code,
                "sub_inventory": sub_inventory,
                "plant_name":plant,
                "available_qty": quantity
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )