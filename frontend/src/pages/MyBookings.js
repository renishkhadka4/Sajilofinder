import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/MyBooking.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [hostelMap, setHostelMap] = useState({});
  const [floorMap, setFloorMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Fetch bookings
        const bookingRes = await api.get("/students/bookings/my-history/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings = bookingRes.data;
        setBookings(bookings);

        // 2️⃣ Fetch unique floor & hostel IDs
        const floorIds = [...new Set(bookings.map(b => b.room.floor))];
        const hostelIds = [];

        const floorPromises = floorIds.map(id =>
          api.get(`/hostel_owner/floors/${id}/`)
        );
        const floors = await Promise.all(floorPromises);
        floors.forEach(f => {
          floorMap[f.data.id] = f.data;
          if (!hostelIds.includes(f.data.hostel)) {
            hostelIds.push(f.data.hostel);
          }
        });

        setFloorMap({ ...floorMap });

        const hostelPromises = hostelIds.map(id =>
          api.get(`/hostel_owner/hostels/${id}/`)
        );
        const hostels = await Promise.all(hostelPromises);
        const hMap = {};
        hostels.forEach(h => (hMap[h.data.id] = h.data));
        setHostelMap(hMap);
      } catch (err) {
        console.error(" Error fetching bookings or hostel/floor:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="bookings-container">
        <h2>📚 My Hostel Bookings</h2>
        <div className="booking-grid">
          {bookings.map((booking) => {
            const floor = floorMap[booking.room.floor];
            const hostel = hostelMap[floor?.hostel];
            return (
              <div key={booking.id} className="booking-card">
                <img
                  src={hostel?.images?.[0]?.image || "/no-image.jpg"}
                  alt="Hostel"
                  className="booking-image"
                />
                <div className="booking-info">
                  <h3>{hostel?.name || "Unknown Hostel"}</h3>
                  <p>📍 {hostel?.address}</p>
                  <p>🧱 Floor: {floor?.floor_number}</p>
                  <p>🚪 Room: {booking.room.room_number}</p>
                  <p>📅 {booking.check_in} → {booking.check_out}</p>
                  <p>🔖 Status: <b>{booking.status}</b></p>
                  <button
                    className="view-booking-btn"
                    onClick={() => navigate(`/student/bookings/${booking.id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
