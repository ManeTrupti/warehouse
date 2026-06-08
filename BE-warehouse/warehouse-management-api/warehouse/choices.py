from core.models.base_models import BaseChoice


class RequisitionStatusChoices(BaseChoice):
    OPEN = "open"
    ACCEPTED = "accepted"
    PARTIAL_ACCEPTED = "partial accepted"
    REJECTED = "rejected"
    CLOSED = "closed"