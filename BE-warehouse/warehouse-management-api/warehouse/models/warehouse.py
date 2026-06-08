# from django.db import models
# from core.models.base_models import BaseModel
#
#
# class Warehouse(BaseModel):
#     """
#     Master table for warehouses under a plant.
#
#     Each warehouse belongs to one plant.
#     One plant can have multiple warehouses.
#     """
#
#     plant = models.ForeignKey(
#         "warehouse.Plant",
#         on_delete=models.CASCADE,
#         related_name="warehouses"
#     )
#     warehouse_name = models.CharField(max_length=255)
#     warehouse_code = models.CharField(max_length=50)
#     description = models.TextField(blank=True, null=True)
#
#     class Meta:
#         db_table = "warehouse_master"
#         verbose_name = "Warehouse"
#         verbose_name_plural = "Warehouses"
#         ordering = ["warehouse_name"]
#         unique_together = ("plant", "warehouse_code")
#
#     def __str__(self):
#         return f"{self.warehouse_code} - {self.warehouse_name}"