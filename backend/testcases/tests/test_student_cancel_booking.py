

import pytest
from api.models import CustomUser
from hostel_owner.models import Hostel, Floor, Room, Booking

@pytest.mark.django_db
def test_student_cancel_booking():
    print("\n Step 1: Create a Student and HostelOwner")
    student = CustomUser.objects.create_user(
        username="studentcancel",
        email="studentcancel@example.com",
        password="password123",
        role="Student"
    )

    owner = CustomUser.objects.create_user(
        username="hostelownercancel",
        email="hostelownercancel@example.com",
        password="password123",
        role="HostelOwner"
    )

    print(" Step 2: Create a Verified Hostel, Floor, and Room")
    hostel = Hostel.objects.create(
        owner=owner,
        name="Cancel Hostel",
        address="Kathmandu",
        description="Test Cancel Hostel",
        contact_number="9800000000",
        email="cancelhostel@example.com",
        established_year=2020,
        city="Kathmandu",
        state="Bagmati",
        zip_code="44600",
        google_maps_link="https://maps.example.com",
        wifi=True,
        parking=True,
        is_verified=True,
        category="boys",
        latitude=27.7172,
        longitude=85.3240
    )
    floor = Floor.objects.create(hostel=hostel, floor_number=1, description="First floor")
    room = Room.objects.create(floor=floor, room_number="201", room_type="Single", price=8000)

    print(" Step 3: Create a Confirmed Booking")
    booking = Booking.objects.create(
        student=student,
        room=room,
        check_in="2025-05-01",
        check_out="2025-05-10",
        status="confirmed"
    )

    print(f" Booking created with ID: {booking.id}")

    print(" Step 4: Cancel the Booking")
    booking.status = "canceled"
    booking.save()

    # Reload the booking from database to verify
    booking.refresh_from_db()

    print(f" Final Booking Status: {booking.status}")

    #  Assertion to check if booking is canceled
    assert booking.status == "canceled", " Booking cancellation failed!"
    print(" Booking cancelled successfully!")

