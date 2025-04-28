# Student App - Serializers
from rest_framework import serializers
from hostel_owner.models import Booking, Room, Hostel, Feedback
from .models import StudentProfile


# Student Profile Serializer
class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    profile_picture = serializers.ImageField(source="user.profile_picture", required=False)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['id', 'phone_number', 'profile_picture', 'first_name', 'last_name', 'email']

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


# Booking Serializer (for Students)
class BookingSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ["id", "student", "room", "check_in", "check_out", "status", "created_at"]
        ref_name = "StudentBookingSerializer"

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "username": obj.student.username,
            "email": obj.student.email,
        }

    def get_room(self, obj):
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


# Hostel Serializer (Minimal for Student Use)
class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = '__all__'
        ref_name = "StudentHostelSerializer"


# Feedback Serializer with Student and Replies
class FeedbackSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = "__all__"

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "username": obj.student.username
        }

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return FeedbackSerializer(replies, many=True).data


# Mini Student Serializer (for Chat or Notifications)
class StudentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile._meta.get_field("user").related_model  # CustomUser
        fields = ["id", "username"]
