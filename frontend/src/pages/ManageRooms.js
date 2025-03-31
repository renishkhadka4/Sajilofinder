import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/ManageRooms.css';

const API_BASE_URL = "http://localhost:8000";
const ManageFloorsRooms = () => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            let token = localStorage.getItem('token');
            const response = await api.get('/hostel_owner/hostels/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Error fetching hostels:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <div className="page-header">
                    <h1>Manage Floors & Rooms</h1>
                    <p>Select a hostel to manage its floors and rooms</p>
                </div>
                
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading hostels...</p>
                    </div>
                ) : (
                    <div className="hostels-grid">
                        {hostels.length > 0 ? (
                            hostels.map((hostel) => (
                                <div 
                                    key={hostel.id} 
                                    className="hostel-card" 
                                    onClick={() => navigate(`/manage-rooms/${hostel.id}`)}
                                >
                                    <div className="hostel-image">
                                    {hostel.images && hostel.images.length > 0 ? (
                  <div className="image-container">
                    <img 
                      src={hostel.images[0].image.startsWith("http") ? hostel.images[0].image : `${API_BASE_URL}${hostel.images[0].image}`} 
                      alt={hostel.name} 
                      className="hostel-image"
                      onError={(e) => { e.target.src = "/placeholder.png"; }} 
                    />
                    <div className="image-count">{hostel.images.length} photos</div>
                  </div>
                ) : (
                  <img src="/placeholder.png" alt="No Image Available" className="hostel-image" />
                )}
                                    </div>
                                    <div className="hostel-info">
                                        <h3>{hostel.name}</h3>
                                        <div className="stats-container">
                                            <div className="stat">
                                                <span className="icon">📍</span>
                                                <span>{hostel.address}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="icon">🏢</span>
                                                <span>{hostel.total_floors || 0} Floors</span>
                                            </div>
                                            <div className="stat">
                                                <span className="icon">🛏️</span>
                                                <span>{hostel.total_rooms || 0} Rooms</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <button className="manage-btn">Manage</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-hostels">
                                <div className="empty-icon">🏨</div>
                                <p>No hostels available</p>
                                <button 
                                    className="add-hostel-btn"
                                    onClick={() => navigate('/add-hostel')}
                                >
                                    Add New Hostel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageFloorsRooms;