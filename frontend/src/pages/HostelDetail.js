import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../api/axios";
import "../styles/HostelDetail.css";
import Navbar from "../components/Navbar";
import StudentMessenger from "./StudentMessenger";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix for missing Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});





// Extracted components for better organization
const HostelInfo = ({ hostel }) => (
  <div className="hostel-info-section">
    <h1>{hostel.name}</h1>
    <p>📍 {hostel.address}</p>
    <p>📞 {hostel.contact_number?.trim() || "Not Provided"} | 📧 {hostel.email?.trim() || "N/A"}</p>

    <p>🗓 Registered: {hostel.established_year || "N/A"}</p>
    <p>🕒 Visiting Hours: {hostel.visiting_hours?.trim() ? hostel.visiting_hours : "N/A"}</p>

    <p>🏫 Nearby Colleges: {hostel.nearby_colleges || "N/A"}</p>
    <p>🛒 Nearby Markets: {hostel.nearby_markets || "N/A"}</p>
  </div>
);






const HostelImages = ({ images }) => (
  <div className="hostel-images">
    {images && images.length > 0 ? (
      images.map((img, i) => (
        <img key={i} src={img.image} alt={`Hostel ${i + 1}`} />
      ))
    ) : (
      <p>No Images Available</p>
    )}
  </div>
);

const Amenities = ({ hostel }) => {
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

  return (
    <div className="amenities-section">
      <h2>Amenities</h2>
      <ul className="amenities-list">
        {amenities.map(
          (item) => hostel[item.key] && <li key={item.key}>✔️ {item.label}</li>
        )}
      </ul>
    </div>
  );
};

const statusIcons = {
  Available: "🟢",
  Booked: "🔴",
  Pending: "🟠",
  Rejected: "⚪",
};

const RoomStatus = ({ status }) => {
  const statusClasses = {
    Available: "status-available",
    Booked: "status-booked",
    Pending: "status-pending",
    Rejected: "status-rejected",
  };

  return (
    <p className={`room-status ${statusClasses[status] || ""}`}>
      {statusIcons[status] || "❔"} {status}
    </p>
  );
};


const RoomCard = ({ room, floorId, status, onBooking }) => (
  <div className="room-card">
    <h4>Room {room.room_number}</h4>
    <p>🏠 Type: {room.room_type}</p>
    <p>💰 Price: Rs {room.price}</p>
    <RoomStatus status={status} />
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
    {status === "Available" && (
      <button onClick={() => onBooking(room.id)}>Book Now</button>
    )}
  </div>
);

const RecentHostels = ({ hostels }) => (
  <div className="recent-hostels">
    <h2>Recent Hostels</h2>
    {hostels.map((recent) => (
      <Link key={recent.id} to={`/hostel/${recent.id}`} className="recent-hostel-card">
        <img src={recent.images[0]?.image || "/no-image.jpg"} alt={recent.name} />
        <p>{recent.name}</p>
        <p>📍 {recent.address}</p>
      </Link>
    ))}
  </div>
);

