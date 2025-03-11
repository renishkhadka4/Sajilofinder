from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelViewSet, RoomViewSet, BookingViewSet, FeedbackViewSet, DashboardView,
    get_confirmed_students, submit_feedback, GetHostelStudents, AvailableHostelsView,
    FloorViewSet, get_current_user, HostelOwnerProfileView,get_all_hostel_students 
)

router = DefaultRouter()
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet, basename="booking")
router.register(r'feedback', FeedbackViewSet)
router.register(r'floors', FloorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('students/feedback/', submit_feedback),
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name='hostel-students'),
    path('hostels/<int:hostel_id>/students/', get_confirmed_students, name='confirmed-students'),
    path("available-hostels/", AvailableHostelsView.as_view(), name="available-hostels"),
    path("auth/user/", get_current_user),
    path('profile/', HostelOwnerProfileView.as_view(), name='hostel-owner-profile'),
    path("students/", get_all_hostel_students, name="get_all_hostel_students"),
]
