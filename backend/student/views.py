from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from hostel_owner.models import Booking, Room, Hostel
from .models import StudentProfile
from .serializers import StudentProfileSerializer, BookingSerializer, HostelSerializer
from rest_framework import serializers
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
from rest_framework import serializers  # ✅ Fix missing import
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from hostel_owner.models import Booking
from student.serializers import BookingSerializer
from django.core.mail import send_mail
from django.conf import settings
import logging

from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
import logging
from hostel_owner.models import Booking, Room
from student.serializers import BookingSerializer
from rest_framework.permissions import IsAuthenticated

# ✅ Enable logging
logger = logging.getLogger(__name__)
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import requests

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """ ✅ Ensure room exists before booking """
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
        """ ✅ Hostel Owner Approves Booking & Sends Email ✅ """
        try:
            booking = self.get_object()

            if booking.status != 'pending':
                return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = 'confirmed'
            booking.save()

            print(f"✅ Booking {booking.id} confirmed. Calling send_booking_email()")  # ✅ Debugging Output
            self.send_booking_email(booking, "Confirmed")  # ✅ Call function directly

            return Response({'message': 'Booking approved, email sent!'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """ ❌ Hostel Owner Rejects Booking ❌ """
        try:
            booking = self.get_object()

            if booking.status != 'pending':
                return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = 'rejected'
            booking.save()

            print(f"❌ Booking {booking.id} rejected. Calling send_booking_email()")  # ✅ Debugging Output
            self.send_booking_email(booking, "Rejected")  # ✅ Call function directly

            return Response({'message': 'Booking rejected, email sent!'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    def send_booking_email(self, booking, status):
        """ ✅ Send email to student when booking is confirmed/rejected ✅ """
        try:
            recipient_email = booking.student.email

            logger.info(f"📧 Attempting to send email to {recipient_email} - Status: {status}")
            print(f"📧 Attempting to send email to {recipient_email} - Status: {status}")  # ✅ Debugging Output

            subject = f"Your Booking has been {status}"
            message = f"Hello {booking.student.username},\n\n" \
                      f"Your booking for {booking.room.floor.hostel.name} has been {status}.\n" \
                      f"Check-in: {booking.check_in}\nCheck-out: {booking.check_out}\n" \
                      f"Thank you for using SajiloFinder!"

            send_mail(subject, message, settings.EMAIL_HOST_USER, [recipient_email], fail_silently=False)

            logger.info(f"✅ Booking email successfully sent to {recipient_email} - Status: {status}")
            print(f"✅ Booking email successfully sent to {recipient_email} - Status: {status}")  # ✅ Debugging Output

        except Exception as e:
            logger.error(f"❌ Error sending booking email to {recipient_email}: {str(e)}")
            print(f"❌ Error sending booking email to {recipient_email}: {str(e)}")  # ✅ Debugging Output

    
    @action(detail=True, methods=['post'], url_path='initiate-payment')
    def initiate_payment(self, request, pk=None):
        booking = self.get_object()

        payload = {
            "return_url": "http://localhost:3000/khalti/verify/",
            "website_url": "http://localhost:3000/",
            "amount": 1800 * 100,  # In paisa
            "purchase_order_id": f"BOOKING-{booking.id}",
            "purchase_order_name": "Hostel Security Deposit",
            "customer_info": {
                "name": request.user.username,
                "email": request.user.email,
                "phone": "9800000001"  # 🔁 Use test phone or ask during payment
            }
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post("https://dev.khalti.com/api/v2/epayment/initiate/", json=payload, headers=headers)
        
        if response.status_code == 200:
            return Response(response.json(), status=200)
        else:
            return Response(response.json(), status=400)

    @action(detail=False, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request):
        pidx = request.data.get("pidx")

        if not pidx:
            return Response({"error": "pidx is required"}, status=400)

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "pidx": pidx
        }

        response = requests.post("https://dev.khalti.com/api/v2/epayment/lookup/", json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()

            if data["status"] == "Completed":
                # Confirm booking if needed
                return Response({"message": "✅ Payment verified!", "booking_status": "confirmed"})
            else:
                return Response({"message": "❌ Payment not completed", "status": data["status"]}, status=400)
        else:
            return Response(response.json(), status=400)

        
    
        
    



        
    



        
    


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



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    data = [
        {
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        }
        for n in notifications
    ]
    return Response(data)



