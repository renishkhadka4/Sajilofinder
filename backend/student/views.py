from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from hostel_owner.models import Booking, Room, Hostel
from .models import StudentProfile
from .serializers import StudentProfileSerializer, BookingSerializer, HostelSerializer
from rest_framework import serializers
#  Search & Filter Hostels
class HostelSearchView(ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    search_fields = ['location', 'name', 'address', 'description']

from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from hostel_owner.models import Room, Booking  #  Import from hostel_owner instead of student

from .serializers import BookingSerializer

class BookHostelView(APIView):
    permission_classes = [IsAuthenticated]  

    def post(self, request):
        #  Debugging
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

            #  Correctly assign the student when creating a booking
            booking = Booking.objects.create(
                student=request.user,  
                room=room,
                check_in=check_in,
                check_out=check_out,
                status='pending'
            )

            print(" Booking created:", booking)
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)




# views.py (in student app)
# student/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from hostel_owner.models import ChatMessage

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_chat_history(request, hostel_id):
    user = request.user

    # Make sure this is a student user
    if user.role != 'Student':
        return Response({"error": "Forbidden"}, status=403)

    # Return only messages where the student is involved
    messages = ChatMessage.objects.filter(
        hostel_id=hostel_id
    ).filter(
        models.Q(sender=user) | models.Q(receiver=user)
    ).order_by("timestamp")

    chat_data = [
        {
            "sender": msg.sender.username,
            "receiver": msg.receiver.username,
            "message": msg.message,
            "image_url": msg.image.url if msg.image else None,
            "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for msg in messages
    ]

    return Response(chat_data)



from rest_framework import generics, permissions
from .serializers import StudentProfileSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user  # returns the logged-in student
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

@api_view(["POST"])
def request_email_change(request):
    new_email = request.data.get("new_email")
    if not new_email:
        return Response({"error": "Email is required"}, status=400)

    user = request.user
    otp = get_random_string(length=6, allowed_chars='0123456789')
    user.email = new_email
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.is_verified = False
    user.save()

    send_mail(
        "Verify Your New Email",
        f"Your OTP is {otp}. It will expire in 5 minutes.",
        settings.EMAIL_HOST_USER,
        [new_email],
        fail_silently=False
    )

    return Response({"message": "OTP sent to new email"}, status=200)


@api_view(["POST"])
def verify_email_change(request):
    otp = request.data.get("otp")
    user = request.user

    if not otp or otp != user.otp:
        return Response({"error": "Invalid or expired OTP"}, status=400)

    user.otp = ""
    user.otp_created_at = None
    user.is_verified = True
    user.save()

    return Response({"message": "Email verified successfully!"}, status=200)


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
from rest_framework import serializers  #  Fix missing import
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

#  Enable logging
logger = logging.getLogger(__name__)
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import requests
from hostel_owner.models import Payment


logger = logging.getLogger(__name__)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """  Ensure room exists before booking """
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
        """  Hostel Owner Approves Booking & Sends Email  """
        try:
            booking = self.get_object()

            if booking.status != 'pending':
                return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = 'confirmed'
            booking.save()

            print(f" Booking {booking.id} confirmed. Calling send_booking_email()")  #  Debugging Output
            self.send_booking_email(booking, "Confirmed")  #  Call function directly

            return Response({'message': 'Booking approved, email sent!'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """  Hostel Owner Rejects Booking  """
        try:
            booking = self.get_object()

            if booking.status != 'pending':
                return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = 'rejected'
            booking.save()

            print(f" Booking {booking.id} rejected. Calling send_booking_email()")  #  Debugging Output
            self.send_booking_email(booking, "Rejected")  # Call function directly

            return Response({'message': 'Booking rejected, email sent!'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    def send_booking_email(self, booking, status):
        """  Send email to student when booking is confirmed/rejected  """
        try:
            recipient_email = booking.student.email

            logger.info(f" Attempting to send email to {recipient_email} - Status: {status}")
            print(f" Attempting to send email to {recipient_email} - Status: {status}")  #  Debugging Output

            subject = f"Your Booking has been {status}"
            message = f"Hello {booking.student.username},\n\n" \
                      f"Your booking for {booking.room.floor.hostel.name} has been {status}.\n" \
                      f"Check-in: {booking.check_in}\nCheck-out: {booking.check_out}\n" \
                      f"Thank you for using SajiloFinder!"

            send_mail(subject, message, settings.EMAIL_HOST_USER, [recipient_email], fail_silently=False)

            logger.info(f" Booking email successfully sent to {recipient_email} - Status: {status}")
            print(f" Booking email successfully sent to {recipient_email} - Status: {status}")  #  Debugging Output

        except Exception as e:
            logger.error(f" Error sending booking email to {recipient_email}: {str(e)}")
            print(f" Error sending booking email to {recipient_email}: {str(e)}")  #  Debugging Output



    @action(detail=True, methods=['post'], url_path='initiate-payment')
    def initiate_payment(self, request, pk=None):
        booking = self.get_object()

        payload = {
            "return_url": "http://localhost:3000/khalti/verify/",
            "website_url": "http://localhost:3000/",
            "amount": 1800 * 100,
            "purchase_order_id": f"BOOKING-{booking.id}",
            "purchase_order_name": "Hostel Security Deposit",
            "customer_info": {
                "name": request.user.username,
                "email": request.user.email,
                "phone": "9800000001"
            }
        }

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        response = requests.post("https://dev.khalti.com/api/v2/epayment/initiate/", json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            booking.pidx = data.get("pidx")
            booking.save()
            return Response(data, status=200)
        else:
            try:
                error_data = response.json()
            except ValueError:
                error_data = {
                    "error": "Invalid response from Khalti.",
                    "status_code": response.status_code,
                    "text": response.text,
                }
            return Response(error_data, status=response.status_code)





    @action(detail=False, methods=['post'], url_path='verify-payment')
    def verify_payment(self, request):
        pidx = request.data.get("pidx")

        if not pidx:
            return Response({"error": "pidx is required"}, status=400)

        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        payload = {"pidx": pidx}

        response = requests.post("https://dev.khalti.com/api/v2/epayment/lookup/", json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(" Khalti Payment Lookup Response:", data)

            if data["status"] == "Completed":
                try:
                    booking = Booking.objects.get(pidx=pidx)
                except Booking.DoesNotExist:
                    return Response({"error": "Booking not found for this pidx"}, status=400)

                #  Create Payment record if not exists
                Payment.objects.get_or_create(
                    booking=booking,
                    defaults={
                        "student": request.user,
                        "amount": data["total_amount"] / 100,
                        "transaction_id": data["transaction_id"],
                        "status": "success",
                        "payment_method": "Khalti"
                    }
                )

                booking.status = "confirmed"
                booking.save()

                return Response({"message": "Payment verified!", "booking_status": "confirmed"})

            else:
                return Response({"message": "Payment not completed", "status": data["status"]}, status=400)
        else:
            try:
                error_data = response.json()
            except ValueError:
                error_data = {
                    "error": "Invalid response from Khalti.",
                    "status_code": response.status_code,
                    "text": response.text,
                }
            return Response(error_data, status=response.status_code)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_khalti_payment(request):
    pidx = request.data.get("pidx")

    if not pidx:
        return Response({"error": "pidx is required"}, status=400)

    try:
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        payload = {"pidx": pidx}

        response = requests.post("https://dev.khalti.com/api/v2/epayment/lookup/", json=payload, headers=headers)

        print("🔍 Khalti Response:", response.status_code, response.json())

        if response.status_code == 200:
            data = response.json()

            if data["status"] == "Completed":
                booking = Booking.objects.get(pidx=pidx)

                # Confirm booking
                booking.status = "confirmed"
                booking.save()

                # Create payment if not exists
                Payment.objects.get_or_create(
                    booking=booking,
                    defaults={
                        "student": request.user,
                        "amount": data["total_amount"] / 100,
                        "transaction_id": data["transaction_id"],
                        "status": "success",
                        "payment_method": "Khalti"
                    }
                )

                from hostel_owner.views import send_booking_email
                send_booking_email(booking, "Confirmed")

                return Response({"message": "Payment verified and booking confirmed!"}, status=200)

            else:
                return Response({"message": "Payment not completed", "status": data["status"]}, status=400)

        return Response(response.json(), status=response.status_code)

    except Exception as e:
        print("❌ Exception during Khalti verification:", str(e))
        return Response({"error": "Something went wrong while verifying payment."}, status=500)




        
    
        
    



        
# student/views.py

from hostel_owner.models import Hostel
from hostel_owner.serializers import HostelSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def student_hostel_detail(request, hostel_id):
    """
    Student can view hostel detail (only verified hostels).
    """
    try:
        hostel = Hostel.objects.get(id=hostel_id, is_verified=True)
        serializer = HostelSerializer(hostel, context={"request": request})
        return Response(serializer.data)
    except Hostel.DoesNotExist:
        return Response({"error": "Hostel not found or not verified"}, status=404)
 



        
    


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
        print(f" DEBUG: Request from user = {student}")  #  Log user
        
        if not student.is_authenticated:
            return Booking.objects.none()  #  Return empty queryset instead of unauthorized error
        
        queryset = Booking.objects.filter(student=student)
        print(f" DEBUG: Found {queryset.count()} bookings")  #  Log found bookings
        return queryset

#  Cancel a Booking
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


#  Manage Student Profile
class StudentProfileView(RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


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
    Allows students to submit feedback or reply if booking is confirmed.
    """
    student = request.user
    hostel_id = request.data.get("hostel")

    rating = request.data.get("rating")
    comment = request.data.get("comment")
    parent_id = request.data.get("parent")  # New

    if not comment:
        return Response({'error': 'Comment is required'}, status=status.HTTP_400_BAD_REQUEST)

    # For replies, ensure parent exists and belongs to the same hostel
    if parent_id:
        try:
            parent = Feedback.objects.get(id=parent_id)
        except Feedback.DoesNotExist:
            return Response({'error': 'Parent feedback not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create a reply without rating
        Feedback.objects.create(
            student=student,
            hostel=parent.hostel,
            comment=comment,
            parent=parent
        )
        return Response({'message': 'Reply submitted successfully!'}, status=status.HTTP_201_CREATED)

    # For new top-level feedback
    if not hostel_id or not rating:
        return Response({'error': 'Hostel and rating are required for new feedback'}, status=status.HTTP_400_BAD_REQUEST)

    # Check confirmed booking exists for this hostel
    has_booking = Booking.objects.filter(
        student=student,
        room__floor__hostel_id=hostel_id,
        status='confirmed'
    ).exists()

    if not has_booking:
        return Response({'error': 'You can only submit feedback for hostels you have stayed at.'}, status=status.HTTP_403_FORBIDDEN)

    Feedback.objects.create(
        student=student,
        hostel_id=hostel_id,
        rating=rating,
        comment=comment
    )
    

    

    return Response({'message': 'Feedback submitted successfully!'}, status=status.HTTP_201_CREATED)
from django.shortcuts import get_object_or_404

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_feedback(request, pk):
    feedback = get_object_or_404(Feedback, id=pk, student=request.user)
    feedback.comment = request.data.get('comment', feedback.comment)
    feedback.rating = request.data.get('rating', feedback.rating) if not feedback.parent else feedback.rating
    feedback.save()
    return Response({'message': 'Feedback updated!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_feedback(request, pk):
    feedback = get_object_or_404(Feedback, id=pk, student=request.user)
    feedback.delete()
    return Response({'message': 'Feedback deleted!'})


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



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    notifications.update(is_read=True)
    return Response({"message": "All notifications marked as read!"})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_chat_history(request, hostel_id):
    user = request.user
    from hostel_owner.models import ChatMessage

    messages = ChatMessage.objects.filter(hostel_id=hostel_id).order_by("timestamp")

    chat_data = [
        {
            "sender": msg.sender.username,
            "receiver": msg.receiver.username,
            "message": msg.message,
            "image_url": msg.image.url if msg.image else None,
            "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for msg in messages
        if msg.sender == user or msg.receiver == user
    ]

    return Response(chat_data)


# student/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_profile(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_hostel_owner_by_hostel(request, hostel_id):
    try:
        hostel = Hostel.objects.get(id=hostel_id)
        owner = hostel.owner
        return Response({
            "id": owner.id,
            "username": owner.username,
            "email": owner.email
        })
    except Hostel.DoesNotExist:
        return Response({"error": "Hostel not found"}, status=404)
