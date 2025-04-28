# Django & DRF General Imports
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.mail import send_mail
from django.core.cache import cache
from django.utils.timezone import now, timedelta
from django.conf import settings
import random, calendar

# Models
from api.models import CustomUser
from hostel_owner.models import Hostel, Feedback, Booking, Payment, OwnerNotification
from student.models import Notification as StudentNotification
from .models import UserReport, Blog, ContactMessage, AboutUs, AdminNotification

# Serializers
from api.serializers import UserProfileSerializer
from hostel_owner.serializers import FeedbackSerializer, PaymentSerializer
from .serializers import (
    UserReportSerializer, HostelSerializer, UserSerializer,
    AdminFeedbackModerationSerializer, BlogSerializer,
    ContactMessageSerializer, AboutUsSerializer, AdminNotificationSerializer,
    AdminProfileSerializer
)

# Permissions
from .permissions import IsCustomAdmin



# ViewSet to manage all User Reports (Admin panel)
class UserReportViewSet(viewsets.ModelViewSet):
    queryset = UserReport.objects.all().order_by('-created_at')  # Fetch all reports ordered by latest first
    serializer_class = UserReportSerializer  # Serializer used to convert queryset to JSON
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users can access


# API View to list all registered users (for admin purposes)
class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]  # Must be authenticated to view users
    def get(self, request):
        users = CustomUser.objects.all()  # Fetch all users from the database
        serializer = UserProfileSerializer(users, many=True)  # Serialize multiple user instances
        return Response(serializer.data)  # Return the serialized user data as API response


# View to list all pending hostels awaiting admin approval
class PendingHostelsView(APIView):
    permission_classes = [IsCustomAdmin]  # Only custom admins can access

    def get(self, request):
        # Fetch all hostels that are not yet verified
        pending_hostels = Hostel.objects.filter(is_verified=False)
        # Serialize the pending hostels
        serializer = HostelSerializer(pending_hostels, many=True)
        # Return the serialized data as response
        return Response(serializer.data)

# ViewSet to manage all users (for admin actions like block/unblock)
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()  # Fetch all users
    serializer_class = UserSerializer  # Serialize users
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    @action(detail=True, methods=["patch"], url_path="block")
    def block_user(self, request, pk=None):
        # Toggle user active status (block or unblock)
        try:
            user = self.get_object()  # Fetch user by primary key
            user.is_active = not user.is_active  # Flip active status
            user.save()
            status_text = "blocked" if not user.is_active else "unblocked"
            return Response({"message": f"User {status_text} successfully."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            # If user not found, return error
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# View to approve a hostel (mark is_verified=True)
class ApproveHostelView(APIView):
    permission_classes = [IsCustomAdmin]  # Only custom admins can approve

    def patch(self, request, pk):
        try:
            hostel = Hostel.objects.get(pk=pk)  # Fetch hostel by ID
            hostel.is_verified = True  # Mark hostel as verified
            hostel.save()
            return Response({"message": "Hostel approved successfully."})
        except Hostel.DoesNotExist:
            # If hostel not found, return error
            return Response({"error": "Hostel not found."}, status=404)

# API function to reject and delete a hostel (and optionally notify the owner)
@api_view(['PATCH'])
@permission_classes([IsCustomAdmin])
def reject_hostel(request, hostel_id):
    try:
        hostel = Hostel.objects.get(id=hostel_id)  # Fetch hostel by ID

        # Optionally send rejection email to hostel owner
        from django.core.mail import send_mail
        send_mail(
            'Hostel Rejected',
            f'Your hostel "{hostel.name}" has been rejected by admin.',
            'noreply@sajilofinder.com',
            [hostel.owner.email],
            fail_silently=True
        )

        hostel.delete()  # Delete hostel record from database
        return Response({"message": "Hostel rejected successfully."})
    except Hostel.DoesNotExist:
        # If hostel not found, return error
        return Response({"error": "Hostel not found."}, status=404)



class ModerateFeedbackView(APIView):
    permission_classes = [IsCustomAdmin]

    def patch(self, request, pk):
        try:
            feedback = Feedback.objects.get(pk=pk)
            serializer = AdminFeedbackModerationSerializer(feedback, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Feedback moderation updated."})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Feedback.DoesNotExist:
            return Response({"error": "Feedback not found."}, status=status.HTTP_404_NOT_FOUND)


# admin_panel/views.py



class AdminReportListView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        reports = UserReport.objects.all().order_by('-created_at')
        serializer = UserReportSerializer(reports, many=True)
        return Response(serializer.data)




# ViewSet to manage Blogs (CRUD operations by Admin)
class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all().order_by('-created_at')  # Fetch all blogs ordered by newest first
    serializer_class = BlogSerializer  # Use BlogSerializer for serialization
    permission_classes = [IsCustomAdmin]  # Only custom admins can manage blogs

    def create(self, request, *args, **kwargs):
        # Debugging: print the payload received when a blog is created
        print("DEBUG Blog POST Payload:", request.data)
        return super().create(request, *args, **kwargs)  # Call the default create method

# ViewSet to manage Contact Messages
class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')  # Fetch all messages, newest first
    serializer_class = ContactMessageSerializer  # Use ContactMessageSerializer

    def get_permissions(self):
        # Allow only authenticated users to POST new messages
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        # Other methods (GET, DELETE) also require authentication
        return [IsAuthenticated()]
    
class AboutUsView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        about = AboutUs.objects.first()
        if about:
            return Response(AboutUsSerializer(about).data)
        return Response({"detail": "About Us info not found"}, status=404)

    def post(self, request):
        about = AboutUs.objects.first()
        data = request.data

        if about:
            serializer = AboutUsSerializer(about, data=data, partial=True)
        else:
            serializer = AboutUsSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)



# Student and Hostel Owner Management


class StudentListAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        # Fetch all students
        students = CustomUser.objects.filter(role='Student')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

class HostelOwnerListAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        # Fetch all hostel owners
        owners = CustomUser.objects.filter(role='HostelOwner')
        serializer = UserSerializer(owners, many=True)
        return Response(serializer.data)


# Admin Dashboard Statistics


class AdminDashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        # Aggregate counts for dashboard overview
        total_users = CustomUser.objects.count()
        total_students = CustomUser.objects.filter(role='Student').count()
        total_owners = CustomUser.objects.filter(role='HostelOwner').count()
        total_bookings = Booking.objects.count()
        total_feedbacks = Feedback.objects.count()

        # Debug info (remove in production)
        print("DEBUG: User =", request.user)
        print("DEBUG: Is Auth =", request.user.is_authenticated)
        print("DEBUG: Role =", getattr(request.user, 'role', 'Not Found'))
       
        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_hostel_owners": total_owners,
            "total_bookings": total_bookings,
            "total_feedbacks": total_feedbacks,
        })


