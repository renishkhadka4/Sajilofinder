import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Homepage.css";
import { 
  Calendar, 
  MapPin, 
  Search, 
  School, 
  Star, 
  User, 
  Wifi, 
  Coffee, 
  Shield,
  X,
  Filter,
  ChevronDown,
  Clock,
  CreditCard,
  MessageCircle,
  Home,
  Check,
  Bookmark,
  RefreshCw
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  
  // Search form states
  const [searchTerm, setSearchTerm] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nearby, setNearby] = useState("");
  
  // Hostel data states
  const [hostels, setHostels] = useState([]);
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Blog states
  const [blogs, setBlogs] = useState([]);
  
  // FAQ states
  const [activeFaq, setActiveFaq] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch all hostels and blogs when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch hostels
        const hostelsResponse = await api.get("/hostel_owner/all-hostels/");
        setHostels(hostelsResponse.data);
        
        // Set featured hostels (top 6 with highest ratings)
        const sortedHostels = [...hostelsResponse.data].sort((a, b) => 
          (b.rating || 0) - (a.rating || 0)
        );
        setFeaturedHostels(sortedHostels.slice(0, 6));
        
        // Fetch blogs
        const blogsResponse = await api.get("/admin/public/blogs/");
        setBlogs(blogsResponse.data.slice(0, 3)); // Get latest 3 blogs
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  // This code should be added to your main JS file or component

