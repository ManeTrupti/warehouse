from django.urls import path, include

from tenants.views.tenants import TenantView

urlpatterns = [
    path("tenants/", TenantView.as_view()),
    path("tenants/<int:pk>/", TenantView.as_view()),
    path("", include("warehouse.urls")),
]
