import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { CalendarDays, Users, Home, FileText, BookOpen } from 'lucide-react';

import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/DashboardAdmin.css';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookingTrend, setBookingTrend] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, bookingTrendRes, userDistRes, feedbackRes] = await Promise.all([
        api.get('/admin/dashboard/stats/'),
        api.get('/admin/dashboard/booking-trend/'),
        api.get('/admin/dashboard/user-distribution/'),
        api.get('/admin/dashboard/feedback-ratings/')
      ]);
  
      setStats(statsRes.data);
      setBookingTrend(bookingTrendRes.data);
      setUserDistribution(userDistRes.data);
      setFeedbackStats(feedbackRes.data);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Function to calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Admin! Here's what's happening today.</p>
          <div className="last-updated">
            {!loading && !error && 
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            }
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => fetchData()} className="retry-button">Retry</button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-data">
                  <h3>Total Users</h3>
                  <p>{stats?.total_users.toLocaleString()}</p>
                  {stats?.previous_stats && (
                    <span className={`trend ${calculateChange(stats.total_users, stats.previous_stats.total_users) >= 0 ? 'positive' : 'negative'}`}>
                      {calculateChange(stats.total_users, stats.previous_stats.total_users).toFixed(1)}% from last month
                    </span>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-data">
                  <h3>Students</h3>
                  <p>{stats?.total_students.toLocaleString()}</p>
                  {stats?.previous_stats && (
                    <span className={`trend ${calculateChange(stats.total_students, stats.previous_stats.total_students) >= 0 ? 'positive' : 'negative'}`}>
                      {calculateChange(stats.total_students, stats.previous_stats.total_students).toFixed(1)}% from last month
                    </span>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Home size={24} />
                </div>
                <div className="stat-data">
                  <h3>Hostel Owners</h3>
                  <p>{stats?.total_hostel_owners.toLocaleString()}</p>
                  {stats?.previous_stats && (
                    <span className={`trend ${calculateChange(stats.total_hostel_owners, stats.previous_stats.total_hostel_owners) >= 0 ? 'positive' : 'negative'}`}>
                      {calculateChange(stats.total_hostel_owners, stats.previous_stats.total_hostel_owners).toFixed(1)}% from last month
                    </span>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <CalendarDays size={24} />
                </div>
                <div className="stat-data">
                  <h3>Bookings</h3>
                  <p>{stats?.total_bookings.toLocaleString()}</p>
                  {stats?.previous_stats && (
                    <span className={`trend ${calculateChange(stats.total_bookings, stats.previous_stats.total_bookings) >= 0 ? 'positive' : 'negative'}`}>
                      {calculateChange(stats.total_bookings, stats.previous_stats.total_bookings).toFixed(1)}% from last month
                    </span>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-data">
                  <h3>Feedback</h3>
                  <p>{stats?.total_feedbacks.toLocaleString()}</p>
                  {stats?.previous_stats && (
                    <span className={`trend ${calculateChange(stats.total_feedbacks, stats.previous_stats.total_feedbacks) >= 0 ? 'positive' : 'negative'}`}>
                      {calculateChange(stats.total_feedbacks, stats.previous_stats.total_feedbacks).toFixed(1)}% from last month
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
              {/* Booking Trend Line Chart */}
              <div className="chart-card">
                <h3>Weekly Booking Trend</h3>
                {bookingTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={bookingTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                      <Line type="monotone" dataKey="inquiries" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">No booking trend data available.</div>
                )}
              </div>
              
              {/* User Distribution Pie Chart */}
              <div className="chart-card">
                <h3>User Distribution</h3>
                {userDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">No user distribution data available.</div>
                )}
              </div>
              
              {/* Feedback Ratings Bar Chart */}
              <div className="chart-card">
                <h3>Feedback Ratings</h3>
                {feedbackStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feedbackStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Number of Ratings" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">No feedback data available.</div>
                )}
              </div>
            </div>
            
            {/* Recent Activity Section */}
            {stats?.recent_activities && stats.recent_activities.length > 0 && (
              <div className="recent-activity-section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {stats.recent_activities.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className="activity-icon">
                        {activity.type === 'booking' && <CalendarDays size={16} />}
                        {activity.type === 'user' && <Users size={16} />}
                        {activity.type === 'feedback' && <FileText size={16} />}
                      </div>
                      <div className="activity-content">
                        <p>{activity.description}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;