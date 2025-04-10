import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import Sidebar from '../pages/Sidebar';
import '../styles/DetailsHostels.css';

// Fix for Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const HostelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  
  // Default coordinates for fallback (you can set this to your city's center coordinates)
  const defaultCoordinates = [28.6139, 77.2090]; // Delhi, India - change as needed

  useEffect(() => {
    fetchHostelDetails();
  }, [id]);

  useEffect(() => {
    if (hostel && showMap) {
      if (hostel.latitude && hostel.longitude) {
        // Use coordinates from database if available
        setMapCoordinates([parseFloat(hostel.latitude), parseFloat(hostel.longitude)]);
      } else {
        // Try to geocode the address
        geocodeAddress();
      }
    }
  }, [hostel, showMap]);
  useEffect(() => {
    if (!hostel || !showMap) return;
  
    if (hostel.latitude && hostel.longitude) {
      setMapCoordinates([parseFloat(hostel.latitude), parseFloat(hostel.longitude)]);
    } else {
      geocodeAddress(); // fallback to address or Google link
    }
  }, [hostel, showMap]);
  
  
  
  const geocodeAddress = async () => {
    if (!hostel) return;
    
    setIsMapLoading(true);
    try {
      // Create a full address string
      const addressString = `${hostel.address}, ${hostel.city}, ${hostel.state}, ${hostel.zip_code}`;
      
      // Try OpenStreetMap Nominatim API first
      const query = encodeURIComponent(addressString);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setMapCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setIsMapLoading(false);
        return;
      }
      
      // If Nominatim fails, try extracting coordinates from Google Maps link if available
      if (hostel.google_maps_link) {
        const coordinates = extractCoordinatesFromGoogleMapsLink(hostel.google_maps_link);
        if (coordinates) {
          setMapCoordinates(coordinates);
          setIsMapLoading(false);
          return;
        }
      }
      
      // If both methods fail, use default coordinates with a marker at the approximate location
      setMapCoordinates(defaultCoordinates);
      setIsMapLoading(false);
      toast.info("Using approximate location. For precise location, please update coordinates in hostel settings.");
      
    } catch (error) {
      console.error('Error geocoding address:', error);
      setMapCoordinates(defaultCoordinates);
      setIsMapLoading(false);
      toast.error("Unable to get precise location coordinates. Using approximate location.");
    }
  };

  // Function to extract coordinates from Google Maps link if possible
  const extractCoordinatesFromGoogleMapsLink = (link) => {
    try {
      // Try to extract coordinates from format like: https://www.google.com/maps?q=28.6139,77.2090
      const regex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match = link.match(regex);
      
      if (match && match.length >= 3) {
        return [parseFloat(match[1]), parseFloat(match[2])];
      }
      
      // Try to extract from format like: https://www.google.com/maps/@28.6139,77.2090,15z
      const regex2 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const match2 = link.match(regex2);
      
      if (match2 && match2.length >= 3) {
        return [parseFloat(match2[1]), parseFloat(match2[2])];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting coordinates from Google Maps link:', error);
      return null;
    }
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

  const fetchHostelDetails = async () => {
    setIsLoading(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) token = await refreshAccessToken();
      
      const response = await api.get(`/hostel_owner/hostels/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHostel(response.data);
    } catch (error) {
      toast.error("Error fetching hostel details");
      console.error('Error fetching hostel details:', error.response?.data || error.message);
      navigate('/manage-hostels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMap = () => {
    if (!showMap) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  };

  // Other existing functions (getFacilitiesList, getRoomFeaturesList, getRulesList)
  const getFacilitiesList = () => {
    if (!hostel) return [];
    
    const facilityProperties = [
      { key: 'wifi', label: 'WiFi' },
      { key: 'parking', label: 'Parking' },
      { key: 'laundry', label: 'Laundry' },
      { key: 'security_guard', label: 'Security Guard' },
      { key: 'mess_service', label: 'Mess Service' }
    ];
    
    return facilityProperties.filter(facility => 
      hostel[facility.key] === true || hostel[facility.key] === 'true'
    ).map(facility => facility.label);
  };
  
  const getRoomFeaturesList = () => {
    if (!hostel) return [];
    
    const featureProperties = [
      { key: 'attached_bathroom', label: 'Attached Bathroom' },
      { key: 'air_conditioning', label: 'Air Conditioning' },
      { key: 'heater', label: 'Heater' },
      { key: 'balcony', label: 'Balcony' }
    ];
    
    return featureProperties.filter(feature => 
      hostel[feature.key] === true || hostel[feature.key] === 'true'
    ).map(feature => feature.label);
  };
  
  const getRulesList = () => {
    if (!hostel) return [];
    
    const ruleProperties = [
      { key: 'smoking_allowed', label: 'Smoking Allowed' },
      { key: 'alcohol_allowed', label: 'Alcohol Allowed' },
      { key: 'pets_allowed', label: 'Pets Allowed' },
      { key: 'visiting_hours', label: 'Visiting Hours Restrictions' }
    ];
    
    return ruleProperties.filter(rule => 
      hostel[rule.key] === true || hostel[rule.key] === 'true'
    ).map(rule => rule.label);
  };

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading hostel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <div className="empty-state">
            <h2>Hostel Not Found</h2>
            <p>The hostel you are looking for does not exist or you don't have permission to view it.</p>
            <button className="back-btn" onClick={() => navigate('/manage-hostels')}>
              ← Go Back to Hostels
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    'boys': 'Boys Hostel',
    'girls': 'Girls Hostel',
    'mixed': 'Mixed Hostel'
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <ToastContainer position="top-right" />
      <div className="dashboard-main hostel-details-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/manage-hostels')}>
            ← Back to Hostels
          </button>
          <div className="header-actions">
  <button
    onClick={() => navigate(`/manage-hostels/${hostel.id}`)}
    style={{ color: '#000' }} // 👈 Add this
  >
    ✏️ Edit
  </button>
  <button
    onClick={() => navigate(`/manage-rooms/${hostel.id}`)}
    style={{ color: '#000' }} // 👈 And here
  >
    🏠 Manage Rooms
  </button>
</div>

        </div>
        
        <div className="hostel-details-container">
          <div className="hostel-details-gallery">
            <div className="main-image-container">
              {hostel.images && hostel.images.length > 0 ? (
                <img 
                  src={hostel.images[activeImageIndex]?.image} 
                  alt={`${hostel.name} - Main view`} 
                  className="main-image"
                  onError={(e) => { e.target.src = "/placeholder.png"; }}
                />
              ) : (
                <img src="/placeholder.png" alt="No image available" className="main-image" />
              )}
            </div>
            
            {hostel.images && hostel.images.length > 1 && (
              <div className="thumbnail-gallery">
                {hostel.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.image}
                    alt={`${hostel.name} - Image ${index + 1}`}
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="hostel-details-content">
            <div className="hostel-details-header">
              <h1>{hostel.name}</h1>
              <div className="hostel-category-badge">
                {categoryLabels[hostel.category] || 'Hostel'}
              </div>
            </div>
            
            <div className="hostel-location">
              <p className="location-text">📍 {hostel.address}, {hostel.city}, {hostel.state} - {hostel.zip_code}</p>
              <div className="location-actions">
                {hostel.google_maps_link && (
                  <a href={hostel.google_maps_link} target="_blank" rel="noopener noreferrer" className="map-link-btn">
                    <span className="map-icon">🗺️</span> View on Google Maps
                  </a>
                )}
                <button 
                  className="map-toggle-btn"
                  onClick={handleToggleMap}
                >
                  <span className="map-icon">{showMap ? '🔍' : '🔍'}</span>
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>
              
              {showMap && (
                <>
                  {isMapLoading ? (
                    <div className="map-loading">
                      <div className="map-loading-spinner"></div>
                      <p>Loading map...</p>
                    </div>
                  ) : mapCoordinates ? (
                    <div className="hostel-map-container">
                    <MapContainer
  center={mapCoordinates}
  zoom={15}
  style={{ height: "400px", width: "100%", borderRadius: "8px", marginTop: "10px" }}
  whenCreated={(mapInstance) => {
    mapRef.current = mapInstance;
    setTimeout(() => {
      mapInstance.invalidateSize(); // 🔥 Key to force Leaflet to calculate dimensions
    }, 300); // Delay ensures container is fully rendered
  }}
>


                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={mapCoordinates}>
                          <Popup>
                            <strong>{hostel.name}</strong><br />
                            {hostel.address}, {hostel.city}<br />
                            {hostel.state} - {hostel.zip_code}
                          </Popup>
                        </Marker>
                      </MapContainer>
                      
                      {mapCoordinates === defaultCoordinates && (
                        <div className="map-disclaimer">
                          <p><strong>Note:</strong> This is an approximate location. For exact directions, please use Google Maps.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="map-error">
                      <p>Unable to display map. Please check the address or use Google Maps for directions.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="hostel-price-section">
              <div className="price-range">
                <h2>Price Range</h2>
                <div className="price-details">
                  <div className="price-item">
                    <span className="price-label">Min Rent:</span>
                    <span className="price-value">{hostel.rent_min}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Max Rent:</span>
                    <span className="price-value">{hostel.rent_max}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Security Deposit:</span>
                    <span className="price-value">{hostel.security_deposit || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rest of the component remains the same */}
            <div className="hostel-description">
              <h2>About this Hostel</h2>
              <p>{hostel.description}</p>
            </div>
            
            <div className="hostel-details-grid">
              <div className="details-section">
                <h2>Contact Information</h2>
                <ul className="details-list">
                  <li><strong>Phone:</strong> {hostel.phone || 'N/A'}</li>
                  <li><strong>Email:</strong> {hostel.email || 'N/A'}</li>
                  <li><strong>Established:</strong> {hostel.established_year || 'N/A'}</li>
                </ul>
              </div>
              
              <div className="details-section">
                <h2>Nearby Places</h2>
                <ul className="details-list">
                  <li><strong>Colleges:</strong> {hostel.nearby_colleges || 'N/A'}</li>
                  <li><strong>Markets:</strong> {hostel.nearby_markets || 'N/A'}</li>
                </ul>
              </div>
            </div>
            
            <div className="hostel-amenities">
              <h2>Facilities & Features</h2>
              <div className="amenities-grid">
                <div className="amenities-section">
                  <h3>Facilities</h3>
                  <ul className="amenities-list">
                    {getFacilitiesList().length > 0 ? (
                      getFacilitiesList().map((facility, index) => (
                        <li key={index} className="amenity-item">
                          <span className="check-mark">✓</span> {facility}
                        </li>
                      ))
                    ) : (
                      <li>No facilities listed</li>
                    )}
                  </ul>
                </div>
                
                <div className="amenities-section">
                  <h3>Room Features</h3>
                  <ul className="amenities-list">
                    {getRoomFeaturesList().length > 0 ? (
                      getRoomFeaturesList().map((feature, index) => (
                        <li key={index} className="amenity-item">
                          <span className="check-mark">✓</span> {feature}
                        </li>
                      ))
                    ) : (
                      <li>No features listed</li>
                    )}
                  </ul>
                </div>
                
                <div className="amenities-section">
                  <h3>Rules</h3>
                  <ul className="amenities-list">
                    {getRulesList().length > 0 ? (
                      getRulesList().map((rule, index) => (
                        <li key={index} className="amenity-item">
                          <span className="check-mark">✓</span> {rule}
                        </li>
                      ))
                    ) : (
                      <li>No rules specified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="cancellation-policy">
              <h2>Cancellation Policy</h2>
              {hostel.cancellation_policy ? (
                <ul className="policy-list">
                  {hostel.cancellation_policy.full_refund_days && (
                    <li><strong>Full Refund:</strong> {hostel.cancellation_policy.full_refund_days} days before check-in</li>
                  )}
                  {hostel.cancellation_policy.partial_refund_days && (
                    <li><strong>Partial Refund ({hostel.cancellation_policy.partial_refund_percentage}%):</strong> {hostel.cancellation_policy.partial_refund_days} days before check-in</li>
                  )}
                </ul>
              ) : (
                <p>No cancellation policy specified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetailsPage;
