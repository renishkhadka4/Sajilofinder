from rest_framework import viewsets, permissions
from .models import Hostel, Room, Booking, Feedback
from .serializers import HostelSerializer, RoomSerializer, BookingSerializer, FeedbackSerializer
from .models import Hostel, HostelImage
from .serializers import HostelSerializer, HostelImageSerializer
from rest_framework.decorators import action
from api.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .models import Room, RoomImage
from .serializers import RoomSerializer, RoomImageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Room, Feedback
from api.models import CustomUser 
from django.shortcuts import get_object_or_404 
from rest_framework.permissions import AllowAny
# Ensure you have this import if needed
from rest_framework import generics
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Custom Permission to Ensure Only Hostel Owners Can Access
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



from rest_framework.parsers import MultiPartParser, FormParser

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  

    def perform_create(self, serializer):
        """  Save hostel and images in one request """
        images = self.request.FILES.getlist('images')  

        print("🚀 Received images:", images)  

        hostel = serializer.save(owner=self.request.user)  

        # ✅ Save images if received
        if images:
            for img in images:
                HostelImage.objects.create(hostel=hostel, image=img)
                print(f" Saved image: {img.name}")  

        return hostel  


    @action(detail=True, methods=['post'], url_path='upload_images')
    def upload_images(self, request, pk=None):
  
        images = request.FILES.getlist('images')  #  Ensure multiple images are received

        if not images:
            return Response({"error": "No images received"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_images = []
        for img in images:
            image_obj = HostelImage.objects.create(hostel=hostel, image=img)  # Save to DB
            uploaded_images.append(request.build_absolute_uri(image_obj.image.url))  # Return full URL

        return Response({
            "status": "Images uploaded successfully!",
            "uploaded_images": uploaded_images
        }, status=status.HTTP_201_CREATED)



from rest_framework import viewsets, permissions
from .models import Room
from .serializers import RoomSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    @action(detail=True, methods=['post'], url_path='upload_images')
    def upload_images(self, request, pk=None):
        room = self.get_object()
        images = request.FILES.getlist('images')

        if len(images) > 5:
            return Response({"error": "You can upload a maximum of 5 images per room."}, status=status.HTTP_400_BAD_REQUEST)

        for img in images:
            RoomImage.objects.create(room=room, image=img)

        return Response({"status": "Images uploaded successfully!"}, status=status.HTTP_201_CREATED)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'confirmed'
        booking.save()
        return Response({'message': 'Booking approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'rejected'
        booking.save()
        return Response({'message': 'Booking rejected'}, status=status.HTTP_200_OK)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "HostelOwner":
            return Feedback.objects.filter(booking__room__hostel__owner=self.request.user)
        return Feedback.objects.filter(booking__student=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

from rest_framework.decorators import api_view

@api_view(['GET'])
def get_confirmed_students(request, hostel_id):
    """ Fetch students who have confirmed bookings in a particular hostel """
    
    # Ensure the hostel exists
    hostel = get_object_or_404(Hostel, id=hostel_id)

    # Get confirmed bookings associated with rooms in this hostel
    confirmed_bookings = Booking.objects.filter(room__hostel=hostel, status='confirmed')

    # Get distinct students who have booked rooms
    students = [booking.student for booking in confirmed_bookings]

    # Serialize student data
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




from rest_framework.decorators import api_view

@api_view(['GET'])
def GetHostelStudents(request, hostel_id):
    """ Fetch students who have confirmed bookings in a particular hostel """
    hostel = get_object_or_404(Hostel, id=hostel_id)

    # Get confirmed bookings for this hostel
    bookings = Booking.objects.filter(room__hostel=hostel, status='confirmed')
    students = [booking.student for booking in bookings]

    student_data = [{"id": student.id, "name": student.username, "email": student.email} for student in students]

    return Response({"students": student_data}, status=200)


class AvailableHostelsView(generics.ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer
    permission_classes = [permissions.AllowAny] 