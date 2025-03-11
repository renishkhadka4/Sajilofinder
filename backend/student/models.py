from django.db import models
from django.contrib.auth import get_user_model
from api.models import CustomUser 

User = get_user_model()

class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="student_profiles/", blank=True, null=True)

    def __str__(self):
        return self.user.username
