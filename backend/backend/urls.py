from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from drf_yasg.generators import OpenAPISchemaGenerator


# Swagger Security Settings
SECURITY_DEFINITIONS = {
    'Bearer': {
        'type': 'apiKey',
        'description': "Enter JWT token with **Bearer** prefix. Example: `Bearer your_token_here`",
        'name': 'Authorization',
        'in': 'header',
    }
}


# Custom Swagger Schema Generator
class CustomSchemaGenerator(OpenAPISchemaGenerator):
    def get_schema(self, request=None, public=False):
        schema = super().get_schema(request, public)
        schema.security_definitions = SECURITY_DEFINITIONS  # Add Bearer Token info to Swagger
        return schema


# Swagger Schema View Setup
schema_view = get_schema_view(
    openapi.Info(
        title="SajiloFinder API",
        default_version='v1',
        description="API documentation for SajiloFinder Hostel Booking Platform",
    ),
    public=True,
    generator_class=CustomSchemaGenerator,
    permission_classes=(permissions.AllowAny,),
)


# URL Patterns
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Core APIs
    path('api/', include('api.urls')),

    # Hostel Owner APIs
    path('hostel_owner/', include('hostel_owner.urls')),  # Optional direct URL
    path('api/hostel_owner/', include('hostel_owner.urls')),  # API prefixed

    # Student APIs
    path('api/students/', include('student.urls')),

    # Admin Panel APIs
    path('api/admin/', include('admin_panel.urls')),

    # Community APIs
    path('api/community/', include('community.urls')),

    # Swagger & Redoc Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]


# Media Files Serving (Development Only)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
