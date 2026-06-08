from django.conf import settings
from django.db import connection
from django.utils.deprecation import MiddlewareMixin

from core.utils.tenant import get_tenant_from_host
from tenants.models.tenants import Client


class SubdomainTenantMiddleware(MiddlewareMixin):

    def process_request(self, request):
        host = request.get_host().split(":")[0]
        base_domain = settings.BASE_DOMAIN

        print("HOST:", host)

        if host == base_domain:
            connection.set_schema_to_public()
            print("ACTIVE SCHEMA:", connection.schema_name)
            request.tenant = None
            return

        tenant_schema = get_tenant_from_host(host)
        print("tenant_schema:", tenant_schema)

        if tenant_schema:
            try:
                tenant = Client.objects.get(schema_name=tenant_schema)

                # 🔥 FORCE schema switch (THIS FIXES YOUR ISSUE)
                with connection.cursor() as cursor:
                    cursor.execute(f"SET search_path TO {tenant.schema_name}")

                print("✅ ACTIVE SCHEMA:", tenant.schema_name)

                request.tenant = tenant
                return

            except Client.DoesNotExist:
                pass

        connection.set_schema_to_public()
        print("ACTIVE SCHEMA:", connection.schema_name)
        request.tenant = None