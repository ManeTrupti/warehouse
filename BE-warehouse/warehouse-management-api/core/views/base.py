import logging

from django.db import connection
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from django_api_mixins import ModelFilterFieldsMixin, APIMixin
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.services.cache_service import delete_cache, get_cache, set_cache
from core.pagination import StandardPagination

logger = logging.getLogger(__name__)


class BaseConfigAPIView(APIMixin, ModelFilterFieldsMixin, APIView):
    """
    Central Base CRUD API with:
    - Search
    - Exact filtering
    - Pagination (centralized)
    - Multi-tenant caching
    - Logging
    """

    # Sentinel for abstract base class; concrete subclasses must override this.
    model = object
    serializer_class = None
    search_fields = []
    filter_fields = []

    # Pagination
    pagination_class = StandardPagination
    paginator = None

    # Cache config
    cache_enabled = False
    cache_timeout = None

    def paginate_queryset(self, queryset, request):
        """Paginate the queryset unless page_size=all or none."""

        if not self.pagination_class:
            return None

        page_size = request.query_params.get("page_size")

        if page_size in ["all", "none"]:
            return None

        self.paginator = self.pagination_class()
        return self.paginator.paginate_queryset(queryset, request, view=self)

    def get_paginated_response(self, data):
        """Return paginated response with metadata."""
        return self.paginator.get_paginated_response(data)

    def get_cache_key(self, request):
        """
        Generate tenant + API + query based cache key.
        Includes pagination params automatically.
        """
        base = f"{connection.schema_name}_{self.model.__name__}_list"

        params = request.query_params.dict()
        if params:
            param_str = "_".join([f"{k}_{v}" for k, v in sorted(params.items())])
            return f"{base}_{param_str}"

        return base

    def clear_cache(self):
        """
        Clear all list cache for this model.
        """
        if not self.cache_enabled:
            return

        base_key = f"{connection.schema_name}_{self.model.__name__}_list"
        delete_cache(base_key)

    # def get_queryset(self, request):
    #     """
    #     Return all objects with optional search & exact filters.
    #     """
    #
    #     queryset = self.model.objects.all()
    #     search = request.query_params.get("search")
    #     if search and self.search_fields:
    #         query = Q()
    #         for field in self.search_fields:
    #             query |= Q(**{f"{field}__icontains": search})
    #         queryset = queryset.filter(query)
    #
    #     # Exact match filters
    #     if self.filter_fields:
    #         filter_params = {
    #             field: request.query_params.get(field)
    #             for field in self.filter_fields
    #             if request.query_params.get(field) is not None
    #         }
    #         if filter_params:
    #             queryset = queryset.filter(**filter_params)
    #
    #     return queryset.order_by("id")

    def get_object(self, pk):
        """Return single object or 404"""
        return get_object_or_404(self.model, pk=pk)

    def get(self, request, pk=None, *args, **kwargs):
        try:
            if pk:
                obj = self.get_object(pk)
                serializer = self.get_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)

            cache_key = None

            if self.cache_enabled:
                cache_key = self.get_cache_key(request)
                cached = get_cache(cache_key)
                if cached:
                    return Response(cached, status=status.HTTP_200_OK)

            queryset = self.get_queryset()
            if queryset is not None:
                queryset = self.get_filtered_queryset()

            # APPLY PAGINATION
            page = self.paginate_queryset(queryset, request)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(serializer.data)
                if isinstance(paginated_response, Response):
                    response_data = paginated_response.data
                else:
                    response_data = paginated_response
            else:
                serializer = self.get_serializer(queryset, many=True)
                response_data = serializer.data

            # CACHE PAGINATED RESULT
            if self.cache_enabled:
                set_cache(cache_key, response_data, self.cache_timeout)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Error occurred while fetching {self.model.__name__}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_create(self, serializer):
        serializer.save()

    def post(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                self.perform_create(serializer)
                self.clear_cache()

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except DRFValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error occurred while creating {self.model.__name__}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, pk):
        try:
            obj = self.get_object(pk)
            serializer = self.get_serializer(obj, data=request.data)

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                self.clear_cache()

                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK,
                )

            return Response(
                serializer.errors,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        except DRFValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(
                f"Error occurred while updating {self.model.__name__} with id {pk}"
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, pk):
        try:
            obj = self.get_object(pk)
            serializer = self.get_serializer(obj, data=request.data, partial=True)

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                self.clear_cache()

                return Response(
                    serializer.data,
                    status=status.HTTP_200_OK,
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except DRFValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(
                f"Error occurred while partially updating {self.model.__name__} with id {pk}"
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        try:
            obj = self.get_object(pk)
            obj.delete()
            self.clear_cache()

            return Response(
                {"message": "Deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except Exception as e:
            logger.exception(
                f"Error occurred while deleting {self.model.__name__} with id {pk}"
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
