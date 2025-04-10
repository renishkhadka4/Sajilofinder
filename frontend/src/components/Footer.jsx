import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css";// Make sure to import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sajilo Finder */}
        <div className="footer-section">
          <h3>Sajilo Finder</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press</Link></li>
          </ul>
        </div>

        {/* For Students */}
        <div className="footer-section">
          <h3>For Students</h3>
          <ul>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* For Hostel Owners */}
        <div className="footer-section">
          <h3>For Hostel Owners</h3>
          <ul>
            <li><Link to="/list-property">List Your Property</Link></li>
            <li><Link to="/owner-faq">Owner FAQs</Link></li>
            <li><Link to="/owner-support">Owner Support</Link></li>
            <li><Link to="/owner-resources">Resources</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#">FB</a>
            <a href="#">IG</a>
            <a href="#">TW</a>
            <a href="#">LI</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Sajilo Finder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
