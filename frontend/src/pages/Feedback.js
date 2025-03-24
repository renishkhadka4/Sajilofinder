import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../pages/Sidebar";
import "../styles/Feedback.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFeedback();

        const handleSidebarChange = (e) => {
            if (e.detail && typeof e.detail.open === "boolean") {
                setSidebarOpen(e.detail.open);
            }
        };
        window.addEventListener("sidebar-toggle", handleSidebarChange);
        return () => window.removeEventListener("sidebar-toggle", handleSidebarChange);
    }, []);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/hostel_owner/feedback/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFeedback(response.data);
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    const handleReply = async (id) => {
        if (!replyText[id]) return;
      
        try {
          const token = localStorage.getItem("token");
          await api.patch(`/hostel_owner/feedback/${id}/`, {
            reply: replyText[id],
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("✅ Reply submitted!");
          setReplyText(prev => ({ ...prev, [id]: "" }));
          fetchFeedback();
        } catch (error) {
          toast.error("❌ Failed to submit reply");
          console.error("Error submitting reply:", error);
        }
      };
      

    const handleReport = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await api.post(`/hostel_owner/feedback/${id}/report/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Feedback reported!");
        } catch (error) {
            console.error("Error reporting feedback:", error);
        }
    };

    const downloadReport = async (format) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get(`/hostel_owner/download-report/feedback/${format}/`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `feedback_report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
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

    const renderStars = (rating) =>
        Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`star ${i < rating ? "star-filled" : ""}`}>★</span>
        ));

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    const averageRating = feedback.length
        ? (feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length).toFixed(1)
        : "N/A";

    const mostRecentDate = feedback.length
        ? formatDate(feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at)
        : "N/A";

    return (
        <div className="feedback-container">
            <Sidebar />
            <div className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
                <div className="page-header">
                    <h1 className="page-title">Manage Feedback</h1>
                </div>

                {/* Stats */}
                <div className="stats-container">
                    <div className="stat-card"><p>Total Feedback</p><h2>{feedback.length}</h2></div>
                    <div className="stat-card"><p>Average Rating</p><h2>{averageRating}</h2></div>
                    <div className="stat-card"><p>Latest Feedback</p><h2>{mostRecentDate}</h2></div>
                </div>

                {/* Search & Filter */}
                <div className="search-filter-container">
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{'⭐'.repeat(r)} ({r})</option>
                        ))}
                    </select>
                    <div className="export-buttons">
                        <button onClick={() => downloadReport('csv')} disabled={loading}>Export CSV</button>
                        <button onClick={() => downloadReport('excel')} disabled={loading}>Export Excel</button>
                        <button onClick={() => downloadReport('pdf')} disabled={loading}>Export PDF</button>
                    </div>
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
                                <th>Reply</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
  {filteredFeedback.length ? (
    filteredFeedback.map((f) => (
      <tr key={f.id}>
        <td>{f.student?.username || f.student?.email || "Anonymous"}</td>
        <td>{f.hostel?.name || "Unknown"}</td>
        <td>{renderStars(f.rating)}</td>
        <td>
          <div className="feedback-comment">
            <p className="comment-text">{f.comment || "No comment"}</p>
            {f.reply && (
              <div className="reply-block">
                <p className="reply-label">🧑‍💼 You replied:</p>
                <div className="reply-bubble">{f.reply}</div>
              </div>
            )}
          </div>
        </td>
        <td>{formatDate(f.created_at)}</td>
        <td>
          {!f.reply && (
            <>
              <textarea
                rows="2"
                value={replyText[f.id] || ""}
                onChange={(e) =>
                  setReplyText({ ...replyText, [f.id]: e.target.value })
                }
                placeholder="Write a reply..."
              />
              <button onClick={() => handleReply(f.id)}>Reply</button>
            </>
          )}
        </td>
        <td>
          <button className="report-btn" onClick={() => handleReport(f.id)}>🚩 Report</button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7">No feedback found.</td>
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
<ToastContainer position="top-right" />
