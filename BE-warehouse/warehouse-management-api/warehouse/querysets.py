from django.db.models import (
    ExpressionWrapper,
    F,
    FloatField,
    OuterRef,
    Subquery,
    Sum,
    Value,
)
from django.db.models.functions import Coalesce

from warehouse.models.requisition import RequisitionIssue


def with_requisition_issue_totals(queryset):
    """
    Per requisition: sum of related RequisitionIssue.quantity and remaining
    (requisition.quantity - issued).
    """
    return queryset.annotate(
        issued_quantity=Coalesce(
            Sum("requisition_issues__quantity"),
            Value(0.0),
            output_field=FloatField(),
        ),
    ).annotate(
        remaining_quantity=ExpressionWrapper(
            F("quantity") - F("issued_quantity"),
            output_field=FloatField(),
        ),
    )


def with_requisition_issue_rows_parent_totals(queryset):
    """
    Per issue row: parent requested qty, total issued on that requisition, remaining.
    """
    issued_sq = (
        RequisitionIssue.objects.filter(requisition_id=OuterRef("requisition_id"))
        .values("requisition_id")
        .annotate(_issued=Sum("quantity"))
        .values("_issued")[:1]
    )
    return (
        queryset.select_related("requisition")
        .annotate(
            _requisition_issued=Coalesce(
                Subquery(issued_sq, output_field=FloatField()),
                Value(0.0),
            ),
        )
        .annotate(
            requested_quantity=F("requisition__quantity"),
            requisition_remaining_quantity=ExpressionWrapper(
                F("requisition__quantity") - F("_requisition_issued"),
                output_field=FloatField(),
            ),
        )
    )
