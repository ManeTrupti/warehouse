
from django.db import models
from django.utils import timezone
from core.models.base_models import BaseModel


class Inward(BaseModel):

    inward_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )

    plant = models.CharField(max_length=100,null=True,blank=True)


    supplier = models.CharField(max_length=200,null=True,blank=True)

    inward_date = models.DateField(auto_now_add=True,null=True,blank=True)

    remarks = models.TextField(blank=True)

    def save(self, *args, **kwargs):

        if not self.inward_number:

            today = timezone.now().strftime("%d-%m-%Y")

            last_inward = Inward.objects.filter(
                inward_number__startswith=f"IN-{today}"
            ).order_by("-inward_number").first()

            if last_inward:
                last_number = int(last_inward.inward_number.split("-")[-1])
                new_number = last_number + 1
            else:
                new_number = 1

            self.inward_number = f"IN-{today}-{str(new_number).zfill(3)}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.inward_number


class InwardItem(BaseModel):

    inward = models.ForeignKey(
        Inward,
        related_name="items",
        on_delete=models.CASCADE
    )

    product_code = models.CharField(max_length=100)


    quantity = models.FloatField()

    sub_inventory = models.CharField(max_length=100)

    inventory_type = models.CharField(max_length=100)



    def __str__(self):
        return f"{self.product_code} - {self.quantity}"
