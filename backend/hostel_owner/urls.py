from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelViewSet, RoomViewSet, BookingViewSet, FeedbackViewSet, DashboardView,
    get_confirmed_students, submit_feedback, GetHostelStudents, AvailableHostelsView,
    FloorViewSet, get_current_user, HostelOwnerProfileView, get_all_hostel_students, DownloadReportView, 
    ChatHistoryView, OwnerNotificationListView, delete_notification, mark_notification_as_read, 
    mark_all_notifications_as_read, list_students,get_all_verified_hostels,get_all_hostels
)

from .views import delete_message
from .views import get_all_hostel_students
from .views import get_students_with_hostels,delete_conversation
# Set up the router to handle common ViewSets
router = DefaultRouter()
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet, basename="booking")
router.register(r'feedback', FeedbackViewSet)
router.register(r'floors', FloorViewSet)

urlpatterns = [
    # Include the default router URLs
    path('', include(router.urls)),

    # Your custom paths
    path('students/feedback/', submit_feedback),  # For submitting student feedback
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name='hostel-students'),  # Get students in a hostel
    path('hostels/<int:hostel_id>/students/confirmed/', get_confirmed_students, name='confirmed-students'),  # Confirmed students
    path('available-hostels/', AvailableHostelsView.as_view(), name='available-hostels'),  # Available hostels list
    path('auth/user/', get_current_user),  # Get current logged-in user
    path('profile/', HostelOwnerProfileView.as_view(), name='hostel-owner-profile'),  # Hostel Owner Profile
    path('students/', get_all_hostel_students, name='get_all_hostel_students'),  # Get all students
    path('dashboard/', DashboardView.as_view(), name='hostel_owner_dashboard'),  # Dashboard view
    path('download-report/<str:report_type>/<str:format_type>/', DownloadReportView.as_view(), name='download_report'),  # Download report
    path('chat-history/<int:hostel_id>/', ChatHistoryView.as_view(), name='chat_history'),  # Chat history for hostel owner
    path('notifications/', OwnerNotificationListView.as_view(), name='owner_notifications'),  # List of notifications

    # Notification actions
    path('notifications/<int:notification_id>/mark_read/', mark_notification_as_read, name='mark_notification_as_read'),
    path('notifications/mark_all_read/', mark_all_notifications_as_read, name='mark_all_notifications_as_read'),
    path('notifications/<int:notification_id>/', delete_notification, name='delete_notification'),

    # List students endpoint
    path('students/list/', list_students, name="list_students"), 
    path('delete-message/<int:message_id>/', delete_message, name='delete_message'),
    path("verified-hostels/", get_all_verified_hostels, name="verified-hostels"),
    path('students/', get_all_hostel_students, name='hostel_students'),
    path("chat-students/", get_students_with_hostels),
    path('delete-conversation/<int:hostel_id>/', delete_conversation),

    path("all-hostels/", get_all_hostels),



      # ✅ Updated path for list students
]

