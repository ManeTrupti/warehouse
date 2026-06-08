# warehouse/models/product_issue.py

from django.db import models
from core.models.base_models import BaseModel
from warehouse.models.product_transfer import ProductTransfer


class IssueStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class ProductIssue(BaseModel):

    request = models.ForeignKey(
        ProductTransfer,
        on_delete=models.CASCADE,
        related_name="issues"
    )

    product_id = models.CharField(max_length=255)
    quantity = models.FloatField()

    from_location = models.CharField(max_length=255)
    to_location = models.CharField(max_length=255)

    status = models.CharField(
        max_length=20,
        choices=IssueStatusChoices.choices,
        default=IssueStatusChoices.PENDING
    )

    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"Issue-{self.id} | {self.product_id}"