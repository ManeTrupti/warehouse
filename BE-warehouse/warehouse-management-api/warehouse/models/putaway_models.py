
from django.db import models
from django.utils import timezone
from django_api_mixins import ModelMixin
from core.models.base_models import BaseModel

class Allocation(BaseModel, ModelMixin):

    sub_inventory= models.CharField(max_length=255,null=True, blank=True)
    product_code = models.CharField(max_length=255,null=True, blank=True)
    grn_number = models.CharField(max_length=255,null=True, blank=True)
    zone_code = models.CharField(max_length=255,null=True, blank=True)
    aisle_code = models.CharField(max_length=255,null=True, blank=True)
    rack_code = models.CharField(max_length=255,null=True, blank=True)
    bin_code = models.CharField(max_length=255,null=True, blank=True)
    allocated_qty = models.FloatField(null=True, blank=True)
    unallocated_qty = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'putaway_allocation'
        ordering = ("-id",)

    def generate_grn_number(self):
        today = timezone.localdate()
        date_part = today.strftime("%Y%m%d")

        last_record = (
            Allocation.objects.filter(
                grn_number__startswith=f"GRN-{date_part}"
            )
            .only("grn_number")
            .order_by("-id")
            .first()
        )

        next_no = (
            int(last_record.grn_number.split("-")[-1]) + 1
            if last_record and last_record.grn_number
            else 1
        )

        return f"GRN-{date_part}-{str(next_no).zfill(4)}"

    def save(self, *args, **kwargs):
        if not self.pk:  # only when creating new record
            self.grn_number = self.generate_grn_number()
        return super().save(*args, **kwargs)