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
        booking = self.get_object()
        if booking.status != 'pending':
            return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'confirmed'
        booking.save()
        return Response({'message': 'Booking approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'pending':
            return Response({"error": "Booking already processed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'rejected'
        booking.save()
        return Response({'message': 'Booking rejected'}, status=status.HTTP_200_OK)

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
