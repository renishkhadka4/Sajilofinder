import pytest
from rest_framework.test import APIClient
from api.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_student_profile_view():
    client = APIClient()

    # Step 1: Create Student
    student = CustomUser.objects.create_user(
        username="teststudent",
        email="teststudent@example.com",
        password="password123",
        role="Student"
    )

    # Step 2: Login (Manually generate token)
    refresh = RefreshToken.for_user(student)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Step 3: Call the correct Profile API
    response = client.get("/api/student/profile/")  # ✅ corrected path

    # Debug output
    print(f"Student Profile API Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Response Data:", response.json())
    else:
        print("❌ Error Response Content:", response.content.decode())

    # Step 4: Assertions
    assert response.status_code == 200
    assert response.json()["username"] == "teststudent"
    assert response.json()["email"] == "teststudent@example.com"
    assert response.json()["role"] == "Student"
