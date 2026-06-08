from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from core.views.base import BaseConfigAPIView, logger
from warehouse.choices import RequisitionStatusChoices
from warehouse.models.requisition import Requisition, RequisitionIssue
from warehouse.querysets import (
    with_requisition_issue_rows_parent_totals,
    with_requisition_issue_totals,
)
from warehouse.serializers.requisition_serializers import (
    RequisitionIssueSerializer,
    RequisitionSerializer,
)


class RequisitionAPIView(BaseConfigAPIView):
    model = Requisition  # required
    serializer_class = RequisitionSerializer
    filterfields = Requisition.get_filter_fields()
    search_fields = ("requisition_num",)
    ordering = ("-id",)
    ordering_fields = ["requisition_num", "id", "quantity", "workstation", "created_on", "updated_on"]

    def get_queryset(self):
        return with_requisition_issue_totals(Requisition.objects.all())

    def get_object(self, pk):
        return get_object_or_404(
            with_requisition_issue_totals(Requisition.objects.all()),
            pk=pk,
        )


class RequisitionIssueAPIView(BaseConfigAPIView):
    model = RequisitionIssue
    serializer_class = RequisitionIssueSerializer
    filterfields = RequisitionIssue.get_filter_fields()
    ordering = ("-id",)
    ordering_fields = ["requisition", "id", "quantity", "created_on", "updated_on"]
    def get_queryset(self):
        return with_requisition_issue_rows_parent_totals(RequisitionIssue.objects.all())

    def get_object(self, pk):
        return get_object_or_404(
            with_requisition_issue_rows_parent_totals(RequisitionIssue.objects.all()),
            pk=pk,
        )

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                requisition = serializer.validated_data.get("requisition")
                if request.data.get("status") == RequisitionStatusChoices.REJECTED.value:
                    requisition.status = RequisitionStatusChoices.REJECTED.value
                    requisition.save(update_fields=["status"])
                    return Response(
                        {"message": "Requisition Rejected successfully."},
                        status=status.HTTP_200_OK,
                    )
                self.perform_create(serializer)
                self.clear_cache()

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error occurred while creating {self.model.__name__}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )