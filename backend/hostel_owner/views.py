from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

from .models import Hostel, Room, Booking, Feedback, HostelImage, Floor, RoomImage
from .serializers import HostelSerializer, RoomSerializer, BookingSerializer, FeedbackSerializer, HostelImageSerializer, FloorSerializer, RoomImageSerializer
from api.models import CustomUser
from hostel_owner.models import Feedback, Booking, Room, Floor, Hostel
from student.models import StudentProfile
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)  # ✅ Enable logging

def send_booking_email(booking, status):
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


class IsHostelOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'HostelOwner'
    
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        students_count = CustomUser.objects.filter(role='Student').count()
        rooms_count = Room.objects.count()
        booked_rooms_count = Booking.objects.filter(status='Booked').count()
        feedback_count = Feedback.objects.count()

        return Response({
            'students': students_count,
            'rooms': rooms_count,
            'bookedRooms': booked_rooms_count,
            'feedbacks': feedback_count
        })

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "HostelOwner":
            return Feedback.objects.filter(hostel__owner=user)
        return Feedback.objects.filter(student=user)

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        images = self.request.FILES.getlist('images')
        hostel = serializer.save(owner=self.request.user)
        if images:
            for img in images:
                HostelImage.objects.create(hostel=hostel, image=img)

    @action(detail=True, methods=['post'], url_path='upload_images')
    def upload_images(self, request, pk=None):
        images = request.FILES.getlist('images')
        if not images:
            return Response({"error": "No images received"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_images = []
        for img in images:
            image_obj = HostelImage.objects.create(hostel=hostel, image=img)
            uploaded_images.append(request.build_absolute_uri(image_obj.image.url))

        return Response({
            "status": "Images uploaded successfully!",
            "uploaded_images": uploaded_images
        }, status=status.HTTP_201_CREATED)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        images = self.request.FILES.getlist('images')
        floor_id = self.request.data.get('floor')
        if not floor_id:
            raise serializers.ValidationError({"floor": "This field is required."})

        floor = Floor.objects.get(id=floor_id)
        room = serializer.save(floor=floor)
        if images:
            for img in images:
                RoomImage.objects.create(room=room, image=img)

@api_view(['GET'])
def get_current_user(request):
    if request.user.is_authenticated:
        return Response({
            "name": request.user.full_name,
            "role": request.user.role
        })
    return Response({"error": "Unauthorized"}, status=401)

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from hostel_owner.models import Booking

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'HostelOwner':
            return Booking.objects.filter(room__floor__hostel__owner=user)
        elif user.role == 'Student':
            return Booking.objects.filter(student=user)
        return Booking.objects.none()

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """ ✅ Hostel Owner Approves Booking ✅ """
        try:
            booking = self.get_object()

            if booking.status != 'pending':
                return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

            booking.status = 'confirmed'
            booking.save()

            print(f"✅ Booking {booking.id} confirmed. Calling send_booking_email()")  # ✅ Debugging Output
            send_booking_email(booking, "Confirmed")  # ✅ Call function directly

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
            send_booking_email(booking, "Rejected")  # ✅ Call function directly

            return Response({'message': 'Booking rejected, email sent!'}, status=status.HTTP_200_OK)

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_confirmed_students(request, hostel_id):
    hostel = get_object_or_404(Hostel, id=hostel_id)
    confirmed_bookings = Booking.objects.filter(room__hostel=hostel, status='confirmed')
    students = [booking.student for booking in confirmed_bookings]

    student_data = [
        {"id": student.id, "name": student.username, "email": student.email} 
        for student in students
    ]
    return Response({"students": student_data}, status=200)

def submit_feedback(request):
    student = request.user
    hostel_id = request.data.get('hostel_id')
    rating = request.data.get('rating')
    comment = request.data.get('comment')

    if not hostel_id or not rating or not comment:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    feedback = Feedback.objects.create(student=student, hostel_id=hostel_id, rating=rating, comment=comment)
    return Response({'message': 'Feedback submitted'}, status=status.HTTP_201_CREATED)

class AvailableHostelsView(generics.ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [permissions.AllowAny]

class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer

    def get_queryset(self):
        hostel_id = self.request.query_params.get('hostel_id')
        if hostel_id:
            return Floor.objects.filter(hostel_id=hostel_id)
        return super().get_queryset()

@api_view(['GET'])
def get_floors_by_hostel(request, hostel_id):
    floors = Floor.objects.filter(hostel_id=hostel_id)
    serializer = FloorSerializer(floors, many=True)
    return Response(serializer.data, status=200)

class HostelOwnerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({"username": user.username, "email": user.email})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def GetHostelStudents(request, hostel_id):
    if request.user.role != "HostelOwner":
        return Response({"error": "Unauthorized"}, status=403)

    try:
        hostel = Hostel.objects.get(id=hostel_id)
    except Hostel.DoesNotExist:
        return Response({"error": "Hostel not found"}, status=404)

    floors = Floor.objects.filter(hostel=hostel)
    rooms = Room.objects.filter(floor__in=floors)
    confirmed_bookings = Booking.objects.filter(room__floor__hostel=hostel, status='confirmed')

    students = []
    for booking in confirmed_bookings:
        student = booking.student
        student_data = {
            "id": student.id,
            "username": student.username,
            "email": student.email
        }
        
        student_profile = StudentProfile.objects.filter(user=student).first()
        student_data["phone"] = student_profile.phone_number if student_profile else None

        students.append(student_data)

    return Response({"students": students}, status=200)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking, Hostel
from api.models import CustomUser

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_hostel_students(request):
    """ Fetch all students across all hostels owned by the logged-in hostel owner """
    
    if request.user.role != "HostelOwner":
        return Response({"error": "Only hostel owners can access this data."}, status=403)

    # Get hostels owned by the logged-in user
    hostels = Hostel.objects.filter(owner=request.user)
    
    # Get bookings where students have confirmed rooms in these hostels
    bookings = Booking.objects.filter(room__floor__hostel__in=hostels, status="confirmed").select_related("student")

    students = [
        {
            "id": booking.student.id,
            "username": booking.student.username,
            "email": booking.student.email,
            "phone": booking.student.student_profile.phone_number if hasattr(booking.student, 'student_profile') else "N/A",
            "room_number": booking.room.room_number if booking.room else "No Room",
            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "status": booking.status,
        }
        for booking in bookings
    ]

    return Response({"students": students}, status=200)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Count, Avg, Sum
from datetime import datetime, timedelta
from .models import Booking, Room, Feedback, Hostel
from api.models import CustomUser

class DashboardView(APIView):
    """ 
    API for Hostel Owners to get dashboard analytics 
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "HostelOwner":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Total Bookings
        total_bookings = Booking.objects.filter(room__floor__hostel__owner=user).count()
        pending_bookings = Booking.objects.filter(room__floor__hostel__owner=user, status="pending").count()
        confirmed_bookings = Booking.objects.filter(room__floor__hostel__owner=user, status="confirmed").count()
        rejected_bookings = Booking.objects.filter(room__floor__hostel__owner=user, status="rejected").count()

        # Monthly Revenue Breakdown (Last 6 Months)
        today = datetime.today()
        six_months_ago = today - timedelta(days=180)
        revenue_per_month = (
            Booking.objects.filter(
                room__floor__hostel__owner=user, status="confirmed", check_in__gte=six_months_ago
            )
            .extra(select={"month": "EXTRACT(MONTH FROM check_in)"})
            .values("month")
            .annotate(total_revenue=Sum("room__price"))
            .order_by("month")
        )

        # Average Ratings & Feedback Count
        avg_rating = Feedback.objects.filter(hostel__owner=user).aggregate(Avg("rating"))["rating__avg"] or 0
        total_feedbacks = Feedback.objects.filter(hostel__owner=user).count()

        # Room Statistics
        total_rooms = Room.objects.filter(floor__hostel__owner=user).count()
        booked_rooms = Booking.objects.filter(room__floor__hostel__owner=user, status="confirmed").count()
        available_rooms = total_rooms - booked_rooms

        return Response(
            {
                "total_bookings": total_bookings,
                "pending_bookings": pending_bookings,
                "confirmed_bookings": confirmed_bookings,
                "rejected_bookings": rejected_bookings,
                "revenue_per_month": list(revenue_per_month),
                "avg_rating": round(avg_rating, 1),
                "total_feedbacks": total_feedbacks,
                "total_rooms": total_rooms,
                "booked_rooms": booked_rooms,
                "available_rooms": available_rooms,
            },
            status=status.HTTP_200_OK,
        )



import pandas as pd
from django.http import HttpResponse
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from reportlab.pdfgen import canvas
from io import BytesIO
from .models import Booking, Feedback
from api.models import CustomUser

class DownloadReportView(APIView):
    """
    API to download reports with advanced filtering (CSV, Excel, PDF).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, report_type, format_type):
        user = request.user
        if user.role != "HostelOwner":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # Extract filters from query parameters
        start_date = request.GET.get("start_date", None)
        end_date = request.GET.get("end_date", None)
        student_name = request.GET.get("student", None)
        status_filter = request.GET.get("status", None)
        room_number = request.GET.get("room", None)
        sort_by = request.GET.get("sort_by", "check_in")  # Default sort by check-in date

        # Get the appropriate data based on report type
        if report_type == "bookings":
            data = self.get_booking_data(user, start_date, end_date, student_name, status_filter, room_number, sort_by)
            filename = f"Booking_Report_{now().strftime('%Y%m%d')}"
        elif report_type == "earnings":
            data = self.get_earnings_data(user, start_date, end_date)
            filename = f"Earnings_Report_{now().strftime('%Y%m%d')}"
        elif report_type == "feedback":
            data = self.get_feedback_data(user)
            filename = f"Feedback_Report_{now().strftime('%Y%m%d')}"
        else:
            return Response({"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate the report in the requested format
        if format_type == "csv":
            return self.generate_csv(data, filename)
        elif format_type == "excel":
            return self.generate_excel(data, filename)
        elif format_type == "pdf":
            return self.generate_pdf(data, filename)
        else:
            return Response({"error": "Invalid format type"}, status=status.HTTP_400_BAD_REQUEST)

    def get_booking_data(self, user, start_date, end_date, student_name, status_filter, room_number, sort_by):
        bookings = Booking.objects.filter(room__floor__hostel__owner=user)

        # Apply filters
        if start_date:
            bookings = bookings.filter(check_in__gte=start_date)
        if end_date:
            bookings = bookings.filter(check_out__lte=end_date)
        if student_name:
            bookings = bookings.filter(student__username__icontains=student_name)
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        if room_number:
            bookings = bookings.filter(room__room_number=room_number)

        # Apply sorting
        bookings = bookings.order_by(sort_by)

        # Prepare data for the report
        data = [
            {
                "Booking ID": booking.id,
                "Student": booking.student.username,
                "Room": booking.room.room_number,
                "Check-in": booking.check_in,
                "Check-out": booking.check_out,
                "Booking Date": booking.created_at.strftime("%Y-%m-%d"),
                "Status": booking.status,
                "Amount Paid": booking.room.price
            }
            for booking in bookings
        ]
        return data

    def get_earnings_data(self, user, start_date, end_date):
        bookings = Booking.objects.filter(room__floor__hostel__owner=user, status="confirmed")

        # Apply filters
        if start_date:
            bookings = bookings.filter(check_in__gte=start_date)
        if end_date:
            bookings = bookings.filter(check_out__lte=end_date)

        total_earnings = sum(booking.room.price for booking in bookings)
        data = [
            {"Month": now().strftime("%B"), "Total Earnings": total_earnings, "Confirmed Bookings": bookings.count()}
        ]
        return data

    def get_feedback_data(self, user):
        feedbacks = Feedback.objects.filter(hostel__owner=user)
        data = [
            {
                "Student": feedback.student.username,
                "Hostel": feedback.hostel.name,
                "Rating": feedback.rating,
                "Comment": feedback.comment,
                "Date": feedback.created_at.strftime("%Y-%m-%d")
            }
            for feedback in feedbacks
        ]
        return data

    def generate_csv(self, data, filename):
        df = pd.DataFrame(data)
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f"attachment; filename={filename}.csv"
        df.to_csv(response, index=False)
        return response

    def generate_excel(self, data, filename):
        df = pd.DataFrame(data)
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = f"attachment; filename={filename}.xlsx"
        with BytesIO() as output:
            df.to_excel(output, index=False, engine="openpyxl")
            response.write(output.getvalue())
        return response

    def generate_pdf(self, data, filename):
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename={filename}.pdf"
        buffer = BytesIO()
        p = canvas.Canvas(buffer)
        p.setFont("Helvetica", 12)
        y = 800

        for idx, item in enumerate(data):
            text = " | ".join(f"{key}: {value}" for key, value in item.items())
            p.drawString(50, y, text)
            y -= 20
            if y < 50:
                p.showPage()
                y = 800

        p.save()
        pdf = buffer.getvalue()
        buffer.close()
        response.write(pdf)
        return response





from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from api.models import CustomUser

class ChatHistoryView(APIView):
    """
    API to fetch chat history between a student and hostel owner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, hostel_id):
        user = request.user

        # Get chat messages related to the hostel
        messages = ChatMessage.objects.filter(hostel_id=hostel_id).order_by("timestamp")

        chat_data = [
            {
                "sender": message.sender.username,
                "receiver": message.receiver.username,
                "message": message.message,
                "timestamp": message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for message in messages
        ]

        return Response(chat_data)


from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)  # ✅ Enable logging

def send_chat_email_notification(sender, receiver, message):
    """ ✅ Send email to notify users of new chat messages ✅ """
    try:
        recipient_email = receiver.email  # ✅ Get receiver's email

        logger.info(f"📧 Sending chat notification email to {recipient_email}")
        print(f"📧 Sending chat notification email to {recipient_email}")  # ✅ Debugging Output

        subject = f"New Message from {sender.username}"
        message_body = f"Hello {receiver.username},\n\n" \
                       f"You have received a new message from {sender.username}:\n\n" \
                       f'"{message}"\n\n' \
                       f"Log in to SajiloFinder to continue the conversation.\n\n" \
                       f"Thank you!"

        send_mail(subject, message_body, settings.EMAIL_HOST_USER, [recipient_email], fail_silently=False)

        logger.info(f"✅ Chat notification email sent to {recipient_email}")
        print(f"✅ Chat notification email sent to {recipient_email}")  # ✅ Debugging Output

    except Exception as e:
        logger.error(f"❌ Error sending chat notification email to {recipient_email}: {str(e)}")
        print(f"❌ Error sending chat notification email to {recipient_email}: {str(e)}")  # ✅ Debugging Output

