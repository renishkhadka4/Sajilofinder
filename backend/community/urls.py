from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet


# DRF Router Setup
router = DefaultRouter()
router.register('posts', PostViewSet, basename='posts')  # Post CRUD APIs
router.register('comments', CommentViewSet, basename='comments')  # Comment CRUD APIs


# URL Patterns
urlpatterns = [
    path('', include(router.urls)),  # Include all router-registered routes
]