# Admin Profile Management


class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        # Return admin profile info
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        # Update admin profile
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully.", "user": serializer.data})
        return Response(serializer.errors, status=400)


# Admin All Feedback Management


class AdminAllFeedbacksAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        # Fetch feedbacks with related student and hostel
        feedbacks = Feedback.objects.select_related("student", "hostel").all().order_by("-created_at")
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

class AllFeedbacksView(APIView):
    def get(self, request):
        # Fetch all feedbacks without select_related optimization
        feedbacks = Feedback.objects.all().order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)


# Transaction Management


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        # Fetch payment transactions
        payments = Payment.objects.select_related('student', 'booking').order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

class AdminTransactionView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        # Fetch payments with nested hostel details
        payments = Payment.objects.select_related("student", "booking__room__floor__hostel").all().order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


# Admin Profile Settings (Advanced - Email Change via OTP)


class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        # Fetch current admin profile
        serializer = AdminProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # Update admin profile fields
        serializer = AdminProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequestEmailChangeView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def post(self, request):
        # Request OTP for email change
        new_email = request.data.get("new_email")
        if not new_email:
            return Response({"error": "New email is required"}, status=400)

        otp = random.randint(100000, 999999)
        cache.set(f"admin_email_change_otp_{request.user.id}", (new_email, otp), timeout=300)

        send_mail(
            "Verify Your New Email",
            f"Your OTP for changing email is: {otp}",
            settings.EMAIL_HOST_USER,
            [new_email],
            fail_silently=False,
        )
        return Response({"message": f"OTP sent to {new_email}!"})

class VerifyEmailChangeView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def post(self, request):
        # Verify OTP and change email
        otp = request.data.get("otp")
        cached = cache.get(f"admin_email_change_otp_{request.user.id}")

        if not cached:
            return Response({"error": "OTP expired or not found"}, status=400)

        new_email, stored_otp = cached
        if str(otp) != str(stored_otp):
            return Response({"error": "Invalid OTP"}, status=400)

        request.user.email = new_email
        request.user.save()
        cache.delete(f"admin_email_change_otp_{request.user.id}")
        return Response({"message": "Email updated successfully!"})


# Dashboard Charts Data (Booking Trends, Users, Feedback Ratings)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_trend_data(request):
    # Booking data for the past 7 days
    today = now().date()
    week_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    data = []
    for day in week_days:
        day_label = calendar.day_name[day.weekday()]
        bookings = Booking.objects.filter(created_at__date=day).count()
        inquiries = Booking.objects.filter(created_at__date=day, status='pending').count()
        data.append({
            "day": day_label,
            "bookings": bookings,
            "inquiries": inquiries
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsCustomAdmin])
def user_distribution_data(request):
    # Pie chart data for users distribution
    student_count = CustomUser.objects.filter(role="Student").count()
    owner_count = CustomUser.objects.filter(role="HostelOwner").count()
    
    return Response([
        {"name": "Students", "value": student_count},
        {"name": "Hostel Owners", "value": owner_count}
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feedback_rating_data(request):
    # Feedback rating distribution
    from django.db.models import Count
    feedback_data = Feedback.objects.values('rating').annotate(count=Count('id')).order_by('rating')
    return Response(feedback_data)


# Notifications Management


class SendAdminNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Send notification to selected roles
        message = request.data.get("message")
        target_roles = request.data.get("roles", [])

        if not message or not target_roles:
            return Response({"error": "Message and roles are required"}, status=400)

        total = 0
        for role in target_roles:
            role = role.lower()
            users = CustomUser.objects.filter(role__iexact=role)
            for user in users:
                if role == "student":
                    StudentNotification.objects.create(user=user, message=message)
                elif role == "hostelowner":
                    OwnerNotification.objects.create(user=user, message=message)
                total += 1

        return Response({"message": f"Notification sent to {total} users."})


# Public Access - Blogs and AboutUs (No authentication required)


class PublicBlogListAPIView(generics.ListAPIView):
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer

class PublicBlogDetailAPIView(generics.RetrieveAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    lookup_field = 'id'

class PublicAboutUsAPIView(generics.RetrieveAPIView):
    queryset = AboutUs.objects.all()
    serializer_class = AboutUsSerializer

    def get_object(self):
        # Always return the first (single) About Us record
        return AboutUs.objects.first()

