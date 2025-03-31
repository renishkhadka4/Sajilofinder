import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/Dashboard.css';
import Sidebar from '../pages/Sidebar';


const Dashboard = () => {
    const [stats, setStats] = useState({
        total_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        rejected_bookings: 0,
        revenue_per_month: [],
        avg_rating: 0,
        total_feedbacks: 0,
        total_rooms: 0,
        booked_rooms: 0,
        available_rooms: 0,
    });
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        checkUserRole();
        fetchStats();
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
    
            const params = new URLSearchParams();
            if (startDate) params.append("start_date", startDate);
            if (endDate) params.append("end_date", endDate);
    
            const response = await api.get(`/hostel_owner/dashboard/?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };
    

    const bookingPieData = {
        labels: ['Pending', 'Confirmed', 'Rejected'],
        datasets: [
            {
                label: 'Booking Status',
                data: [stats.pending_bookings, stats.confirmed_bookings, stats.rejected_bookings],
                backgroundColor: ['#FFC107', '#4CAF50', '#F44336'],
            },
        ],
    };

    const revenueBarData = {
        labels: stats.revenue_per_month.map(item => `Month ${item.month}`),
        datasets: [
            {
                label: 'Monthly Revenue',
                data: stats.revenue_per_month.map(item => item.total_revenue),
                backgroundColor: '#2196F3',
            },
        ],
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <h1 className="dashboard-title">Hostel Owner Dashboard</h1>
                <div className="date-filters">
    <label>Start Date: <input type="date" onChange={(e) => setStartDate(e.target.value)} /></label>
    <label>End Date: <input type="date" onChange={(e) => setEndDate(e.target.value)} /></label>
    <button onClick={fetchStats}>Apply</button>
</div>

                <div className="dashboard-stats">
                    <div className="stat-card blue">
                        <h2>{stats.total_bookings}</h2>
                        <p>Total Bookings</p>
                    </div>
                    <div className="stat-card yellow">
                        <h2>{stats.pending_bookings}</h2>
                        <p>Pending</p>
                    </div>
                    <div className="stat-card green">
                        <h2>{stats.confirmed_bookings}</h2>
                        <p>Confirmed</p>
                    </div>
                    <div className="stat-card red">
                        <h2>{stats.rejected_bookings}</h2>
                        <p>Rejected</p>
                    </div>
                    <div className="stat-card purple">
                        <h2>{stats.total_rooms}</h2>
                        <p>Total Rooms</p>
                    </div>
                    <div className="stat-card teal">
                        <h2>{stats.available_rooms}</h2>
                        <p>Available Rooms</p>
                    </div>
                    <div className="stat-card orange">
                        <h2>{stats.booked_rooms}</h2>
                        <p>Booked Rooms</p>
                    </div>
                    <div className="stat-card pink">
                        <h2>{stats.total_feedbacks}</h2>
                        <p>Feedbacks</p>
                    </div>
                    <div className="stat-card indigo">
                        <h2>{stats.avg_rating}</h2>
                        <p>Avg Rating ⭐</p>
                    </div>
                </div>

                <div className="dashboard-charts">
                    <div className="chart-container">
                        <h2>Booking Status Breakdown</h2>
                        <Pie data={bookingPieData} />
                    </div>
                    <div className="chart-container">
                        <h2>Monthly Revenue</h2>
                        <Bar data={revenueBarData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
