from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelViewSet, RoomViewSet, BookingViewSet, FeedbackViewSet, FloorViewSet,
    DashboardView, submit_feedback, GetHostelStudents, get_confirmed_students,
    AvailableHostelsView, get_current_user, HostelOwnerProfileView, get_all_hostel_students,
    DownloadReportView, ChatHistoryView, OwnerNotificationListView, delete_notification,
    mark_notification_as_read, mark_all_notifications_as_read, list_students,
    delete_message, get_students_with_hostels, delete_conversation,
    get_all_verified_hostels, get_all_hostels, get_active_bookings
)


# DRF Router Setup (ViewSets)

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet, basename="booking")
router.register(r'feedback', FeedbackViewSet)
router.register(r'floors', FloorViewSet)
router.register(r'hostels', HostelViewSet, basename='hostel')


# URL Patterns
urlpatterns = [
    # ViewSets (automatically generated routes)
    path('', include(router.urls)),

    # Feedback Management
    path('students/feedback/', submit_feedback),  # Submit student feedback

    # Hostel Students
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name='hostel-students'),
    path('hostels/<int:hostel_id>/students/confirmed/', get_confirmed_students, name='confirmed-students'),
    path('students/', get_all_hostel_students, name='hostel_students'),  # Get all students across hostels
    path('students/list/', list_students, name="list_students"),  # List students simple endpoint
    path('chat-students/', get_students_with_hostels),  # Students with chat hostels

    # Hostel Listings
    path('available-hostels/', AvailableHostelsView.as_view(), name='available-hostels'),
    path('verified-hostels/', get_all_verified_hostels, name='verified-hostels'),
    path('all-hostels/', get_all_hostels),

    # Hostel Owner Profile
    path('auth/user/', get_current_user),
    path('profile/', HostelOwnerProfileView.as_view(), name='hostel-owner-profile'),

    # Dashboard and Reports
    path('dashboard/', DashboardView.as_view(), name='hostel_owner_dashboard'),
    path('download-report/<str:report_type>/<str:format_type>/', DownloadReportView.as_view(), name='download_report'),

    # Chat System
    path('chat-history/<int:hostel_id>/', ChatHistoryView.as_view(), name='chat_history'),
    path('delete-message/<int:message_id>/', delete_message, name='delete_message'),
    path('delete-conversation/<int:hostel_id>/', delete_conversation),

    # Active Bookings
    path('active-bookings/', get_active_bookings, name="active_bookings"),

    # Notification Management
    path('notifications/', OwnerNotificationListView.as_view(), name='owner_notifications'),
    path('notifications/<int:notification_id>/mark_read/', mark_notification_as_read, name='mark_notification_as_read'),
    path('notifications/mark_all_read/', mark_all_notifications_as_read, name='mark_all_notifications_as_read'),
    path('notifications/<int:notification_id>/', delete_notification, name='delete_notification'),
]