const FeedbackItem = ({ 
  feedback, 
  currentUser, 
  onEdit, 
  onDelete, 
  onUpdate, 
  editMode, 
  editReplyMode, 
  editInputs, 
  setEditInputs, 
  replyInputs, 
  setReplyInputs, 
  onSubmitReply,
  canGiveFeedback
}) => (
  <div className="feedback-card">
    <p>
      <strong>{feedback.student.username}</strong> ({feedback.rating}⭐)
    </p>
    
    {/* Feedback Comment or Edit Mode */}
    {editMode === feedback.id ? (
      <>
        <textarea
          value={editInputs[feedback.id] || feedback.comment}
          onChange={(e) => setEditInputs({ ...editInputs, [feedback.id]: e.target.value })}
        />
        <button onClick={() => onUpdate(feedback.id, editInputs[feedback.id], feedback.rating)}>
          Update
        </button>
        <button onClick={() => onEdit(null)}>Cancel</button>
      </>
    ) : (
      <p>{feedback.comment}</p>
    )}

    {/* Edit/Delete Buttons for Feedback */}
    {currentUser?.id === feedback.student.id && editMode !== feedback.id && (
      <div className="feedback-actions">
        <button onClick={() => onEdit(feedback.id)}>Edit</button>
        <button onClick={() => onDelete(feedback.id)}>Delete</button>
      </div>
    )}

    {/* Replies */}
    {feedback.replies && feedback.replies.map((reply) => (
      <div key={reply.id} className="reply-comment">
        <p>
          <strong>↪ {reply.student.username}</strong>:
        </p>

        {editReplyMode === reply.id ? (
          <>
            <textarea
              value={editInputs[reply.id] || reply.comment}
              onChange={(e) => setEditInputs({ ...editInputs, [reply.id]: e.target.value })}
            />
            <button onClick={() => onUpdate(reply.id, editInputs[reply.id])}>
              Update
            </button>
            <button onClick={() => onEdit(null, true)}>Cancel</button>
          </>
        ) : (
          <p>{reply.comment}</p>
        )}

        {currentUser?.id === reply.student.id && (
          <div className="reply-actions">
            <button onClick={() => onEdit(reply.id, true)}>Edit</button>
            <button onClick={() => onDelete(reply.id)}>Delete</button>
          </div>
        )}
      </div>
    ))}

    {/* Reply Box */}
    {canGiveFeedback && (
      <div className="reply-box">
        <textarea
          rows="2"
          placeholder="Write a reply..."
          value={replyInputs[feedback.id] || ""}
          onChange={(e) =>
            setReplyInputs({ ...replyInputs, [feedback.id]: e.target.value })
          }
        />
        <button onClick={() => onSubmitReply(feedback.id)}>Reply</button>
      </div>
    )}
  </div>
);

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management - consolidated for better organization
  const [data, setData] = useState({
    hostel: null,
    floors: [],
    recentHostels: [],
    feedbackList: [],
    studentBookings: [],
    currentUser: null,
    loading: true,
    error: null
  });
  
  // UI state
  const [filter, setFilter] = useState("All");
  const [showChat, setShowChat] = useState(false);
  const [canGiveFeedback, setCanGiveFeedback] = useState(true);
  
  // Feedback form state
  const [newFeedback, setNewFeedback] = useState({ rating: "", comment: "" });
  const [replyInputs, setReplyInputs] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [editReplyMode, setEditReplyMode] = useState(null);
  const [editInputs, setEditInputs] = useState({});


const [showMap, setShowMap] = useState(false);
const [mapCoordinates, setMapCoordinates] = useState(null);
const [isMapLoading, setIsMapLoading] = useState(false);
const defaultCoordinates = [27.7172, 85.3240]; // Kathmandu fallback
const mapRef = React.useRef(null);

const handleToggleMap = () => setShowMap(!showMap);

useEffect(() => {
  if (!data.hostel || !showMap) return;

  if (data.hostel.latitude && data.hostel.longitude) {
    setMapCoordinates([parseFloat(data.hostel.latitude), parseFloat(data.hostel.longitude)]);
  } else {
    geocodeAddress();
  }
}, [data.hostel, showMap]);

