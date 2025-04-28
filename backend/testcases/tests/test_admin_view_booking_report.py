import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_admin_view_booking_report():
    client = APIClient()

    admin = CustomUser.objects.create_user(
        username="adminuser",
        email="admin@example.com",
        password="adminpass123",
        role="Admin",
        is_superuser=True,
        is_staff=True
    )

    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    response = client.get("/api/hostel_owner/download-report/bookings/csv/")  # ✅ fixed dash

    print(f"Booking Report Status Code: {response.status_code}")
    print(f"Booking Report Content-Type: {response['Content-Type']}")

    assert response.status_code == 200
    assert "text/csv" in response["Content-Type"]

    print("✅ Admin Booking Report Test Passed!")


@pytest.mark.django_db
def test_admin_view_earnings_report():
    client = APIClient()

    admin = CustomUser.objects.create_user(
        username="adminuser2",
        email="admin2@example.com",
        password="adminpass123",
        role="Admin",
        is_superuser=True,
        is_staff=True
    )

    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    response = client.get("/api/hostel_owner/download-report/earnings/csv/")  # ✅ fixed dash

    print(f"Earnings Report Status Code: {response.status_code}")
    print(f"Earnings Report Content-Type: {response['Content-Type']}")

    assert response.status_code == 200
    assert "text/csv" in response["Content-Type"]

    print("✅ Admin Earnings Report Test Passed!")


@pytest.mark.django_db
def test_admin_view_feedback_report():
    client = APIClient()

    admin = CustomUser.objects.create_user(
        username="adminuser3",
        email="admin3@example.com",
        password="adminpass123",
        role="Admin",
        is_superuser=True,
        is_staff=True
    )

    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    response = client.get("/api/hostel_owner/download-report/feedback/csv/")  # ✅ fixed dash

    print(f"Feedback Report Status Code: {response.status_code}")
    print(f"Feedback Report Content-Type: {response['Content-Type']}")

    assert response.status_code == 200
    assert "text/csv" in response["Content-Type"]

    print("✅ Admin Feedback Report Test Passed!")
