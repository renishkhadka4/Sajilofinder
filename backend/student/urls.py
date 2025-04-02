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
from .views import mark_all_notifications_read
from .views import update_feedback, delete_feedback
from .views import get_current_user
router = DefaultRouter()
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path("hostels/search/", HostelSearchView.as_view(), name="hostel-search"),
    path("bookings/manual/", BookHostelView.as_view(), name="book-hostel-manual"),  # 👈 changed
    path("bookings/<int:booking_id>/cancel/", CancelBookingView.as_view(), name="cancel-booking"),
    path("bookings/my-history/", StudentBookingHistoryView.as_view(), name="booking-history"),
    path("students/profile/", StudentProfileView.as_view(), name="student-profile"),
    path("feedback/", submit_feedback, name="submit-feedback"),
    path('notifications/', get_student_notifications, name='student-notifications'),
    path("notifications/mark_all_read/", mark_all_notifications_read, name="mark-all-notifications-read"),
    path("feedback/<int:pk>/update/", update_feedback, name="update-feedback"),
    path("feedback/<int:pk>/delete/", delete_feedback, name="delete-feedback"),
    path("me/", get_current_user, name="get-current-user"),

    path('', include(router.urls)),  
]

