import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/ManageHostels.css';
import { motion } from 'framer-motion'; // Added for animations

const API_BASE_URL = "http://localhost:8000";

const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState([]);
  const navigate = useNavigate();

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
      console.error('Error fetching hostels:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    // Create preview URLs for the selected images
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('facilities.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          [field]: type === 'checkbox' ? checked : value,
        }
      }));
    } else if (name.includes('room_features.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        room_features: {
          ...prev.room_features,
          [field]: type === 'checkbox' ? checked : value,
        }
      }));
    } else if (name.includes('pricing.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value,
        }
      }));
    } else if (name.includes('rules.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rules: {
          ...prev.rules,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();

      const data = new FormData();
      const convertToBoolean = (value) => (value === true || value === "true" ? "true" : "false");
      
      // Basic Details
      data.append('name', formData.name);
      data.append('address', formData.address);
      data.append('description', formData.description);
      data.append('phone', formData.contact_number || 'N/A');
      data.append('email', formData.email || 'N/A');
      data.append('established_year', formData.established_year || new Date().getFullYear());
      data.append('city', formData.city || 'Unknown');
      data.append('state', formData.state || 'Unknown');
      data.append('zip_code', formData.zip || '000000');
      data.append('google_maps_link', formData.googleMapsLink || 'https://maps.google.com');
      data.append('nearby_colleges', formData.nearby_colleges || 'Not Provided');
      data.append('nearby_markets', formData.nearby_markets || 'Not Provided');

      // Facilities
      Object.keys(formData.facilities).forEach(key => {
        data.append(key, convertToBoolean(formData.facilities[key])); 
      });

      // Room Features
      Object.keys(formData.room_features).forEach(key => {
        data.append(key, convertToBoolean(formData.room_features[key]));
      });

      // Pricing
      data.append('rent_min', formData.pricing.minRent || '0');
      data.append('rent_max', formData.pricing.maxRent || '0');
      data.append('security_deposit', formData.pricing.securityDeposit || '0');

      // Rules
      Object.keys(formData.rules).forEach(key => {
        data.append(key, convertToBoolean(formData.rules[key]));
      });

      // Images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          data.append("images", image, image.name);
        });
      }

      // Send Data to API
      const response = await api.post('/hostel_owner/hostels/', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("✅ Response:", response.data);
      fetchHostels();
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      console.error('❌ Error adding hostel:', error.response?.data || error.message);
      alert(`Failed to add hostel: ${JSON.stringify(error.response?.data || error.message)}`);
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



  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <nav className="dashboard-nav">
          <h1>Manage Your Hostels</h1>
          <button className="add-hostel-btn" onClick={() => setShowModal(true)}>
            <span className="btn-icon">➕</span> Add New Hostel
          </button>
        </nav>

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
            
            {hostels.map((hostel) => (
              <motion.div 
                key={hostel.id} 
                className="hostel-card"
                whileHover={{ y: -10, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                onClick={() => navigate(`/manage-hostels/${hostel.id}`)}
              >
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
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-container">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Add New Hostel</h2>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Hostel Name</label>
                      <input type="text" name="name" placeholder="Enter hostel name" value={formData.name} onChange={handleChange} required />
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
                      <input type="text" name="contact_number" placeholder="Enter contact number" value={formData.contact_number} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Location</h3>
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" placeholder="Enter complete address" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Google Maps Link</label>
                    <input type="url" name="googleMapsLink" placeholder="https://maps.google.com/..." value={formData.googleMapsLink} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Nearby Places</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nearby Colleges</label>
                      <input type="text" name="nearby_colleges" placeholder="Enter nearby college names" value={formData.nearby_colleges} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Nearby Markets</label>
                      <input type="text" name="nearby_markets" placeholder="Enter nearby market names" value={formData.nearby_markets} onChange={handleChange} />
                    </div>
                  </div>
                </div>

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
                  <div className="file-upload">
                    <input type="file" multiple onChange={handleImageUpload} accept="image/*" id="hostel-images" className="file-input" />
                    <label htmlFor="hostel-images" className="file-label">
                      <span className="upload-icon">📁</span>
                      Choose Images (Max 10)
                    </label>
                  </div>
                  
                  {previewImages.length > 0 && (
                    <div className="image-previews">
                      {previewImages.map((src, index) => (
                        <div key={index} className="preview-thumbnail">
                          <img src={src} alt={`Preview ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-buttons">
                  <button type="submit" className="add-btn" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Hostel'}
                  </button>
                  <button type="button" className="close-btn" onClick={() => {setShowModal(false); resetForm();}}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHostels;