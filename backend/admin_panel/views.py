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
        from hostel_owner.models import Hostel
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
        hostel.is_verified = False
        hostel.save()
        return Response({"message": "Hostel rejected successfully."}, status=status.HTTP_200_OK)
    except Hostel.DoesNotExist:
        return Response({"error": "Hostel not found."}, status=status.HTTP_404_NOT_FOUND)


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


class ContactMessageListView(generics.ListAPIView):
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

        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_hostel_owners": total_owners,
            "total_bookings": total_bookings,
            "total_feedbacks": total_feedbacks,
        })


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
