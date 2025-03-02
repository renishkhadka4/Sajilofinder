from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    STUDENT = 'Student'
    HOSTEL_OWNER = 'HostelOwner'
    ADMIN = 'Admin'

    ROLE_CHOICES = [
        (STUDENT, 'Student'),
        (HOSTEL_OWNER, 'Hostel Owner'),
        (ADMIN, 'Admin'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=STUDENT)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def is_admin(self):
        return self.role == self.ADMIN

    def is_hostel_owner(self):
        return self.role == self.HOSTEL_OWNER

    def is_student(self):
        return self.role == self.STUDENT