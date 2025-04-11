import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Hostels.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Star, 
  MapPin, 
  User, 
  Wifi, 
  Coffee, 
  Shield, 
  Search, 
  Calendar, 
  X,
  ChevronDown,
  Filter,
  Clock
} from "lucide-react";

const Hostels = () => {
  const [hostels, setHostels] = useState([]);
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sortBy, setSortBy] = useState("recommended");
  const datePickerRef = useRef(null);
  const filterPanelRef = useRef(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchHostels = async () => {
      setLoading(true);
      try {
        const response = await api.get("/hostel_owner/all-hostels/");
        console.log("Fetched hostels:", response.data.length); // Debug: Log the number of hostels fetched
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
    let results = [...hostels]; // Create a copy to avoid mutating the original
    console.log("Starting filter with", results.length, "hostels"); // Debug
    
    // Category filter
    if (filter !== "all") {
      results = results.filter(hostel => {
        const hostelCategory = hostel.category?.toLowerCase() || "";
        return hostelCategory === filter.toLowerCase();
      });
      console.log("After category filter:", results.length); // Debug
    }
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        hostel => 
          (hostel.name?.toLowerCase() || "").includes(term) || 
          (hostel.address?.toLowerCase() || "").includes(term) ||
          (hostel.owner?.toLowerCase() || "").includes(term)
      );
      console.log("After search filter:", results.length); // Debug
    }
    
    // Price range filter - Fixed to handle different price formats
    results = results.filter(hostel => {
      // First, attempt to get numeric price from rent_max
      let price = null;
      
      if (hostel.rent_max !== undefined && hostel.rent_max !== null) {
        // If rent_max exists and is a number, use it
        price = parseFloat(hostel.rent_max);
      } else if (hostel.price) {
        // If price exists, extract numeric value
        const priceString = hostel.price.toString().replace(/[^\d]/g, '');
        price = parseFloat(priceString);
      }
      
      // Default to 0 if price is NaN or null
      if (isNaN(price) || price === null) {
        price = 0;
      }
      
      return price >= priceRange[0] && (priceRange[1] === 20000 || price <= priceRange[1]);
    });
    console.log("After price filter:", results.length); // Debug
    
    // Sort results
    switch(sortBy) {
      case "price-low":
        results.sort((a, b) => {
          const priceA = getPriceValue(a);
          const priceB = getPriceValue(b);
          return priceA - priceB;
        });
        break;
      case "price-high":
        results.sort((a, b) => {
          const priceA = getPriceValue(a);
          const priceB = getPriceValue(b);
          return priceB - priceA;
        });
        break;
      case "rating":
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // "recommended" - No specific sort, server's default order
        break;
    }
  
    setFilteredHostels(results);
    console.log("Final filtered hostels:", results.length); // Debug
  }, [hostels, filter, searchTerm, checkInDate, checkOutDate, priceRange, sortBy]);

  // Helper function to extract price value from a hostel object
  const getPriceValue = (hostel) => {
    if (hostel.rent_max !== undefined && hostel.rent_max !== null) {
      return parseFloat(hostel.rent_max);
    } else if (hostel.price) {
      // Handle string price format (e.g., "Rs5000")
      const priceString = hostel.price.toString().replace(/[^\d]/g, '');
      return parseFloat(priceString) || 0;
    }
    return 0; // Default value
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is handled by the useEffect above
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setCheckInDate("");
    setCheckOutDate("");
    setFilter("all");
    setPriceRange([0, 20000]);
    setSortBy("recommended");
    setShowDatePicker(false);
    setShowMobileFilters(false);
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
      <div className="amenities-container">
        {amenities}
        {amenities.length > 0 && (
          <span className="amenities-label">{amenities.length} amenities</span>
        )}
      </div>
    ) : null;
  };
  
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "Price on request";
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) return price;
    
    return `Rs${priceValue}`;
  };

  return (
    <div className="hostels-page">
      <Navbar />
      
      <div className="hostels-hero">
        <div className="hero-content">
          <h1>Find Your Perfect Hostel</h1>
          <p>Discover comfortable and affordable accommodations for your stay</p>
        </div>
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
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
              <Calendar size={18} className="calendar-icon" />
              <span className="date-label">
                {checkInDate && checkOutDate 
                  ? `${new Date(checkInDate).toLocaleDateString()} - ${new Date(checkOutDate).toLocaleDateString()}`
                  : "Select Dates"}
              </span>
              <ChevronDown size={16} className="dropdown-icon" />
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
                  <div className="date-actions">
                    <button 
                      type="button" 
                      className="date-close-btn"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            className="filter-toggle-btn"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          
          <button type="submit" className="search-button">
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>
      </div>
      
      <div className="hostels-container">
        <div className={`filters-sidebar ${showMobileFilters ? 'show' : ''}`} ref={filterPanelRef}>
          <div className="filter-header">
            <h3>Filters</h3>
            <button 
              type="button" 
              className="close-filters-btn"
              onClick={() => setShowMobileFilters(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="filter-section">
            <h4>Hostel Type</h4>
            <div className="filter-options">
              <button 
                className={`filter-option ${filter === 'all' ? 'active' : ''}`} 
                onClick={() => setFilter('all')}
              >
                All Hostels
              </button>
              <button 
                className={`filter-option ${filter === 'boys' ? 'active' : ''}`} 
                onClick={() => setFilter('boys')}
              >
                Boys Only
              </button>
              <button 
                className={`filter-option ${filter === 'girls' ? 'active' : ''}`} 
                onClick={() => setFilter('girls')}
              >
                Girls Only
              </button>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-slider-container">
              <div className="price-range-labels">
                <span>{priceRange[0].toLocaleString()}</span>
                <span>{priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="price-slider"
              />
              <input
                type="range"
                min="0"
                max="20000" 
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="price-slider"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Sort By</h4>
            <div className="sort-options">
              <button 
                className={`sort-option ${sortBy === 'recommended' ? 'active' : ''}`}
                onClick={() => setSortBy('recommended')}
              >
                Recommended
              </button>
              <button 
                className={`sort-option ${sortBy === 'price-low' ? 'active' : ''}`}
                onClick={() => setSortBy('price-low')}
              >
                Price (Low to High)
              </button>
              <button 
                className={`sort-option ${sortBy === 'price-high' ? 'active' : ''}`}
                onClick={() => setSortBy('price-high')}
              >
                Price (High to Low)
              </button>
              <button 
                className={`sort-option ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Rating (High to Low)
              </button>
            </div>
          </div>
          
          {(searchTerm || checkInDate || checkOutDate || filter !== "all" || sortBy !== "recommended" || priceRange[0] > 0 || priceRange[1] < 20000) && (
            <button type="button" className="clear-all-filters-btn" onClick={clearFilters}>
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>
        
        <div className="hostel-results">
          <div className="results-header">
            <div className="active-filters">
              {filter !== "all" && (
                <span className="active-filter-tag">
                  {filter === "boys" ? "Boys Hostel" : "Girls Hostel"}
                  <button onClick={() => setFilter("all")} className="remove-filter">
                    <X size={14} />
                  </button>
                </span>  
              )}
              
              {checkInDate && checkOutDate && (
                <span className="active-filter-tag">
                  {new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}
                  <button 
                    onClick={() => {
                      setCheckInDate("");
                      setCheckOutDate("");
                    }} 
                    className="remove-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              
              {(priceRange[0] > 0 || priceRange[1] < 20000) && (
                <span className="active-filter-tag">
                  ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  <button 
                    onClick={() => setPriceRange([0, 20000])} 
                    className="remove-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              
              {sortBy !== "recommended" && (
                <span className="active-filter-tag">
                  {sortBy === "price-low" 
                    ? "Price: Low to High" 
                    : sortBy === "price-high" 
                      ? "Price: High to Low" 
                      : "Highest Rated"}
                  <button 
                    onClick={() => setSortBy("recommended")} 
                    className="remove-filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="skeleton-results-count"></div>
            ) : (
              <p className="results-count">
                <strong>{filteredHostels.length}</strong> hostel{filteredHostels.length !== 1 ? 's' : ''} found
                {hostels.length > filteredHostels.length && (
                  <span> (filtered from {hostels.length})</span>
                )}
              </p>
            )}
          </div>

          {loading ? (
            <div className="hostel-grid">
              {[...Array(6)].map((_, index) => (
                <div className="hostel-card skeleton" key={`skeleton-${index}`}>
                  <div className="skeleton-image"></div>
                  <div className="skeleton-details">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-location"></div>
                    <div className="skeleton-owner"></div>
                    <div className="skeleton-amenities"></div>
                    <div className="skeleton-footer">
                      <div className="skeleton-price"></div>
                      <div className="skeleton-vacancy"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHostels.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🏠</div>
              <h3>No hostels found matching your criteria</h3>
              <p>Try adjusting your filters for more results</p>
              <button className="reset-search-btn" onClick={clearFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="hostel-grid">
              {filteredHostels.map((hostel) => (
                <div key={hostel.id} className="hostel-card">
                  <Link to={`/hostel/${hostel.id}`} className="hostel-link">
                    <div className="hostel-image-container">
                      <img
                        src={hostel.images && hostel.images.length > 0 ? hostel.images[0].image : "/images/placeholder-hostel.jpg"}
                        alt={hostel.name || "Hostel Image"}
                        className="hostel-image"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-hostel.jpg";
                        }}
                      />
                      {hostel.is_featured && (
                        <span className="featured-badge">
                          <Star size={12} />
                          Featured
                        </span>
                      )}
                      {checkInDate && checkOutDate && hostel.has_vacancy && (
                        <span className="available-badge">
                          <Clock size={12} />
                          Available
                        </span>
                      )}
                    </div>
                    
                    <div className="hostel-details">
                      <div className="hostel-header">
                        <h3 className="hostel-name">{hostel.name || "Unnamed Hostel"}</h3>
                        {renderStarRating(hostel.rating)}
                      </div>
                      
                      <div className="hostel-location">
                        <MapPin size={16} className="location-icon" />
                        <span>{hostel.address || "Location not specified"}</span>
                      </div>
                      
                      <div className="hostel-owner">
                        <User size={16} className="owner-icon" />
                        <span>{hostel.owner || "Owner information not available"}</span>
                      </div>
                      
                      {renderAmenities(hostel)}
                      
                      <div className="hostel-footer">
                        <span className="hostel-price">
                          {formatPrice(hostel.rent_max)}
                          <span className="price-period">/month</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showMobileFilters && (
        <div className="filters-overlay" onClick={() => setShowMobileFilters(false)}></div>
      )}
      <Footer />
    </div>
  );
};

export default Hostels;