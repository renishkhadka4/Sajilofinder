import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from hostel_owner.models import Hostel, Floor, Room
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_student_hostel_room_booking():
    client = APIClient()

    # Step 1: Create Hostel Owner
    owner = CustomUser.objects.create_user(
        username="hostelowner",
        email="owner@example.com",
        password="password123",
        role="HostelOwner"
    )

    # Step 2: Create Student User
    student = CustomUser.objects.create_user(
        username="teststudent",
        email="teststudent@example.com",
        password="password123",
        role="Student"
    )

    # Step 3: Create Verified Hostel
    hostel = Hostel.objects.create(
        name="Green Valley Hostel",
        owner=owner,
        is_verified=True
    )

    # Step 4: Create Floor ( added floor_number)
    floor = Floor.objects.create(
        hostel=hostel,
        floor_number=1,               
        description="First Floor"
    )

    # Step 5: Create Room
    room = Room.objects.create(
        floor=floor,
        room_number="101",
        room_type="Single",
        price=5000,
        is_available=True
    )

    # Step 6: Login Student
    refresh = RefreshToken.for_user(student)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Step 7: Submit Booking
    booking_payload = {
        "room_id": room.id,
        "check_in": "2025-05-01",
        "check_out": "2025-06-01"
    }

    response = client.post("/api/students/bookings/manual/", booking_payload, format="json")

    print(f"Student Hostel Room Booking API Status Code: {response.status_code}")
    if response.status_code == 201:
        print(" Booking Response Data:", response.json())
    else:
        print(" Error Response Content:", response.content.decode())

    # Step 8: Assertions
    assert response.status_code == 201
    assert response.data["status"] == "pending"
