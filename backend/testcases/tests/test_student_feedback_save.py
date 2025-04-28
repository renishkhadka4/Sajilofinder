import pytest
from api.models import CustomUser
from hostel_owner.models import Hostel, Floor, Room, Booking
from hostel_owner.serializers import FeedbackSerializer

@pytest.mark.django_db
def test_student_feedback_save():
    print("\n Step 1: Create a Student user")
    student = CustomUser.objects.create_user(
        username="studentuser",
        email="student@example.com",
        password="password123",
        role="Student"
    )
    print(f" Student created: {student.username}")

    print("\n Step 2: Create a HostelOwner and Verified Hostel")
    owner = CustomUser.objects.create_user(
        username="hostelowner",
        email="owner@example.com",
        password="password123",
        role="HostelOwner"
    )
    hostel = Hostel.objects.create(
        owner=owner,
        name="Test Hostel",
        address="Kathmandu",
        description="Test description",
        contact_number="9800000000",
        email="testhostel@example.com",
        established_year=2020,
        city="Kathmandu",
        state="Bagmati",
        zip_code="44600",
        google_maps_link="https://maps.example.com",
        wifi=True,
        parking=True,
        laundry=True,
        security_guard=True,
        mess_service=True,
        attached_bathroom=True,
        air_conditioning=True,
        heater=True,
        balcony=True,
        rent_min="5000",
        rent_max="10000",
        security_deposit="2000",
        smoking_allowed=True,
        alcohol_allowed=False,
        pets_allowed=False,
        visiting_hours="9AM - 7PM",
        nearby_colleges="College X",
        nearby_markets="Market Y",
        category="boys",
        latitude=27.7172,
        longitude=85.3240,
        is_verified=True
    )
    print(f" Hostel created: {hostel.name}")

    print("\n Step 3: Create Floor and Room under the hostel")
    floor = Floor.objects.create(hostel=hostel, floor_number=1, description="First floor")
    room = Room.objects.create(floor=floor, room_number="101", room_type="Single", price=7000)

    print("\n Step 4: Create a Confirmed Booking for the student")
    booking = Booking.objects.create(
        student=student,
        room=room,
        check_in="2025-05-01",
        check_out="2025-05-10",
        status="confirmed"
    )
    print(f" Booking created: {booking.id}")

    print("\n Step 5: Prepare Feedback Data and Save")
    feedback_data = {
        "rating": 4,
        "comment": "Nice hostel, good service!",
    }

    serializer_context = {"request": None}
    serializer = FeedbackSerializer(data=feedback_data, context=serializer_context)

    assert serializer.is_valid(), f"❌ Serializer validation errors: {serializer.errors}"

    feedback = serializer.save(
        student=student,
        hostel=hostel
    )  #  Manually pass both student and hostel

    print(f" Feedback saved: {feedback.comment}")
    print("\n Test Completed Successfully - Student Feedback Save Logic Working! ")
