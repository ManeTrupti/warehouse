from django.core.cache import cache
from django.db import connection


def tenant_cache_key(key: str) -> str:
    """
    Generate a tenant-specific cache key.

    """
    return f"{connection.schema_name}_{key}"


def get_cache(key: str):
    """
    Retrieve a value from the cache for the current tenant.

    """
    value = cache.get(tenant_cache_key(key))
    return value


def set_cache(key: str, value, timeout=None):
    """
    Store a value in the cache for the current tenant.

    """
    cache.set(tenant_cache_key(key), value, timeout)


def delete_cache(key: str):
    """
    Remove a value from the cache for the current tenant.

    """
    cache.delete(tenant_cache_key(key))
