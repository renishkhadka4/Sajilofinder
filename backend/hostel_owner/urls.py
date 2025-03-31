from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelViewSet, RoomViewSet, BookingViewSet, FeedbackViewSet, DashboardView,
    get_confirmed_students, submit_feedback, GetHostelStudents, AvailableHostelsView,
    FloorViewSet, get_current_user, HostelOwnerProfileView,get_all_hostel_students ,DownloadReportView,ChatHistoryView,OwnerNotificationListView
)
from .views import mark_notification_as_read, mark_all_notifications_as_read
router = DefaultRouter()
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet, basename="booking")
router.register(r'feedback', FeedbackViewSet)
router.register(r'floors', FloorViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('students/feedback/', submit_feedback),
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name='hostel-students'),
    path('hostels/<int:hostel_id>/students/', get_confirmed_students, name='confirmed-students'),
    path("available-hostels/", AvailableHostelsView.as_view(), name="available-hostels"),
    path("auth/user/", get_current_user),
    path('profile/', HostelOwnerProfileView.as_view(), name='hostel-owner-profile'),
    path("students/", get_all_hostel_students, name="get_all_hostel_students"),
    path("dashboard/", DashboardView.as_view(), name="hostel_owner_dashboard"),
    path("download-report/<str:report_type>/<str:format_type>/", DownloadReportView.as_view(), name="download_report"),
    path("chat-history/<int:hostel_id>/", ChatHistoryView.as_view(), name="chat_history"),
    path('notifications/', OwnerNotificationListView.as_view(), name='owner_notifications'),

    path("notifications/<int:notification_id>/mark_read/", mark_notification_as_read, name="mark_notification_as_read"),
    path("notifications/mark_all_read/", mark_all_notifications_as_read, name="mark_all_notifications_as_read"),

    
]
