import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaCommentDots,
  FaBuilding,
  FaBlog,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaEnvelopeOpenText,
  FaUserCog,
  FaInfoCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import '../styles/AdminSidebar.css';

const AdminSidebar = ({ userName = 'Admin', userRole = 'Administrator', userAvatar }) => {
  const location = useLocation();
  
  // Define navigation items in one place for better maintainability
  const navItems = useMemo(() => [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/feedback', icon: <FaCommentDots />, label: 'Feedback' },
    { path: '/admin/hostels', icon: <FaBuilding />, label: 'Hostels' },
    { path: '/admin/blogs', icon: <FaBlog />, label: 'Blogs' },
    { path: '/admin/transactions', icon: <FaMoneyCheckAlt />, label: 'Transactions' },
    { path: '/admin/messages', icon: <FaEnvelopeOpenText />, label: 'Messages' },
    { path: '/admin/about-us', icon: <FaInfoCircle />, label: 'About Us' },
    { path: '/admin/settings', icon: <FaUserCog />, label: 'Settings' },
    { path: '/admin/send-notification', icon: <FaExclamationTriangle />, label: 'Send Notification' },

  ], []);

  // Check if a path is active or if any of its sub-paths are active
  const isActive = (path) => {
    // Exact match
    if (location.pathname === path) return true;
    // Sub-path match (like /admin/users/123 should highlight the Users tab)
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="admin-sidebar">
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
      
      <h1 className="admin-sidebar-title">Admin Panel</h1>
      
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => (
          <SidebarLink 
            key={item.path}
            to={item.path} 
            icon={item.icon} 
            label={item.label} 
            active={isActive(item.path)} 
          />
        ))}
      </nav>
      
      <div className="admin-sidebar-footer">
        <Link to="/login" className="admin-sidebar-logout">
          <span className="icon"><FaSignOutAlt /></span>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`admin-sidebar-link ${active ? 'active' : ''}`}
    title={label}
  >
    <span className="icon">{icon}</span>
    <span className="label">{label}</span>
  </Link>
);

export default AdminSidebar;