import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/ManageHostelDetail.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const ManageHostelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [showFacilities, setShowFacilities] = useState(false);
    const [showRoomFeatures, setShowRoomFeatures] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showImages, setShowImages] = useState(false);
    const [showExtraDetails, setShowExtraDetails] = useState(false);
    const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

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

            // Cancellation Policy
            if (formData.cancellation_policy) {
                updatedData.append("cancellation_policy", JSON.stringify(formData.cancellation_policy));
            }

            // New images
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
                const token = localStorage.getItem('token');
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

                            {/* Extra Details */}
                            <h3 onClick={() => setShowExtraDetails(!showExtraDetails)} className="collapsible-header">
                                Additional Info {showExtraDetails ? "🔼" : "🔽"}
                            </h3>
                            {showExtraDetails && (
                                <>
                                    <label>Nearby Colleges:</label>
                                    <input type="text" name="nearby_colleges" value={formData.nearby_colleges || ""} onChange={handleChange} />
                                    <label>Nearby Markets:</label>
                                    <input type="text" name="nearby_markets" value={formData.nearby_markets || ""} onChange={handleChange} />
                                    <label>Visiting Hours:</label>
                                    <input type="text" name="visiting_hours" value={formData.visiting_hours || ""} onChange={handleChange} />
                                </>
                            )}

                            {/* Pricing */}
                            <h3 onClick={() => setShowPricing(!showPricing)} className="collapsible-header">
                                Pricing {showPricing ? "🔼" : "🔽"}
                            </h3>
                            {showPricing && (
                                <>
                                    <input type="number" name="rent_min" value={formData.rent_min} onChange={handleChange} placeholder="Min Rent" />
                                    <input type="number" name="rent_max" value={formData.rent_max} onChange={handleChange} placeholder="Max Rent" />
                                    <input type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} placeholder="Security Deposit" />
                                </>
                            )}

                            {/* Cancellation Policy */}
                            <h3 onClick={() => setShowCancellationPolicy(!showCancellationPolicy)} className="collapsible-header">
                                Cancellation Policy {showCancellationPolicy ? "🔼" : "🔽"}
                            </h3>
                            {showCancellationPolicy && (
                                <>
                                    <input type="number" name="full_refund_days" value={formData.cancellation_policy?.full_refund_days || ""} onChange={handleCancellationChange} placeholder="Full Refund Days" />
                                    <input type="number" name="partial_refund_days" value={formData.cancellation_policy?.partial_refund_days || ""} onChange={handleCancellationChange} placeholder="Partial Refund Days" />
                                    <input type="number" name="partial_refund_percentage" value={formData.cancellation_policy?.partial_refund_percentage || ""} onChange={handleCancellationChange} placeholder="Partial Refund %" />
                                </>
                            )}

                            {/* Rules */}
                            <h3 onClick={() => setShowRules(!showRules)} className="collapsible-header">
                                Rules {showRules ? "🔼" : "🔽"}
                            </h3>
                            {showRules && ["smoking_allowed", "alcohol_allowed", "pets_allowed"].map((key) => (
                                <label key={key}>
                                    <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                    {key.replace("_", " ").toUpperCase()}
                                </label>
                            ))}

                            {/* Facilities */}
                            <h3 onClick={() => setShowFacilities(!showFacilities)} className="collapsible-header">
                                Facilities {showFacilities ? "🔼" : "🔽"}
                            </h3>
                            {showFacilities && ["wifi", "parking", "laundry", "security_guard", "mess_service"].map((key) => (
                                <label key={key}>
                                    <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                    {key.replace("_", " ").toUpperCase()}
                                </label>
                            ))}

                            {/* Room Features */}
                            <h3 onClick={() => setShowRoomFeatures(!showRoomFeatures)} className="collapsible-header">
                                Room Features {showRoomFeatures ? "🔼" : "🔽"}
                            </h3>
                            {showRoomFeatures && ["attached_bathroom", "air_conditioning", "heater", "balcony"].map((key) => (
                                <label key={key}>
                                    <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                                    {key.replace("_", " ").toUpperCase()}
                                </label>
                            ))}

                      {/* Images Section with Drag-and-Drop */}
<h3 onClick={() => setShowImages(!showImages)} className="collapsible-header">
  Images {showImages ? "🔼" : "🔽"}
</h3>
{showImages && (
  <>
    <input type="file" multiple onChange={handleImageUpload} accept="image/*" />

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
            className="existing-images"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
          >
            {imagePreviews.map((img, index) => (
              <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                {(provided) => (
                  <div
                    className="image-preview"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    <img src={img.image} alt="Hostel" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                    <button onClick={() => handleImageDelete(img.id)}>❌</button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </>
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
