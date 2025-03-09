import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/ManageHostelDetail.css';

const ManageHostelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Collapsible Sections State
    const [showFacilities, setShowFacilities] = useState(false);
    const [showRoomFeatures, setShowRoomFeatures] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showImages, setShowImages] = useState(false);

    useEffect(() => {
        fetchHostelDetails();
    }, []);

    const fetchHostelDetails = async () => {
        try {
            let token = localStorage.getItem('token');
            const response = await api.get(`/hostel_owner/hostels/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData(response.data);
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: files,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            let token = localStorage.getItem('token');
            const updatedData = new FormData();

            // Append all required fields
            ["name", "description", "address", "phone", "email", "city", "state", "zip_code", "google_maps_link",
             "rent_min", "rent_max", "security_deposit"].forEach(field => {
                updatedData.append(field, formData[field] || "N/A");
            });

            // Append boolean fields correctly
            ["wifi", "parking", "laundry", "security_guard", "mess_service",
             "attached_bathroom", "air_conditioning", "heater", "balcony",
             "smoking_allowed", "alcohol_allowed", "pets_allowed"].forEach(field => {
                updatedData.append(field, formData[field] ? "true" : "false");
            });

            // Handle image uploads if needed
            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((image, index) => {
                    updatedData.append(`images[${index}]`, image);
                });
            }

            await api.put(`/hostel_owner/hostels/${id}/`, updatedData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            alert("✅ Hostel updated successfully!");
            fetchHostelDetails();
        } catch (error) {
            console.error("❌ Error updating hostel:", error.response?.data || error.message);
            alert(`Failed to update hostel: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            try {
                let token = localStorage.getItem('token');
                await api.delete(`/hostel_owner/hostels/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert('Hostel deleted successfully!');
                navigate('/manage-hostels');
            } catch (error) {
                console.error('Error deleting hostel:', error);
                alert('Failed to delete hostel');
            }
        }
    };

    if (loading || !formData) return <p>Loading...</p>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <div className="hostel-detail-container">
                    
                    {/* ✅ Left Side - Hostel Details */}
                    <div className="hostel-details">
                        <h2>{formData.name}</h2>
                        <p><strong>📍 Address:</strong> {formData.address}</p>
                        <p><strong>📞 Phone:</strong> {formData.phone}</p>
                        <p><strong>📧 Email:</strong> {formData.email}</p>
                        <p><strong>🏙️ City:</strong> {formData.city}</p>
                        <p><strong>🏢 State:</strong> {formData.state}</p>
                        <p><strong>📌 Zip Code:</strong> {formData.zip_code}</p>
                        <p><strong>🗺️ Google Maps:</strong> <a href={formData.google_maps_link} target="_blank">View Location</a></p>
                    </div>

                    {/* ✅ Right Side - Edit Form with Collapsible Sections */}
                    <div className="edit-form">
                        <h2>Edit Hostel</h2>
                        <form onSubmit={handleUpdate}>
                            <label>Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />

                            <label>Address:</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />

                            <label>Phone:</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />

                            <label>Email:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />

                            <label>Description:</label>
                            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

                            {/* 💰 Pricing Section */}
                            <h3 onClick={() => setShowPricing(!showPricing)} className="collapsible-header">
                                Pricing {showPricing ? "🔼" : "🔽"}
                            </h3>
                            {showPricing && (
                                <div className="collapsible-content">
                                    <input type="number" name="rent_min" value={formData.rent_min} onChange={handleChange} />
                                    <input type="number" name="rent_max" value={formData.rent_max} onChange={handleChange} />
                                    <input type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} />
                                </div>
                            )}

                            {/* 🚫 Rules Section */}
                            <h3 onClick={() => setShowRules(!showRules)} className="collapsible-header">
                                Rules {showRules ? "🔼" : "🔽"}
                            </h3>
                            {showRules && (
                                <div className="collapsible-content">
                                    {["smoking_allowed", "alcohol_allowed", "pets_allowed"].map((key) => (
                                        <label key={key}>
                                            <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                            {key.replace("_", " ").toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* 🖼 Images Section */}
                            <h3 onClick={() => setShowImages(!showImages)} className="collapsible-header">
                                Images {showImages ? "🔼" : "🔽"}
                            </h3>
                            {showImages && (
                                <div className="collapsible-content">
                                    <input type="file" multiple onChange={handleImageUpload} accept="image/*" />
                                </div>
                            )}

                             {/* 📍 Location Section */}
                             <h3 onClick={() => setShowLocation(!showLocation)} className="collapsible-header">
                                Location Details {showLocation ? "🔼" : "🔽"}
                            </h3>
                            {showLocation && (
                                <div className="collapsible-content">
                                    {["city", "state", "zip_code", "google_maps_link"].map((key) => (
                                        <input key={key} type="text" name={key} value={formData[key]} onChange={handleChange} />
                                    ))}
                                </div>
                            )}
                            {/* 🏠 Facilities Section */}
                            <h3 onClick={() => setShowFacilities(!showFacilities)} className="collapsible-header">
                                Facilities {showFacilities ? "🔼" : "🔽"}
                            </h3>
                            {showFacilities && (
                                <div className="collapsible-content">
                                    {["wifi", "parking", "laundry", "security_guard", "mess_service"].map((key) => (
                                        <label key={key}>
                                            <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                            {key.replace("_", " ").toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* 🏡 Room Features Section */}
                            <h3 onClick={() => setShowRoomFeatures(!showRoomFeatures)} className="collapsible-header">
                                Room Features {showRoomFeatures ? "🔼" : "🔽"}
                            </h3>
                            {showRoomFeatures && (
                                <div className="collapsible-content">
                                    {["attached_bathroom", "air_conditioning", "heater", "balcony"].map((key) => (
                                        <label key={key}>
                                            <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                            {key.replace("_", " ").toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            )}




                            <button type="submit" className="update-btn">Update Hostel</button>
                        </form>

                        <button className="delete-btn" onClick={handleDelete}>Delete Hostel</button>
                        <button className="back-btn" onClick={() => navigate('/manage-hostels')}>Back</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ManageHostelDetail;
