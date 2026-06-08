from channels.db import database_sync_to_async
from django.db import connection

from tenants.models.tenants import Client


class TenantWebSocketMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        host = headers.get(b"host", b"").decode()

        tenant_name = self.get_tenant_from_host(host)

        if tenant_name:
            tenant = await self.get_tenant(tenant_name)
            if tenant:
                connection.set_tenant(tenant)
                scope["tenant"] = tenant
            else:
                connection.set_schema_to_public()
        else:
            connection.set_schema_to_public()

        return await self.app(scope, receive, send)

    def get_tenant_from_host(self, host: str):
        if "-pm." in host:
            return host.split("-pm.")[0]
        return None

    @database_sync_to_async
    def get_tenant(self, tenant_name):
        try:
            return Client.objects.get(schema_name=tenant_name)
        except Client.DoesNotExist:
            return None
