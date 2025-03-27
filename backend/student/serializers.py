from rest_framework import serializers
from hostel_owner.models import Booking, Room, Hostel, Feedback
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    room = serializers.SerializerMethodField()

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

    class Meta:
        model = Booking
        fields = ["id", "student", "room", "check_in", "check_out", "status", "created_at"]


class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
