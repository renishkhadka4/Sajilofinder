from rest_framework import serializers
from .models import UserReport

class UserReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reported_username = serializers.CharField(source='reported_user.username', read_only=True)

    class Meta:
        model = UserReport
        fields = '__all__'
from rest_framework import serializers
from hostel_owner.models import Hostel

from rest_framework import serializers
from hostel_owner.models import Hostel

class HostelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'state', 'city', 'address', 'is_verified']




# admin_panel/serializers.py
from api.models import CustomUser
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'is_active']

# admin_panel/serializers.py

from hostel_owner.models import Feedback
from rest_framework import serializers

class AdminFeedbackModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'is_fake']


# admin_panel/serializers.py

from rest_framework import serializers
from .models import UserReport

class UserReportSerializer(serializers.ModelSerializer):
    reporter = serializers.StringRelatedField()
    reported_user = serializers.StringRelatedField()

    class Meta:
        model = UserReport
        fields = ['id', 'reporter', 'reported_user', 'reason', 'created_at']


from rest_framework import serializers
from .models import Blog, ContactMessage

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

