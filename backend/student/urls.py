from django.urls import path
from .views import (
    HostelSearchView, 
    StudentBookingHistoryView, 
    CancelBookingView, 
    StudentProfileView,
    BookHostelView
)

urlpatterns = [
    path("hostels/search/", HostelSearchView.as_view(), name="hostel-search"),
    path("bookings/my-history/", StudentBookingHistoryView.as_view(), name="booking-history"),
    path("bookings/<int:booking_id>/cancel/", CancelBookingView.as_view(), name="cancel-booking"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path("bookings/", BookHostelView.as_view(), name="book-hostel"),
]
