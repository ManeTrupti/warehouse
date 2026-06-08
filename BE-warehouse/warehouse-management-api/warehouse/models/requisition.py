from django_api_mixins import ModelMixin

from core.models.base_models import BaseModel, BaseChoice
from django.db import models

from warehouse.choices import RequisitionStatusChoices


class Requisition(BaseModel, ModelMixin):
    requisition_num = models.CharField(max_length=100, null=True, blank=True)
    workstation = models.CharField()
    to_sub_inventory = models.CharField()
    from_sub_inventory = models.CharField(null=True, blank=True)
    product = models.CharField()
    quantity = models.FloatField() # requested quantity
    status = models.CharField(max_length=100,choices=RequisitionStatusChoices.choices(),default=RequisitionStatusChoices.OPEN.value, null=True, blank=True) # Open, Approved, Rejected, Closed

    class Meta:
        db_table = 'requisition'
        ordering = ("-id", )


class RequisitionIssue(BaseModel, ModelMixin):
    """
    Here, requisition, will only be issued, neither open nor rejected. only accepted quantities of requisition will keep here.
    """
    requisition = models.ForeignKey(Requisition, on_delete=models.CASCADE, related_name="requisition_issues", db_index=True)
    quantity = models.FloatField()
    remarks = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'requisition_issue'
        ordering = ("-id",)
