from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
import random
from datetime import timedelta
from django.core.mail import send_mail


from django.utils import timezone  # Import timezone for setting OTP creation time

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'role')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")

        if data['role'] == CustomUser.ADMIN:
            raise serializers.ValidationError("Admin registration is not allowed.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['password'] = make_password(validated_data['password'])
        user = CustomUser.objects.create(**validated_data)

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP email
        subject = 'Your OTP Verification Code'
        message = f'Your OTP is {otp}. It will expire in 5 minutes.'
        from_email = 'no-reply@yourdomain.com'
        recipient_list = [user.email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = CustomUser.objects.filter(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_verified:
            raise serializers.ValidationError("User not verified.")

        return data

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        user = CustomUser.objects.filter(email=data['email'], otp=data['otp']).first()

        if not user:
            raise serializers.ValidationError("Invalid OTP or email.")

        if not user.otp_created_at:
            raise serializers.ValidationError("OTP timestamp not set. Please request a new OTP.")

        otp_expiry_time = user.otp_created_at + timedelta(minutes=5)
        if timezone.now() > otp_expiry_time:
            raise serializers.ValidationError("OTP has expired. Please request a new one.")

        user.is_verified = True
        user.otp = ''
        user.otp_created_at = None
        user.save()

        return data

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'profile_picture']

    def update(self, instance, validated_data):
        """ Custom update to handle profile picture """
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)

        
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data['profile_picture']

        instance.save()  
        return instance



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({"old_password": "Incorrect password."})
        return data


    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
