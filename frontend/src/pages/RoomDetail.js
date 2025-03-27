import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/RoomDetail.css";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [floor, setFloor] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomStatus, setRoomStatus] = useState("Available");
  const [isBookingAllowed, setIsBookingAllowed] = useState(true); // To track booking restrictions

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        // Get Room
        const roomRes = await api.get(`/hostel_owner/rooms/${id}/`);
        setRoom(roomRes.data);

        // Floor & Hostel
        const floorRes = await api.get(`/hostel_owner/floors/${roomRes.data.floor}/`);
        setFloor(floorRes.data);
        const hostelRes = await api.get(`/hostel_owner/hostels/${floorRes.data.hostel}/`);
        setHostel(hostelRes.data);

        // Get all student bookings
        const bookingsRes = await api.get(`/students/bookings/my-history/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const match = bookingsRes.data.find(
          (b) =>
            b.room.id === parseInt(id) &&
            b.status !== "cancelled" &&
            b.status !== "rejected"
        );

        if (match) {
          setExistingBooking(match);
          setBookingId(match.id);
        }

        const allBookingRes = await api.get("/hostel_owner/bookings/");
        const bookingsForRoom = allBookingRes.data.filter(
          (b) => b.room.id === parseInt(id) && !["rejected", "cancelled"].includes(b.status)
        );

        if (bookingsForRoom.length > 0) {
          const isConfirmed = bookingsForRoom.some((b) => b.status === "confirmed");
          const isPending = bookingsForRoom.some((b) => b.status === "pending");
          if (isConfirmed) setRoomStatus("Booked");
          else if (isPending) setRoomStatus("Pending");
        } else {
          setRoomStatus("Available");
        }

        // Check if booking is rejected and prevent new bookings for a week
        if (existingBooking && existingBooking.status === "rejected") {
          const rejectionDate = new Date(existingBooking.created_at);
          const currentDate = new Date();
          const weekLater = new Date(rejectionDate.setDate(rejectionDate.getDate() + 7));

          if (currentDate < weekLater) {
            setIsBookingAllowed(false);  // Prevent booking for 7 days after rejection
          }
        }

      } catch (error) {
        console.error("❌ Error fetching details:", error);
      }
    };

    fetchDetails();
  }, [id, existingBooking]); // Run when `id` or `existingBooking` changes

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert("❗ Please select both check-in and check-out dates.");
      return;
    }

    if (!isBookingAllowed) {
      alert("❗ You cannot book a room due to recent cancellation.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const bookingRes = await api.post(
        "/students/bookings/",
        {
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Booking request sent! You can now pay the security deposit.");
      setBookingId(bookingRes.data.id);
      setExistingBooking(bookingRes.data);
      setRoomStatus("Pending");  // Set status to pending after booking
    } catch (error) {
      console.error("❌ Booking failed:", error);
      alert("❌ Booking failed. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!bookingId) {
      alert("❗ Please book the room first before paying.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const paymentRes = await api.post(
        `/students/bookings/${bookingId}/initiate-payment/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentUrl = paymentRes.data.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert("❌ Payment initiation failed");
      }
    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
      alert("❌ Payment failed. Try again.");
    }
  };

  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/students/bookings/${bookingId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("❌ Booking cancelled.");
      setExistingBooking(null);
      setBookingId(null);
      setRoomStatus("Available");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("❌ Could not cancel. Try again.");
    }
  };

  const handleCancelConfirmedBooking = async () => {
    const cancelPolicy = hostel.cancellation_policy; // assuming cancellation policy exists in the hostel object
    const bookingDate = new Date(existingBooking.check_in);
    const currentDate = new Date();
    const differenceInDays = Math.floor((bookingDate - currentDate) / (1000 * 60 * 60 * 24));

    if (differenceInDays < cancelPolicy.full_refund_days) {
      alert("❌ You are too late to cancel for a full refund.");
    } else if (differenceInDays < cancelPolicy.partial_refund_days) {
      alert(`❗ You can get a partial refund of ${cancelPolicy.partial_refund_percentage}%`);
    } else {
      alert("✅ Full refund available.");
    }

    // Proceed with cancellation
    try {
      const token = localStorage.getItem("token");
      await api.post(`/students/bookings/${bookingId}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Booking cancelled successfully.");
      setExistingBooking(null);
      setBookingId(null);
      setRoomStatus("Available");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("❌ Could not cancel. Try again.");
    }
  };

  if (!room || !floor || !hostel) {
    return <p className="loading">Loading room details...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="room-detail-container">
        <h1>Room {room.room_number}</h1>
        <p>🏠 Type: {room.room_type}</p>
        <p>💰 Price: Rs {room.price}</p>
        <p>🏢 Floor: {floor.floor_number}</p>
        <p>📍 Hostel: {hostel.name}</p>
        <p>
          {roomStatus === "Booked" && "🔴 Booked"}
          {roomStatus === "Pending" && "🟠 Pending Approval"}
          {roomStatus === "Available" && "🟢 Available"}
        </p>

        <div className="booking-section">
        {existingBooking ? (
  <>
    <p className="info-text">📌 You have already booked this room.</p>
    <p>Status: <b>{existingBooking.status}</b></p>

    {existingBooking.status === "pending" && (
      <>
        <button className="cancel-btn" onClick={handleCancelBooking}>
          ❌ Cancel Booking
        </button>
        <button
          className="book-room-btn"
          onClick={handlePayment}
          style={{ marginLeft: "10px", backgroundColor: "#4CAF50" }}
        >
          💰 Pay Security Deposit
        </button>
      </>
    )}

    {existingBooking.status === "confirmed" && (
      <button className="cancel-btn" onClick={handleCancelConfirmedBooking}>
        ❌ Cancel Confirmed Booking
      </button>
    )}
  </>


          ) : roomStatus === "Available" ? (
            <>
              <label>
                Check-in Date:
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label>
                Check-out Date:
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </label>
              <button className="book-room-btn" onClick={handleBooking}>
                Book Room
              </button>
         

            </>
          ) : (
            <p className="warning-text">❌ Room is not available for booking.</p>
          )}
        </div>

        <div className="room-images">
          <h3>Room Images</h3>
          {room.images && room.images.length > 0 ? (
            <div className="image-gallery">
              {room.images.map((img, idx) => (
                <img key={idx} src={img.image || "/path/to/fallback-image.jpg"} alt={`Room ${idx + 1}`} />
              ))}
            </div>
          ) : (
            <p>No images available for this room.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
