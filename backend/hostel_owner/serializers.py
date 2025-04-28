from rest_framework import serializers
from .models import Hostel, HostelImage, Room, RoomImage, Booking, Feedback, Floor, ChatMessage, OwnerNotification, Payment
from api.models import CustomUser


# Hostel Image Serializer
class HostelImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # Return full URL for image

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = HostelImage
        fields = ['id', 'image', 'uploaded_at']


# Floor Serializer
class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ['id', 'hostel', 'floor_number', 'description']


# Hostel Serializer
class HostelSerializer(serializers.ModelSerializer):
    images = HostelImageSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source="owner.username")  # Show owner's username

    class Meta:
        model = Hostel
        fields = [
            "id", "name", "address", "description", "owner",
            "contact_number", "email", "established_year",
            "city", "state", "zip_code", "google_maps_link",
            "wifi", "parking", "laundry", "security_guard", "mess_service",
            "attached_bathroom", "air_conditioning", "heater", "balcony",
            "rent_min", "rent_max", "security_deposit",
            "smoking_allowed", "alcohol_allowed", "pets_allowed", "visiting_hours",
            "nearby_colleges", "nearby_markets", "created_at",
            "images", "category", "latitude", "longitude",
        ]
        ref_name = "HostelOwnerHostelSerializer"


# Room and Room Image Serializer
class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ["id", "image"]

class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())  # Floor selection by ID

    class Meta:
        model = Room
        fields = ["id", "floor", "room_number", "room_type", "price", "is_available", "images"]


# Booking Serializer
class BookingSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()

    def get_student(self, obj):
        # Return limited student details
        return {"id": obj.student.id, "username": obj.student.username, "email": obj.student.email} if obj.student else None

    def get_room(self, obj):
        # Return nested room -> floor -> hostel details
        try:
            return {
                "id": obj.room.id,
                "room_number": obj.room.room_number,
                "floor": {
                    "id": obj.room.floor.id,
                    "hostel": {
                        "id": obj.room.floor.hostel.id,
                        "name": obj.room.floor.hostel.name,
                    }
                }
            }
        except AttributeError:
            return None

    class Meta:
        model = Booking
        fields = ["id", "student", "room", "check_in", "check_out", "status"]
        ref_name = "OwnerBookingSerializer"


# Feedback Serializer (with Replies)
class FeedbackSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    hostel = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = [
            "id", "student", "hostel", "rating", "comment", "created_at",
            "replies", "parent"
        ]

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "username": obj.student.username,
            "email": obj.student.email
        }

    def get_hostel(self, obj):
        return {
            "id": obj.hostel.id,
            "name": obj.hostel.name,
            "city": obj.hostel.city,
        }

    def get_replies(self, obj):
        # Recursively fetch feedback replies
        replies = obj.replies.all().order_by("created_at")
        return FeedbackSerializer(replies, many=True).data


# Chat Message Serializer
class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username')
    receiver = serializers.CharField(source='receiver.username')
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'receiver', 'message', 'image_url', 'timestamp', 'hostel_name']


# Chat Image Upload Serializer
class ChatImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['image']


# Owner Notification Serializer
class OwnerNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerNotification
        fields = "__all__"


# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)
    student_email = serializers.EmailField(source="student.email", read_only=True)
    hostel_name = serializers.CharField(source="booking.room.floor.hostel.name", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
