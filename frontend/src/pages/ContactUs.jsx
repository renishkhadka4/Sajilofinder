import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/ContactUs.css";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../styles/LoginPop.css";
import { useNavigate } from 'react-router-dom'; // Add this import at the top of your file

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate(); // ✅ Modal state

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError("");
  
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true); // 🔒 Show modal if not logged in
      return;
    }
  
    try {
      await api.post("/admin/contact-messages/", formData);
      setSuccess("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  

  useEffect(() => {
    const handleUnauthorized = () => {
      setShowLoginModal(true); // ✅ Show modal on 401
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  return (
    <>
      <Navbar />
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>

        <div className="company-info">
          <h2>Sajilo Finder</h2>
          <p className="contact-description">
            We're here to make your rental experience seamless and stress-free.
            Whether you have questions, suggestions, or need assistance, our team is ready to help!
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <p>+977 9741816117</p>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>
                <a href="https://www.google.com/maps/place/Sajilo+Rental/@27.7020913,85.3193857,1022m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39eb197193f7379f:0x628e424021ef929f!8m2!3d27.7020913!4d85.321966!16s%2Fg%2F11sx74khlx?entry=ttu"
                   target="_blank" rel="noopener noreferrer">
                  Find us on Google Maps
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="welcome-message">
          <p>
            At Sajilo Finder, we value your feedback and inquiries. Our dedicated team is committed to
            providing exceptional service to meet all your rental needs. Feel free to reach out using
            the form below, and we'll get back to you promptly. Your satisfaction is our priority!
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Send Message</button>

          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>

      {/* ✅ Login/Register Modal */}
      {showLoginModal && (
  <div className="modal-overlay" onClick={(e) => {
    if (e.target.className === 'modal-overlay') setShowLoginModal(false);
  }}>
    <div className="modal">
      <h2>Login Required </h2>
      <div className="modal-buttons">
        <Link to="/login" className="login-btn">Log In</Link>
        <Link to="/register" className="register-btn">Create Account</Link>
        <button className="cancel-btn" onClick={() => setShowLoginModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      <Footer />
    </>
  );
};

export default ContactUs;
