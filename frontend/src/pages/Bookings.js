import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
//import "../styles/ManageBookings.css";

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            let token = localStorage.getItem("token");
            const response = await api.get("/hostel_owner/bookings/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            let token = localStorage.getItem("token");
            await api.delete(`/hostel_owner/bookings/${bookingId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookings(bookings.filter((booking) => booking.id !== bookingId));
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const studentName = booking.student?.username || booking.student?.email || "Unknown Student";
        const roomNumber = booking.room?.room_number || "Unknown Room";

        return (
            studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="manage-bookings-container">
            <nav className="dashboard-nav">
                <h1>Hostel Owner Dashboard</h1>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/manage-hostels">Manage Hostels</Link></li>
                    <li><Link to="/manage-rooms">Manage Rooms</Link></li>
                    <li><Link to="/bookings">Bookings</Link></li>
                    <li><Link to="/students">Students</Link></li>
                    <li><Link to="/feedback">Feedback</Link></li>
                    <li>
                        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            <h1>Manage Bookings</h1>
            <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />

            <table className="booking-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Room Number</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.student?.username || booking.student?.email || "Unknown Student"}</td>
                                <td>{booking.room?.room_number || "Unknown Room"}</td>
                                <td>{booking.check_in}</td>
                                <td>{booking.check_out}</td>
                                <td>{booking.status}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => handleDeleteBooking(booking.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No bookings found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageBookings;
