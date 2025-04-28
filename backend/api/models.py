from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom user model extending Django's AbstractUser
class CustomUser(AbstractUser):
    # --- Role definitions ---
    STUDENT = 'Student'
    HOSTEL_OWNER = 'HostelOwner'
    ADMIN = 'Admin'

    # Available role choices for the 'role' field
    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (HOSTEL_OWNER, 'Hostel Owner'),
        (ADMIN, 'Admin'),
    ]

    # --- Additional custom fields ---
    email = models.EmailField(unique=True)  # Use email as the unique login identifier
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=STUDENT)  # Role assigned to the user
    is_verified = models.BooleanField(default=False)  # Whether email/account is verified
    otp = models.CharField(max_length=6, blank=True, null=True)  # One-Time Password for email/phone verification
    otp_created_at = models.DateTimeField(null=True, blank=True)  # Time when OTP was created
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)  # Optional profile image upload

    # --- Authentication settings ---
    USERNAME_FIELD = 'email'  # Use email for login instead of username
    REQUIRED_FIELDS = ['username']  # Username is still required during signup

    # --- Helper methods to check user roles ---
    def is_admin(self):
        return self.role == self.ADMIN

    def is_hostel_owner(self):
        return self.role == self.HOSTEL_OWNER

    def is_student(self):
        return self.role == self.STUDENT

    # --- Optional Feature ---
    unread_messages = models.IntegerField(default=0)  # Track the number of unread chat messages for chat systems
