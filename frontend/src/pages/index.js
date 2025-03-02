import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser } from "../utils/auth";
import api from "../api/axios"; // ✅ Ensure axios is configured
import "../styles/index.css"; // Import CSS file
import Navbar from "../components/Navbar";
import registerImage from "../Assests/hostel.jpg"; // ✅ Fixed path
import hostelRegister from "../Assests/registerhostel.png";
import studentRegister from "../Assests/studentregister.png";

const API_BASE_URL = "http://localhost:8000"; // ✅ Ensure this matches Django settings

const Index = () => {
  const [user, setUser] = useState(null);
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    const loggedInUser = getUser();
    setUser(loggedInUser);
  }, []);

  // ✅ Fetch available hostels from backend
  useEffect(() => {
    api.get("/hostel_owner/hostels/")
      .then((response) => {
        setHostels(response.data);
      })
      .catch((error) => {
        console.error("Error fetching hostels:", error);
      });
  }, []);

  return (
    <div>
      {/* ✅ Navbar Only on Index Page */}
      <Navbar />

      {/* Hero Section */}
      <div className="index-container">
        <div className="hero-section">
          <img src={registerImage} alt="Hostel" className="hero-image" />
          <div className="hero-overlay">
            <h1 className="hero-title">Find Your Perfect Hostel</h1>
            <p className="hero-subtitle">
              Sajilo Finder connects students with the best hostels. <br />
              Our recommendation system ensures you find the perfect match.<br />
              Start your journey with us today!
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/dashboard" className="btn dark-btn">
                  Welcome, {user.username}
                </Link>
              ) : (
                <Link to="/register" className="btn primary-btn">
                  Get Started
                </Link>
              )}
              <Link to="/about" className="btn secondary-btn">Learn More</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <span className="search-icon">📍</span>
          <input type="text" placeholder="Search Destination" className="search-input" />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="why-choose-us">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">
          The main reason is because our competitors have outdated sites, but we can't write that here, 
          so the text here will be different.
        </p>
        <div className="features-grid">
          <div className="feature-box">
            <span className="feature-icon">🎓</span>
            <h3>Student Registration</h3>
            <p>Students can easily register and start exploring available hostels.</p>
          </div>
          <div className="feature-box">
            <span className="feature-icon">🏠</span>
            <h3>Hostel Owner Registration</h3>
            <p>Hostel owners can list their properties, making them visible to students.</p>
          </div>
          <div className="feature-box">
            <span className="feature-icon">🔍</span>
            <h3>Find & Book</h3>
            <p>Use our system to find the perfect hostel and book it seamlessly.</p>
          </div>
        </div>
      </div>

    <div className="available-hostels">
    <h2>Available Hostels</h2>
    <div className="hostel-list">
        {hostels.map((hostel) => (
            <div key={hostel.id} className="hostel-card">
                {/* ✅ Display Image from API or Placeholder */}
                {hostel.images.length > 0 && hostel.images[0].image ? (
                    <img 
                        src={hostel.images[0].image.startsWith("http") ? hostel.images[0].image : `${API_BASE_URL}${hostel.images[0].image}`} 
                        alt={hostel.name} 
                        className="hostel-image"
                        onError={(e) => { e.target.src = "/placeholder.png"; }} 
                    />
                ) : (
                    <img src="/placeholder.png" alt="No Image Available" className="hostel-image" />
                )}

                <h3>{hostel.name}</h3>
                <p>📍 {hostel.address}</p>
                <p>🏠 Owned by: {hostel.owner}</p>
                <p>{hostel.description}</p>
                <button className="btn">View Details</button>
            </div>
        ))}
    </div>
</div>




      {/* Student Registration Section */}
      <div className="registration-section">
        <div className="registration-content">
          <h2>Effortless Student Registration</h2>
          <p>
            Join our platform to explore a wide range of hostels tailored to your needs. 
            Sign up now to access personalized recommendations and seamless booking options.
            Start your journey with Sajilo Finder today!
          </p>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
        <div className="registration-image">
          <img src={studentRegister} alt="Student Registration" />
        </div>
      </div>

      {/* Hostel Registration Section */}
      <div className="registration-section reverse">
        <div className="registration-content">
          <h2>Register Your Hostel Today</h2>
          <p>
            Join Sajilo Finder and increase your hostel's visibility to thousands of students. 
            Our platform offers easy management of listings and access to a dedicated support team.
            Showcase your unique amenities and attract more students effortlessly.
          </p>
          <Link to="/register" className="register-btn">Register</Link>
        </div>
        <div className="registration-image">
          <img src={hostelRegister} alt="Register Your Hostel" />
        </div>
      </div>
    </div>
  );
};

export default Index;
