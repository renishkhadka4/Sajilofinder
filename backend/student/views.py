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

from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from hostel_owner.models import Room, Booking  # ✅ Import from hostel_owner instead of student

from .serializers import BookingSerializer

class BookHostelView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        # ✅ Debugging
        print(f"📌 DEBUG: User - {request.user} (ID: {request.user.id}, Role: {request.user.role})")

        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        room_id = request.data.get("room_id")
        check_in = request.data.get("check_in")
        check_out = request.data.get("check_out")

        if not room_id or not check_in or not check_out:
            return Response({"error": "room_id, check_in, and check_out are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            room = Room.objects.get(id=room_id)

            if not room.is_available:
                return Response({"error": "Room is not available"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Correctly assign the student when creating a booking
            booking = Booking.objects.create(
                student=request.user,  
                room=room,
                check_in=check_in,
                check_out=check_out,
                status='pending'
            )

            print("✅ Booking created:", booking)
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)









from rest_framework import viewsets
from hostel_owner.models import Booking
from student.serializers import BookingSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from hostel_owner.models import Room, Booking
from student.serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        room_id = self.request.data.get("room_id")

        if not room_id:
            raise serializers.ValidationError({"room_id": "This field is required."})

        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            raise serializers.ValidationError({"room_id": "Invalid room ID."})

        serializer.save(student=self.request.user, room=room)


    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """ ✅ Hostel Owner Approves Booking ✅ """
        booking = self.get_object()
        if booking.status != 'pending':
            return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'confirmed'
        booking.save()
        return Response({'message': 'Booking approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """ ❌ Hostel Owner Rejects Booking ❌ """
        booking = self.get_object()
        if booking.status != 'pending':
            return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'rejected'
        booking.save()
        return Response({'message': 'Booking rejected'}, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from hostel_owner.models import Booking
from student.serializers import BookingSerializer
from rest_framework.response import Response

class StudentBookingHistoryView(ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        student = self.request.user
        print(f"📌 DEBUG: Request from user = {student}")  # ✅ Log user
        
        if not student.is_authenticated:
            return Booking.objects.none()  # ✅ Return empty queryset instead of unauthorized error
        
        queryset = Booking.objects.filter(student=student)
        print(f"📌 DEBUG: Found {queryset.count()} bookings")  # ✅ Log found bookings
        return queryset

# ✅ Cancel a Booking
class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, student=request.user)

            # Prevent canceling confirmed/rejected bookings
            if booking.status in ["confirmed", "rejected"]:
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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from hostel_owner.models import Booking, Feedback, Hostel
from .serializers import FeedbackSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_feedback(request):
    """
    ✅ Allows students to submit feedback **only if their booking is confirmed**.
    """
    student = request.user
    hostel_id = request.data.get("hostel_id")
    rating = request.data.get("rating")
    comment = request.data.get("comment")

    # ✅ Ensure required fields are provided
    if not hostel_id or not rating or not comment:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Check if the student has a confirmed booking in this hostel
    has_booking = Booking.objects.filter(
        student=student, room__floor__hostel_id=hostel_id, status='confirmed'
    ).exists()

    if not has_booking:
        return Response({'error': 'You can only leave feedback for hostels where you have a confirmed booking.'}, 
                        status=status.HTTP_403_FORBIDDEN)

    # ✅ Create Feedback Entry
    feedback = Feedback.objects.create(
        student=student, 
        hostel_id=hostel_id, 
        rating=rating, 
        comment=comment
    )

    return Response({'message': 'Feedback submitted successfully!'}, status=status.HTTP_201_CREATED)
