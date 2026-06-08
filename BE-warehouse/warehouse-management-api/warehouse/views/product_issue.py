
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.db import transaction

from warehouse.models.product_issue import ProductIssue
from warehouse.models.product_transfer import ProductTransfer
from warehouse.serializers.product_issue_serializer import ProductIssueSerializer




class ProductIssueAPIView(APIView):

    def post(self, request):

        transfer_ids = request.data.get("transfer_ids", [])

        if not transfer_ids:
            return Response(
                {"message": "request_ids list is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        issues_created = []

        with transaction.atomic():

            transfers = ProductTransfer.objects.filter(id__in=transfer_ids)

            if not transfers.exists():
                return Response(
                    {"message": "No valid transfer_ids found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            for req in transfers:
                status_value = request.data.get("status", "PENDING")

                issue = ProductIssue.objects.create(
                    request=req,
                    product_id=req.product_code,
                    quantity=req.quantity,
                    from_location=req.from_store,
                    to_location=req.to_store,
                    status=status_value
                )

                issues_created.append(issue)

        return Response(
            {
                "message": "Issues created successfully",
                "count": len(issues_created),
                "data": ProductIssueSerializer(issues_created, many=True).data
            },
            status=status.HTTP_201_CREATED
        )