# backend/testcases/tests/test_admin_feedback_moderate.py

import pytest
from api.models import CustomUser
from hostel_owner.models import Hostel, Floor, Room, Booking, Feedback

@pytest.mark.django_db
def test_admin_marks_feedback_as_fake():
    #  Step 1: Create Student
    student = CustomUser.objects.create_user(
        username="teststudent",
        email="teststudent@example.com",
        password="password123",
        role="Student"
    )

    # Step 2: Create Admin
    admin = CustomUser.objects.create_user(
        username="adminuser",
        email="admin@example.com",
        password="adminpassword",
        role="Admin"
    )

    #  Step 3: Create Hostel Owner and Verified Hostel
    owner = CustomUser.objects.create_user(
        username="hostelowner",
        email="hostelowner@example.com",
        password="ownerpassword",
        role="HostelOwner"
    )

    hostel = Hostel.objects.create(
        owner=owner,
        name="Moderation Hostel",
        address="Kathmandu",
        description="Test description",
        contact_number="9800000000",
        email="test@example.com",
        established_year=2021,
        city="Kathmandu",
        state="Bagmati",
        zip_code="44600",
        google_maps_link="https://maps.example.com",
        wifi=True,
        parking=True,
        is_verified=True,
        latitude=27.7172,
        longitude=85.3240,
        category="boys",
    )

    #  Step 4: Create Floor and Room
    floor = Floor.objects.create(hostel=hostel, floor_number=1, description="Test Floor")
    room = Room.objects.create(floor=floor, room_number="101", room_type="Single", price=5000)

    # Step 5: Create Confirmed Booking
    booking = Booking.objects.create(
        student=student,
        room=room,
        check_in="2025-05-01",
        check_out="2025-05-10",
        status="confirmed"
    )

    #  Step 6: Submit Feedback
    feedback = Feedback.objects.create(
        student=student,
        hostel=hostel,
        rating=4,
        comment="This hostel is okay."
    )

    #  Step 7: Admin moderates (marks feedback as fake)
    feedback.is_fake = True
    feedback.save()

    #  Step 8: Assert that feedback is marked fake
    feedback.refresh_from_db()
    assert feedback.is_fake == True
    print(f" Feedback ID {feedback.id} successfully marked as fake!")

