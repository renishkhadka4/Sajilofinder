import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/HostelDetail.css";
import Navbar from "../components/Navbar";

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [floors, setFloors] = useState([]);
  const [recentHostels, setRecentHostels] = useState([]);
  const [filter, setFilter] = useState("All");
  const [studentBookings, setStudentBookings] = useState([]);

  useEffect(() => {
    fetchHostel();
    fetchFloors();
    fetchRecentHostels();
    fetchStudentBookings();  // Fetch student bookings to check room status
  }, [id]);

  const fetchHostel = async () => {
    try {
      const res = await api.get(`/hostel_owner/hostels/${id}/`);
      setHostel(res.data);
    } catch (err) {
      console.error("Error fetching hostel:", err);
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await api.get(`/hostel_owner/floors/?hostel_id=${id}`);  // Ensure that you are fetching floors for the correct hostel
      const floorData = await Promise.all(
        res.data.map(async (floor) => {
          const roomRes = await api.get(`/hostel_owner/rooms/?floor_id=${floor.id}&hostel_id=${id}`); // Filtering by hostel_id
          return { ...floor, rooms: roomRes.data };
        })
      );
      setFloors(floorData);
    } catch (err) {
      console.error("Error fetching floors:", err);
    }
  };
  
  

  const fetchRecentHostels = async () => {
    try {
      const res = await api.get("/hostel_owner/hostels/");
      setRecentHostels(res.data.slice(0, 4));
    } catch (err) {
      console.error("Error fetching recent hostels:", err);
    }
  };

  const fetchStudentBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/students/bookings/my-history/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentBookings(res.data);  // Save student bookings data
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleBooking = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const check_in = new Date().toISOString().split("T")[0];
      const check_out = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      await api.post(
        "/student/bookings/",
        { room_id: roomId, check_in, check_out },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Booking request sent!");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("❌ Booking failed. Try again.");
    }
  };

  const getRoomStatus = (roomId, floorId) => {
    const booking = studentBookings.find(
      (b) =>
        b.room.id === roomId &&
        b.room.floor.hostel.id === parseInt(id) // Only consider bookings for this hostel
    );
  
    if (booking) {
      if (booking.status === "confirmed") return "Booked";
      if (booking.status === "pending") return "Pending";
      if (booking.status === "rejected") return "Rejected";
    }
  
    return "Available";
  };
  

  const amenities = [
    { key: "wifi", label: "WiFi" },
    { key: "parking", label: "Parking" },
    { key: "laundry", label: "Laundry" },
    { key: "security_guard", label: "Security Guard" },
    { key: "mess_service", label: "Mess Service" },
    { key: "attached_bathroom", label: "Attached Bathroom" },
    { key: "air_conditioning", label: "Air Conditioning" },
    { key: "heater", label: "Heater" },
    { key: "balcony", label: "Balcony" },
    { key: "smoking_allowed", label: "Smoking Allowed" },
    { key: "alcohol_allowed", label: "Alcohol Allowed" },
    { key: "pets_allowed", label: "Pets Allowed" },
  ];

  if (!hostel) return <p className="loading">Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="hostel-detail-container">
        <div className="hostel-content">
          <div className="hostel-info-section">
            <h1>{hostel.name}</h1>
            <p>📍 {hostel.address}</p>
            <p>📞 {hostel.contact_number || "N/A"} | 📧 {hostel.email || "N/A"}</p>
            <p>🗓 Registered: {hostel.established_year || "N/A"}</p>
            <p>🕒 Visiting Hours: {hostel.visiting_hours || "N/A"}</p>
            <p>🏫 Nearby Colleges: {hostel.nearby_colleges || "N/A"}</p>
            <p>🛒 Nearby Markets: {hostel.nearby_markets || "N/A"}</p>
          </div>

          <div className="hostel-images">
            {hostel.images.length > 0 ? (
              hostel.images.map((img, i) => (
                <img key={i} src={img.image} alt={`Hostel ${i + 1}`} />
              ))
            ) : (
              <p>No Images Available</p>
            )}
          </div>

          <div className="hostel-description">
            <h2>Description</h2>
            <p>{hostel.description}</p>
          </div>

          <div className="amenities-section">
            <h2>Amenities</h2>
            <ul className="amenities-list">
              {amenities.map(
                (item) => hostel[item.key] && <li key={item.key}>✔️ {item.label}</li>
              )}
            </ul>
          </div>

          <div className="room-filter">
            <label>Filter Rooms:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="room-section">
            <h2>Available Rooms by Floor</h2>
            {floors.map((floor) => {
              const visibleRooms =
                filter === "All"
                  ? floor.rooms
                  : floor.rooms.filter((room) => room.room_type === filter);
              return (
                <div key={floor.id} className="floor-section">
                  <h3>🧱 Floor {floor.floor_number}</h3>
                  {visibleRooms.length > 0 ? (
                    <div className="room-grid">
                      {visibleRooms.map((room) => (
                        <div key={room.id} className="room-card">
                          <h4>Room {room.room_number}</h4>
                          <p>🏠 Type: {room.room_type}</p>
                          <p>💰 Price: Rs {room.price}</p>
                          <p>{getRoomStatus(room.id, floor.id)}</p>
                          <div className="room-images">
                            {room.images && room.images.length > 0 ? (
                              room.images.map((img, i) => (
                                <img key={i} src={img.image} alt={`Room ${i + 1}`} />
                              ))
                            ) : (
                              <p>No images available for this room.</p>
                            )}
                          </div>

                          <Link to={`/room/${room.id}`} className="view-details-btn">
                            View Details
                          </Link>
                          {getRoomStatus(room.id) === "Available" && (
                            <button onClick={() => handleBooking(room.id)}>
                              Book Now
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No matching rooms on this floor.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="recent-hostels">
          <h2>Recent Hostels</h2>
          {recentHostels.map((recent) => (
            <Link key={recent.id} to={`/hostel/${recent.id}`} className="recent-hostel-card">
              <img src={recent.images[0]?.image || "/no-image.jpg"} alt={recent.name} />
              <p>{recent.name}</p>
              <p>📍 {recent.address}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostelDetail;
