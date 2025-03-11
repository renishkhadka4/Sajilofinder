import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from '../pages/Sidebar';
import '../styles/ManageStudent.css'; // Import the CSS

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        pending: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchStudents();
        
        // Add event listener for sidebar toggle
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

    const fetchStudents = async () => {
        try {
            let token = localStorage.getItem("token");
            const response = await api.get(`/hostel_owner/students/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const studentsData = response.data.students || [];
            setStudents(studentsData);
            
            // Calculate stats
            const newStats = {
                total: studentsData.length,
                confirmed: studentsData.filter(s => s.status === 'confirmed').length,
                pending: studentsData.filter(s => s.status === 'pending').length,
                rejected: studentsData.filter(s => s.status === 'rejected').length
            };
            setStats(newStats);
            
        } catch (error) {
            console.error("❌ Error fetching students:", error);
        }
    };

    const filteredStudents = students.filter((student) => {
        const name = student.username || student.email || "Unknown";
        const statusMatch = statusFilter ? student.status === statusFilter : true;

        return name.toLowerCase().includes(searchQuery.toLowerCase()) && statusMatch;
    });

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'confirmed': return 'status-badge status-confirmed';
            case 'pending': return 'status-badge status-pending';
            case 'rejected': return 'status-badge status-rejected';
            default: return 'status-badge';
        }
    };
    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    return (
        <div className={`manage-students-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
            <Sidebar onToggle={handleSidebarToggle} />
            <h1>Manage Students</h1>
            
            {/* Stats Section */}
            <div className="student-stats">
                <div className="stat-card">
                    <div className="stat-icon icon-indigo">
                        <span>👥</span>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total Students</p>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-emerald">
                        <span>✓</span>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Confirmed</p>
                        <p className="stat-value">{stats.confirmed}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-amber">
                        <span>⏳</span>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending</p>
                        <p className="stat-value">{stats.pending}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-rose">
                        <span>✕</span>
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Rejected</p>
                        <p className="stat-value">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-area">
                <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />

                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="filter-dropdown"
                >
                    <option value="">All Students</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Student List Table */}
            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Room</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.username || "Unknown"}</td>
                                    <td>{student.email || "No Email"}</td>
                                    <td>{student.phone || "N/A"}</td>
                                    <td>{student.room_number || "No Room"}</td>
                                    <td>{formatDate(student.check_in)}</td>
                                    <td>{formatDate(student.check_out)}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(student.status)}>
                                            {student.status || "N/A"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <div className="empty-icon">🔍</div>
                                        <p className="empty-title">No students found</p>
                                        <p className="empty-subtitle">Try adjusting your search or filter criteria</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageStudents;