from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserReportViewSet
from .views import AdminUserListView, PendingHostelsView, ApproveHostelView
from .views import UserViewSet
from .views import reject_hostel
from .views import ModerateFeedbackView
from .views import AdminReportListView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogViewSet, ContactMessageListView
from .views import StudentListAPIView, HostelOwnerListAPIView
from .views import AdminDashboardStatsAPIView
from .views import AdminProfileView
router = DefaultRouter()
router.register('reports', UserReportViewSet)
router.register(r'all-users', UserViewSet, basename='admin-users')

router.register(r'blogs', BlogViewSet, basename='blog')
urlpatterns = [
    path('', include(router.urls)),
    
    # Specific routes first
    path("users/students/", StudentListAPIView.as_view(), name="admin-student-list"),
    path("users/hostel-owners/", HostelOwnerListAPIView.as_view(), name="admin-hostel-owner-list"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),

    path("hostels/pending/", PendingHostelsView.as_view()),
    path('hostels/<int:pk>/approve/', ApproveHostelView.as_view(), name='approve-hostel'),
    path('hostels/<int:hostel_id>/reject/', reject_hostel, name="reject-hostel"),
    path('feedback/<int:pk>/moderate/', ModerateFeedbackView.as_view(), name='moderate-feedback'),
    path('reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('contact-messages/', ContactMessageListView.as_view(), name='contact-messages'),
    path("dashboard/stats/", AdminDashboardStatsAPIView.as_view(), name="admin-dashboard-stats"),
    path("me/", AdminProfileView.as_view(), name="admin-profile"),
]

