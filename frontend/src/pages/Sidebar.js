import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/Sidebar.css";
import { 
  FaHome, 
  FaHotel, 
  FaBed, 
  FaBook, 
  FaUserGraduate, 
  FaComment,
  FaBars,
  FaTimes,
  FaUserCog,
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";

const Sidebar = ({ onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({ name: "Loading...", role: "Hostel Owner" });
  const location = useLocation();

  useEffect(() => {
    fetchCurrentUser();
    
    // Check if user has a sidebar preference stored
    const storedPreference = localStorage.getItem("sidebarCollapsed");
    if (storedPreference !== null) {
      setCollapsed(storedPreference === "true");
    }
  }, []);

  // Effect to notify parent components when collapsed state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(collapsed);
    }
    // Update localStorage when state changes
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed, onToggle]);

  const fetchCurrentUser = async () => {
    try {
        let token = localStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found.");
            return;
        }

        // Fetch user details from the correct API
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

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("Logging out...");
    window.location.href = "/login";
  };

  return (
    <>
      <div className={`sidebar-toggle ${collapsed ? "sidebar-collapsed" : ""}`} onClick={toggleSidebar}>
        {collapsed ? <FaBars /> : <FaTimes />}
      </div>
      
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            {!collapsed && "Hostel Management"}
            {collapsed && "HM"}
          </h2>
        </div>

        <div className="sidebar-divider"></div>

        <div className="user-profile">
          <div className="profile-image">
            <FaUser />
          </div>
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
            <Link to="/dashboard">
              <FaHome className="sidebar-icon" /> {!collapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive("/manage-hostels")}>
            <Link to="/manage-hostels">
              <FaHotel className="sidebar-icon" /> {!collapsed && <span>Manage Hostels</span>}
            </Link>
          </li>
          <li className={isActive("/manage-rooms")}>
            <Link to="/manage-rooms">
              <FaBed className="sidebar-icon" /> {!collapsed && <span>Manage Rooms</span>}
            </Link>
          </li>
          <li className={isActive("/bookings")}>
            <Link to="/bookings">
              <FaBook className="sidebar-icon" /> {!collapsed && <span>Bookings</span>}
            </Link>
          </li>
          <li className={isActive("/students")}>
            <Link to="/students">
              <FaUserGraduate className="sidebar-icon" /> {!collapsed && <span>Students</span>}
            </Link>
          </li>
          <li className={isActive("/feedback")}>
            <Link to="/feedback">
              <FaComment className="sidebar-icon" /> {!collapsed && <span>Feedback</span>}
            </Link>
          </li>
        </ul>

        <div className="sidebar-divider mt-auto"></div>

        <ul className="sidebar-menu account-menu">
          <li className={isActive("/profile-settings")}>
            <Link to="/profile-settings">
              <FaUserCog className="sidebar-icon" /> {!collapsed && <span>Profile Settings</span>}
            </Link>
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