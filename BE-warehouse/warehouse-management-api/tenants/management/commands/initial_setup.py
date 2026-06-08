from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import connection

from tenants.models.tenants import Client, Domain

User = get_user_model()


class Command(BaseCommand):
    help = "🚀 Complete system setup: Public schema + Global superuser"

    def handle(self, *args, **options):
        self.stdout.write("")
        self.stdout.write(
            "🚀 Initializing Multi-Tenant Production Monitoring System..."
        )
        self.stdout.write("")

        # CREATE PUBLIC TENANT (MANDATORY)
        public_tenant, created = Client.objects.get_or_create(
            schema_name="public",
            defaults={
                "name": "Global Portal",
                "is_system": True,
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS("✅ Public tenant created"))
        else:
            self.stdout.write(self.style.WARNING("ℹ️ Public tenant already exists"))

        # CREATE GLOBAL DOMAIN (warehouse.indi4.io)
        Domain.objects.get_or_create(
            domain="warehouse.indi4.io",
            tenant=public_tenant,
            defaults={"is_primary": True},
        )

        self.stdout.write(
            self.style.SUCCESS("✅ Global domain configured: warehouse.indi4.io")
        )

        # FINAL OUTPUT

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("🎉 SYSTEM READY!"))
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS("   Global Portal: http://warehouse.indi4.io:8000/admin/")
        )
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "⏭️  NEXT STEP: Create tenant via API using globaladmin credentials"
            )
        )
        self.stdout.write("")
