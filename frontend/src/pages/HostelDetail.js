import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/HostelDetail.css";
import Navbar from "../components/Navbar";

const HostelDetail = () => {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [recentHostels, setRecentHostels] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Fetch Hostel Details
    const fetchHostel = async () => {
      try {
        const response = await api.get(`/hostel_owner/hostels/${id}/`);
        setHostel(response.data);
      } catch (error) {
        console.error("Error fetching hostel details:", error);
      }
    };

    // Fetch Rooms for this Hostel
    const fetchRooms = async () => {
      try {
        const response = await api.get(`/hostel_owner/rooms/?hostel_id=${id}`);
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    // Fetch Recent Hostels
    const fetchRecentHostels = async () => {
      try {
        const response = await api.get("/hostel_owner/hostels/");
        setRecentHostels(response.data.slice(0, 4)); // Show 4 recent hostels
      } catch (error) {
        console.error("Error fetching recent hostels:", error);
      }
    };

    fetchHostel();
    fetchRooms();
    fetchRecentHostels();
  }, [id]);

  if (!hostel) {
    return <p className="loading">Loading hostel details...</p>;
  }

  // Filter rooms based on type
  const filteredRooms =
    filter === "All" ? rooms : rooms.filter((room) => room.room_type === filter);

  return (
    <div>
      <Navbar />
      <div className="hostel-detail-container">
        <div className="hostel-content">
          <div className="hostel-info-section">
            <h1 className="hostel-title">{hostel.name}</h1>
            <p className="hostel-location">📍 {hostel.address}</p>
            <p className="hostel-info">
              📞 {hostel.contact_number || "N/A"} | 📧 {hostel.email || "N/A"}
            </p>
            <p className="register-year">🗓 Register Year: {hostel.established_year || "N/A"}</p>
          </div>

          {/*  Image Gallery */}
          <div className="hostel-images">
            {hostel.images.length > 0 ? (
              hostel.images.map((img, index) => (
                <img key={index} src={img.image} alt={`Hostel view ${index + 1}`} />
              ))
            ) : (
              <p>No Images Available</p>
            )}
          </div>

          {/*  Hostel Description */}
          <div className="hostel-description">
            <h2>Hostel Detail</h2>
            <p>{hostel.description}</p>
          </div>

          {/* Filter Rooms */}
          <div className="room-filter">
            <label>Filter Rooms:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          {/* ✅ Rooms Section */}
          <div className="room-section">
            <h2>Available Rooms</h2>
            {filteredRooms.length > 0 ? (
              <div className="room-grid">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="room-card">
                    <h3>Room {room.room_number}</h3>
                    <p>🏠 Type: {room.room_type}</p>
                    <p>💰 Price: Rs {room.price}</p>
                    <p>🟢 {room.is_available ? "Available" : "Booked"}</p>

                    {/* ✅ Room Images */}
                    <div className="room-images">
                      {room.images.length > 0 ? (
                        room.images.map((img, index) => (
                          <img key={index} src={img.image} alt={`Room ${room.room_number} - ${index + 1}`} />
                        ))
                      ) : (
                        <p>No Images Available</p>
                      )}
                    </div>

                    {room.is_available && (
                      <button className="book-room-btn">Book Now</button>
                    )}
                    <Link to={`/room/${room.id}`} className="view-details-btn">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>No rooms available in this hostel.</p>
            )}
          </div>
        </div>

        {/* ✅ Recent Hostels Section */}
        <div className="recent-hostels">
          <h2>Recent Hostel</h2>
          {recentHostels.map((recent) => (
            <Link key={recent.id} to={`/hostel/${recent.id}`} className="recent-hostel-card">
              <img src={recent.images.length > 0 ? recent.images[0].image : "no-image.jpg"} alt={recent.name} />
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
