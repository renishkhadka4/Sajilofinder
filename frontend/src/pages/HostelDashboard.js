import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HostelDashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [newHostel, setNewHostel] = useState({ name: '', address: '', description: '' });
    const [editingHostel, setEditingHostel] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/hostel_owner/hostels/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };
    
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                console.error('No refresh token found');
                return null;
            }
            const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('token', response.data.access);
            return response.data.access;
        } catch (error) {
            console.error('Error refreshing token:', error.response?.data || error.message);
            return null;
        }
    };

    const handleAddHostel = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }
            const hostelData = { name: newHostel.name, address: newHostel.address, description: newHostel.description };
            console.log('Submitting hostel data:', hostelData);
            await axios.post('http://127.0.0.1:8000/hostel_owner/hostels/', hostelData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            fetchHostels();
        } catch (error) {
            console.error('Error adding hostel:', error.response?.data || error.message);
        }
    };

    const handleEditHostel = (hostel) => {
        setEditingHostel(hostel);
    };

    const handleUpdateHostel = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return;
            }
            await axios.put(`http://127.0.0.1:8000/hostel_owner/hostels/${editingHostel.id}/`, editingHostel, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            setEditingHostel(null);
            fetchHostels();
        } catch (error) {
            console.error('Error updating hostel:', error.response?.data || error.message);
        }
    };

    const handleDeleteHostel = async (hostelId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/hostel_owner/hostels/${hostelId}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchHostels();
        } catch (error) {
            console.error('Error deleting hostel:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Hostel Management Dashboard</h1>
            <div className="add-hostel">
                <h2>Add New Hostel</h2>
                <input type="text" placeholder="Name" value={newHostel.name} onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })} />
                <input type="text" placeholder="Address" value={newHostel.address} onChange={(e) => setNewHostel({ ...newHostel, address: e.target.value })} />
                <input type="text" placeholder="Description" value={newHostel.description} onChange={(e) => setNewHostel({ ...newHostel, description: e.target.value })} />
                <button onClick={handleAddHostel}>Add Hostel</button>
            </div>

            <div className="hostel-list">
                {hostels.map((hostel) => (
                    <div key={hostel.id} className="hostel-card">
                        {editingHostel && editingHostel.id === hostel.id ? (
                            <div>
                                <input type="text" value={editingHostel.name} onChange={(e) => setEditingHostel({ ...editingHostel, name: e.target.value })} />
                                <input type="text" value={editingHostel.address} onChange={(e) => setEditingHostel({ ...editingHostel, address: e.target.value })} />
                                <input type="text" value={editingHostel.description} onChange={(e) => setEditingHostel({ ...editingHostel, description: e.target.value })} />
                                <button onClick={handleUpdateHostel}>Update</button>
                                <button onClick={() => setEditingHostel(null)}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <h3>{hostel.name}</h3>
                                <p><strong>Address:</strong> {hostel.address}</p>
                                <p><strong>Description:</strong> {hostel.description}</p>
                                <button onClick={() => handleEditHostel(hostel)}>Edit</button>
                                <button onClick={() => handleDeleteHostel(hostel.id)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HostelDashboard;
