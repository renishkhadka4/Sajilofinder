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
  const [feedbackList, setFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ rating: "", comment: "" });
  const [canGiveFeedback, setCanGiveFeedback] = useState(true);
  const [replyInputs, setReplyInputs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editReplyMode, setEditReplyMode] = useState(null);
  const [editInputs, setEditInputs] = useState({});
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        fetchHostel();
        fetchFloors();
        fetchRecentHostels();
        fetchStudentBookings();
        fetchFeedbacks();
  
        const token = localStorage.getItem("token");
  
        const userRes = await api.get("/students/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);
  
        // ✅ Allow everyone to give feedback
        setCanGiveFeedback(true);
  
        // If you still want to fetch booking history, but not use it for feedback:
        await api.get("/students/bookings/my-history/", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
      } catch (err) {
        console.error("Something went wrong:", err);
      }
    };
  
    fetchAll();
  }, [id]);
  
  
  
  const handleUpdateFeedback = async (id, newComment, newRating = null) => {
    const token = localStorage.getItem("token");
    try {
      await api.put(`/students/feedback/${id}/update/`, {
        comment: newComment,
        ...(newRating !== null && { rating: newRating })
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedbacks();
      setEditMode(null);
      setEditReplyMode(null);
    } catch (err) {
      alert("Update failed.");
    }
  };
  
  const handleDeleteFeedback = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/students/feedback/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedbacks();
    } catch (err) {
      alert("Delete failed.");
    }
  };
  
  const fetchFeedbacks = async () => {
    try {
      const res = await api.get(`/hostel_owner/feedback/?hostel_id=${id}`);
      setFeedbackList(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };
  
  
  const handleSubmitReply = async (parentId) => {
    const token = localStorage.getItem("token");
    const comment = replyInputs[parentId]?.trim();
    if (!comment) return alert("Reply cannot be empty");
  
    try {
      await api.post("/students/feedback/", {
        hostel_id: hostel.id,
        comment,
        parent: parentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      console.error("Reply failed:", err);
      alert("Reply failed");
    }
  };
  

  const checkFeedbackPermission = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/students/bookings/my-history/", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const hasConfirmed = res.data.some(
        (b) => b.room.floor.hostel.id === parseInt(id) && b.status === "confirmed"
      );
      setCanGiveFeedback(hasConfirmed);
    } catch (err) {
      console.error("Permission check failed:", err);
    }
  };

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

      alert(" Booking request sent!");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed:", err);
      alert(" Booking failed. Try again.");
    }
  };


  const handleSubmitFeedback = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.post("/students/feedback/", {
        hostel_id: hostel.id,  // Ensure that hostel_id is included
        rating: newFeedback.rating,
        comment: newFeedback.comment.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      alert("Feedback submitted!");
      setNewFeedback({ rating: "", comment: "" });
      fetchFeedbacks();  // Refresh feedback after submission
    } catch (err) {
      console.error("Feedback submission error:", err);
      alert("You may not have permission or something went wrong.");
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
  
  document.addEventListener('DOMContentLoaded', function() {
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(card => {
      const statusElement = card.querySelector('p:nth-of-type(3)');
      if (!statusElement) return;
      
      const status = statusElement.textContent.trim();
      
      if (status === 'Available') {
        statusElement.style.backgroundColor = '#e8f5e9';
        statusElement.style.color = '#2e7d32';
      } else if (status === 'Booked') {
        statusElement.style.backgroundColor = '#ffebee';
        statusElement.style.color = '#c62828';
      } else if (status === 'Pending') {
        statusElement.style.backgroundColor = '#fff8e1';
        statusElement.style.color = '#f57f17';
      } else if (status === 'Rejected') {
        statusElement.style.backgroundColor = '#f5f5f5';
        statusElement.style.color = '#616161';
      }
    });
  });



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

{feedbackList.length > 0 ? (
  feedbackList.map((fb) => (
    <div key={fb.id} className="feedback-card">
      <p><strong>{fb.student.username}</strong> ({fb.rating}⭐)</p>
      
      {/* Feedback Comment or Edit Mode */}
      {editMode === fb.id ? (
        <>
          <textarea
            value={editInputs[fb.id] || fb.comment}
            onChange={(e) => setEditInputs({ ...editInputs, [fb.id]: e.target.value })}
          />
          <button onClick={() => handleUpdateFeedback(fb.id, editInputs[fb.id], fb.rating)}>Update</button>
          <button onClick={() => setEditMode(null)}>Cancel</button>
        </>
      ) : (
        <p>{fb.comment}</p>
      )}

      {/* Edit/Delete Buttons for Feedback */}
      {currentUser?.id === fb.student.id && editMode !== fb.id && (
        <div className="feedback-actions">
          <button onClick={() => setEditMode(fb.id)}>Edit</button>
          <button onClick={() => handleDeleteFeedback(fb.id)}>Delete</button>
        </div>
      )}

      {/* Replies */}
      {fb.replies && fb.replies.map((r) => (
        <div key={r.id} className="reply-comment">
          <p><strong>↪ {r.student.username}</strong>:</p>

          {editReplyMode === r.id ? (
            <>
              <textarea
                value={editInputs[r.id] || r.comment}
                onChange={(e) => setEditInputs({ ...editInputs, [r.id]: e.target.value })}
              />
              <button onClick={() => handleUpdateFeedback(r.id, editInputs[r.id])}>Update</button>
              <button onClick={() => setEditReplyMode(null)}>Cancel</button>
            </>
          ) : (
            <p>{r.comment}</p>
          )}

{currentUser?.id === r.student.id && (
  <div className="reply-actions">
    <button onClick={() => setEditReplyMode(r.id)}>Edit</button>
    <button onClick={() => handleDeleteFeedback(r.id)}>Delete</button>
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
            value={replyInputs[fb.id] || ""}
            onChange={(e) =>
              setReplyInputs({ ...replyInputs, [fb.id]: e.target.value })
            }
          />
          <button onClick={() => handleSubmitReply(fb.id)}>Reply</button>
        </div>
      )}
    </div>
  ))
) : (
  <p>No feedback yet.</p>
)}

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
