from django.test import TestCase

# Create your tests here.
import pytest
from api.serializers import RegisterSerializer

@pytest.mark.django_db
def test_invalid_email_format_registration():
    data = {
        "username": "don",
        "email": "don123gmail.com",  # Invalid email
        "password": "Password123",
        "password2": "Password123",
        "role": "Student"
    }

    serializer = RegisterSerializer(data=data)
    is_valid = serializer.is_valid()

    # Debug output
    if is_valid:
        print(" Serializer unexpectedly valid. Errors expected.")
    else:
        print(" Serializer validation failed as expected.")
        print(" Errors:", serializer.errors)

    # Assertions
    assert not is_valid, f"Serializer should be invalid but returned valid. Errors: {serializer.errors}"
    assert "email" in serializer.errors, f"'email' not in errors: {serializer.errors}"
    assert serializer.errors["email"][0] == "Enter a valid email address.", f"Expected email error not found. Got: {serializer.errors['email'][0]}"
