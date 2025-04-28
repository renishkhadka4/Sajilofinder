import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from hostel_owner.models import Hostel
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_owner_hostel_list_view():
    client = APIClient()

    # Step 1: Create Hostel Owner
    owner = CustomUser.objects.create_user(
        username="testowner",
        email="testowner@example.com",
        password="password123",
        role="HostelOwner"
    )

    # Step 2: Create Hostels (use address instead of location)
    Hostel.objects.create(name="Dream Hostel", owner=owner, address="Kathmandu", is_verified=True)
    Hostel.objects.create(name="Sunshine Hostel", owner=owner, address="Pokhara", is_verified=True)

    # Step 3: Authenticate
    refresh = RefreshToken.for_user(owner)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Step 4: Call Hostels API
    response = client.get("/api/hostel_owner/hostels/")  #  Correct URL

    print(f"Owner Hostel List API Status Code: {response.status_code}")
    if response.status_code == 200:
        print(" Hostels Data:", response.json())
    else:
        print(" Error Content:", response.content.decode())

    # Step 5: Assertions
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 2  # Because we created 2 hostels
    hostel_names = [h["name"] for h in response.json()]
    assert "Dream Hostel" in hostel_names
    assert "Sunshine Hostel" in hostel_names