// Function to handle FAQ toggling
document.addEventListener('DOMContentLoaded', () => {
    // FAQ toggle functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isOpen = question.classList.contains('open');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-question').forEach(q => {
          q.classList.remove('open');
          q.nextElementSibling.classList.remove('open');
        });
        
        // Toggle the clicked FAQ
        if (!isOpen) {
          question.classList.add('open');
          answer.classList.add('open');
        }
      });
    });
    
    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.animate-fade-in');
    
    const checkIfInView = () => {
      animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };
    
    // Initialize elements with hidden state
    animateElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });
    
    // Check elements on scroll
    window.addEventListener('scroll', checkIfInView);
    
    // Check initially on page load
    checkIfInView();
  });

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query parameters for the URL
    const searchParams = new URLSearchParams();
    
    if (searchTerm) searchParams.append('search', searchTerm);
    if (checkIn) searchParams.append('check_in', checkIn);
    if (checkOut) searchParams.append('check_out', checkOut);
    if (nearby) searchParams.append('nearby', nearby);
    if (categoryFilter !== 'all') searchParams.append('category', categoryFilter);
    if (priceRange[0] > 0) searchParams.append('min_price', priceRange[0]);
    if (priceRange[1] < 20000) searchParams.append('max_price', priceRange[1]);
    
    // Redirect to hostels page with the search parameters
    navigate(`/hostels?${searchParams.toString()}`);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    setCheckIn("");
    setCheckOut("");
    setNearby("");
    setCategoryFilter("all");
    setPriceRange([0, 20000]);
    setSearchPerformed(false);
  };
  
  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  
  // Helper functions for rendering hostel cards
  const renderStarRating = (rating) => {
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
    if (hostel.wifi) amenities.push(<Wifi size={16} className="amenity-icon" key="wifi" title="WiFi Available" />);
    if (hostel.mess_service) amenities.push(<Coffee size={16} className="amenity-icon" key="breakfast" title="Mess Service Available" />);
    if (hostel.security_guard) amenities.push(<Shield size={16} className="amenity-icon" key="security" title="Security Guard" />);
    
    return amenities.length > 0 ? (
      <div className="amenities-container">
        {amenities}
        {amenities.length > 0 && (
          <span className="amenities-count">{amenities.length} amenities</span>
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

  // FAQ data
  const faqs = [
    {
      question: "How do I book a hostel on Sajilo Finder?",
      answer: "You can search for hostels based on your preferences, view available options, and book directly through our platform. After selecting a hostel, you'll complete a simple booking form and receive confirmation."
    },
    {
      question: "Are the hostels verified?",
      answer: "Yes, all hostels listed on Sajilo Finder are verified by our team to ensure they meet our safety and quality standards. We personally visit and review each property before listing."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel bookings according to the cancellation policy of each hostel. Most hostels allow free cancellation up to 7 days before check-in. Check the specific policy on the hostel's page."
    },
    {
      question: "How can I contact hostel owners directly?",
      answer: "Once you've made a booking, you'll get access to our direct messaging feature that allows you to chat with hostel owners or managers. You can also find contact information on each hostel's page."
    },
    {
      question: "Are meals included in hostel bookings?",
      answer: "This varies by hostel. Some hostels include meals in their rates, while others offer meal services for an additional fee. Check the amenities section on each hostel listing for details."
    }
  ];
  useEffect(() => {
    const handleUnauthorized = () => {
      setShowLoginModal(true);
    };
  
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);
  

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Search Section */}
      <div className={`hero-section ${searchPerformed ? 'compact' : ''}`}>
        <div className="hero-overlay">
          <h1>Find Your Perfect Hostel in Kathmandu</h1>
          <p>Verified Hostels • Easy Booking • Student Friendly</p>

          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="input-group">
              <MapPin size={16} />
              <input
                type="text"
                placeholder="Search by location or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="input-group">
              <Calendar size={16} />
              <input
                type="date"
                placeholder="Check-in"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
              <input
                type="date"
                placeholder="Check-out"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || undefined}
              />
            </div>
            <div className="input-group">
              <School size={16} />
              <input
                type="text"
                placeholder="Nearby college or market"
                value={nearby}
                onChange={(e) => setNearby(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">
              <Search size={18} /> Search
            </button>
            {searchPerformed && (
              <button type="button" className="clear-btn" onClick={clearSearch}>
                <X size={18} /> Clear
              </button>
            )}
            <button 
              type="button" 
              className="filter-btn" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} /> Filters
            </button>
          </form>
          
          {showFilters && (
            <div className="search-filters">
              <div className="filter-section">
                <h4>Hostel Type</h4>
                <div className="filter-options">
                  <button 
                    className={`filter-option ${categoryFilter === 'all' ? 'active' : ''}`} 
                    onClick={() => setCategoryFilter('all')}
                  >
                    All Hostels
                  </button>
                  <button 
                    className={`filter-option ${categoryFilter === 'boys' ? 'active' : ''}`} 
                    onClick={() => setCategoryFilter('boys')}
                  >
                    Boys Only
                  </button>
                  <button 
                    className={`filter-option ${categoryFilter === 'girls' ? 'active' : ''}`} 
                    onClick={() => setCategoryFilter('girls')}
                  >
                    Girls Only
                  </button>
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Price Range (Rs)</h4>
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
            </div>
          )}
        </div>
      </div>

      {/* Available Hostels Section */}
      <div className="available-hostels">
        <div className="section-header">
          <h2>Featured Hostels</h2>
          <p>Explore our hand-picked selection of top-rated hostels in Kathmandu</p>
        </div>
        
        {loading ? (
          <div className="text-center">Loading hostels...</div>
        ) : (
          <>
            <div className="hostels-grid">
            {featuredHostels.map((hostel) => (
                <div key={hostel.id} className="hostel-card">
                  <div style={{ position: "relative" }}>
                  <img 
  src={hostel.images && hostel.images.length > 0 
    ? hostel.images[0].image 
    : "/images/hostel-placeholder.jpg"} 

                      alt={hostel.name} 
                      className="hostel-img" 
                    />
                    <span className="hostel-type">
                      {hostel.hostel_type === "boys" ? "Boys Hostel" : 
                       hostel.hostel_type === "girls" ? "Girls Hostel" : 
                       "Mixed Hostel"}
                    </span>
                  </div>
                  <div className="hostel-content">
                    <h3 className="hostel-title">{hostel.name}</h3>
                    <div className="hostel-location">
                      <MapPin size={14} />
                      <span>{hostel.address || "Location unavailable"}</span>
                    </div>
                    {renderStarRating(hostel.rating)}
                    {renderAmenities(hostel)}
                    <div className="hostel-price">
                      {formatPrice(hostel.price)} / month
                    </div>
                    {isLoggedIn ? (
  <Link to={`/hostel/${hostel.id}`} className="view-details-btn">
    View Details
  </Link>
) : (
  <button className="view-details-btn" onClick={() => setShowLoginModal(true)}>
    View Details
  </button>
)}

                  </div>
                </div>
              ))}
            </div>
            <Link to="/hostels" className="view-all-btn">
              View All Hostels
            </Link>
          </>
        )}
      </div>

      {/* How It Works Section */}
      <div className="section-header">
  <h2>New Here? See How It Works</h2>
  <p>Learn how Sajilo Finder helps students, hostel owners, and admins in 5 simple steps.</p>
  <Link to="/how-it-works" className="view-all-btn">Explore →</Link>
</div>


      {/* About Us Preview */}
      <div className="about-section">
        <h2>About Sajilo Finder</h2>
        <p>
          Sajilo Finder is a trusted platform built to help students and professionals find
          safe, verified, and affordable hostels in Nepal. We simplify the process with an
          easy search, real-time availability, live chat with owners, and secure payment.
          Our team personally verifies each hostel to ensure they meet our standards for
          safety, cleanliness, and facilities.
        </p>
        <Link to="/about" className="read-more">Read More →</Link>
      </div>

      {/* Blog Section - Fetching from API */}
      <div className="blog-preview-section">
        <div className="section-header">
          <h2>Latest from Our Blog</h2>
          <p>Tips, guides, and insights to help you find the perfect accommodation</p>
        </div>
        
        <div className="blog-cards">
          {blogs.length > 0 ? (
            blogs.map(blog => (
              <div className="blog-card" key={blog.id}>
                <img src={blog.image || "/images/blog-placeholder.jpg"} alt={blog.title} />
                <h4>{blog.title}</h4>
                <p>
                  {blog.content.slice(0, 100)}...
                </p>
                <Link to={`/blog/${blog.id}`}>Read More</Link>
              </div>
            ))
          ) : (
            <>
              <div className="blog-card">
                <img src="/images/blog1.jpg" alt="Blog 1" />
                <h4>5 Tips to Choose a Hostel in Kathmandu</h4>
                <p>Explore what really matters when you're choosing your next student stay.</p>
                <Link to="/blogs">Read More</Link>
              </div>
              <div className="blog-card">
                <img src="/images/blog2.jpg" alt="Blog 2" />
                <h4>Affordable Hostels with Good Facilities</h4>
                <p>Our top picks for budget hostels that don't compromise on quality.</p>
                <Link to="/blogs">Read More</Link>
              </div>
              <div className="blog-card">
                <img src="/images/blog3.jpg" alt="Blog 3" />
                <h4>Student Life in Kathmandu: A Guide</h4>
                <p>Everything you need to know about living as a student in Nepal's capital.</p>
                <Link to="/blogs">Read More</Link>
              </div>
            </>
          )}
        </div>
        
        <Link to="/blogs" className="view-all-btn">
          View All Articles
        </Link>
      </div>
      
      {/* FAQs Section */}
      <div className="section-header">
  <h2>Got Questions?</h2>
  <p>We’ve answered the most common queries about booking, payments, and listings.</p>
  <Link to="/faqs" className="view-all-btn">Visit FAQs</Link>
</div>

      
      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Hear from students and professionals who found their perfect accommodation using Sajilo Finder</p>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-text">
              Sajilo Finder made my transition to Kathmandu so much easier. I found a safe girls hostel near my college within my budget. The reviews were honest and helped me make a good choice.
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial1.jpg" alt="Samiksha" className="author-avatar" />
              <div className="author-info">
                <h4>Samiksha Sharma</h4>
                <p>BBA Student, Kathmandu</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-text">
              As someone new to the city, I was worried about finding good accommodation. Sajilo Finder's verified listings and direct chat with hostel owners gave me confidence in my decision.
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial2.jpg" alt="Anish" className="author-avatar" />
              <div className="author-info">
                <h4>Anish Thapa</h4>
                <p>Engineering Student, Lalitpur</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-text">
              The filtering options on Sajilo Finder are fantastic! I could narrow down hostels based on my exact requirements like WiFi, mess facility, and distance from my university.
            </div>
            <div className="testimonial-author">
              <img src="/images/testimonial3.jpg" alt="Priya" className="author-avatar" />
              <div className="author-info">
                <h4>Priya Gurung</h4>
                <p>Medical Student, Bhaktapur</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLoginModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Login Required</h2>
      <p>You need to login or register to continue.</p>
      <div className="modal-buttons">
        <Link to="/login" className="login-btn">Login</Link>
        <Link to="/register" className="register-btn">Register</Link>
        <button onClick={() => setShowLoginModal(false)} className="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
)}

      {/* Contact Us CTA */}
      <div className="contact-cta-section">
        <h2>Need Help Finding Your Perfect Hostel?</h2>
        <p>Our team is ready to assist you with personalized recommendations and support throughout your search.</p>
        <Link to="/contact" className="contact-btn">Contact Us</Link>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;