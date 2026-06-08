from django.db import models
from django_api_mixins import ModelMixin

from core.models.base_models import BaseModel


class TransferTypeChoices(models.TextChoices):
    SUBINVENTORY_TO_SUBINVENTORY = "SubInventory to SubInventory"
    PLANT_TO_PLANT = "Plant to Plant"
    ZONE_TO_ZONE = "Zone to Zone"
    AISLE_TO_AISLE = "Aisle to Aisle"
    BIN_TO_BIN = "Bin to Bin"
    Rack_TO_RACK = "Rack to Rack"


class TransferStatusChoices(models.TextChoices):
    PENDING_APPROVAL = "Pending Approval"
    COMPLETED = "Completed"
    IN_TRANSIT = "In Transit"

class TransferModeChoices(models.TextChoices):
    INTERNAL_TRANSFER = "Internal Transfer"
    EXTERNAL_TRANSFER = "External Transfer"

class ProductTransfer(BaseModel, ModelMixin):
    transfer_id = models.CharField(max_length=100, null=True, blank=True)
    transfer_date = models.DateField()
    transfer_type = models.CharField(
        max_length=50,
        choices=TransferTypeChoices.choices,
        null=True, blank=True
    )
    transfer_mode = models.CharField(
        max_length=50,
        choices=TransferModeChoices.choices,
        null=True, blank=True
    )
    product_code = models.CharField(max_length=255,null=True,blank=True)
    from_location = models.CharField(max_length=255,null=True,blank=True)
    to_location = models.CharField(max_length=255,null=True,blank=True)
    quantity = models.FloatField(null=True, blank=True)
    reason = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, choices=TransferStatusChoices.choices, default=TransferStatusChoices.PENDING_APPROVAL.value)

    class Meta:
        db_table = "Product_transfer"

    def __str__(self):
        return f"{self.product_code} {self.from_location} → {self.to_location}"