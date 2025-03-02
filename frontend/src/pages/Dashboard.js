import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/Dashboard.css';


const Dashboard = () => {
    const [stats, setStats] = useState({ students: 0, rooms: 0, bookedRooms: 0, feedbacks: 0 });
    const [hostels, setHostels] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserRole();
        fetchStats();
        fetchHostels();
    }, []);
    
    
    // Function to refresh dashboard manually
    const refreshDashboard = () => {
        fetchStats();
        fetchHostels();
    };
    

    const checkUserRole = () => {
        const role = localStorage.getItem('role');
        if (role !== 'HostelOwner') {
            navigate('/login');
        }
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                console.error('No refresh token found');
                navigate('/login');
                return null;
            }
            const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('token', response.data.access);
            return response.data.access;
        } catch (error) {
            console.error('Error refreshing token:', error.response?.data || error.message);
            navigate('/login');
            return null;
        }
    };

    const fetchStats = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
    
            const response = await api.get('/hostel_owner/dashboard/', { // ✅ Correct endpoint
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error.response?.data || error.message);
        }
    };
    
    

    const fetchHostels = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
    
            const response = await api.get('/hostel_owner/hostels/', { // ✅ Removed extra /api/
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Error fetching hostels:', error.response?.data || error.message);
        }
    };
    
    

    const chartData = {
        labels: ['Students', 'Rooms', 'Booked Rooms', 'Feedbacks'],
        datasets: [
            {
                label: 'Dashboard Stats',
                data: [stats.students, stats.rooms, stats.bookedRooms, stats.feedbacks],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
            },
        ],
    };

    return (
        
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Hostel Owner Dashboard</h1>
                <ul>
                    <li><Link to="/manage-hostels">Manage Hostels</Link></li>
                    <li><Link to="/manage-rooms">Manage Rooms</Link></li>
                    <li><Link to="/bookings">Bookings</Link></li>
                    <li><Link to="/students">Students</Link></li>
                    <li><Link to="/feedback">Feedback</Link></li>
                    <li><button onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button></li>
                </ul>
            </nav>
            <button onClick={refreshDashboard} className="refresh-btn">Refresh Dashboard</button>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h2>{stats.students}</h2>
                    <p>Registered Students</p>
                </div>
                <div className="stat-card">
                    <h2>{stats.rooms}</h2>
                    <p>Total Rooms</p>
                </div>
                <div className="stat-card">
                    <h2>{stats.bookedRooms}</h2>
                    <p>Booked Rooms</p>
                </div>
                <div className="stat-card">
                    <h2>{stats.feedbacks}</h2>
                    <p>Feedbacks</p>
                </div>
            </div>

            <div className="dashboard-chart">
                <Bar data={chartData} />
            </div>

            <div className="hostel-list">
                <h2>My Hostels</h2>
                {hostels.length > 0 ? (
                    hostels.map((hostel) => (
                        <div key={hostel.id} className="hostel-card">
                            <h3>{hostel.name}</h3>
                            <p><strong>Address:</strong> {hostel.address}</p>
                            <p><strong>Description:</strong> {hostel.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No hostels added yet.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
