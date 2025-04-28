from rest_framework import serializers
from api.models import CustomUser
from hostel_owner.models import Hostel, Feedback
from .models import UserReport, Blog, ContactMessage, AboutUs, AdminNotification


# User Report Serializer

class UserReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True)

    class Meta:
        model = UserReport
        fields = '__all__'

# Hostel Serializer (Minimal fields)

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'state', 'city', 'address', 'is_verified']


# User Serializer (for Admin Panel User Management)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'is_active']

# Feedback Moderation Serializer (only is_fake field)

class AdminFeedbackModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'is_fake']

# Blog Serializer

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'

# Contact Message Serializer

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'


# Admin Profile Update Serializer

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'profile_picture')
        read_only_fields = ('email',)  # Email can be changed only via OTP verification

# About Us Serializer

class AboutUsSerializer(serializers.ModelSerializer):
    services_list = serializers.SerializerMethodField()

    class Meta:
        model = AboutUs
        fields = [
            "id", "title", "description", "services", "services_list",
            "image1", "image2", "image3", "image4", "updated_at"
        ]

    def get_services_list(self, obj):
        # Returns the services as a list instead of a comma-separated string
        return obj.service_list()


# Admin Notifications Serializer

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = '__all__'
