import React from 'react';
import { Link } from 'react-router-dom';
//import '../styles/sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Hostel Management</h2>
            <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/manage-hostels">Manage Hostels</Link></li>
                <li><Link to="/manage-rooms">Manage Rooms</Link></li>
                <li><Link to="/bookings">Bookings</Link></li>
                <li><Link to="/students">Students</Link></li>
                <li><Link to="/feedback">Feedback</Link></li>
            </ul>
        </div>
    );
};

export default Sidebar;