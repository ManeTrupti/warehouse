# from django.db import models
# from core.models.base_models import BaseModel
#
#
# class Store(BaseModel):
#     """
#     Master table for stores under a plant.
#
#     Each store belongs to one plant.
#     One plant can have multiple stores.
#     """
#
#     plant = models.ForeignKey(
#         "warehouse.Plant",
#         on_delete=models.CASCADE,
#         related_name="stores"
#     )
#     store_name = models.CharField(max_length=255)
#     store_code = models.CharField(max_length=50)
#     description = models.TextField(blank=True, null=True)
#
#     class Meta:
#         db_table = "store_master"
#         verbose_name = "Store"
#         verbose_name_plural = "Stores"
#         ordering = ["store_name"]
#         unique_together = ("plant", "store_code")
#
#     def __str__(self):
#         return f"{self.store_code} - {self.store_name}"