from django.db import models
from django.utils.timezone import now
from api.models import CustomUser
from django.db import models
from django.core.exceptions import ObjectDoesNotExist

class Hostel(models.Model):
    # 🏠 Basic Details
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'HostelOwner'})
    name = models.CharField(max_length=255)
    address = models.TextField()
    description = models.TextField()
    contact_number = models.CharField(max_length=20, blank=True, null=True)  #  Added contact number
    email = models.EmailField(blank=True, null=True)  #  Added email
    established_year = models.IntegerField(blank=True, null=True)  #  Year established

    # 📍 Location Details
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    google_maps_link = models.URLField(blank=True, null=True)

    # 🏡 Facilities & Amenities
    wifi = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    laundry = models.BooleanField(default=False)
    security_guard = models.BooleanField(default=False)
    mess_service = models.BooleanField(default=False)

    # 🏠 Room Features
    attached_bathroom = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    heater = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)

    # 💰 Pricing
    rent_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rent_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # 🚫 Rules & Policies
    smoking_allowed = models.BooleanField(default=False)
    alcohol_allowed = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    visiting_hours = models.CharField(max_length=100, blank=True, null=True)

    # 🏙️ Nearby Places
    nearby_colleges = models.TextField(blank=True, null=True)
    nearby_markets = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
def get_default_floor():
    try:
        return Floor.objects.first().id  # Assign the first existing floor
    except (ObjectDoesNotExist, AttributeError):
        return None  # Avoid migration issues if no floors exist yet

class Floor(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='floors')
    floor_number = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('hostel', 'floor_number')  # Ensure unique floors per hostel

    def __str__(self):
        return f"{self.hostel.name} - Floor {self.floor_number}"

class Room(models.Model):
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='rooms', default=get_default_floor)
    room_number = models.CharField(max_length=20, unique=True)
    room_type = models.CharField(max_length=50, choices=[('Single', 'Single'), ('Double', 'Double'), ('Suite', 'Suite')])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='room_images/')


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]

    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey('Room', on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')  #  Added booking status

    def __str__(self):
        return f"{self.student.username} - {self.room.room_number} ({self.status})"
    
class Feedback(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Temporarily allow null values
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, null=True, blank=True)  #  Also allow null for hostel
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username if self.student else 'No Student'} - {self.hostel.name if self.hostel else 'No Hostel'} ({self.rating})"


class HostelImage(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='hostel_images/')  #  Save images to 'media/hostel_images'
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.hostel.name} - {self.image.name}"  #  Better debugging
