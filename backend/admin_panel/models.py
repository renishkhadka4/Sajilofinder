from django.db import models
from api.models import CustomUser

class UserReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('hostel', 'Hostel'),
        ('student', 'Student'),
        ('review', 'Review'),
        ('other', 'Other'),
    ]

    reporter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_received', null=True, blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, default='pending')  # pending, reviewed, resolved
    reason = models.TextField(default="General complaint")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.username} - {self.report_type}"


# admin_panel/models.py

from django.db import models
from api.models import CustomUser

class Blog(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"
