import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/Sidebar.css";
import { 
  FaHome, FaHotel, FaBed, FaBook, FaUserGraduate, FaComment,
  FaBars, FaTimes, FaUserCog, FaSignOutAlt, FaUser, FaBell,
  FaAngleRight, FaSpinner
} from "react-icons/fa";

const Sidebar = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({ name: "Loading...", role: "Hostel Owner" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    fetchCurrentUser();
    fetchNotifications();

    const storedPreference = localStorage.getItem("sidebarCollapsed");
    if (storedPreference !== null) {
      setCollapsed(storedPreference === "true");
    }

    // Add click event listener to handle clicking outside of notification box
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (onToggle) {
      onToggle(collapsed);
    }
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed, onToggle]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/hostel_owner/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({
        name: response.data.username || "Unknown Owner",
        role: "Hostel Owner",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser({ name: "Guest User", role: "Viewer" });
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/hostel_owner/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotificationBox(!showNotificationBox);
    
    // Refresh notifications when opening the box
    if (!showNotificationBox) {
      fetchNotifications();
    }
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/hostel_owner/notifications/${notificationId}/mark_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/hostel_owner/notifications/mark_all_read/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <>
      <div className={`sidebar-toggle ${collapsed ? "sidebar-collapsed" : ""}`} onClick={toggleSidebar}>
        {collapsed ? <FaBars /> : <FaTimes />}
      </div>

      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{!collapsed ? "Hostel Management" : "HM"}</h2>
        </div>

        <div className="sidebar-divider"></div>

        <div className="user-profile">
          <div className="profile-image"><FaUser /></div>
          {!collapsed && (
            <div className="profile-info">
              <h3>{user.name}</h3>
              <p>{user.role}</p>
            </div>
          )}
        </div>

        <div className="sidebar-divider"></div>

        <ul className="sidebar-menu">
          <li className={isActive("/dashboard")}>
            <Link to="/dashboard"><FaHome className="sidebar-icon" /> {!collapsed && <span>Dashboard</span>}</Link>
          </li>
          <li className={isActive("/manage-hostels")}>
            <Link to="/manage-hostels"><FaHotel className="sidebar-icon" /> {!collapsed && <span>Manage Hostels</span>}</Link>
          </li>
          <li className={isActive("/manage-rooms")}>
            <Link to="/manage-rooms"><FaBed className="sidebar-icon" /> {!collapsed && <span>Manage Rooms</span>}</Link>
          </li>
          <li className={isActive("/bookings")}>
            <Link to="/bookings"><FaBook className="sidebar-icon" /> {!collapsed && <span>Bookings</span>}</Link>
          </li>
          <li className={isActive("/students")}>
            <Link to="/students"><FaUserGraduate className="sidebar-icon" /> {!collapsed && <span>Students</span>}</Link>
          </li>
          <li className={isActive("/feedback")}>
            <Link to="/feedback"><FaComment className="sidebar-icon" /> {!collapsed && <span>Feedback</span>}</Link>
          </li>
          <li className={isActive("/notifications")}>
            <div className="notification-icon-wrapper" onClick={toggleNotifications}>
              <FaBell className={`sidebar-icon ${unreadCount > 0 ? 'notification-active' : ''}`} />
              {!collapsed && <span>Notifications</span>}
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
          </li>
        </ul>

        {showNotificationBox && (
          <div className="notification-popup" ref={notificationRef}>
            <div className="notification-header">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {loading ? (
                <div className="loading-notifications">
                  <FaSpinner className="spinner" />
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-notifications">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.is_read ? '' : 'unread'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.is_read ? '🔔' : '🔵'}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="notification-footer">
              <Link to="/notifications" className="view-all-link" onClick={() => setShowNotificationBox(false)}>
                View all notifications <FaAngleRight />
              </Link>
            </div>
          </div>
        )}

        <div className="sidebar-divider mt-auto"></div>

        <ul className="sidebar-menu account-menu">
          <li className={isActive("/profile-settings")}>
            <Link to="/profile-settings"><FaUserCog className="sidebar-icon" /> {!collapsed && <span>Profile Settings</span>}</Link>
          </li>
          <li>
            <Link to="/login" onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" /> {!collapsed && <span>Logout</span>}
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          {!collapsed && <span>© 2025 Hostel System</span>}
        </div>
      </div>
    </>
  );
};

export default Sidebar;