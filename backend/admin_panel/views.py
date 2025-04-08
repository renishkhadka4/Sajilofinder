from rest_framework import viewsets, permissions
from .models import UserReport
from .serializers import UserReportSerializer

class UserReportViewSet(viewsets.ModelViewSet):
    queryset = UserReport.objects.all().order_by('-created_at')
    serializer_class = UserReportSerializer
    permission_classes = [permissions.IsAuthenticated]

# admin_panel/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import CustomUser
from api.serializers import UserProfileSerializer

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from hostel_owner.models import Hostel
from .serializers import HostelSerializer

from .permissions import IsCustomAdmin

class PendingHostelsView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        pending_hostels = Hostel.objects.filter(is_verified=False)
        serializer = HostelSerializer(pending_hostels, many=True)
        return Response(serializer.data)



from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from api.models import CustomUser
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["patch"], url_path="block")
    def block_user(self, request, pk=None):
        try:
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            status_text = "blocked" if not user.is_active else "unblocked"
            return Response({"message": f"User {status_text} successfully."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from hostel_owner.models import Hostel

from .permissions import IsCustomAdmin

class ApproveHostelView(APIView):
    permission_classes = [IsCustomAdmin]

    def patch(self, request, pk):
        try:
            hostel = Hostel.objects.get(pk=pk)
            hostel.is_verified = True
            hostel.save()
            return Response({"message": "Hostel approved successfully."})
        except Hostel.DoesNotExist:
            return Response({"error": "Hostel not found."}, status=404)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from hostel_owner.models import Hostel

@api_view(['PATCH'])
@permission_classes([IsCustomAdmin])
def reject_hostel(request, hostel_id):
    try:
        hostel = Hostel.objects.get(id=hostel_id)

        # optionally send email
        from django.core.mail import send_mail
        send_mail(
            'Hostel Rejected',
            f'Your hostel "{hostel.name}" has been rejected by admin.',
            'noreply@sajilofinder.com',
            [hostel.owner.email],
            fail_silently=True
        )

        hostel.delete()  # or mark as rejected if you want to keep it
        return Response({"message": "Hostel rejected successfully."})
    except Hostel.DoesNotExist:
        return Response({"error": "Hostel not found."}, status=404)

class PendingHostelsView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        pending_hostels = Hostel.objects.filter(is_verified=False)
        serializer = HostelSerializer(pending_hostels, many=True)
        return Response(serializer.data)


# admin_panel/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from hostel_owner.models import Feedback
from .serializers import AdminFeedbackModerationSerializer
from .permissions import IsCustomAdmin  # custom role-based permission

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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserReport
from .serializers import UserReportSerializer
from .permissions import IsCustomAdmin  # Use custom permission class

class AdminReportListView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        reports = UserReport.objects.all().order_by('-created_at')
        serializer = UserReportSerializer(reports, many=True)
        return Response(serializer.data)


from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Blog, ContactMessage
from .serializers import BlogSerializer, ContactMessageSerializer

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [IsCustomAdmin]
    def create(self, request, *args, **kwargs):
        print("DEBUG Blog POST Payload:", request.data)
        return super().create(request, *args, **kwargs)


from rest_framework import viewsets
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from .permissions import IsCustomAdmin

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsCustomAdmin]


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from api.models import CustomUser
from .serializers import UserSerializer

from .permissions import IsCustomAdmin

class StudentListAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        students = CustomUser.objects.filter(role='Student')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

class HostelOwnerListAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        owners = CustomUser.objects.filter(role='HostelOwner')
        serializer = UserSerializer(owners, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import CustomUser
from hostel_owner.models import Booking, Feedback
from .permissions import IsCustomAdmin

class AdminDashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        total_users = CustomUser.objects.count()
        total_students = CustomUser.objects.filter(role='Student').count()
        total_owners = CustomUser.objects.filter(role='HostelOwner').count()

        total_bookings = Booking.objects.count()
        total_feedbacks = Feedback.objects.count()

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
    
from rest_framework import viewsets
from .models import AboutUs
from .serializers import AboutUsSerializer
from .permissions import IsCustomAdmin

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import AboutUs
from .serializers import AboutUsSerializer
from .permissions import IsCustomAdmin

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


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.serializers import UserProfileSerializer
from .permissions import IsCustomAdmin

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully.", "user": serializer.data})
        return Response(serializer.errors, status=400)

from hostel_owner.serializers import FeedbackSerializer


class AdminAllFeedbacksAPIView(APIView):
    permission_classes = [IsCustomAdmin]

    def get(self, request):
        feedbacks = Feedback.objects.select_related("student", "hostel").all().order_by("-created_at")
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from hostel_owner.models import Feedback

class AllFeedbacksView(APIView):
    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from hostel_owner.models import Payment

from hostel_owner.serializers import PaymentSerializer  # we'll create this next
from admin_panel.permissions import IsCustomAdmin  # if using custom permission

class TransactionListView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        payments = Payment.objects.select_related('student', 'booking').order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


from hostel_owner.models import Payment
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from admin_panel.permissions import IsCustomAdmin  # your custom admin permission
from hostel_owner.serializers import PaymentSerializer

class AdminTransactionView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        payments = Payment.objects.select_related("student", "booking__room__floor__hostel").all().order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)



# admin_panel/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.models import CustomUser
from .serializers import AdminProfileSerializer
from admin_panel.permissions import IsCustomAdmin

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def get(self, request):
        user = request.user
        serializer = AdminProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = AdminProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# admin_panel/views.py (continued)

from django.core.mail import send_mail
from django.conf import settings
import random
from django.core.cache import cache

class RequestEmailChangeView(APIView):
    permission_classes = [IsAuthenticated, IsCustomAdmin]

    def post(self, request):
        new_email = request.data.get("new_email")
        if not new_email:
            return Response({"error": "New email is required"}, status=400)

        otp = random.randint(100000, 999999)
        cache.set(f"admin_email_change_otp_{request.user.id}", (new_email, otp), timeout=300)  # expires in 5 mins

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



# admin_panel/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from hostel_owner.models import Booking
from django.utils.timezone import now, timedelta
import calendar

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_trend_data(request):
    today = now().date()
    week_days = [today - timedelta(days=i) for i in range(6, -1, -1)]  # Last 7 days

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
    student_count = CustomUser.objects.filter(role="Student").count()
    owner_count = CustomUser.objects.filter(role="HostelOwner").count()
    
    return Response([
        {"name": "Students", "value": student_count},
        {"name": "Hostel Owners", "value": owner_count}
    ])



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feedback_rating_data(request):
    from hostel_owner.models import Feedback
    from django.db.models import Count

    feedback_data = Feedback.objects.values('rating').annotate(count=Count('id')).order_by('rating')
    return Response(feedback_data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import CustomUser
from .models import AdminNotification
from .serializers import AdminNotificationSerializer
from student.models import Notification as StudentNotification
from hostel_owner.models import OwnerNotification
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import CustomUser
from student.models import Notification as StudentNotification
from hostel_owner.models import OwnerNotification

# admin_panel/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import CustomUser
from student.models import Notification as StudentNotification
from hostel_owner.models import OwnerNotification

class SendAdminNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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
