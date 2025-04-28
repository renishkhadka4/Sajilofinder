# Student App - URL Configuration
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelSearchView, StudentBookingHistoryView, CancelBookingView,
    StudentProfileView, BookHostelView, BookingViewSet, submit_feedback,
    get_student_notifications, mark_all_notifications_read, update_feedback,
    delete_feedback, get_current_user, verify_khalti_payment,
    student_chat_history, student_profile, get_hostel_owner_by_hostel,
    request_email_change, verify_email_change, student_hostel_detail
)

# Setup DRF Router
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='student-bookings')

urlpatterns = [
    # Hostel Search
    path("hostels/search/", HostelSearchView.as_view(), name="hostel-search"),
    path('hostels/<int:hostel_id>/', student_hostel_detail, name='student-hostel-detail'),

    # Booking Management
    path("bookings/manual/", BookHostelView.as_view(), name="book-hostel-manual"),
    path("bookings/<int:booking_id>/cancel/", CancelBookingView.as_view(), name="cancel-booking"),
    path("bookings/my-history/", StudentBookingHistoryView.as_view(), name="booking-history"),

    # Student Profile
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path("profile/", StudentProfileView.as_view(), name="student-profile"),  # same view accessible via two paths
    path('profile/request-email-change/', request_email_change, name="request-email-change"),
    path('profile/verify-email-change/', verify_email_change, name="verify-email-change"),
    path('profile/', student_profile),  # function-based profile endpoint (if needed)

    # Feedback
    path("feedback/", submit_feedback, name="submit-feedback"),
    path("feedback/<int:pk>/update/", update_feedback, name="update-feedback"),
    path("feedback/<int:pk>/delete/", delete_feedback, name="delete-feedback"),

    # Notifications
    path('notifications/', get_student_notifications, name='student-notifications'),
    path("notifications/mark_all_read/", mark_all_notifications_read, name="mark-all-notifications-read"),

    # User Management
    path("me/", get_current_user, name="get-current-user"),
    path("verify-khalti/", verify_khalti_payment, name="verify-khalti"),

    # Chat
    path('chat-history/<int:hostel_id>/', student_chat_history),
    path('get-owner/<int:hostel_id>/', get_hostel_owner_by_hostel),

    # DRF Router URLs
    path('', include(router.urls)),
]
