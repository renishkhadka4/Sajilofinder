import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/ManageRooms.css';

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]); // ✅ Store available hostels
    const [selectedHostel, setSelectedHostel] = useState(''); // ✅ Store selected hostel
    const [newRoom, setNewRoom] = useState({ room_number: '', room_type: 'Single', price: '', is_available: true, images: [] });
    const [editingRoom, setEditingRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRooms();
        fetchHostels(); // ✅ Fetch hostels
    }, []);

    // ✅ Fetch rooms
    const fetchRooms = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken(); // ✅ Get a new token if expired
    
            const response = await api.get('/hostel_owner/rooms/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };
    

    // ✅ Fetch available hostels
    const fetchHostels = async () => {
        try {
            let token = localStorage.getItem('token');
            const response = await api.get('/hostel_owner/hostels/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostels(response.data);
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

    // ✅ Handle Image Upload
    const handleImageUpload = (e) => {
        setNewRoom({ ...newRoom, images: Array.from(e.target.files) });
    };

    const handleAddRoom = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
    
            if (!selectedHostel) {
                console.error("Hostel selection is required");
                alert("Please select a hostel before adding a room.");
                return;
            }
    
            const formData = new FormData();
            formData.append('hostel', selectedHostel); // ✅ Ensure hostel ID is sent
            formData.append('room_number', newRoom.room_number);
            formData.append('room_type', newRoom.room_type);
            formData.append('price', newRoom.price);
            formData.append('is_available', newRoom.is_available);
    
            newRoom.images.forEach(image => formData.append('images', image)); // ✅ Append images
    
            const response = await api.post('/hostel_owner/rooms/', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
    
            console.log('Room added successfully:', response.data);
            setNewRoom({ room_number: '', room_type: 'Single', price: '', is_available: true, images: [] });
            fetchRooms(); // ✅ Refresh room list
    
        } catch (error) {
            console.error('Error adding room:', error.response?.data || error.message);
            alert(`Failed to add room: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };
    
    
    const refreshDashboard = async () => {
        try {
            let token = localStorage.getItem('token');
            if (!token) token = await refreshAccessToken();
    
            await api.get('/hostel_owner/dashboard/', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            console.log('Dashboard refreshed successfully');
        } catch (error) {
            console.error('Error refreshing dashboard:', error.response?.data || error.message);
        }
    };
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh');
            if (!refreshToken) {
                console.error('No refresh token found');
                window.location.href = '/login'; // Redirect to login if no refresh token
                return null;
            }
            const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('token', response.data.access);
            return response.data.access;
        } catch (error) {
            console.error('Error refreshing token:', error.response?.data || error.message);
            window.location.href = '/login'; // Redirect to login on failure
            return null;
        }
    };
        
    
    const handleEditRoom = (room) => {
        setEditingRoom({ ...room });
    };
    const handleUpdateRoom = async () => {
        if (!editingRoom) return;
    
        try {
            let token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('room_number', editingRoom.room_number);
            formData.append('room_type', editingRoom.room_type);
            formData.append('price', editingRoom.price);
            formData.append('is_available', editingRoom.is_available);
            formData.append('hostel', editingRoom.hostel); // ✅ Include the hostel
    
            await api.put(`/hostel_owner/rooms/${editingRoom.id}/`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
    
            setEditingRoom(null);
            fetchRooms(); // Refresh the list
        } catch (error) {
            console.error('Error updating room:', error.response?.data || error.message);
            alert(`Failed to update room: ${JSON.stringify(error.response?.data)}`);
        }
    };
    
    const handleDeleteRoom = async (roomId) => {
        try {
            let token = localStorage.getItem('token');
            await api.delete(`/hostel_owner/rooms/${roomId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            fetchRooms(); // Refresh the list after deleting
        } catch (error) {
            console.error('Error deleting room:', error.response?.data || error.message);
            alert(`Failed to delete room: ${JSON.stringify(error.response?.data)}`);
        }
    };
            

    return (
        <div className="manage-rooms-container">
            {/* ✅ Navigation Bar */}
            <nav className="dashboard-nav">
                <h1>Hostel Owner Dashboard</h1>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/manage-hostels">Manage Hostels</Link></li>
                    <li><Link to="/manage-rooms">Manage Rooms</Link></li>
                    <li><Link to="/bookings">Bookings</Link></li>
                    <li><Link to="/students">Students</Link></li>
                    <li><Link to="/feedback">Feedback</Link></li>
                    <li><button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button></li>
                </ul>
            </nav>

            <h1>Manage Rooms</h1>
            <div className="add-room-form">
                {/* ✅ Hostel Selection */}
                <select value={selectedHostel} onChange={(e) => setSelectedHostel(e.target.value)}>
                    <option value="">Select Hostel</option>
                    {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                        </option>
                    ))}
                </select>

                <input type="text" placeholder="Room Number" value={newRoom.room_number} onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })} />
                
                <select value={newRoom.room_type} onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                </select>

                <input type="number" placeholder="Price" value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} />
                <input type="file" multiple onChange={handleImageUpload} />
                <button onClick={handleAddRoom}>Add Room</button>
            </div>

            <input type="text" placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} className="search-bar" />

            {/* ✅ Table Displaying Rooms */}
            <table className="room-table">
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Room Type</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Images</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    {rooms
        .filter(room =>
            room.room_number.toLowerCase().includes(searchQuery) ||
            room.room_type.toLowerCase().includes(searchQuery)
        )
        .map((room) => (
            <tr key={room.id}>
                <td>
                    {editingRoom && editingRoom.id === room.id ? (
                        <input
                            type="text"
                            value={editingRoom.room_number}
                            onChange={(e) => setEditingRoom({ ...editingRoom, room_number: e.target.value })}
                        />
                    ) : (
                        room.room_number
                    )}
                </td>
                <td>
                    {editingRoom && editingRoom.id === room.id ? (
                        <select
                            value={editingRoom.room_type}
                            onChange={(e) => setEditingRoom({ ...editingRoom, room_type: e.target.value })}
                        >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Suite">Suite</option>
                        </select>
                    ) : (
                        room.room_type
                    )}
                </td>
                <td>
                    {editingRoom && editingRoom.id === room.id ? (
                        <input
                            type="number"
                            value={editingRoom.price}
                            onChange={(e) => setEditingRoom({ ...editingRoom, price: e.target.value })}
                        />
                    ) : (
                        `$${room.price}`
                    )}
                </td>
                <td>
                    {editingRoom && editingRoom.id === room.id ? (
                        <select
                            value={editingRoom.is_available}
                            onChange={(e) => setEditingRoom({ ...editingRoom, is_available: e.target.value === "true" })}
                        >
                            <option value={true}>Available</option>
                            <option value={false}>Not Available</option>
                        </select>
                    ) : (
                        room.is_available ? 'Available' : 'Not Available'
                    )}
                </td>
                <td>
                    {room.images && room.images.length > 0 && (
                        <div className="room-images">
                            {room.images.map((img, index) => (
                                <img key={index} src={img} alt="Room" className="room-image" />
                            ))}
                        </div>
                    )}
                </td>
                <td>
                    {editingRoom && editingRoom.id === room.id ? (
                        <>
                            <button onClick={handleUpdateRoom}>Save</button>
                            <button onClick={() => setEditingRoom(null)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEditRoom(room)}>Edit</button>
                            <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                        </>
                    )}
                </td>
            </tr>
        ))}
</tbody>

            </table>
        </div>
    );
};

export default ManageRooms;
