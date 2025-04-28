from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserReportViewSet, UserViewSet, BlogViewSet, ContactMessageViewSet,
    AdminUserListView, PendingHostelsView, ApproveHostelView, reject_hostel,
    ModerateFeedbackView, AdminReportListView, AdminDashboardStatsAPIView,
    AdminProfileView, RequestEmailChangeView, VerifyEmailChangeView,
    AboutUsView, AdminAllFeedbacksAPIView, AllFeedbacksView,
    TransactionListView, StudentListAPIView, HostelOwnerListAPIView,
    booking_trend_data, user_distribution_data, feedback_rating_data,
    SendAdminNotificationView, PublicAboutUsAPIView,
    PublicBlogListAPIView, PublicBlogDetailAPIView
)

from hostel_owner.views import DownloadReportView


# Router Registration

router = DefaultRouter()
router.register('reports', UserReportViewSet)
router.register('all-users', UserViewSet, basename='admin-users')
router.register('blogs', BlogViewSet, basename='blog')
router.register('contact-messages', ContactMessageViewSet, basename='contact-messages')


# URL Patterns

urlpatterns = [
    path('', include(router.urls)),

    # --- Admin User Management ---
    path("users/students/", StudentListAPIView.as_view(), name="admin-student-list"),
    path("users/hostel-owners/", HostelOwnerListAPIView.as_view(), name="admin-hostel-owner-list"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),

    # --- Hostel Management ---
    path("hostels/pending/", PendingHostelsView.as_view(), name="pending-hostels"),
    path("hostels/<int:pk>/approve/", ApproveHostelView.as_view(), name="approve-hostel"),
    path("hostels/<int:hostel_id>/reject/", reject_hostel, name="reject-hostel"),

    # --- Feedback Management ---
    path("feedback/<int:pk>/moderate/", ModerateFeedbackView.as_view(), name="moderate-feedback"),
    path("all-feedbacks/", AllFeedbacksView.as_view(), name="all-feedbacks"),
    path("admin-all-feedbacks/", AdminAllFeedbacksAPIView.as_view(), name="admin_all_feedbacks"),

    # --- Reports ---
    path("reports/", AdminReportListView.as_view(), name="admin-reports"),

    # --- Dashboard Statistics ---
    path("dashboard/stats/", AdminDashboardStatsAPIView.as_view(), name="admin-dashboard-stats"),
    path("dashboard/booking-trend/", booking_trend_data),
    path("dashboard/user-distribution/", user_distribution_data),
    path("dashboard/feedback-ratings/", feedback_rating_data),

    # --- Admin Profile Management ---
    path("me/", AdminProfileView.as_view(), name="admin-profile"),
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("profile/request-email-change/", RequestEmailChangeView.as_view(), name="request-email-change"),
    path("profile/verify-email-change/", VerifyEmailChangeView.as_view(), name="verify-email-change"),

    # --- About Us ---
    path("about/", AboutUsView.as_view(), name="about-us"),

    # --- Transactions ---
    path("transactions/", TransactionListView.as_view(), name="admin-transactions"),

    # --- Admin Notifications ---
    path("send-notification/", SendAdminNotificationView.as_view(), name="admin-send-notification"),

    # --- Report Download ---
    path("download_report/<str:report_type>/<str:format_type>/", DownloadReportView.as_view(), name="admin-download-report"),

    # --- Public Routes ---
    path("public/about/", PublicAboutUsAPIView.as_view(), name="public-about"),
    path("public/blogs/", PublicBlogListAPIView.as_view(), name="public-blog-list"),
    path("public/blogs/<int:id>/", PublicBlogDetailAPIView.as_view(), name="public-blog-detail"),
]
