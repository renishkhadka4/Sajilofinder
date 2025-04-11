import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/MyBooking.css";
import Footer from "../components/Footer";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [hostelMap, setHostelMap] = useState({});
  const [floorMap, setFloorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "active", "completed", "cancelled"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
  
        // 1️⃣ Get bookings
        const bookingRes = await api.get("/students/bookings/my-history/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings = bookingRes.data;
        setBookings(bookings);
  
        // 2️⃣ Extract floor IDs
        const floorIds = [...new Set(bookings.map(b => b.room.floor?.id).filter(Boolean))];
        const hostelIds = [];
        const tempFloorMap = {};
  
        if (floorIds.length > 0) {
          // 3️⃣ Fetch floor data
          const floorPromises = floorIds.map(id => api.get(`/hostel_owner/floors/${id}/`));
          const floors = await Promise.all(floorPromises);
    
          floors.forEach(f => {
            tempFloorMap[f.data.id] = f.data;
            if (!hostelIds.includes(f.data.hostel)) {
              hostelIds.push(f.data.hostel);
            }
          });
          setFloorMap(tempFloorMap);
    
          // 4️⃣ Fetch hostel data
          if (hostelIds.length > 0) {
            const hostelPromises = hostelIds.map(id => api.get(`/hostel_owner/hostels/${id}/`));
            const hostels = await Promise.all(hostelPromises);
            const hMap = {};
            hostels.forEach(h => (hMap[h.data.id] = h.data));
            setHostelMap(hMap);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings or hostel/floor:", err);
        setError("Failed to load your bookings. Please try again later.");
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    if (filter === "active") return booking.status === "active" || booking.status === "confirmed";
    if (filter === "completed") return booking.status === "completed";
    if (filter === "cancelled") return booking.status === "cancelled";
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case "active":
      case "confirmed":
        return "status-badge status-active";
      case "completed":
        return "status-badge status-completed";
      case "cancelled":
        return "status-badge status-cancelled";
      case "pending":
        return "status-badge status-pending";
      default:
        return "status-badge";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="bookings-container loading-container">
          <div className="loader"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="bookings-container error-container">
          <h2>⚠️ Something went wrong</h2>
          <p>{error}</p>
          <button className="primary-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <Navbar />
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Hostel Bookings</h1>
          <p className="bookings-count">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="filter-container">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="empty-state">
              <i className="empty-icon">🏨</i>
              <h3>No bookings found</h3>
              <p>You don't have any {filter !== "all" ? filter : ""} bookings yet.</p>
              <button 
                className="primary-btn"
                onClick={() => navigate("/hostels")}
              >
                Browse Hostels
              </button>
            </div>
          </div>
        ) : (
          <div className="booking-grid">
            {filteredBookings.map((booking) => {
              const floor = floorMap[booking.room.floor?.id];
              const hostel = hostelMap[floor?.hostel];

              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-header">
                    <div className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </div>
                  </div>
                  
                  <div className="booking-image-container">
                    <img
                      src={hostel?.images?.[0]?.image || "/no-image.jpg"}
                      alt={hostel?.name || "Hostel"}
                      className="booking-image"
                    />
                    <div className="booking-image-overlay">
                      <span className="booking-price">
                        {booking.total_amount ? `₹${booking.total_amount}` : ""}
                      </span>
                    </div>
                  </div>
                  
                  <div className="booking-info">
                    <h3 className="hostel-name">{hostel?.name || "Unknown Hostel"}</h3>
                    <div className="booking-details">
                      <div className="booking-detail">
                        <span className="detail-icon">📍</span>
                        <span className="detail-text truncate">
                          {hostel?.address || "Address not available"}
                        </span>
                      </div>
                      
                      <div className="booking-detail-row">
                        <div className="booking-detail half">
                          <span className="detail-icon">🧱</span>
                          <span className="detail-text">
                            Floor {floor?.floor_number || "N/A"}
                          </span>
                        </div>
                        <div className="booking-detail half">
                          <span className="detail-icon">🚪</span>
                          <span className="detail-text">
                            Room {booking.room.room_number}
                          </span>
                        </div>
                      </div>
                      
                      <div className="booking-detail date-range">
                        <span className="detail-icon">📅</span>
                        <div className="date-range-container">
                          <span className="date-value">{formatDate(booking.check_in)}</span>
                          <span className="date-separator">→</span>
                          <span className="date-value">{formatDate(booking.check_out)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      <button
                        className="view-booking-btn"
                        onClick={() => navigate(`/student/bookings/${booking.id}`)}
                      >
                        View Details
                      </button>
                      
                      {(booking.status === "active" || booking.status === "confirmed") && (
                        <button 
                          className="extend-booking-btn"
                          onClick={() => navigate(`/student/bookings/${booking.id}/extend`)}
                        >
                          Extend Stay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;