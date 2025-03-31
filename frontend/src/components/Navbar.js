import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import "../styles/navbar.css"; // Import CSS
import { FaBell, FaSpinner } from "react-icons/fa";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(" Error parsing user data:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    fetchNotifications();
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (e) => {
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setNotifOpen(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/students/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error(" Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/students/notifications/mark_all_read/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = notifications.map((n) => ({ ...n, is_read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (err) {
      console.error(" Error marking all as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Sajilo Finder</Link>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contacts">Contacts</Link></li>
        <li><Link to="/community">Community</Link></li>
        <li><Link to="/hostels">Hostels</Link></li>
      </ul>

      <div className="nav-actions">
        {user && user.username ? (
          <>
            <div className="notif-icon" onClick={() => setNotifOpen(!notifOpen)} ref={notifRef}>
              <FaBell className="bell-icon" />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button className="mark-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {loading ? (
                      <div className="notif-loading"><FaSpinner className="spinner" /> Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="notif-empty">No notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`notif-item ${notif.is_read ? "" : "unread"}`}>
                          <p>{notif.message}</p>
                          <small>{formatTimeAgo(notif.created_at)}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.username} ⬇
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile">Edit Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn">Get Started</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
