import pytest
from api.models import CustomUser
from hostel_owner.models import Room, Floor, Hostel
from hostel_owner.serializers import RoomSerializer

@pytest.mark.django_db
def test_room_save_method():
    print("\n Step 1: Creating a HostelOwner user first")
    # Why? Because Hostel requires a non-null owner
    owner = CustomUser.objects.create_user(
        username="hostelowner",
        email="owner@example.com",
        password="password123",
        role="HostelOwner"
    )
    print(f" HostelOwner created: {owner.username}, {owner.email}")

    print("\n Step 2: Creating a verified Hostel linked to the owner")
    hostel = Hostel.objects.create(
        owner=owner,  # Important! Linking owner here
        name="Test Hostel",
        address="Kathmandu",
        description="Test hostel description",
        contact_number="9800000000",
        email="testhostel@example.com",
        established_year=2020,
        city="Kathmandu",
        state="Bagmati",
        zip_code="44600",
        google_maps_link="https://maps.example.com",
        wifi=True,
        parking=True,
        laundry=True,
        security_guard=True,
        mess_service=True,
        attached_bathroom=True,
        air_conditioning=True,
        heater=True,
        balcony=True,
        rent_min="5000",
        rent_max="15000",
        security_deposit="2000",
        smoking_allowed=True,
        alcohol_allowed=False,
        pets_allowed=False,
        visiting_hours="8AM - 8PM",
        nearby_colleges="Some College",
        nearby_markets="Some Market",
        category="boys",
        latitude=27.7172,
        longitude=85.3240,
        is_verified=True  #  Admin approved hostel
    )
    print(f" Hostel created: {hostel.name} (ID: {hostel.id})")

    print("\nStep 3: Creating a Floor under the hostel")
    floor = Floor.objects.create(
        hostel=hostel,
        floor_number=1,
        description="First floor"
    )
    print(f" Floor created: Floor No. {floor.floor_number} (Hostel ID: {hostel.id})")

    print("\n Step 4: Preparing room data and saving using serializer")
    room_data = {
        "floor": floor.id,
        "room_number": "101",
        "room_type": "Single",
        "price": 7000
    }

    serializer = RoomSerializer(data=room_data)
    is_valid = serializer.is_valid()
    print(f" Serializer validation: {is_valid}")
    if not is_valid:
        print(f" Serializer errors: {serializer.errors}")

    room = serializer.save()
    print(f" Room created: {room.room_number}, {room.room_type}, Rs.{room.price}")

    print("\n Step 5: Final Assertions to confirm room saved properly")
    assert room.room_number == "101", " Room number mismatch"
    assert room.floor.id == floor.id, " Floor ID mismatch"
    assert room.price == 7000, " Room price mismatch"
    assert room.is_available == True, " Room availability mismatch"

    print("\n Test Passed Successfully — Room Save Logic Working! ")
