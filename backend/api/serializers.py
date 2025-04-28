from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from datetime import timedelta
from django.utils import timezone
import random


# Registration Serializer

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)  # Confirm password field

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'role')

    def validate(self, data):
        # Ensure both passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")

        # Disallow admin registration from frontend
        if data['role'] == CustomUser.ADMIN:
            raise serializers.ValidationError("Admin registration is not allowed.")
        return data

    def create(self, validated_data):
        # Remove password2 before saving
        validated_data.pop('password2')
        validated_data['password'] = make_password(validated_data['password'])  # Hash password
        user = CustomUser.objects.create(**validated_data)

        # Generate OTP for verification
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()

        # Send OTP to user's email
        subject = 'Your OTP Verification Code'
        message = f'Your OTP is {otp}. It will expire in 5 minutes.'
        from_email = 'no-reply@yourdomain.com'
        recipient_list = [user.email]

        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

        return user


# Login Serializer

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


# Verify OTP Serializer

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        # Check if user with matching email and OTP exists
        user = CustomUser.objects.filter(email=data['email'], otp=data['otp']).first()
        if not user:
            raise serializers.ValidationError("Invalid OTP or email.")

        # Check OTP timestamp
        if not user.otp_created_at:
            raise serializers.ValidationError("OTP timestamp not set. Please request a new OTP.")

        # Check if OTP expired (valid for 5 mins)
        otp_expiry_time = user.otp_created_at + timedelta(minutes=5)
        if timezone.now() > otp_expiry_time:
            raise serializers.ValidationError("OTP has expired. Please request a new one.")

        # Mark user verified and clear OTP
        user.is_verified = True
        user.otp = ''
        user.otp_created_at = None
        user.save()

        return data


# User Profile Serializer

from django.contrib.auth import get_user_model
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']

    def update(self, instance, validated_data):
        # Custom update logic for profile updates
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)

        # If profile picture is updated
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data['profile_picture']

        instance.save()
        return instance


# Change Password Serializer

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


# Minimal User Serializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile_picture')
        read_only_fields = ('id', 'username', 'email')  # Email is readonly to avoid unauthorized changes

    def get_profile_image(self, obj):
        # Return absolute URL of profile image if available
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
