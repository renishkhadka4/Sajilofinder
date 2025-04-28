import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_admin_dashboard_stats_view():
    client = APIClient()

    # Step 1: Create Admin User
    admin = CustomUser.objects.create_user(
        username="adminuser",
        email="adminuser@example.com",
        password="adminpass123",
        role="Admin",
        is_superuser=True,
        is_staff=True
    )

    # Step 2: Login (generate token)
    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Step 3: Call Dashboard Stats API
    response = client.get("/api/admin/dashboard/stats/")
  #  Correct URL

    print(f"Admin Dashboard Stats API Status Code: {response.status_code}")
    if response.status_code == 200:
        print(" Dashboard Stats:", response.json())
    else:
        print(" Error Response Content:", response.content.decode())

    # Step 4: Assertions
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_students" in data
    assert "total_hostel_owners" in data
    assert "total_bookings" in data
    assert "total_feedbacks" in data
