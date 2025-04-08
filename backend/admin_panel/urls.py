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
from .views import BlogViewSet
from .views import StudentListAPIView, HostelOwnerListAPIView
from .views import AdminDashboardStatsAPIView
from .views import AdminProfileView
from .views import ContactMessageViewSet
from .views import AdminAllFeedbacksAPIView
from .views import ModerateFeedbackView, AllFeedbacksView
from .views import TransactionListView
from .views import AdminProfileView, RequestEmailChangeView, VerifyEmailChangeView
from .views import AboutUsView
from .views import (
    booking_trend_data,
    user_distribution_data,
    feedback_rating_data,
)
from .views import SendAdminNotificationView
router = DefaultRouter()
router.register('reports', UserReportViewSet)
router.register(r'all-users', UserViewSet, basename='admin-users')

router.register(r'blogs', BlogViewSet, basename='blog')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-messages')

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
   
    path("dashboard/stats/", AdminDashboardStatsAPIView.as_view(), name="admin-dashboard-stats"),
    path("me/", AdminProfileView.as_view(), name="admin-profile"),
    path("pending-hostels/", PendingHostelsView.as_view(), name="pending-hostels"),
    path("approve-hostel/<int:pk>/", ApproveHostelView.as_view(), name="approve-hostel"),
    path("all-feedbacks/", AdminAllFeedbacksAPIView.as_view(), name="admin_all_feedbacks"),
    path('moderate-feedback/<int:pk>/', ModerateFeedbackView.as_view(), name='moderate-feedback'),
    path('all-feedbacks/', AllFeedbacksView.as_view(), name='all-feedbacks'),
    path('transactions/', TransactionListView.as_view(), name='admin-transactions'),
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("profile/request-email-change/", RequestEmailChangeView.as_view(), name="request-email-change"),
    path("profile/verify-email-change/", VerifyEmailChangeView.as_view(), name="verify-email-change"),
    path("about/", AboutUsView.as_view(), name="about-us"),
    path('dashboard/booking-trend/', booking_trend_data),
    path('dashboard/user-distribution/', user_distribution_data),
    path('dashboard/feedback-ratings/', feedback_rating_data),
    path('send-notification/', SendAdminNotificationView.as_view(), name='admin-send-notification'),
]

