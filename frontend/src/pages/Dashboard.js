import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/Dashboard.css';
import Sidebar from '../pages/Sidebar';

const Dashboard = () => {
    const [stats, setStats] = useState({ students: 0, rooms: 0, bookedRooms: 0, feedbacks: 0 });
    const [hostels, setHostels] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserRole();
        fetchStats();
        fetchHostels();
    }, []);

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
                navigate('/login');
                return null;
            }
            const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('token', response.data.access);
            return response.data.access;
        } catch (error) {
            navigate('/login');
            return null;
        }
    };

    const fetchStats = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
            const response = await api.get('/hostel_owner/dashboard/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    const fetchHostels = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
            const response = await api.get('/hostel_owner/hostels/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

    const barChartData = {
        labels: ['Students', 'Rooms', 'Booked Rooms', 'Feedbacks'],
        datasets: [
            {
                label: 'Dashboard Stats',
                data: [stats.students, stats.rooms, stats.bookedRooms, stats.feedbacks],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
            },
        ],
    };

    const pieChartData = {
        labels: ['Students', 'Rooms', 'Booked Rooms', 'Feedbacks'],
        datasets: [
            {
                data: [stats.students, stats.rooms, stats.bookedRooms, stats.feedbacks],
                backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
            },
        ],
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="dashboard-stats">
                    <div className="stat-card blue">
                        <h2>{stats.students}</h2>
                        <p>Registered Students</p>
                        <button className="view-details">View Details</button>
                    </div>
                    <div className="stat-card green">
                        <h2>{stats.rooms}</h2>
                        <p>Total Rooms</p>
                        <button className="view-details">View Details</button>
                    </div>
                    <div className="stat-card orange">
                        <h2>{stats.bookedRooms}</h2>
                        <p>Booked Rooms</p>
                        <button className="view-details">View Details</button>
                    </div>
                    <div className="stat-card red">
                        <h2>{stats.feedbacks}</h2>
                        <p>Feedbacks</p>
                        <button className="view-details">View Details</button>
                    </div>
                </div>
                <div className="dashboard-charts">
                    <div className="chart-container">
                        <h2>Bar Chart</h2>
                        <Bar data={barChartData} />
                    </div>
                    <div className="chart-container">
                        <h2>Pie Chart</h2>
                        <Pie data={pieChartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
