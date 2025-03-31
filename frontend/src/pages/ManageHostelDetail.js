import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/ManageHostelDetail.css';

const ManageHostelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [activeSection, setActiveSection] = useState('basic');

    useEffect(() => {
        fetchHostelDetails();
    }, []);

    const fetchHostelDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/hostel_owner/hostels/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData(response.data);
            setImagePreviews(response.data.images || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hostel details:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCancellationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            cancellation_policy: {
                ...prev.cancellation_policy,
                [name]: value,
            },
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: files,
        }));
    };

    const handleImageDelete = async (imageId) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            const token = localStorage.getItem("token");
            await api.delete(`/hostel_owner/hostels/${id}/bulk_delete_images/`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { image_ids: [imageId] },
            });
            setImagePreviews((prev) => prev.filter((img) => img.id !== imageId));
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const updatedData = new FormData();

            const baseFields = [
                "name", "description", "address", "phone", "email", "city", "state",
                "zip_code", "google_maps_link", "nearby_colleges", "nearby_markets", "visiting_hours",
                "rent_min", "rent_max", "security_deposit"
            ];

            baseFields.forEach(field => {
                updatedData.append(field, formData[field] || "");
            });

            const boolFields = [
                "wifi", "parking", "laundry", "security_guard", "mess_service",
                "attached_bathroom", "air_conditioning", "heater", "balcony",
                "smoking_allowed", "alcohol_allowed", "pets_allowed"
            ];

            boolFields.forEach(field => {
                updatedData.append(field, formData[field] ? "true" : "false");
            });

            if (formData.cancellation_policy) {
                updatedData.append("cancellation_policy", JSON.stringify(formData.cancellation_policy));
            }

            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((image, index) => {
                    updatedData.append(`images[${index}]`, image);
                });
            }

            await api.put(`/hostel_owner/hostels/${id}/`, updatedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            showNotification("Hostel updated successfully!", "success");
            fetchHostelDetails();
        } catch (error) {
            console.error("Error updating hostel:", error.response?.data || error.message);
            showNotification(`Failed to update: ${JSON.stringify(error.response?.data || error.message)}`, "error");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            try {
                const token = localStorage.getItem('token');
                await api.delete(`/hostel_owner/hostels/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showNotification('Hostel deleted successfully!', 'success');
                navigate('/manage-hostels');
            } catch (error) {
                console.error('Error deleting hostel:', error);
                showNotification('Failed to delete hostel', 'error');
            }
        }
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }, 10);
    };

    if (loading || !formData) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading hostel details...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout manage-hostel-detail">

            <Sidebar />
            <div className="dashboard-main">
                <div className="hostel-edit-container">
                    <div className="hostel-edit-header">
                        <h1>{formData.name}</h1>
                        <div className="action-buttons">
                            <button className="back-button" onClick={() => navigate('/manage-hostels')}>
                                <i className="fas fa-arrow-left"></i> Back to Hostels
                            </button>
                            <button className="delete-button" onClick={handleDelete}>
                                <i className="fas fa-trash"></i> Delete Hostel
                            </button>
                        </div>
                    </div>
                    
                    <div className="edit-form-container">
                        <div className="form-nav">
                            <button 
                                className={activeSection === 'basic' ? 'active' : ''} 
                                onClick={() => setActiveSection('basic')}
                            >
                                Basic Info
                            </button>
                            <button 
                                className={activeSection === 'location' ? 'active' : ''} 
                                onClick={() => setActiveSection('location')}
                            >
                                Location
                            </button>
                            <button 
                                className={activeSection === 'features' ? 'active' : ''} 
                                onClick={() => setActiveSection('features')}
                            >
                                Features
                            </button>
                            <button 
                                className={activeSection === 'pricing' ? 'active' : ''} 
                                onClick={() => setActiveSection('pricing')}
                            >
                                Pricing
                            </button>
                            <button 
                                className={activeSection === 'rules' ? 'active' : ''} 
                                onClick={() => setActiveSection('rules')}
                            >
                                Rules
                            </button>
                            <button 
                                className={activeSection === 'images' ? 'active' : ''} 
                                onClick={() => setActiveSection('images')}
                            >
                                Images
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="hostel-edit-form">
                            {/* Basic Info Section */}
                            <div className={`form-section ${activeSection === 'basic' ? 'active' : ''}`}>

                                <h2>Basic Information</h2>
                                <div className="form-group">
                                    <label>Hostel Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter hostel name"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description || ''} 
                                        onChange={handleChange}
                                        placeholder="Describe your hostel"
                                        rows="5"
                                    ></textarea>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            value={formData.phone || ''} 
                                            onChange={handleChange} 
                                            placeholder="Contact number"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email || ''} 
                                            onChange={handleChange}
                                            placeholder="Contact email"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Visiting Hours</label>
                                    <input 
                                        type="text" 
                                        name="visiting_hours" 
                                        value={formData.visiting_hours || ''} 
                                        onChange={handleChange}
                                        placeholder="e.g., 9:00 AM - 8:00 PM"
                                    />
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className={`form-section ${activeSection === 'location' ? 'active' : ''}`}>

                                <h2>Location Details</h2>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={formData.address || ''} 
                                        onChange={handleChange}
                                        placeholder="Full address"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            value={formData.city || ''} 
                                            onChange={handleChange}
                                            placeholder="City"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>State</label>
                                        <input 
                                            type="text" 
                                            name="state" 
                                            value={formData.state || ''} 
                                            onChange={handleChange}
                                            placeholder="State"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>ZIP Code</label>
                                        <input 
                                            type="text" 
                                            name="zip_code" 
                                            value={formData.zip_code || ''} 
                                            onChange={handleChange}
                                            placeholder="ZIP code"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Google Maps Link</label>
                                    <input 
                                        type="text" 
                                        name="google_maps_link" 
                                        value={formData.google_maps_link || ''} 
                                        onChange={handleChange}
                                        placeholder="Google Maps URL"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Nearby Colleges</label>
                                    <input 
                                        type="text" 
                                        name="nearby_colleges" 
                                        value={formData.nearby_colleges || ''} 
                                        onChange={handleChange}
                                        placeholder="Comma-separated list of nearby colleges"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Nearby Markets</label>
                                    <input 
                                        type="text" 
                                        name="nearby_markets" 
                                        value={formData.nearby_markets || ''} 
                                        onChange={handleChange}
                                        placeholder="Comma-separated list of nearby markets"
                                    />
                                </div>
                            </div>
                            
                            {/* Features Section */}
                            <div className={`form-section ${activeSection === 'features' ? 'active' : ''}`}>

                                <h2>Hostel Features</h2>
                                <div className="features-container">
                                    <div className="features-column">
                                        <h3>Facilities</h3>
                                        <div className="checkbox-group">
                                            {["wifi", "parking", "laundry", "security_guard", "mess_service"].map((key) => (
                                                <label key={key} className="checkbox-label">
                                                    <input 
                                                        type="checkbox" 
                                                        name={key} 
                                                        checked={formData[key] || false} 
                                                        onChange={handleChange} 
                                                    />
                                                    <span className="checkbox-text">
                                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="features-column">
                                        <h3>Room Features</h3>
                                        <div className="checkbox-group">
                                            {["attached_bathroom", "air_conditioning", "heater", "balcony"].map((key) => (
                                                <label key={key} className="checkbox-label">
                                                    <input 
                                                        type="checkbox" 
                                                        name={key} 
                                                        checked={formData[key] || false} 
                                                        onChange={handleChange} 
                                                    />
                                                    <span className="checkbox-text">
                                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className={`form-section ${activeSection === 'pricing' ? 'active' : ''}`}>

                                <h2>Pricing & Policies</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Minimum Rent (₹)</label>
                                        <input 
                                            type="number" 
                                            name="rent_min" 
                                            value={formData.rent_min || ''} 
                                            onChange={handleChange}
                                            placeholder="Minimum rent"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Maximum Rent (₹)</label>
                                        <input 
                                            type="number" 
                                            name="rent_max" 
                                            value={formData.rent_max || ''} 
                                            onChange={handleChange}
                                            placeholder="Maximum rent"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Security Deposit (₹)</label>
                                    <input 
                                        type="number" 
                                        name="security_deposit" 
                                        value={formData.security_deposit || ''} 
                                        onChange={handleChange}
                                        placeholder="Security deposit amount"
                                    />
                                </div>
                                
                                <h3>Cancellation Policy</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Refund Days</label>
                                        <input 
                                            type="number" 
                                            name="full_refund_days" 
                                            value={formData.cancellation_policy?.full_refund_days || ''} 
                                            onChange={handleCancellationChange}
                                            placeholder="Days for full refund"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Partial Refund Days</label>
                                        <input 
                                            type="number" 
                                            name="partial_refund_days" 
                                            value={formData.cancellation_policy?.partial_refund_days || ''} 
                                            onChange={handleCancellationChange}
                                            placeholder="Days for partial refund"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Partial Refund %</label>
                                        <input 
                                            type="number" 
                                            name="partial_refund_percentage" 
                                            value={formData.cancellation_policy?.partial_refund_percentage || ''} 
                                            onChange={handleCancellationChange}
                                            placeholder="Percentage for partial refund"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rules Section */}
                            <div className={`form-section ${activeSection === 'rules' ? 'active' : ''}`}>

                                <h2>Hostel Rules</h2>
                                <div className="rules-container">
                                    {["smoking_allowed", "alcohol_allowed", "pets_allowed"].map((key) => (
                                        <label key={key} className="rule-item">
                                            <input 
                                                type="checkbox" 
                                                name={key} 
                                                checked={formData[key] || false} 
                                                onChange={handleChange} 
                                            />
                                            <div className="rule-label">
                                                <span className="rule-icon">
                                                    {key === "smoking_allowed" && "🚬"}
                                                    {key === "alcohol_allowed" && "🍸"}
                                                    {key === "pets_allowed" && "🐾"}
                                                </span>
                                                <span className="rule-text">
                                                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className={`form-section ${activeSection === 'images' ? 'active' : ''}`}>

                                <h2>Hostel Images</h2>
                                <div className="images-upload-container">
                                    <label className="custom-file-upload">
                                        <input type="file" multiple onChange={handleImageUpload} accept="image/*" />
                                        <i className="fas fa-cloud-upload-alt"></i> Upload Images
                                    </label>
                                    <p className="help-text">Drag and drop images to reorder them. First image will be the main image.</p>
                                </div>
                                
                                <DragDropContext onDragEnd={(result) => {
                                    if (!result.destination) return;
                                    const reordered = Array.from(imagePreviews);
                                    const [moved] = reordered.splice(result.source.index, 1);
                                    reordered.splice(result.destination.index, 0, moved);
                                    setImagePreviews(reordered);
                                }}>
                                    <Droppable droppableId="imagePreviews" direction="horizontal">
                                        {(provided) => (
                                            <div
                                                className="images-gallery"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                {imagePreviews.map((img, index) => (
                                                    <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                className="image-preview-card"
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                }}
                                                            >
                                                                <div className="image-actions">
                                                                    <button 
                                                                        type="button"
                                                                        className="delete-image-btn" 
                                                                        onClick={() => handleImageDelete(img.id)}
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                    <span className="image-order">{index === 0 ? 'Main' : `#${index + 1}`}</span>
                                                                </div>
                                                                <img src={img.image} alt={`Hostel view ${index + 1}`} />
                                                                <div className="drag-handle">
                                                                    <i className="fas fa-grip-lines"></i>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {imagePreviews.length === 0 && (
                                                    <div className="no-images">
                                                        <i className="fas fa-images"></i>
                                                        <p>No images uploaded yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="update-button">
                                    <i className="fas fa-save"></i> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageHostelDetail;