from django.db import models
# from core.models.base_models import BaseModel
#
#
# class Location(BaseModel):
#     """
#     Master table representing the main geographical/business location
#     such as Pune, Mumbai, Chennai, etc.
#
#     One location can have multiple plants.
#     """
#
#     name = models.CharField(max_length=255, unique=True)
#     code = models.CharField(max_length=50, unique=True)
#     description = models.TextField(blank=True, null=True)
#
#     class Meta:
#         db_table = "location_master"
#         verbose_name = "Location"
#         verbose_name_plural = "Locations"
#         ordering = ["name"]
#
#     def __str__(self):
#         return f"{self.code} - {self.name}"