const geocodeAddress = async () => {
  if (!data.hostel) return;

  setIsMapLoading(true);
  try {
    const query = encodeURIComponent(`${data.hostel.address}, ${data.hostel.city}, ${data.hostel.state}`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const result = await res.json();

    if (result?.[0]) {
      setMapCoordinates([parseFloat(result[0].lat), parseFloat(result[0].lon)]);
    } else {
      setMapCoordinates(defaultCoordinates);
    }
  } catch (err) {
    setMapCoordinates(defaultCoordinates);
  } finally {
    setIsMapLoading(false);
  }
};


  // Fetch all data at once
  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem("token");
      
      // Parallel API calls for better performance
      const [hostelRes, floorsRes, recentHostelsRes, feedbackRes, userRes, bookingsRes] = await Promise.all([
        api.get(`/hostel_owner/hostels/${id}/`),
        api.get(`/hostel_owner/floors/?hostel_id=${id}`),
        api.get("/hostel_owner/hostels/"),
        api.get(`/hostel_owner/feedback/?hostel_id=${id}`),
        api.get("/students/me/", { headers: { Authorization: `Bearer ${token}` }}),
        api.get("/students/bookings/my-history/", { headers: { Authorization: `Bearer ${token}` }})
      ]);

      const activeBookingsRes = await api.get("/hostel_owner/active-bookings/", {
  headers: { Authorization: `Bearer ${token}` },
});

   
      // Get rooms for each floor
      const floorData = await Promise.all(
        floorsRes.data.map(async (floor) => {
          const roomRes = await api.get(`/hostel_owner/rooms/?floor_id=${floor.id}&hostel_id=${id}`);
          return { ...floor, rooms: roomRes.data };
        })
      );

      setData({
        hostel: hostelRes.data,
        floors: floorData,
        recentHostels: recentHostelsRes.data.slice(0, 4),
        feedbackList: feedbackRes.data,
        studentBookings: bookingsRes.data,
        currentUser: userRes.data,
        activeBookings: activeBookingsRes.data.bookings,
        loading: false,
        error: null,
      });
      
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Failed to load hostel data. Please try again later." 
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Feedback handling
  const handleSubmitFeedback = async () => {
    if (!newFeedback.comment.trim()) {
      alert("Please enter a comment");
      return;
    }
    
    if (!newFeedback.rating) {
      alert("Please select a rating");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await api.post("/students/feedback/", {
        hostel_id: data.hostel.id,
        rating: newFeedback.rating,
        comment: newFeedback.comment.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Feedback submitted!");
      setNewFeedback({ rating: "", comment: "" });
      fetchData(); // Refresh all data
    } catch (err) {
      console.error("Feedback submission error:", err);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleUpdateFeedback = async (id, newComment, newRating = null) => {
    if (!newComment || !newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await api.put(`/students/feedback/${id}/update/`, {
        comment: newComment,
        ...(newRating !== null && { rating: newRating })
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchData(); // Refresh all data
      setEditMode(null);
      setEditReplyMode(null);
    } catch (err) {
      alert("Update failed. Please try again.");
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await api.delete(`/students/feedback/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh all data
    } catch (err) {
      alert("Delete failed. Please try again.");
    }
  };

  const handleSubmitReply = async (parentId) => {
    const token = localStorage.getItem("token");
    const comment = replyInputs[parentId]?.trim();
    if (!comment) {
      alert("Reply cannot be empty");
      return;
    }

    try {
      await api.post("/students/feedback/", {
        hostel_id: data.hostel.id,
        comment,
        parent: parentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      fetchData(); // Refresh all data
    } catch (err) {
      console.error("Reply failed:", err);
      alert("Reply failed. Please try again.");
    }
  };

  const handleEditFeedback = (id, isReply = false) => {
    if (isReply) {
      setEditReplyMode(id);
    } else {
      setEditMode(id);
    }
  };

  // Room booking
  const handleBooking = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      
      // Generate check-in and check-out dates
      const check_in = new Date().toISOString().split("T")[0];
      const check_out = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      await api.post(
        "/student/bookings/",
        { room_id: roomId, check_in, check_out },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Booking request sent!");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed. Please try again.");
    }
  };

  
  // Room status helper
  const getRoomStatus = (roomId) => {
    const isBookedByAnyone = data.activeBookings?.find(
      (b) => b.room_id === roomId && ["confirmed", "pending"].includes(b.status)
    );
  
    if (isBookedByAnyone) {
      return isBookedByAnyone.status === "confirmed" ? "Booked" : "Pending";
    }
  
    return "Available";
  };
  
  

  // Chat handlers
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowChat(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Loading state
  if (data.loading) {
    return (
      <div className="loading-container">
        <Navbar />
        <div className="loading">Loading hostel information...</div>
      </div>
    );
  }

  // Error state
  if (data.error) {
    return (
      <div className="error-container">
        <Navbar />
        <div className="error-message">
          <h2>Error Loading Hostel</h2>
          <p>{data.error}</p>
          <button onClick={fetchData}>Try Again</button>
        </div>
      </div>
    );
  }

  // If hostel doesn't exist
  if (!data.hostel) {
    return (
      <div>
        <Navbar />
        <div className="not-found">
          <h2>Hostel Not Found</h2>
          <p>The hostel you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="home-link">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
               
      <Navbar />
      <div className="hostel-detail-container">
        <div className="hostel-content">
          {/* Hostel Information */}
          <HostelInfo hostel={data.hostel} />
          <HostelImages images={data.hostel.images} />
          

          {/* Description */}
          <div className="hostel-description">
            <h2>Description</h2>
            <p>{data.hostel.description}</p>
          </div>
                    <div className="map-toggle-controls">
  {data.hostel.google_maps_link && (
    <a href={data.hostel.google_maps_link} target="_blank" rel="noopener noreferrer" className="map-link-btn">
      🗺️ View on Google Maps
    </a>
  )}
  <button onClick={handleToggleMap} className="map-toggle-btn">
    {showMap ? "Hide Map" : "Show Map"}
  </button>
</div>
          {showMap && (
  <div className="map-wrapper">
    {isMapLoading ? (
      <p>Loading map...</p>
    ) : mapCoordinates ? (
      <MapContainer
        center={mapCoordinates}
        zoom={15}
        className="leaflet-map"
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 300);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={mapCoordinates}>
          <Popup>
            <strong>{data.hostel.name}</strong><br />
            {data.hostel.address}
          </Popup>
        </Marker>
      </MapContainer>
    ) : (
      <p>Map unavailable. Please check address or coordinates.</p>
    )}
  </div>
)}
          {/* Amenities */}
          <Amenities hostel={data.hostel} />

          {/* Rooms Section */}
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
            {data.floors.length > 0 ? (
              data.floors.map((floor) => {
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
                          <RoomCard
                            key={room.id}
                            room={room}
                            floorId={floor.id}
                            status={getRoomStatus(room.id)}
                            onBooking={handleBooking}
                          />
                        ))}
                      </div>
                    ) : (
                      <p>No matching rooms on this floor.</p>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No floors available for this hostel.</p>
            )}
          </div>






          {/* Feedback Section */}
          <div className="feedback-section">
            <h2>Student Feedback</h2>

            {canGiveFeedback && (
              <div className="submit-feedback">
                <textarea
                  rows="3"
                  placeholder="Write your feedback..."
                  value={newFeedback.comment}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, comment: e.target.value })
                  }
                />
                <select
                  value={newFeedback.rating}
                  onChange={(e) =>
                    setNewFeedback({ ...newFeedback, rating: e.target.value })
                  }
                >
                  <option value="">Select Rating</option>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {"⭐".repeat(r)} ({r})
                    </option>
                  ))}
                </select>
                <button onClick={handleSubmitFeedback}>Submit Feedback</button>
              </div>
            )}

            {data.feedbackList.length > 0 ? (
              data.feedbackList.map((fb) => (
                <FeedbackItem
                  key={fb.id}
                  feedback={fb}
                  currentUser={data.currentUser}
                  onEdit={handleEditFeedback}
                  onDelete={handleDeleteFeedback}
                  onUpdate={handleUpdateFeedback}
                  editMode={editMode}
                  editReplyMode={editReplyMode}
                  editInputs={editInputs}
                  setEditInputs={setEditInputs}
                  replyInputs={replyInputs}
                  setReplyInputs={setReplyInputs}
                  onSubmitReply={handleSubmitReply}
                  canGiveFeedback={canGiveFeedback}
                />
              ))
            ) : (
              <p>No feedback yet. Be the first to leave a review!</p>
            )}
          </div>
        </div>

        {/* Recent Hostels Sidebar */}
        <RecentHostels hostels={data.recentHostels} />
      </div>

     {/* Updated Chat Feature Implementation */}
{data.hostel?.id && (
  <>
    <button className="floating-chat-button" onClick={toggleChat}>
      💬 
    </button>

    {showChat && (
      <div className="chat-popup">
        <div className="chat-popup-header">
          <span>Chat with Hostel Owner</span>
          <button onClick={() => setShowChat(false)}>❌</button>
        </div>
        {/* Make sure the content container takes up available space */}
        <div className="chat-popup-content">
          {/* Pass the hostel owner's ID directly to the messenger component */}
          <StudentMessenger 
            selectedHostelId={data.hostel.id} 
            hostelOwnerId={data.hostel.owner_id} 
            inPopup={true} 
          />
        </div>
      </div>
    )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default HostelDetail;