from django.conf import settings


def get_tenant_from_host(host: str):
    if "-warehouse." in host:
        return host.split("-warehouse.")[0]
    return None
