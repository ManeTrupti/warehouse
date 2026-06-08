from enum import Enum
from typing import List

from django.db import models


class BaseModel(models.Model):
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseChoice(Enum):
    @classmethod
    def choices(cls):
        return [(choice.value, choice.value) for choice in cls]

    @classmethod
    def choices_dict(cls):
        return {choice.value: choice.value for choice in cls}

    @classmethod
    def choices_values(cls) -> List[str]:
        return [choice.value for choice in cls]

    @classmethod
    def choices_keys(cls) -> List[str]:
        return [choice.name for choice in cls]