# from django.db import models
# from core.models.base_models import BaseModel
#
#
# class Plant(BaseModel):
#     """
#     Master table for plants/factories.
#
#     Each plant belongs to one location.
#     One location can have multiple plants.
#     """
#
#     location = models.ForeignKey(
#         "warehouse.Location",
#         on_delete=models.CASCADE,
#         related_name="plants"
#     )
#     plant_name = models.CharField(max_length=255)
#     plant_code = models.CharField(max_length=50, unique=True)
#     description = models.TextField(blank=True, null=True)
#
#     class Meta:
#         db_table = "plant_master"
#         verbose_name = "Plant"
#         verbose_name_plural = "Plants"
#         ordering = ["plant_name"]
#
#     def __str__(self):
#         return f"{self.plant_code} - {self.plant_name}"