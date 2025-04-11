import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-slogan">
        <h2>Your Hostels Search Made Simple, Your Journey Made Sajilo</h2>
      </div>
      
      <div className="footer-container">
        {/* Sajilo Finder */}
        <div className="footer-section">
          <h3>Sajilo Finder</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* For Students */}
        <div className="footer-section">
          <h3>For Tenant & Owners
          </h3>
          <ul>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/register">List Your Property</Link></li>
            <li><Link to="/hostels">Book Your Hostel Here</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li><i className="fa fa-envelope"></i> sajilofinder@gmail.com</li>
            <li><i className="fa fa-phone"></i> +977 9869274750</li>
            <li><i className="fa fa-map-marker"></i> Putali Sadak, Kathmandu</li>
          </ul>
        </div>

        {/* Social Media */}
      
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Sajilo Finder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;