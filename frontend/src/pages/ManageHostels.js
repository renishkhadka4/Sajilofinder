import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import imageCompression from 'browser-image-compression';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/ManageHostels.css';

const API_BASE_URL = "http://localhost:8000";

const ManageHostels = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formValidation, setFormValidation] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    contact_number: '',
    email: '',
    established_year: new Date().getFullYear(),
    city: '',
    state: '',
    zip: '',
    googleMapsLink: '',
    nearby_colleges: '',
    nearby_markets: '',
    cancellation_policy: {
      full_refund_days: '',
      partial_refund_days: '',
      partial_refund_percentage: '',
    },
    facilities: {
      wifi: false,
      parking: false,
      laundry: false,
      security_guard: false,
      mess_service: false,
    },
    room_features: {
      attached_bathroom: false,
      air_conditioning: false,
      heater: false,
      balcony: false,
    },
    pricing: {
      minRent: '',
      maxRent: '',
      securityDeposit: '',
    },
    rules: {
      smoking_allowed: false,
      alcohol_allowed: false,
      pets_allowed: false,
      visiting_hours: false,
    },
    images: []
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    validateCurrentStep();
  }, [formData, currentStep]);

  const validateCurrentStep = () => {
    let isValid = false;
    
    switch(currentStep) {
      case 1:
        isValid = formData.name.trim() !== '' && 
                 formData.description.trim() !== '';
        break;
      case 2:
        isValid = formData.address.trim() !== '' && 
                 formData.city.trim() !== '' && 
                 formData.state.trim() !== '' && 
                 formData.zip.trim() !== '';
        break;
      case 3:
        isValid = formData.pricing.minRent.toString().trim() !== '' && 
                 formData.pricing.maxRent.toString().trim() !== '';
        break;
      case 4:
        isValid = true; // Facilities and rules are optional
        break;
      default:
        isValid = false;
    }
    
    setFormValidation(prev => ({
      ...prev,
      [`step${currentStep}`]: isValid
    }));
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

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();
      const response = await api.get('/hostel_owner/hostels/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHostels(response.data);
    } catch (error) {
      toast.error("Error fetching hostels");
      console.error('Error fetching hostels:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const compressAndPreviewImages = async (files) => {
    const compressedFiles = [];
    const previews = [];
    try {
      for (let file of files) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        compressedFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      }
      setFormData((prev) => ({ ...prev, images: compressedFiles }));
      setPreviewImages(previews);
    } catch (error) {
      toast.error("Error processing images");
      console.error('Error compressing images:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error("Maximum 10 images allowed.");
      return;
    }
    compressAndPreviewImages(files);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const reordered = Array.from(formData.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFormData((prev) => ({ ...prev, images: reordered }));
    
    const reorderedPreviews = Array.from(previewImages);
    const [movedPreview] = reorderedPreviews.splice(result.source.index, 1);
    reorderedPreviews.splice(result.destination.index, 0, movedPreview);
    setPreviewImages(reorderedPreviews);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hostel?")) return;
    
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();
      
      await api.delete(`/hostel_owner/hostels/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Hostel deleted successfully!");
      fetchHostels();
    } catch (error) {
      toast.error("Failed to delete hostel");
      console.error('Error deleting hostel:', error.response?.data || error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      description: '',
      contact_number: '',
      email: '',
      established_year: new Date().getFullYear(),
      city: '',
      state: '',
      zip: '',
      googleMapsLink: '',
      nearby_colleges: '',
      nearby_markets: '',
      cancellation_policy: {
        full_refund_days: '',
        partial_refund_days: '',
        partial_refund_percentage: '',
      },
      facilities: {
        wifi: false,
        parking: false,
        laundry: false,
        security_guard: false,
        mess_service: false,
      },
      room_features: {
        attached_bathroom: false,
        air_conditioning: false,
        heater: false,
        balcony: false,
      },
      pricing: {
        minRent: '',
        maxRent: '',
        securityDeposit: '',
      },
      rules: {
        smoking_allowed: false,
        alcohol_allowed: false,
        pets_allowed: false,
        visiting_hours: false,
      },
      images: []
    });
    setPreviewImages([]);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();

      const data = new FormData();
      const boolToStr = val => (val === true || val === 'true') ? 'true' : 'false';

      // Basic fields
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('description', formData.description);
      data.append('phone', formData.contact_number);
      data.append('email', formData.email);
      data.append('established_year', formData.established_year);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('zip_code', formData.zip);
      data.append('google_maps_link', formData.googleMapsLink);
      data.append('nearby_colleges', formData.nearby_colleges);
      data.append('nearby_markets', formData.nearby_markets);

      // Facilities, Features, Rules
      Object.entries(formData.facilities).forEach(([k, v]) => data.append(k, boolToStr(v)));
      Object.entries(formData.room_features).forEach(([k, v]) => data.append(k, boolToStr(v)));
      Object.entries(formData.rules).forEach(([k, v]) => data.append(k, boolToStr(v)));

      // Pricing
      data.append('rent_min', formData.pricing.minRent);
      data.append('rent_max', formData.pricing.maxRent);
      data.append('security_deposit', formData.pricing.securityDeposit);

      // Cancellation Policy (JSON)
      data.append('cancellation_policy', JSON.stringify(formData.cancellation_policy));

      // Images
      formData.images.forEach((img) => data.append('images', img));

      await api.post('/hostel_owner/hostels/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("✅ Hostel added successfully!");
      setShowModal(false);
      resetForm();
      fetchHostels();

    } catch (error) {
      toast.error("❌ Failed to add hostel");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the number of facilities for a hostel
  const getFacilitiesCount = (hostel) => {
    if (!hostel) return 0;
    
    // Count all true/enabled facilities
    let count = 0;
    
    // Common facility properties in the API response
    const facilityProperties = [
      'wifi', 'parking', 'laundry', 'security_guard', 'mess_service',
      'attached_bathroom', 'air_conditioning', 'heater', 'balcony'
    ];
    
    facilityProperties.forEach(prop => {
      if (hostel[prop] === true || hostel[prop] === 'true') {
        count++;
      }
    });
    
    return count;
  };

  // Form steps components
  const renderFormStep1 = () => (
    <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Hostel Name</label>
            <input name="name" placeholder="Enter hostel name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Established Year</label>
            <input type="number" name="established_year" placeholder="YYYY" value={formData.established_year} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" placeholder="Write a detailed description of your hostel" value={formData.description} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-section">
        <h3>Contact Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Phone Number</label>
            <input name="contact_number" placeholder="Phone" value={formData.contact_number} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep2 = () => (
    <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
      <div className="form-section">
        <h3>Location</h3>
        <div className="form-group">
          <label>Address</label>
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>City</label>
            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>State</label>
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input name="zip" placeholder="ZIP Code" value={formData.zip} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Google Maps Link</label>
          <input name="googleMapsLink" placeholder="Google Maps Link" value={formData.googleMapsLink} onChange={handleChange} />
        </div>
      </div>

      <div className="form-section">
        <h3>Nearby Places</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nearby Colleges</label>
            <input name="nearby_colleges" placeholder="Enter nearby college names" value={formData.nearby_colleges} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Nearby Markets</label>
            <input name="nearby_markets" placeholder="Enter nearby market names" value={formData.nearby_markets} onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep3 = () => (
    <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
      <div className="form-section">
        <h3>Pricing</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Minimum Rent (₹)</label>
            <input type="number" name="pricing.minRent" placeholder="0" value={formData.pricing.minRent} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Maximum Rent (₹)</label>
            <input type="number" name="pricing.maxRent" placeholder="0" value={formData.pricing.maxRent} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Security Deposit (₹)</label>
            <input type="number" name="pricing.securityDeposit" placeholder="0" value={formData.pricing.securityDeposit} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Cancellation Policy</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Refund Days</label>
            <input 
              name="cancellation_policy.full_refund_days" 
              placeholder="Full Refund Days"
              value={formData.cancellation_policy.full_refund_days}
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Partial Refund Days</label>
            <input 
              name="cancellation_policy.partial_refund_days" 
              placeholder="Partial Refund Days"
              value={formData.cancellation_policy.partial_refund_days}
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Partial Refund Percentage</label>
            <input 
              name="cancellation_policy.partial_refund_percentage" 
              placeholder="Partial Refund %"
              value={formData.cancellation_policy.partial_refund_percentage}
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFormStep4 = () => (
    <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
      <div className="form-section">
        <h3>Facilities</h3>
        <div className="checkbox-grid">
          {Object.keys(formData.facilities).map((key) => (
            <label key={key} className="checkbox-label">
              <input 
                type="checkbox" 
                name={`facilities.${key}`} 
                checked={formData.facilities[key]} 
                onChange={handleChange} 
              />
              <span className="checkbox-text">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Room Features</h3>
        <div className="checkbox-grid">
          {Object.keys(formData.room_features).map((key) => (
            <label key={key} className="checkbox-label">
              <input 
                type="checkbox" 
                name={`room_features.${key}`} 
                checked={formData.room_features[key]} 
                onChange={handleChange} 
              />
              <span className="checkbox-text">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Rules</h3>
        <div className="checkbox-grid">
          {Object.keys(formData.rules).map((key) => (
            <label key={key} className="checkbox-label">
              <input 
                type="checkbox" 
                name={`rules.${key}`} 
                checked={formData.rules[key]} 
                onChange={handleChange} 
              />
              <span className="checkbox-text">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Upload Images</h3>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} />

        {previewImages.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  className="image-preview-row"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {previewImages.map((src, index) => (
                    <Draggable key={index} draggableId={`img-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <img
                            src={src}
                            alt={`Preview ${index}`}
                            className="preview-thumbnail"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <ToastContainer position="top-right" />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Manage Hostels</h1>
          <button className="add-btn" onClick={() => setShowModal(true)}>➕ Add Hostel</button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading hostels...</p>
          </div>
        ) : hostels.length === 0 ? (
          <div className="empty-state">
            <img src="/empty-state.svg" alt="No hostels" className="empty-state-image" />
            <h2>No Hostels Found</h2>
            <p>You haven't added any hostels yet. Click the 'Add New Hostel' button to get started.</p>
          </div>
        ) : (
          <div className="hostels-grid">
            {hostels.map((hostel, index) => (
              <motion.div 
                key={hostel.id} 
                className="hostel-card"
                style={{"--index": index}}
                whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                {hostel.isNew && <span className="new-badge">New</span>}
                <img
                  src={hostel.images?.[0]?.image || '/placeholder.png'}
                  alt={hostel.name}
                  className="hostel-image"
                  onError={(e) => { e.target.src = "/placeholder.png"; }}
                />
                <h3>{hostel.name}</h3>
                <p><span>📍 Location:</span> {hostel.address || "N/A"}</p>
                <p><span>🏠 Owned by:</span> {hostel.owner || "You"}</p>
                <div className="hostel-stats">
                  <div className="stat">
                    <span className="stat-value">₹{hostel.rent_min !== undefined ? hostel.rent_min : 'N/A'}</span>
                    <span className="stat-label">Min Rent</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{getFacilitiesCount(hostel)}</span>
                    <span className="stat-label">Facilities</span>
                  </div>
                </div>
                <div className="hostel-card-actions">
                  <button onClick={() => navigate(`/manage-hostels/${hostel.id}`)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(hostel.id)}>🗑 Delete</button>
                  <button onClick={() => navigate(`/manage-rooms/${hostel.id}`)}> Add Floors & Rooms </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal">
            <motion.form onSubmit={handleSubmit}
              className="modal-form"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Add New Hostel</h2>
              
              {/* Stepper */}
              <div className="stepper">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                  <div className="step-label">Basic Info</div>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                  <div className="step-label">Location</div>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="step-number">{currentStep > 3 ? '✓' : '3'}</div>
                  <div className="step-label">Pricing</div>
                </div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                  <div className="step-number">4</div>
                  <div className="step-label">Amenities & Images</div>
                </div>
              </div>

              {/* Form Steps */}
              {renderFormStep1()}
              {renderFormStep2()}
              {renderFormStep3()}
              {renderFormStep4()}

              {/* Navigation Buttons */}
              <div className="stepper-navigation">
                {currentStep > 1 && (
                  <button type="button" className="prev-btn" onClick={prevStep}>
                    Previous
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    className="next-btn" 
                    onClick={nextStep}
                    disabled={!formValidation[`step${currentStep}`]}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Hostel'}
                  </button>
                )}
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHostels;