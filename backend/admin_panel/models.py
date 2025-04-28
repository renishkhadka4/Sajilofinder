from django.db import models
from api.models import CustomUser


# User Report Model

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
    reason = models.TextField(default="General complaint")
    status = models.CharField(max_length=20, default='pending')  # Status can be pending, reviewed, resolved
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reporter.username} - {self.report_type}"


# Blog Model

class Blog(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# Contact Message Model

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"


# About Us Model

class AboutUs(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    services = models.TextField(help_text="Comma-separated list of services")
    image1 = models.ImageField(upload_to="about_us/", null=True, blank=True)
    image2 = models.ImageField(upload_to="about_us/", null=True, blank=True)
    image3 = models.ImageField(upload_to="about_us/", null=True, blank=True)
    image4 = models.ImageField(upload_to="about_us/", null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def service_list(self):
        # Splits the comma-separated services into a clean list
        return [s.strip() for s in self.services.split(',') if s.strip()]

    def __str__(self):
        return self.title


# Admin Notification Model

class AdminNotification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='admin_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.user.username}: {self.message[:30]}"
