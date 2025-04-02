import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import api from "../api/axios";
import "../styles/index.css";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:8000";

const Index = () => {
  const [user, setUser] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const loggedInUser = getUser();
    setUser(loggedInUser);
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 2);
    
    setCheckInDate(formatDate(tomorrow));
    setCheckOutDate(formatDate(nextDay));
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch available hostels from backend
  useEffect(() => {
    api.get("/hostel_owner/hostels/")
      .then((response) => {
        setHostels(response.data);
      })
      .catch((error) => {
        console.error("Error fetching hostels:", error);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery, "Check-in:", checkInDate, "Check-out:", checkOutDate, "Guests:", guests);
    // Here you would call your API with the search parameters
  };

  return (
    <div className="booking-style-app">
      {/* Navbar with updated design */}
      <Navbar />

      {/* Hero Section with Search */}
      <div className="hero-container">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Hostel</h1>
          <p className="hero-subtitle">Connect with the best hostels tailored for students</p>
          
          {/* Search Card */}
          <div className="search-card">
            {/* Tab Navigation */}
            <div className="search-tabs">
              <div className="tab active">
                <i className="tab-icon">🏨</i>
                <span>Hostels</span>
              </div>
              <div className="tab">
                <i className="tab-icon">🏠</i>
                <span>Homes & Apartments</span>
              </div>
              <div className="tab">
                <i className="tab-icon">📅</i>
                <span>Long stays</span>
              </div>
              <div className="tab">
                <i className="tab-icon">🚕</i>
                <span>Airport transfer</span>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <div className="search-destination">
                  <i className="search-icon">📍</i>
                  <input 
                    type="text" 
                    placeholder="Enter a destination or property" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="destination-input" 
                  />
                </div>
                
                <div className="date-guest-container">
                  <div className="date-inputs">
                    <div className="date-input">
                      <i className="date-icon">📅</i>
                      <input 
                        type="date" 
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="date-select" 
                      />
                    </div>
                    <div className="date-input">
                      <i className="date-icon">📅</i>
                      <input 
                        type="date" 
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="date-select" 
                      />
                    </div>
                  </div>
                  
                  <div className="guest-input">
                    <i className="guest-icon">👥</i>
                    <select 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="guest-select"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5+ Guests</option>
                    </select>
                  </div>
                </div>
                
                <button type="submit" className="search-button">
                  SEARCH
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Promotions Section */}
      <div className="promotions-section">
        <div className="section-header">
          <h2 className="section-title">Accommodation Promotions</h2>
          <Link to="/promotions" className="view-all-link">
            View all <i className="arrow-icon">→</i>
          </Link>
        </div>
        
        <div className="promotions-grid">
          {/* Promotional Cards */}
          <div className="promo-card">
            <div className="promo-image">
              <img src="/images/promo1.jpg" alt="Special Deal" />
              <div className="promo-badge">15% OFF</div>
            </div>
            <div className="promo-content">
              <h3>Last Minute Deals</h3>
              <p>Book now and save up to 15% on selected hostels</p>
            </div>
          </div>
          
          <div className="promo-card">
            <div className="promo-image">
              <img src="/images/promo2.jpg" alt="Weekly Stay" />
              <div className="promo-badge">20% OFF</div>
            </div>
            <div className="promo-content">
              <h3>Weekly Stay Discount</h3>
              <p>Enjoy 20% off when you book for a week or longer</p>
            </div>
          </div>
          
          <div className="promo-card">
            <div className="promo-image">
              <img src="/images/promo3.jpg" alt="New Listings" />
              <div className="promo-badge">NEW</div>
            </div>
            <div className="promo-content">
              <h3>New Hostels Added</h3>
              <p>Be the first to stay at our newly listed properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Hostels Section */}
      <div className="featured-hostels">
        <div className="section-header">
          <h2 className="section-title">Popular Hostels</h2>
          <Link to="/hostels" className="view-all-link">
            View all <i className="arrow-icon">→</i>
          </Link>
        </div>
        
        <div className="hostel-grid">
          {hostels.slice(0, 4).map((hostel) => (
            <div key={hostel.id} className="hostel-card">
              <div className="hostel-image">
                {hostel.images && hostel.images.length > 0 ? (
                  <img 
                    src={hostel.images[0].image.startsWith("http") ? hostel.images[0].image : `${API_BASE_URL}${hostel.images[0].image}`} 
                    alt={hostel.name} 
                    onError={(e) => { e.target.src = "/images/placeholder.jpg"; }}
                  />
                ) : (
                  <img src="/images/placeholder.jpg" alt="No Image Available" />
                )}
                <div className="hostel-rating">
                  <span className="rating-score">4.8</span>
                  <span className="rating-text">Excellent</span>
                </div>
              </div>
              <div className="hostel-details">
                <h3>{hostel.name}</h3>
                <p className="hostel-location">
                  <i className="location-icon">📍</i> {hostel.address}
                </p>
                <div className="hostel-amenities">
                  <span className="amenity">WiFi</span>
                  <span className="amenity">AC</span>
                  <span className="amenity">Kitchen</span>
                </div>
                <div className="hostel-price">
                  <span className="price-value">₹{Math.floor(Math.random() * 1000) + 500}</span>
                  <span className="price-night">/night</span>
                </div>
                <Link to={`/hostel/${hostel.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="why-choose-us">
        <h2 className="section-title">Why Choose Sajilo Finder</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🔍</div>
            <h3>Easy Search</h3>
            <p>Find the perfect hostel with our powerful search filters</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Best Price Guarantee</h3>
            <p>We offer competitive rates with no hidden fees</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h3>Verified Reviews</h3>
            <p>Read authentic reviews from real students</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h3>Secure Booking</h3>
            <p>Book your stay with confidence and security</p>
          </div>
        </div>
      </div>

      {/* App Promotion */}
      <div className="app-promotion">
        <div className="app-content">
          <h2>Save more on our app!</h2>
          <p>Download our mobile app for exclusive deals and easier booking</p>
          <div className="app-buttons">
            <button className="app-button">
              <i className="app-icon">📱</i> Get the App
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Sajilo Finder</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>For Students</h3>
            <ul>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/support">Support</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>For Hostel Owners</h3>
            <ul>
              <li><Link to="/list-property">List Your Property</Link></li>
              <li><Link to="/owner-faq">Owner FAQs</Link></li>
              <li><Link to="/owner-support">Owner Support</Link></li>
              <li><Link to="/owner-resources">Resources</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-icon">FB</a>
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">TW</a>
              <a href="#" className="social-icon">LI</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Sajilo Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;