import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, RefreshCw, Check, X, ChevronDown, ChevronUp, Eye } from "lucide-react";
import AdminSidebar from "../../components/AdminSiderbar";
import "../../styles/AdminHostel.css";

const AdminManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHostel, setExpandedHostel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPendingHostels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pending-hostels/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHostels(res.data);
    } catch (error) {
      toast.error("Failed to load hostels");
      console.error("Error fetching hostels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(
        `/admin/approve-hostel/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hostel approved successfully");
      fetchPendingHostels();
    } catch (error) {
      toast.error("Failed to approve hostel");
    }
  };

  const handleReject = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to reject this hostel?"
    );
    if (!confirm) return;

    try {
      await api.patch(
        `/admin/reject-hostel/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hostel rejected and email sent to owner");
      fetchPendingHostels();
    } catch (error) {
      toast.error("Failed to reject hostel");
    }
  };

  const toggleExpand = (id) => {
    setExpandedHostel(expandedHostel === id ? null : id);
  };

  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchPendingHostels();
  }, []);

  // Format facilities to be more readable
  const formatFacilities = (hostel) => {
    const facilities = [
      hostel.wifi && "WiFi",
      hostel.parking && "Parking",
      hostel.laundry && "Laundry",
      hostel.security_guard && "Security Guard",
      hostel.mess_service && "Mess",
      hostel.attached_bathroom && "Attached Bathroom",
      hostel.air_conditioning && "AC",
      hostel.heater && "Heater",
      hostel.balcony && "Balcony",
    ].filter(Boolean);

    return facilities.length > 0 ? facilities.join(", ") : "None";
  };

  // Image Viewer Modal
  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h3>Hostel Image</h3>
            <button onClick={onClose} className="close-button">
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <img
              src={image}
              alt="Hostel Image"
              className="modal-image"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="main-content">
        <div className="content-container">
          <div className="header-section">
            <div className="page-title">
              <h1>Pending Hostel Approvals</h1>
              <p>Review and manage hostels waiting approval</p>
            </div>
            
            <div className="view-controls">
              <span className="zoom-value">80%</span>
              <div className="zoom-controls">
                <button className="zoom-button">−</button>
                <button className="zoom-button">+</button>
              </div>
              <button className="reset-button">Reset</button>
            </div>
          </div>

          <div className="actions-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search hostels..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            
            <button
              onClick={fetchPendingHostels}
              className="refresh-button"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading hostels...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredHostels.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  className="icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3>No pending hostels</h3>
              <p>There are no hostels waiting for approval at this time.</p>
            </div>
          )}

          {/* Hostels list */}
          {!loading && filteredHostels.length > 0 && (
            <div className="hostels-list">
              {filteredHostels.map((hostel) => (
                <div
                  key={hostel.id}
                  className="hostel-card"
                >
                  <div className="hostel-header">
                    <div>
                      <h2>{hostel.name}</h2>
                      <p className="hostel-meta">
                        Owner: {hostel.owner} • City: {hostel.city}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(hostel.id)}
                      className="expand-button"
                    >
                      {expandedHostel === hostel.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>

                  {/* Quick Info */}
                  <div className="quick-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Category</span>
                        <p>{hostel.category || "N/A"}</p>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Security Deposit</span>
                        <p>Rs. {hostel.security_deposit}</p>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Rent Range</span>
                        <p>Rs. {hostel.rent_min} - {hostel.rent_max}</p>
                      </div>
                    </div>
                  </div>

                  {/* Images Preview */}
                  {hostel.images && hostel.images.length > 0 && (
                    <div className="images-preview">
                      <div className="images-gallery">
                        {hostel.images.map((img) => (
                          <div key={img.id} className="image-container">
                            <img
                              src={img.image}
                              alt="hostel"
                              className="hostel-image"
                              onClick={() => setSelectedImage(img.image)}
                            />
                            <button
                              className="view-image-button"
                              onClick={() => setSelectedImage(img.image)}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedHostel === hostel.id && (
                    <div className="expanded-details">
                      <div className="details-grid">
                        <div className="details-column">
                          <h3>Details</h3>
                          <div className="details-list">
                            <div className="detail-item">
                              <span className="detail-label">Address</span>
                              <p>{hostel.address}, {hostel.city}, {hostel.zip_code}</p>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Description</span>
                              <p>{hostel.description || "No description provided"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="details-column">
                          <h3>Amenities</h3>
                          <div className="details-list">
                            <div className="detail-item">
                              <span className="detail-label">Facilities</span>
                              <p>{formatFacilities(hostel)}</p>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Nearby</span>
                              <p>Colleges: {hostel.nearby_colleges || "None"}</p>
                              <p>Markets: {hostel.nearby_markets || "None"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      {hostel.cancellation_policy && Object.keys(hostel.cancellation_policy).length > 0 && (
                        <div className="cancellation-policy">
                          <h3>Cancellation Policy</h3>
                          <div className="policy-content">
                            <pre>
                              {JSON.stringify(hostel.cancellation_policy, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      className="reject-button"
                      onClick={() => handleReject(hostel.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="approve-button"
                      onClick={() => handleApprove(hostel.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Image viewer modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default AdminManageHostels;