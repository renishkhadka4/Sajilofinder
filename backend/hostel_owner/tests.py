from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Hostel

class HostelTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.hostel_data = {'name': 'Sample Hostel', 'location': 'Kathmandu'}
        self.hostel = Hostel.objects.create(**self.hostel_data)

    def test_hostel_creation(self):
        """Test if hostel is created successfully"""
        self.assertEqual(self.hostel.name, 'Sample Hostel')
        self.assertEqual(self.hostel.location, 'Kathmandu')

    def test_hostel_list_api(self):
        """Test getting the hostel list API"""
        url = reverse('hostel-list')  # your API name
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
