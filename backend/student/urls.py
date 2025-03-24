from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelSearchView, 
    StudentBookingHistoryView, 
    CancelBookingView, 
    StudentProfileView,
    BookHostelView,
    BookingViewSet,
    submit_feedback,get_student_notifications
)

router = DefaultRouter()
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("hostels/search/", HostelSearchView.as_view(), name="hostel-search"),
    path("students/bookings/my-history/", StudentBookingHistoryView.as_view(), name="booking-history"),
    path("bookings/<int:booking_id>/cancel/", CancelBookingView.as_view(), name="cancel-booking"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path("bookings/", BookHostelView.as_view(), name="book-hostel"),
    path("feedback/", submit_feedback, name="submit-feedback"),
    path('notifications/', get_student_notifications, name='student-notifications'),
]
