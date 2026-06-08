from django.db import models
from django_tenants.models import DomainMixin, TenantMixin

from core.models.base_models import BaseModel


class Client(BaseModel, TenantMixin):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)

    auto_create_schema = True
    auto_drop_schema = True

    def __str__(self):
        return self.name


class Domain(DomainMixin):
    pass
