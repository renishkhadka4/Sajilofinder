import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCommentDots, 
  FaBuilding, 
  FaBlog, 
  FaMoneyCheckAlt, 
  FaEnvelopeOpenText, 
  FaInfoCircle, 
  FaCog, 
  FaBell,
  FaSignOutAlt 
} from 'react-icons/fa';
import "../styles/AdminSidebar.css";
const AdminSidebar = ({ userName = 'Admin', userRole = 'Administrator', userAvatar }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/feedback', icon: <FaCommentDots />, label: 'Feedback' },
    { path: '/admin/hostels', icon: <FaBuilding />, label: 'Hostels' },
    { path: '/admin/blogs', icon: <FaBlog />, label: 'Blogs' },
    { path: '/admin/transactions', icon: <FaMoneyCheckAlt />, label: 'Transactions' },
    { path: '/admin/messages', icon: <FaEnvelopeOpenText />, label: 'Messages' },
    { path: '/admin/about-us', icon: <FaInfoCircle />, label: 'About Us' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    { path: '/admin/send-notification', icon: <FaBell />, label: 'Send Notification' },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/admin/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className="admin-sidebar">
      {/* Admin Profile */}
      <div className="admin-profile">
        <div className="admin-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={`${userName}'s avatar`} />
          ) : (
            <div className="avatar-placeholder">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="admin-info">
          <h3 className="admin-name">{userName}</h3>
          <p className="admin-role">{userRole}</p>
        </div>
      </div>
      
      {/* Sidebar Title */}
      <h1 className="admin-sidebar-title">Admin Panel</h1>
      
      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            title={item.label}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      {/* Logout Section */}
      <div className="admin-sidebar-footer">
        <Link to="/logout" className="admin-sidebar-logout">
          <span className="icon"><FaSignOutAlt /></span>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;