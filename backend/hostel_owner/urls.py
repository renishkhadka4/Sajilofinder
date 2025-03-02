from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HostelViewSet, RoomViewSet, BookingViewSet, FeedbackViewSet, DashboardView
from .views import get_confirmed_students, submit_feedback
from .views import GetHostelStudents
from .views import AvailableHostelsView
router = DefaultRouter()
router.register(r'hostels', HostelViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'feedback', FeedbackViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('students/feedback/', submit_feedback),  
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name='hostel-students'),
    path('hostels/<int:hostel_id>/students/', GetHostelStudents, name="get_hostel_students"),
    path('hostels/<int:hostel_id>/students/', get_confirmed_students, name='confirmed-students'),
    path("available-hostels/", AvailableHostelsView.as_view(), name="available-hostels"),
]
