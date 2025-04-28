from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Define user roles
    STUDENT = 'Student'
    HOSTEL_OWNER = 'HostelOwner'
    ADMIN = 'Admin'

    # Choices available for the 'role' field
    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (HOSTEL_OWNER, 'Hostel Owner'),
        (ADMIN, 'Admin'),
    ]

    # Additional fields for the custom user
    email = models.EmailField(unique=True)  # Use email as unique identifier for login
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=STUDENT)  # Role of the user
    is_verified = models.BooleanField(default=False)  # Email/Account verification status
    otp = models.CharField(max_length=6, blank=True, null=True)  # OTP for verification (optional)
    otp_created_at = models.DateTimeField(null=True, blank=True)  # Timestamp when OTP was generated
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)  # Profile picture

    # Set email as the field used for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Username is still required for registration

    # Helper methods to check user roles
    def is_admin(self):
        return self.role == self.ADMIN

    def is_hostel_owner(self):
        return self.role == self.HOSTEL_OWNER

    def is_student(self):
        return self.role == self.STUDENT
    
    # Track the number of unread chat messages (optional feature for chat systems)
    unread_messages = models.IntegerField(default=0)
