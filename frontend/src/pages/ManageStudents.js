import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from '../pages/Sidebar';
import '../styles/ManageStudent.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");
  const [hostelList, setHostelList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    fetchStudents();
    const handleSidebarChange = (e) => {
      if (e.detail && typeof e.detail.open === 'boolean') {
        setSidebarOpen(e.detail.open);
      }
    };
    window.addEventListener('sidebar-toggle', handleSidebarChange);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarChange);
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/hostel_owner/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.students || [];
      console.log("Fetched students:", data); // Debug log
      setStudents(data);
      
      // Update statistics
      setStats({
        total: data.length,
        confirmed: data.filter(s => s.status === 'confirmed').length,
        pending: data.filter(s => s.status === 'pending').length,
        rejected: data.filter(s => s.status === 'rejected').length
      });
      
      // Extract unique hostels
      const uniqueHostels = Array.from(
        new Set(data.filter(s => s.hostel).map(s => JSON.stringify(s.hostel)))
      ).map(str => JSON.parse(str));
      
      console.log("Unique hostels:", uniqueHostels); // Debug log
      setHostelList(uniqueHostels);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    }
  };

  const handleAction = async (id, action) => {
    const token = localStorage.getItem("token");
    const url = `/hostel_owner/bookings/${id}/${action}/`;
    try {
      await api.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchStudents();
    } catch (error) {
      console.error(`❌ Error during ${action}:`, error);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/hostel_owner/download-report/bookings/${format}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Booking_Report.${format === "excel" ? "xlsx" : format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Export failed:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed": return "status-badge status-confirmed";
      case "pending": return "status-badge status-pending";
      case "rejected": return "status-badge status-rejected";
      default: return "status-badge";
    }
  };

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Fixed filtering function
  const filteredStudents = students.filter((student) => {
    // For debugging
    if (hostelFilter) {
      console.log(`Comparing: Student hostel ID: ${student.hostel?.id}, Filter: ${hostelFilter}`);
    }
    
    // Apply status filter
    const statusMatch = !statusFilter || student.status === statusFilter;
    
    // Apply hostel filter - making sure we convert both to the same type for comparison
    const hostelMatch = !hostelFilter || 
                      (student.hostel && student.hostel.id.toString() === hostelFilter.toString());
    
    // Apply search query filter on name or email
    const nameMatch = !searchQuery || 
                     (student.username && student.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                     (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return nameMatch && statusMatch && hostelMatch;
  });

  return (
    <div className={`manage-students-container ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <Sidebar onToggle={handleSidebarToggle} />
      <h1>Manage Students</h1>

      <div className="student-stats">
        <div className="stat-card">
          <div className="stat-icon icon-indigo">👥</div>
          <div className="stat-info">
            <p className="stat-label">Total Students</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-emerald">✅</div>
          <div className="stat-info">
            <p className="stat-label">Confirmed</p>
            <p className="stat-value">{stats.confirmed}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-amber">⏳</div>
          <div className="stat-info">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-rose">❌</div>
          <div className="stat-info">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

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
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Hostels</option>
          {hostelList.map(hostel => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>

        <button
          className="reset-filters-btn"
          onClick={() => {
            setHostelFilter("");
            setSearchQuery("");
            setStatusFilter("");
          }}
        >
          🔄 Reset Filters
        </button>

        <div className="export-dropdown">
          <button className="export-btn">📥 Export ▼</button>
          <div className="export-options">
            <span onClick={() => exportReport("csv")}>CSV</span>
            <span onClick={() => exportReport("excel")}>Excel</span>
            <span onClick={() => exportReport("pdf")}>PDF</span>
          </div>
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Hostel</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.username || "Unknown"}</td>
                  <td>{student.email || "No Email"}</td>
                  <td>{student.phone || "N/A"}</td>
                  <td>{student.hostel?.name || "N/A"}</td>
                  <td>{student.room_number || "No Room"}</td>
                  <td>{formatDate(student.check_in)}</td>
                  <td>{formatDate(student.check_out)}</td>
                  <td>
                    <span className={getStatusClass(student.status)}>
                      {student.status || "N/A"}
                    </span>
                  </td>
                  <td className="actions">
                    {student.status === "pending" && (
                      <>
                        <button onClick={() => handleAction(student.id, "approve")}>✅</button>
                        <button onClick={() => handleAction(student.id, "reject")}>❌</button>
                      </>
                    )}
                    {student.status === "confirmed" && (
                      <button onClick={() => handleAction(student.id, "cancel_booking")}>🗑</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">
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