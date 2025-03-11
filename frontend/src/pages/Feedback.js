import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from '../pages/Sidebar';
import '../styles/Feedback.css';

const ManageFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchFeedback();
        // Add event listener to detect sidebar state
        const handleSidebarChange = (e) => {
            if (e.detail && typeof e.detail.open === 'boolean') {
                setSidebarOpen(e.detail.open);
            }
        };
        
        window.addEventListener('sidebar-toggle', handleSidebarChange);
        
        return () => {
            window.removeEventListener('sidebar-toggle', handleSidebarChange);
        };
    }, []);

    const fetchFeedback = async () => {
        try {
            let token = localStorage.getItem("token");
            const response = await api.get("/hostel_owner/feedback/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFeedback(response.data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    const filteredFeedback = feedback.filter((f) => {
        const studentName = f.student?.username || f.student?.email || "Anonymous";
        const hostelName = typeof f.hostel === "string" ? f.hostel : (f.hostel?.name || "Unknown Hostel");
    
        return (
            studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hostelName.toLowerCase().includes(searchQuery.toLowerCase())
        ) && (selectedRating ? f.rating.toString() === selectedRating : true);
    });

    const getInitials = (name) => {
        return name.charAt(0).toUpperCase();
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className={`star ${index < rating ? 'star-filled' : ''}`}>★</span>
        ));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Calculate stats
    const averageRating = feedback.length > 0 
        ? (feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length).toFixed(1) 
        : "N/A";

    const mostRecentDate = feedback.length > 0 
        ? formatDate(feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at)
        : "N/A";

    return (
        <div className="feedback-container">
             <Sidebar />
            <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="page-header">
                    <h1 className="page-title">Manage Feedback</h1>
                </div>

                {/* Stats Cards */}
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon icon-blue">
                            <span>📊</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Total Feedback</p>
                            <p className="stat-value">{feedback.length}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-green">
                            <span>⭐</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Average Rating</p>
                            <p className="stat-value">{averageRating}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-purple">
                            <span>📅</span>
                        </div>
                        <div className="stat-info">
                            <p className="stat-label">Latest Feedback</p>
                            <p className="stat-value">{mostRecentDate}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="search-filter-container">
                    <input
                        type="text"
                        placeholder="Search by student or hostel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="rating-select"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">⭐️⭐️⭐️⭐️⭐️ (5)</option>
                        <option value="4">⭐️⭐️⭐️⭐️ (4)</option>
                        <option value="3">⭐️⭐️⭐️ (3)</option>
                        <option value="2">⭐️⭐️ (2)</option>
                        <option value="1">⭐️ (1)</option>
                    </select>
                </div>

                {/* Feedback Table */}
                <div className="feedback-table-container">
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Hostel</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedback.length > 0 ? (
                                filteredFeedback.map((f, index) => (
                                    <tr key={f.id || index}>
                                        <td>
                                            <div className="student-cell">
                                                <div className="student-avatar">
                                                    {getInitials(f.student?.username || f.student?.email || "A")}
                                                </div>
                                                <span>{f.student?.username || f.student?.email || "Anonymous"}</span>
                                            </div>
                                        </td>
                                        <td>{f.hostel?.name || "Unknown Hostel"}</td>
                                        <td>
                                            <div className="rating-stars">
                                                {renderStars(f.rating)}
                                            </div>
                                        </td>
                                        <td className="comment-cell">{f.comment || "No comment provided"}</td>
                                        <td>{formatDate(f.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-icon">🔍</div>
                                            <p className="empty-title">No feedback found</p>
                                            <p className="empty-subtitle">Try adjusting your search or filter criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageFeedback;