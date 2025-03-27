from rest_framework import serializers
from .models import Hostel, HostelImage, Room, RoomImage, Booking, Feedback, Floor
from api.models import CustomUser

class HostelImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    class Meta:
        model = HostelImage
        fields = ['id', 'image', 'uploaded_at']

class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ['id', 'hostel', 'floor_number', 'description']
        
class HostelSerializer(serializers.ModelSerializer):
    images = HostelImageSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source="owner.username")

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
            "images"
        ]

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ["id", "image"]

class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())
    

    class Meta:
        model = Room
        fields = ["id", "floor", "room_number", "room_type", "price", "is_available", "images"]

class BookingSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()

    def get_student(self, obj):
        return {"id": obj.student.id, "username": obj.student.username, "email": obj.student.email} if obj.student else None

    def get_room(self, obj):
        return {"id": obj.room.id, "room_number": obj.room.room_number} if obj.room else None

    class Meta:
        model = Booking
        fields = ["id", "student", "room", "check_in", "check_out", "status", ]

class FeedbackSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    hostel = serializers.SerializerMethodField()

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
            "address": obj.hostel.address,
            "city": obj.hostel.city
        }

    class Meta:
        model = Feedback
        fields = ["id", "student", "hostel", "rating", "comment", "reply", "created_at"]


from rest_framework import serializers
from .models import OwnerNotification

class OwnerNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OwnerNotification
        fields = "__all__"
