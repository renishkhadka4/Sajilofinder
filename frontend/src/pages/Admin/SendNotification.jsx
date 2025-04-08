import React, { useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from "../../components/AdminSiderbar";
import '../../styles/SendNotification.css';

const SendNotification = () => {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [responseType, setResponseType] = useState(''); // 'success' or 'error'
  const [showInfo, setShowInfo] = useState(false);

  const getRoles = (target) => {
    if (target === "all") return ["Student", "HostelOwner"];
    if (target === "students") return ["Student"];
    if (target === "owners") return ["HostelOwner"];
    return [];
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setResponseMsg("Message is required.");
      setResponseType('error');
      return;
    }

    try {
      setLoading(true);
      setResponseMsg('');

      const res = await api.post('/admin/send-notification/', {
        message,
        roles: getRoles(target),
      });

      setResponseType('success');
      setResponseMsg(res.data.message || 'Notification sent successfully!');
      setMessage('');
    } catch (err) {
      setResponseType('error');
      setResponseMsg(err.response?.data?.message || "Failed to send notification.");
      console.error("AxiosError:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <AdminSidebar />
      </div>
      <div className="admin-content">
        <div className="notification-container">
          <div className="notification-card">
            <div className="card-header">
              <h2 className="card-title">📢 Send Notification</h2>
              <button 
                onClick={toggleInfo}
                className="info-button"
                aria-label="Information about notifications"
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </div>

            {showInfo && (
              <div className="info-panel">
                <h3>About Notifications</h3>
                <p>
                  This page allows you to send system notifications to different user groups.
                  Notifications will appear in the users' notification center and may trigger 
                  email alerts depending on their settings. Use this feature for important 
                  announcements, updates, or alerts.
                </p>
              </div>
            )}

            <div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification message..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-control"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="owners">Hostel Owners Only</option>
                </select>
              </div>

              <button
                className="send-button"
                onClick={handleSend}
                disabled={loading}
              >
                <span className="button-icon">
                  {loading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </span>
                {loading ? 'Sending...' : 'Send Notification'}
              </button>

              {responseMsg && (
                <div className={`response-message ${responseType}`}>
                  <span className="response-icon">
                    {responseType === 'success' ? (
                      <i className="fas fa-check-circle"></i>
                    ) : (
                      <i className="fas fa-exclamation-circle"></i>
                    )}
                  </span>
                  <p>{responseMsg}</p>
                </div>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="info-section-header">
              <i className="fas fa-info-circle"></i>
              <h3 className="info-section-title">What is this page?</h3>
            </div>
            <p className="info-section-content">
              The Send Notification page allows administrators to broadcast important messages to users. 
              You can target all users, only students, or only hostel owners. Use this feature for 
              system announcements, important updates, maintenance alerts, or any information 
              that needs to reach users quickly. Notifications are delivered instantly to users 
              who are online and will appear in the notification center for offline users when they 
              log in next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;