import logging

from django.db import transaction
from django.utils.text import slugify
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.settings import BASE_DOMAIN
from tenants.models.tenants import Client, Domain

logger = logging.getLogger(__name__)


class TenantView(APIView):

    def get(self, request, pk=None):
        try:
            if pk:
                tenant = Client.objects.get(pk=pk)
                return Response(
                    {
                        "id": tenant.id,
                        "name": tenant.name,
                        "schema_name": tenant.schema_name,
                        "is_active": tenant.is_active,
                        "is_system": tenant.is_system,
                        "created_on": tenant.created_on,
                    },
                    status=status.HTTP_200_OK,
                )

            tenants = Client.objects.all()

            data = [
                {
                    "id": tenant.id,
                    "name": tenant.name,
                    "schema_name": tenant.schema_name,
                    "is_active": tenant.is_active,
                    "is_system": tenant.is_system,
                    "created_on": tenant.created_on,
                }
                for tenant in tenants
            ]

            return Response(data, status=status.HTTP_200_OK)

        except Client.DoesNotExist:
            return Response(
                {"error": "Tenant not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            logger.exception("Error fetching tenant(s)")
            return Response(
                {"error": "Something went wrong"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        try:
            name = request.data.get("name")

            if not name:
                return Response(
                    {"error": "Tenant name is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Extract first word for schema
            first_word = name.strip().split()[0]
            schema_name = slugify(first_word.lower())

            # Prevent duplicate schema
            if Client.objects.filter(schema_name=schema_name).exists():
                return Response(
                    {"error": "Tenant with this schema already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                tenant = Client.objects.create(
                    name=name,
                    schema_name=schema_name,
                    is_active=True,
                    is_system=False,
                )

                domain_name = f"{schema_name}.{BASE_DOMAIN}"

                Domain.objects.create(
                    domain=domain_name,
                    tenant=tenant,
                    is_primary=True,
                )

            return Response(
                {
                    "message": "Tenant created successfully",
                    "tenant": {
                        "id": tenant.id,
                        "name": tenant.name,
                        "schema_name": tenant.schema_name,
                        "domain": domain_name,
                        "is_active": tenant.is_active,
                        "is_system": tenant.is_system,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception:
            logger.exception("Error creating tenant")
            return Response(
                {"error": "Something went wrong"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, pk=None):
        try:
            if not pk:
                return Response(
                    {"error": "Tenant ID is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            tenant = Client.objects.get(pk=pk)

            name = request.data.get("name")
            is_active = request.data.get("is_active")

            if name:
                tenant.name = name

            if is_active is not None:
                tenant.is_active = is_active

            tenant.save()

            return Response(
                {
                    "message": "Tenant updated successfully",
                    "tenant": {
                        "id": tenant.id,
                        "name": tenant.name,
                        "schema_name": tenant.schema_name,
                        "is_active": tenant.is_active,
                        "is_system": tenant.is_system,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Client.DoesNotExist:
            return Response(
                {"error": "Tenant not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            logger.exception("Error updating tenant")
            return Response(
                {"error": "Something went wrong"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk=None):
        try:
            if not pk:
                return Response(
                    {"error": "Tenant ID is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            tenant = Client.objects.get(pk=pk)

            if tenant.is_system:
                return Response(
                    {"error": "System tenant cannot be deleted"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            tenant.delete()

            return Response(
                {"message": "Tenant deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except Client.DoesNotExist:
            return Response(
                {"error": "Tenant not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            logger.exception("Error deleting tenant")
            return Response(
                {"error": "Something went wrong"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )