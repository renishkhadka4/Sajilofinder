import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Hostels.css";
import Navbar from "../components/Navbar";
import { Star, MapPin, User, Wifi, Coffee, Shield, Search, Calendar, X } from "lucide-react";


const Hostels = () => {
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

 
  
  useEffect(() => {
    const fetchHostels = async () => {
      setLoading(true);
      try {
        const response = await api.get("/hostel_owner/hostels/");
        setHostels(response.data);
        setFilteredHostels(response.data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    // Apply filters whenever filter criteria change
    let results = hostels;
    
    // Category filter
    if (filter !== "all") {
      results = results.filter(hostel => 
        hostel.category?.toLowerCase() === filter.toLowerCase()
      );
    }
    
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        hostel => 
          hostel.name.toLowerCase().includes(term) || 
          hostel.address.toLowerCase().includes(term) ||
          hostel.owner.toLowerCase().includes(term)
      );
    }
    
    // Date availability filter
    if (checkInDate && checkOutDate) {
      // In a real application, you would check availability against the backend
      // Here we're simulating this by filtering based on a theoretical availability field
      results = results.filter(hostel => hostel.has_vacancy);
    }
  
    setFilteredHostels(results);
  }, [hostels, filter, searchTerm, checkInDate, checkOutDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is handled by the useEffect above
  };
  
  
  const clearFilters = () => {
    setSearchTerm("");
    setCheckInDate("");
    setCheckOutDate("");
    setFilter("all");
    setShowDatePicker(false);
  };
  
  const renderStarRating = (rating) => {
    // Handle cases where rating isn't provided in the data
    const ratingValue = rating || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            size={16} 
            className={`star-icon ${
              i < fullStars 
                ? "filled" 
                : i === fullStars && hasHalfStar 
                  ? "half-filled" 
                  : "empty"
            }`} 
          />
        ))}
        <span className="rating-value">{ratingValue.toFixed(1)}</span>
      </div>
    );
  };
  

  const renderAmenities = (hostel) => {
    const amenities = [];
    if (hostel.has_wifi) amenities.push(<Wifi size={16} className="amenity-icon" key="wifi" title="WiFi Available" />);
    if (hostel.has_breakfast) amenities.push(<Coffee size={16} className="amenity-icon" key="breakfast" title="Breakfast Included" />);
    if (hostel.has_security) amenities.push(<Shield size={16} className="amenity-icon" key="security" title="24/7 Security" />);
    
    return amenities.length > 0 ? (
      <div className="amenities-container">{amenities}</div>
    ) : null;
  };
  

  return (
    <div className="hostels-page">
      <Navbar />
      <div className="hostels-hero">
        <h1>Find Your Perfect Hostel</h1>
        <p>Discover comfortable and affordable accommodations for your stay</p>
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, location, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="date-picker-group">
            <button 
              type="button" 
              className="date-picker-toggle"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar size={20} className="calendar-icon" />
              {checkInDate && checkOutDate 
                ? `${new Date(checkInDate).toLocaleDateString()} - ${new Date(checkOutDate).toLocaleDateString()}`
                : "Select Dates"}
            </button>
            
            {showDatePicker && (
              <div className="date-picker-dropdown" ref={datePickerRef}>

                <div className="date-picker-inputs">
                  <div className="date-input-group">
                    <label htmlFor="check-in">Check-in:</label>
                    <input
                      type="date"
                      id="check-in"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="date-input-group">
                    <label htmlFor="check-out">Check-out:</label>
                    <input
                      type="date"
                      id="check-out"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button type="submit" className="search-button">Search</button>
          
          {(searchTerm || checkInDate || checkOutDate || filter !== "all") && (
            <button type="button" className="clear-filters-button" onClick={clearFilters}>
              <X size={16} />
              Clear Filters
            </button>
          )}
        </form>
      </div>
      
      <div className="hostels-container">
        <div className="filters-container">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            All Hostels
          </button>
          <button 
            className={`filter-btn ${filter === 'boys' ? 'active' : ''}`} 
            onClick={() => setFilter('boys')}
          >
            Boys Only
          </button>
          <button 
            className={`filter-btn ${filter === 'girls' ? 'active' : ''}`} 
            onClick={() => setFilter('girls')}
          >
            Girls Only
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading available hostels...</p>
          </div>
        ) : filteredHostels.length === 0 ? (
          <div className="no-results">
            <p>No hostels found matching your criteria</p>
            <button className="reset-search-btn" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">{filteredHostels.length} hostel{filteredHostels.length !== 1 ? 's' : ''} found</p>
            <div className="hostel-grid">
              {filteredHostels.map((hostel) => (
                <div key={hostel.id} className="hostel-card">
                  <Link to={`/hostel/${hostel.id}`} className="hostel-link">
                    <div className="hostel-image-container">
                      <img
                        src={hostel.images && hostel.images.length > 0 ? hostel.images[0].image : "/images/placeholder-hostel.jpg"}
                        alt={hostel.name}
                        className="hostel-image"
                      />
                      {hostel.is_featured && <span className="featured-badge">Featured</span>}
                      {checkInDate && checkOutDate && hostel.has_vacancy && (
                        <span className="available-badge">Available</span>
                      )}
                    </div>
                    
                    <div className="hostel-details">
                      <div className="hostel-header">
                        <h3 className="hostel-name">{hostel.name}</h3>
                        {renderStarRating(hostel.rating)}
                      </div>
                      
                      <div className="hostel-location">
                        <MapPin size={16} className="location-icon" />
                        <span>{hostel.address}</span>
                      </div>
                      
                      <div className="hostel-owner">
                        <User size={16} className="owner-icon" />
                        <span>{hostel.owner}</span>
                      </div>
                      
                      {renderAmenities(hostel)}
                      
                      <div className="hostel-footer">
                        <span className="hostel-price">₹{hostel.price || "5,000"}<span className="price-period">/month</span></span>
                        <span className={`vacancy-status ${hostel.has_vacancy ? 'available' : 'full'}`}>
                          {hostel.has_vacancy ? "Vacancies Available" : "Full"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Hostels;

