import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from './Sidebar';
import '../styles/ManageFloorsRoomsDetails.css';

const ManageFloorsRoomsDetail = () => {
    const { id } = useParams();
    const [hostel, setHostel] = useState(null);
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFloors, setExpandedFloors] = useState({});
    const [newFloor, setNewFloor] = useState({ floor_number: '', description: '' });
    const [newRooms, setNewRooms] = useState({}); 
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', id: null });
    const [editMode, setEditMode] = useState({ active: false, type: '', data: null });
    
    useEffect(() => {
        fetchHostelDetails();
    }, []);

    useEffect(() => {
        if (hostel) {
            fetchFloors();
        }
    }, [hostel]);

    const fetchHostelDetails = async () => {
        try {
            let token = localStorage.getItem('token');
            const response = await api.get(`/hostel_owner/hostels/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setHostel(response.data);
                setLoading(false);
            } else {
                console.error("Failed to fetch hostel details");
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching hostel details:', error.response?.data || error.message);
            setLoading(false);
        }
    };

    const fetchFloors = async () => {
        if (!hostel?.id) return;
    
        try {
            let token = localStorage.getItem("token");
            let response = await api.get(`/hostel_owner/floors/?hostel_id=${hostel.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            let floorsWithRooms = await Promise.all(
                response.data.map(async (floor) => {
                    let roomResponse = await api.get(`/hostel_owner/rooms/?floor_id=${floor.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
    
                    return { ...floor, rooms: roomResponse.data };
                })
            );
    
            setFloors(floorsWithRooms);
        } catch (error) {
            console.error("Error fetching floors:", error);
        }
    };
    
    const toggleFloor = (floorId) => {
        setExpandedFloors(prev => ({
            ...prev,
            [floorId]: !prev[floorId],
        }));
    };

    const addFloor = async () => {
        if (!newFloor.floor_number) return alert("Please enter a valid floor number.");
        try {
            let token = localStorage.getItem('token');
            let response = await api.post(
                '/hostel_owner/floors/', 
                {
                    hostel: parseInt(id),
                    floor_number: parseInt(newFloor.floor_number),
                    description: newFloor.description || `Floor ${newFloor.floor_number} description`
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            setFloors([...floors, { ...response.data, rooms: [] }]);
            setNewFloor({ floor_number: '', description: '' });
        } catch (error) {
            console.error('❌ Error adding floor:', error.response?.data || error.message);
            alert(`Failed to add floor: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };
    
    const deleteFloor = async (floorId) => {
        setIsDeleting(true);
        try {
            let token = localStorage.getItem('token');
            await api.delete(`/hostel_owner/floors/${floorId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Remove floor from state
            setFloors(floors.filter(floor => floor.id !== floorId));
            setConfirmDelete({ show: false, type: '', id: null });
        } catch (error) {
            console.error('❌ Error deleting floor:', error.response?.data || error.message);
            alert(`Failed to delete floor: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const startEditFloor = (floor) => {
        setEditMode({
            active: true,
            type: 'floor',
            data: {
                id: floor.id,
                floor_number: floor.floor_number,
                description: floor.description
            }
        });
    };

    const updateFloor = async () => {
        if (!editMode.data.floor_number) return alert("Please enter a valid floor number.");
        try {
            let token = localStorage.getItem('token');
            let response = await api.put(
                `/hostel_owner/floors/${editMode.data.id}/`, 
                {
                    hostel: parseInt(id),
                    floor_number: parseInt(editMode.data.floor_number),
                    description: editMode.data.description
                },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            
            // Update floor in state
            setFloors(prevFloors => 
                prevFloors.map(floor => 
                    floor.id === editMode.data.id ? { ...floor, ...response.data } : floor
                )
            );
            
            // Exit edit mode
            setEditMode({ active: false, type: '', data: null });
        } catch (error) {
            console.error('❌ Error updating floor:', error.response?.data || error.message);
            alert(`Failed to update floor: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    const addRoom = async (floorId) => {
        const roomData = newRooms[floorId]; // Get room data for this specific floor

        if (!roomData || !roomData.room_number || !roomData.price) {
            return alert("Please fill all room details.");
        }

        try {
            let token = localStorage.getItem("token");
            let formData = new FormData();

            formData.append("floor", floorId);
            formData.append("room_number", roomData.room_number);
            formData.append("room_type", roomData.room_type || "Single");
            formData.append("price", parseFloat(roomData.price));
            formData.append("is_available", roomData.is_available ? "true" : "false");

            // Add images if they exist
            if (roomData.images && roomData.images.length > 0) {
                roomData.images.forEach((image) => {
                    formData.append("images", image);
                });
            }

            let response = await api.post("/hostel_owner/rooms/", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Room added:", response.data);

            setFloors((prevFloors) =>
                prevFloors.map((floor) =>
                    floor.id === floorId
                        ? { ...floor, rooms: [...(floor.rooms || []), response.data] }
                        : floor
                )
            );

            // Clear the form for just this floor
            setNewRooms((prev) => ({
                ...prev,
                [floorId]: { room_number: "", room_type: "Single", price: "", is_available: true, images: [] },
            }));

        } catch (error) {
            console.error("❌ Error adding room:", error.response?.data || error.message);
            alert(`Failed to add room: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };
    
    const startEditRoom = (room, floorId) => {
        setEditMode({
            active: true,
            type: 'room',
            data: {
                id: room.id,
                floorId: floorId,
                room_number: room.room_number,
                room_type: room.room_type,
                price: room.price,
                is_available: room.is_available,
                // We don't populate images since we can't get them from the response
                images: []
            }
        });
    };

    const updateRoom = async () => {
        if (!editMode.data.room_number || !editMode.data.price) 
            return alert("Please fill all room details.");
        
        try {
            let token = localStorage.getItem('token');
            let formData = new FormData();
    
            formData.append("floor", editMode.data.floorId);
            formData.append("room_number", editMode.data.room_number);
            formData.append("room_type", editMode.data.room_type);
            formData.append("price", parseFloat(editMode.data.price));
            formData.append("is_available", editMode.data.is_available ? "true" : "false");
    
            if (editMode.data.images && editMode.data.images.length > 0) {
                editMode.data.images.forEach((image) => {
                    formData.append("images", image);
                });
            }
    
            let response = await api.put(`/hostel_owner/rooms/${editMode.data.id}/`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
    
            // Update room in state
            setFloors(prevFloors =>
                prevFloors.map(floor =>
                    floor.id === editMode.data.floorId
                        ? { 
                            ...floor, 
                            rooms: floor.rooms.map(room =>
                                room.id === editMode.data.id ? response.data : room
                            ) 
                        }
                        : floor
                )
            );
    
            // Exit edit mode
            setEditMode({ active: false, type: '', data: null });
    
        } catch (error) {
            console.error('❌ Error updating room:', error.response?.data || error.message);
            alert(`Failed to update room: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };
    
    const deleteRoom = async (floorId, roomId) => {
        setIsDeleting(true);
        try {
            let token = localStorage.getItem('token');
            await api.delete(`/hostel_owner/rooms/${roomId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update floors state to remove the deleted room
            setFloors(prevFloors =>
                prevFloors.map(floor =>
                    floor.id === floorId
                        ? { ...floor, rooms: floor.rooms.filter(room => room.id !== roomId) }
                        : floor
                )
            );
            setConfirmDelete({ show: false, type: '', id: null });
        } catch (error) {
            console.error('❌ Error deleting room:', error.response?.data || error.message);
            alert(`Failed to delete room: ${error.response?.data?.detail || error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const showDeleteConfirm = (type, id, floorId = null) => {
        setConfirmDelete({ show: true, type, id, floorId });
    };

    const handleDeleteConfirm = () => {
        if (confirmDelete.type === 'floor') {
            deleteFloor(confirmDelete.id);
        } else if (confirmDelete.type === 'room') {
            deleteRoom(confirmDelete.floorId, confirmDelete.id);
        }
    };

    const cancelEdit = () => {
        setEditMode({ active: false, type: '', data: null });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading hostel details...</p>
                    </div>
                ) : (
                    <>
                        <div className="page-header">
                            <h1>{hostel?.name} - Floors & Rooms</h1>
                            <p className="hostel-address"><span className="icon">📍</span> {hostel?.address}</p>
                        </div>

                        <div className="floors-section">
                            <div className="section-header">
                                <h2>Manage Floors</h2>
                                <div className="section-actions">
                                    <button className="action-btn refresh-btn" onClick={fetchFloors}>
                                        <span className="icon">🔄</span> Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Add Floor Form */}
                            <div className="add-floor-form">
                                <input
                                    type="number"
                                    placeholder="Enter Floor Number"
                                    value={newFloor.floor_number}
                                    onChange={(e) => setNewFloor({ ...newFloor, floor_number: e.target.value })}
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newFloor.description}
                                    onChange={(e) => setNewFloor({ ...newFloor, description: e.target.value })}
                                    className="form-input"
                                />
                                <button className="add-btn" onClick={addFloor}>
                                    <span className="icon">➕</span> Add Floor
                                </button>
                            </div>

                            {/* Edit Floor Form (shown only in edit mode) */}
                            {editMode.active && editMode.type === 'floor' && (
                                <div className="edit-form">
                                    <h3>Edit Floor</h3>
                                    <div className="form-grid">
                                        <input
                                            type="number"
                                            placeholder="Floor Number"
                                            value={editMode.data.floor_number}
                                            onChange={(e) => setEditMode({
                                                ...editMode,
                                                data: { ...editMode.data, floor_number: e.target.value }
                                            })}
                                            className="form-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={editMode.data.description}
                                            onChange={(e) => setEditMode({
                                                ...editMode,
                                                data: { ...editMode.data, description: e.target.value }
                                            })}
                                            className="form-input"
                                        />
                                        <div className="edit-actions">
                                            <button className="cancel-btn" onClick={cancelEdit}>
                                                Cancel
                                            </button>
                                            <button className="save-btn" onClick={updateFloor}>
                                                <span className="icon">💾</span> Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="floors-grid">
                                {floors.length > 0 ? (
                                    floors.map((floor) => (
                                        <div key={floor.id} className="floor-card">
                                            <div className="card-header">
                                                <h3>Floor {floor.floor_number}</h3>
                                                <div className="card-actions">
                                                    <button 
                                                        className="edit-btn" 
                                                        onClick={() => startEditFloor(floor)}
                                                    >
                                                        <span className="icon">✏️</span>
                                                    </button>
                                                    <button 
                                                        className="delete-btn" 
                                                        onClick={() => showDeleteConfirm('floor', floor.id)}
                                                    >
                                                        <span className="icon">🗑️</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-content">
                                                <p><span className="label">Description:</span> {floor.description}</p>
                                                <p><span className="label">Rooms:</span> {floor.rooms?.length || 0}</p>
                                                <button onClick={() => toggleFloor(floor.id)} className="toggle-btn">
                                                    {expandedFloors[floor.id] ? "🔼 Hide Rooms" : "🔽 Show Rooms"}
                                                </button>
                                            </div>

                                            {expandedFloors[floor.id] && (
                                                <div className="rooms-section">
                                                    <h4>Add Room</h4>
                                                    <div className="add-room-form">
                                                        <input
                                                            type="text"
                                                            placeholder="Room Number"
                                                            value={newRooms[floor.id]?.room_number || ""}
                                                            onChange={(e) => setNewRooms({
                                                                ...newRooms,
                                                                [floor.id]: { ...(newRooms[floor.id] || { room_type: "Single", is_available: true }), room_number: e.target.value }
                                                            })}
                                                            className="form-input"
                                                        />
                                                        <select
                                                            value={newRooms[floor.id]?.room_type || "Single"}
                                                            onChange={(e) => setNewRooms({
                                                                ...newRooms,
                                                                [floor.id]: { ...(newRooms[floor.id] || { is_available: true }), room_type: e.target.value }
                                                            })}
                                                            className="form-select"
                                                        >
                                                            <option value="Single">Single</option>
                                                            <option value="Double">Double</option>
                                                            <option value="Suite">Suite</option>
                                                        </select>
                                                        <input
                                                            type="number"
                                                            placeholder="Price"
                                                            value={newRooms[floor.id]?.price || ""}
                                                            onChange={(e) => setNewRooms({
                                                                ...newRooms,
                                                                [floor.id]: { ...(newRooms[floor.id] || { room_type: "Single", is_available: true }), price: e.target.value }
                                                            })}
                                                            className="form-input"
                                                        />
                                                        <label className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={newRooms[floor.id]?.is_available ?? true}
                                                                onChange={(e) => setNewRooms({
                                                                    ...newRooms,
                                                                    [floor.id]: { ...(newRooms[floor.id] || { room_type: "Single" }), is_available: e.target.checked }
                                                                })}
                                                            />
                                                            Available
                                                        </label>

                                                        <div className="file-upload">
                                                            <label className="file-label">
                                                                <span className="icon">📷</span> Upload Room Images
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={(e) => setNewRooms({
                                                                        ...newRooms,
                                                                        [floor.id]: { ...(newRooms[floor.id] || { room_type: "Single", is_available: true }), images: Array.from(e.target.files) }
                                                                    })}
                                                                    className="hidden-input"
                                                                />
                                                            </label>
                                                            <span className="file-info">
                                                                {newRooms[floor.id]?.images && newRooms[floor.id]?.images.length > 0 
                                                                    ? `${newRooms[floor.id].images.length} file(s) selected` 
                                                                    : "No files selected"}
                                                            </span>
                                                        </div>

                                                        <button className="add-btn" onClick={() => addRoom(floor.id)}>
                                                            <span className="icon">➕</span> Add Room
                                                        </button>
                                                    </div>

                                                    {/* Edit Room Form (shown only in edit mode) */}
                                                    {editMode.active && editMode.type === 'room' && editMode.data.floorId === floor.id && (
                                                        <div className="edit-form">
                                                            <h4>Edit Room</h4>
                                                            <div className="form-grid">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Room Number"
                                                                    value={editMode.data.room_number}
                                                                    onChange={(e) => setEditMode({
                                                                        ...editMode,
                                                                        data: { ...editMode.data, room_number: e.target.value }
                                                                    })}
                                                                    className="form-input"
                                                                />
                                                                <select
                                                                    value={editMode.data.room_type}
                                                                    onChange={(e) => setEditMode({
                                                                        ...editMode,
                                                                        data: { ...editMode.data, room_type: e.target.value }
                                                                    })}
                                                                    className="form-select"
                                                                >
                                                                    <option value="Single">Single</option>
                                                                    <option value="Double">Double</option>
                                                                    <option value="Suite">Suite</option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Price"
                                                                    value={editMode.data.price}
                                                                    onChange={(e) => setEditMode({
                                                                        ...editMode,
                                                                        data: { ...editMode.data, price: e.target.value }
                                                                    })}
                                                                    className="form-input"
                                                                />
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editMode.data.is_available}
                                                                        onChange={(e) => setEditMode({
                                                                            ...editMode,
                                                                            data: { ...editMode.data, is_available: e.target.checked }
                                                                        })}
                                                                    />
                                                                    Available
                                                                </label>
                                                                <div className="file-upload">
                                                                    <label className="file-label">
                                                                        <span className="icon">📷</span> Update Room Images
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            accept="image/*"
                                                                            onChange={(e) => setEditMode({
                                                                                ...editMode,
                                                                                data: { ...editMode.data, images: Array.from(e.target.files) }
                                                                            })}
                                                                            className="hidden-input"
                                                                        />
                                                                    </label>
                                                                    <span className="file-info">
                                                                        {editMode.data.images && editMode.data.images.length > 0 
                                                                            ? `${editMode.data.images.length} file(s) selected` 
                                                                            : "No new files selected"}
                                                                    </span>
                                                                </div>
                                                                <div className="edit-actions">
                                                                    <button className="cancel-btn" onClick={cancelEdit}>
                                                                        Cancel
                                                                    </button>
                                                                    <button className="save-btn" onClick={updateRoom}>
                                                                        <span className="icon">💾</span> Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="rooms-list">
                                                        <h4>Existing Rooms</h4>
                                                        {floor.rooms && floor.rooms.length > 0 ? (
                                                            <div className="room-cards">
                                                                {floor.rooms.map((room) => (
                                                                    <div key={room.id} className="room-card">
                                                                        <div className="card-header">
                                                                            <h4>Room {room.room_number}</h4>
                                                                            <div className="card-actions">
                                                                                <button 
                                                                                    className="edit-btn" 
                                                                                    onClick={() => startEditRoom(room, floor.id)}
                                                                                >
                                                                                    <span className="icon">✏️</span>
                                                                                </button>
                                                                                <button 
                                                                                    className="delete-btn" 
                                                                                    onClick={() => showDeleteConfirm('room', room.id, floor.id)}
                                                                                >
                                                                                    <span className="icon">🗑️</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="card-content">
                                                                            <p><span className="label">Type:</span> {room.room_type}</p>
                                                                            <p><span className="label">Price:</span> Rs {room.price}</p>
                                                                            <p>
                                                                                <span className="label">Status:</span> 
                                                                                <span className={room.is_available ? "status available" : "status booked"}>
                                                                                    {room.is_available ? "Available" : "Booked"}
                                                                                </span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="empty-message">No rooms added yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No floors added yet.</p>
                                        <p>Add your first floor to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {confirmDelete.show && (
                            <div className="modal-backdrop">
                                <div className="modal-content">
                                    <h3>Confirm Delete</h3>
                                    <p>Are you sure you want to delete this {confirmDelete.type}?</p>
                                    <p className="warning-text">This action cannot be undone.</p>
                                    <div className="modal-actions">
                                        <button 
                                            className="cancel-btn" 
                                            onClick={() => setConfirmDelete({ show: false, type: '', id: null })}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="delete-confirm-btn" 
                                            onClick={handleDeleteConfirm}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManageFloorsRoomsDetail;