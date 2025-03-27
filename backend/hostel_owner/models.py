from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from api.models import CustomUser

class Hostel(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'HostelOwner'})
    name = models.CharField(max_length=255)
    address = models.TextField()
    description = models.TextField()
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    established_year = models.IntegerField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    google_maps_link = models.URLField(blank=True, null=True)
    wifi = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    laundry = models.BooleanField(default=False)
    security_guard = models.BooleanField(default=False)
    mess_service = models.BooleanField(default=False)
    attached_bathroom = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    heater = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    rent_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rent_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    smoking_allowed = models.BooleanField(default=False)
    alcohol_allowed = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    visiting_hours = models.CharField(max_length=100, blank=True, null=True)
    nearby_colleges = models.TextField(blank=True, null=True)
    nearby_markets = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cancellation_policy = models.JSONField(default=dict)
    
    def __str__(self):
        return self.name

def get_default_floor():
    try:
        return Floor.objects.first().id
    except (ObjectDoesNotExist, AttributeError):
        return None

class Floor(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='floors')
    floor_number = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('hostel', 'floor_number')

    def __str__(self):
        return f"{self.hostel.name} - Floor {self.floor_number}"

class Room(models.Model):
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    room_type = models.CharField(max_length=50, choices=[('Single', 'Single'), ('Double', 'Double'), ('Suite', 'Suite')])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('floor', 'room_number')  # ✅ Only unique within floor

    def __str__(self):
        return f"Room {self.room_number} - {'Available' if self.is_available else 'Unavailable'}"


class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='room_images/')
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['position']

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True) 
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="bookings")
    pidx = models.CharField(max_length=255, blank=True, null=True)
    def __str__(self):
        return f"{self.student.username} - {self.room.room_number} ({self.status})"

class Feedback(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    reply = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.hostel.name} ({self.rating})"

class HostelImage(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='hostel_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.hostel.name} - {self.image.name}"


from django.db import models
from api.models import CustomUser
from datetime import datetime

class ChatMessage(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_messages")
    hostel = models.ForeignKey("Hostel", on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat from {self.sender.username} to {self.receiver.username}"


class OwnerNotification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.user.username}"


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20)  # e.g., success / failed
    payment_method = models.CharField(max_length=100, default="Khalti")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Booking {self.booking.id} - {self.status}"
