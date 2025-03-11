import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from '../pages/Sidebar';
import '../styles/Booking.css';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        fetchBookings();
        // Initial sidebar state is checked in the Sidebar component itself
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            let token = localStorage.getItem("token");
            const response = await api.get("/hostel_owner/bookings/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookings(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        filterBookings();
    }, [activeTab, bookings, searchQuery]);

    const filterBookings = () => {
        let filtered = bookings.filter((b) => b.status === activeTab);
        if (searchQuery) {
            filtered = filtered.filter(
                (b) =>
                    b.student?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.room?.room_number.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredBookings(filtered);
    };

    const handleAction = async (bookingId, action) => {
        try {
            let token = localStorage.getItem("token");
            await api.patch(`/hostel_owner/bookings/${bookingId}/${action}/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchBookings();
        } catch (error) {
            console.error(`Error ${action} booking:`, error);
        }
    };

    const getInitials = (name) => {
        return name
            ? name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            : "?";
    };

    // Handle sidebar toggle from the Sidebar component
    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    return (
        <div className="app-container">
            {/* Use the Sidebar component and pass the toggle handler */}
            <Sidebar onToggle={handleSidebarToggle} />

            {/* Main Content - uses the sidebar collapsed state */}
            <div className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
                <div className="booking-content">
                    <h1 className="booking-title">Bookings</h1>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="🔍 Search by student name or room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="booking-search"
                    />

                    {/* Tabs */}
                    <div className="booking-tabs">
                        {["pending", "confirmed", "rejected"].map((tab) => (
                            <button
                                key={tab}
                                className={`booking-tab ${
                                    activeTab === tab ? "booking-tab-active" : "booking-tab-inactive"
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Booking Table */}
                    <div className="booking-table-container">
                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Status</th>
                                    {activeTab === "pending" && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="loading-state">
                                            <div className="loading-spinner"></div>
                                            Loading bookings...
                                        </td>
                                    </tr>
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>
                                                <div className="student-name">
                                                    <div className="student-avatar">
                                                        {getInitials(booking.student?.username)}
                                                    </div>
                                                    {booking.student?.username || "Unknown"}
                                                </div>
                                            </td>
                                            <td className="room-number">{booking.room?.room_number || "Unknown"}</td>
                                            <td className="booking-date">{booking.check_in}</td>
                                            <td className="booking-date">{booking.check_out}</td>
                                            <td>
                                                <span className={`status-${booking.status}`}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </td>
                                            {activeTab === "pending" && (
                                                <td>
                                                    <div className="booking-action-buttons">
                                                        <button
                                                            className="btn-approve"
                                                            onClick={() => handleAction(booking.id, "approve")}
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => handleAction(booking.id, "reject")}
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageBookings;