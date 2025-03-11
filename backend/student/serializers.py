from rest_framework import serializers
from hostel_owner.models import Booking, Room, Hostel, Feedback
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    room = serializers.SerializerMethodField()
    student = serializers.SerializerMethodField()

    def get_room(self, obj):
        if obj.room and obj.room.floor and obj.room.floor.hostel:
            return {
                "id": obj.room.id,
                "room_number": obj.room.room_number,
                "hostel": obj.room.floor.hostel.name
            }
        return None

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "username": obj.student.username,
            "email": obj.student.email
        }

    class Meta:
        model = Booking
        fields = ['id', 'student', 'room', 'check_in', 'check_out', 'status']

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
