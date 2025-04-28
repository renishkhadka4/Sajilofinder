from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Hostel

# -------------------------------
# Test Cases for Hostel Model and APIs
# -------------------------------
class HostelTests(TestCase):

    def setUp(self):
        # Set up a test client and create a sample hostel
        self.client = APIClient()
        self.hostel_data = {
            'name': 'Sample Hostel',
            'address': 'Kathmandu',  #  Your model has no 'location' field, fixed to 'address'
        }
        self.hostel = Hostel.objects.create(**self.hostel_data)

    def test_hostel_creation(self):
        # Test if the hostel instance is created successfully
        self.assertEqual(self.hostel.name, 'Sample Hostel')
        self.assertEqual(self.hostel.address, 'Kathmandu')  #  Fixed field name (was wrong before)

    def test_hostel_list_api(self):
        # Test if hostel list API is working correctly
        url = reverse('hostel-list')  # URL name must match your view/router name
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
