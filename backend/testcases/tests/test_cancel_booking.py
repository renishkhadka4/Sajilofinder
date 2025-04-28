import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from hostel_owner.models import Hostel, Floor, Room, Booking
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_student_cancel_booking():
    client = APIClient()

    # Step 1: Create a Hostel Owner
    owner = CustomUser.objects.create_user(
        username="hostelowner1",
        email="owner1@example.com",
        password="password123",
        role="HostelOwner"
    )

    # Step 2: Create a Student User
    student = CustomUser.objects.create_user(
        username="teststudent1",
        email="teststudent1@example.com",
        password="password123",
        role="Student"
    )

    # Step 3: Create Hostel, Floor, and Room
    hostel = Hostel.objects.create(name="Peace Hostel", owner=owner, is_verified=True)
    floor = Floor.objects.create(hostel=hostel, floor_number=1)
    room = Room.objects.create(floor=floor, room_number="102", room_type="Double", price=6000, is_available=True)

    # Step 4: Create a Pending Booking for Student
    booking = Booking.objects.create(
        student=student,
        room=room,
        check_in="2025-05-10",
        check_out="2025-06-10",
        status="pending"
    )

    # Step 5: Login as Student
    refresh = RefreshToken.for_user(student)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Step 6: Call Cancel Booking API
    response = client.post(f"/api/students/bookings/{booking.id}/cancel/")

    # Debug Output
    print(f"Cancel Booking API Status Code: {response.status_code}")
    if response.status_code == 200:
        print(" Cancel Response Data:", response.json())
    else:
        print(" Error Response Content:", response.content.decode())

    # Step 7: Assertions
    booking.refresh_from_db()  # Refresh booking from database
    assert response.status_code == 200
    assert booking.status == "rejected"
