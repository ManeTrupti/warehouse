
from rest_framework.response import Response
from rest_framework.views import APIView

from warehouse.models.product_issue import ProductIssue
from warehouse.serializers.product_issue_serializer import ProductIssueSerializer
from warehouse.services.inventory_services import update_inventory


class ProductIssueProcessAPIView(APIView):

    def post(self, request, pk):

        approve = request.data.get("approve", True)

        try:

            issue = ProductIssue.objects.get(id=pk)

            if issue.status != "PENDING":
                return Response({"error": "Already processed"}, status=400)

            if not approve:
                issue.status = "REJECTED"
                issue.save()
                return Response({"message": "Issue rejected"})

            product_code = issue.product_id
            plant = issue.request.plant_code
            quantity = float(issue.quantity)

            from_store = issue.from_location
            to_store = issue.to_location

            reference = str(issue.id)

            # 🔻 Deduct stock
            update_inventory(
                product_code=product_code,
                plant=plant,
                location_code=from_store,
                quantity=quantity,
                transaction_type="OUT",
                transfer_type=issue.request.transfer_type,
                reference=reference
            )

            # 🔺 Add stock
            update_inventory(
                product_code=product_code,
                plant=plant,
                location_code=to_store,
                quantity=quantity,
                transaction_type="IN",
                transfer_type=issue.request.transfer_type,
                reference=reference
            )

            issue.status = "APPROVED"
            issue.save()

            issue.request.status = "PROCESSED"
            issue.request.save()

            return Response({
                "message": "Issue approved & inventory updated",
                "data": ProductIssueSerializer(issue).data
            })

        except ProductIssue.DoesNotExist:
            return Response({"error": "Issue not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=400)