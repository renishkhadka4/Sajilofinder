from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from hostel_owner.models import Booking, Room, Hostel
from .models import StudentProfile
from .serializers import StudentProfileSerializer, BookingSerializer, HostelSerializer

# ✅ Search & Filter Hostels
class HostelSearchView(ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    search_fields = ['location', 'name', 'address', 'description']

# ✅ Book a Hostel
class BookHostelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        room_id = request.data.get("room_id")
        check_in = request.data.get("check_in_date")
        check_out = request.data.get("check_out_date")

        try:
            room = Room.objects.get(id=room_id)
            if not room.is_available:
                return Response({"error": "Room not available."}, status=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.create(
                student=request.user,
                room=room,
                check_in=check_in,
                check_out=check_out,
                status='pending'
            )
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

# ✅ View Student's Own Bookings
class StudentBookingHistoryView(ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(student=self.request.user)

# ✅ Cancel a Booking
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, student=request.user)
            if booking.status in ["rejected", "confirmed"]:
                return Response({"error": "You cannot cancel this booking"}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = "rejected"
            booking.save()
            return Response({"message": "Booking cancelled successfully"}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

# ✅ Manage Student Profile
class StudentProfileView(RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return StudentProfile.objects.get(user=self.request.user)
