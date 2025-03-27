import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/BookingDetails.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const StudentBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [floor, setFloor] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const bookingRes = await api.get(`/students/bookings/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const b = bookingRes.data;
        setBooking(b);

        const roomRes = await api.get(`/hostel_owner/rooms/${b.room.id}/`);
        const floorRes = await api.get(`/hostel_owner/floors/${roomRes.data.floor}/`);
        const hostelRes = await api.get(`/hostel_owner/hostels/${floorRes.data.hostel}/`);

        setRoom(roomRes.data);
        setFloor(floorRes.data);
        setHostel(hostelRes.data);
      } catch (err) {
        console.error("❌ Error loading booking detail:", err);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const generateInvoice = async () => {
    const doc = new jsPDF();
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Hostel Booking Invoice", 70, 20);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);
  
    // Hostel Info
    doc.setFont("helvetica", "bold");
    doc.text("Hostel Details", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${hostel?.name || "-"}`, 14, 48);
    doc.text(`Address: ${hostel?.address || "-"}`, 14, 55);
    doc.text(`Contact: ${hostel?.contact_number || "N/A"}`, 14, 62);
  
    // Student Info
    doc.setFont("helvetica", "bold");
    doc.text("Student Info", 14, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${booking?.student?.username || "-"}`, 14, 83);
    doc.text(`Email: ${booking?.student?.email || "-"}`, 14, 90);
  
    // Booking Info Table
    autoTable(doc, {
      startY: 105,
      head: [["Floor", "Room No.", "Type", "Check-in", "Check-out", "Status", "Amount"]],
      body: [
        [
          floor?.floor_number || "-",
          room?.room_number || "-",
          room?.room_type || "-",
          booking?.check_in || "-",
          booking?.check_out || "-",
          booking?.status || "-",
          `Rs. ${room?.price || "1800.00"}`
        ]
      ]
    });
  
    // Authorized Stamp and Signature
    doc.text("Authorized Signature", 14, 170);
    doc.line(14, 172, 70, 172);
  
    // Add stamp image (must be Base64 or public URL)
    const img = new Image();
    img.src = "/stamp.png"; // put stamp.png inside /public folder
  
    img.onload = () => {
      doc.addImage(img, "PNG", 130, 160, 40, 40); // X, Y, Width, Height
      doc.save(`Invoice_Booking_${booking.id}.pdf`);
    };
  };
  

  const handleCancelBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/students/bookings/${id}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("❌ Booking cancelled.");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("❌ Could not cancel. Try again.");
    }
  };

  if (!booking || !hostel || !floor || !room) {
    return <p className="loading">Loading booking details...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="booking-detail-container">
        <h2>📄 Booking Details</h2>

        <div className="detail-box">
          <h3>🏠 Hostel Info</h3>
          <p><b>{hostel.name}</b></p>
          <p>📍 {hostel.address}</p>
          <p>☎️ {hostel.contact_number || "N/A"}</p>
        </div>

        <div className="detail-box">
          <h3>🚪 Room Details</h3>
          <p>🧱 Floor: {floor.floor_number}</p>
          <p>🏠 Room No: {room.room_number}</p>
          <p>💰 Price: Rs {room.price}</p>
          <p>🛏 Type: {room.room_type}</p>
        </div>

        <div className="detail-box">
          <h3>🗓 Booking Info</h3>
          <p>From: {booking.check_in}</p>
          <p>To: {booking.check_out}</p>
          <p>Status: <b>{booking.status}</b></p>
          {booking.status === "confirmed" && (
            <p className="success-msg">✅ Payment Successful</p>
          )}
        </div>

        <div className="actions">
          {booking.status === "pending" && (
            <button className="cancel-btn" onClick={handleCancelBooking}>
              ❌ Cancel Booking
            </button>
          )}
          <button className="invoice-btn" onClick={generateInvoice}>
            📄 Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentBookingDetail;
