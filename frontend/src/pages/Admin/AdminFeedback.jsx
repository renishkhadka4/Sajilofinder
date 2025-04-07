import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/AdminSiderbar";
import { FaStar, FaFilter, FaSearch, FaFlag, FaCheck, FaTrash } from "react-icons/fa";
import "../../styles/AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/all-feedbacks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, markFake) => {
    try {
      await api.patch(
        `/admin/moderate-feedback/${id}/`,
        {
          is_fake: markFake,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Feedback marked as ${markFake ? "Fake" : "Valid"}`);
      fetchFeedbacks();
    } catch (err) {
      toast.error("Failed to update feedback");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await api.delete(`/hostel_owner/feedback/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Feedback deleted successfully");
      fetchFeedbacks();
    } catch (err) {
      toast.error("Failed to delete feedback");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <FaStar
          key={i}
          className={i < rating ? "star-filled" : "star-empty"}
        />
      ));
  };

  const clearFilters = () => {
    setSearch("");
    setRatingFilter("");
    setStatusFilter("");
  };

  const filtered = feedbacks.filter(
    (f) =>
      f.hostel.name.toLowerCase().includes(search.toLowerCase()) &&
      (ratingFilter ? f.rating === parseInt(ratingFilter) : true) &&
      (statusFilter === "fake"
        ? f.is_fake === true
        : statusFilter === "valid"
        ? f.is_fake === false
        : true)
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <div className="admin-feedback-panel">
          <header className="panel-header">
            <div>
              <h1 className="panel-title">Manage Feedback</h1>
              <p className="panel-subtitle">
                Total: {feedbacks.length} | Filtered: {filtered.length}
              </p>
            </div>
            <button className="refresh-btn" onClick={fetchFeedbacks}>
              Refresh Data
            </button>
          </header>

          <div className="filter-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by hostel name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>
                  <FaStar className="filter-icon" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    <option value="5">★★★★★ (5)</option>
                    <option value="4">★★★★☆ (4)</option>
                    <option value="3">★★★☆☆ (3)</option>
                    <option value="2">★★☆☆☆ (2)</option>
                    <option value="1">★☆☆☆☆ (1)</option>
                  </select>
                </label>
              </div>

              <div className="filter-group">
                <label>
                  <FaFilter className="filter-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="fake">Fake</option>
                  </select>
                </label>
              </div>

              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading feedbacks...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-data-message">
              <p>No feedbacks match your search criteria.</p>
              <button className="reset-btn" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="feedback-grid">
              {filtered.map((fb) => (
                <div
                  key={fb.id}
                  className={`feedback-card ${fb.is_fake ? "fake-feedback" : ""}`}
                >
                  <div className="feedback-header">
                    <div className="hostel-info">
                      <h2>{fb.hostel.name}</h2>
                      <p className="student-info">
                        By: {fb.student.username} ({fb.student.email})
                      </p>
                    </div>
                    <div className="rating-display">
                      <div className="stars">{renderStars(fb.rating)}</div>
                      <span className="rating-number">{fb.rating}/5</span>
                    </div>
                  </div>

                  <div className="feedback-content">
                    <p>{fb.comment}</p>
                  </div>

                  {fb.is_fake && (
                    <div className="fake-badge">
                      <FaFlag /> Marked as Fake
                    </div>
                  )}

                  <div className="feedback-actions">
                    <button
                      className="action-btn fake-btn"
                      onClick={() => handleModerate(fb.id, true)}
                      disabled={fb.is_fake}
                    >
                      <FaFlag /> Mark Fake
                    </button>
                    <button
                      className="action-btn valid-btn"
                      onClick={() => handleModerate(fb.id, false)}
                      disabled={!fb.is_fake}
                    >
                      <FaCheck /> Mark Valid
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(fb.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;