import pytest
import json
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import CustomUser

@pytest.mark.django_db
def test_owner_profile_update():
    client = APIClient()

    # Create owner user
    owner = CustomUser.objects.create_user(
        username="owner1",
        email="owner1@example.com",
        password="password123",
        role="HostelOwner"
    )

    #  Generate JWT token manually
    refresh = RefreshToken.for_user(owner)
    access_token = str(refresh.access_token)

    #  Attach Authorization header
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

    #  Prepare JSON body correctly
    payload = {
        "first_name": "UpdatedName",
        "last_name": "OwnerLastName"
    }

    #  Now do JSON dump
    response = client.patch(
        "/api/auth/profile/",
        data=json.dumps(payload),   # <-- important
        content_type="application/json"
    )

    # Fetch updated user
    owner.refresh_from_db()

    #  Important debug info
    if response.status_code != 200:
        print(f" API Error: {response.json()}")

    # Assertions
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
    assert owner.first_name == "UpdatedName"
    assert owner.last_name == "OwnerLastName"
    print(" Owner profile update successful!")
