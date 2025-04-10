import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AboutUs.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaUsers, FaHandshake, FaLightbulb, FaAward, FaSearch, FaHome, FaCalculator, FaVideo, FaFileContract, FaHeadset } from "react-icons/fa";

const AboutUs = () => {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("/admin/public/about/")
      .then((res) => {
        console.log("About Us Response:", res.data);
        setAbout(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch About Us:", err);
        setError("Failed to load content. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Helper function to get appropriate icons for services
  const getServiceIcon = (service) => {
    const serviceIcons = {
      "Property Search": <FaSearch />,
      "Home Listing": <FaHome />,
      "Virtual Tours": <FaVideo />,
      "Mortgage Calculator": <FaCalculator />,
      "Paperwork": <FaFileContract />,
      "Customer Support": <FaHeadset />
    };
    
    return serviceIcons[service] || <FaHome />;
  };

  // Helper function to get specific descriptions for services
  const getServiceDescription = (service) => {
    const descriptions = {
      "Property Search": "Find your dream home with our advanced search tools that match your specific requirements and preferences.",
      "Home Listing": "List your property with professional photography, detailed descriptions, and maximum visibility to potential buyers.",
      
      "Customer Support": "Our dedicated support team is available to assist you at every step of your property journey."
    };
    
    return descriptions[service] || `We provide top-quality ${service.toLowerCase()} services that meet your unique needs and preferences.`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading our story...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>We're Sorry!</h2>
          <p>{error}</p>
          <p>We're experiencing some technical difficulties. Please try again in a few moments.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
        <Footer />
      </>
    );
  }

  const defaultDescription = "Sajilo Finder is a digital platform designed to simplify home-finding. Founded in 2024, we've helped thousands find their ideal homes through our intuitive platform. We combine technology with personalized service to create a seamless experience for our users.";

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="about-hero" style={{backgroundImage: "url('/images/hero-background.jpg')"}}>
        <div className="about-hero-content">
          <h1 className="about-title">ABOUT US</h1>
          <div className="title-underline"></div>
        </div>
      </div>
      
      <div className="about-container">
        {/* Main Content Section */}
        <div className="about-main">
          <div className="about-text-content">
            <h2 className="about-subtitle">Our Story</h2>
            <p className="about-description">{about.description || defaultDescription}</p>
            
            {/* Mission Statement */}
            <div className="about-mission">
              <h2 className="about-subtitle">Our Mission</h2>
              <p className="about-description">
                {about.mission || "Our mission at Sajilo Finder is to revolutionize the way students and professionals in Nepal find and book hostels. We aim to create a transparent, trusted, and user-friendly platform that simplifies accommodation discovery, ensures quality service, and connects hostel seekers with verified providers. Through smart technology, secure payments, and community-driven features, we strive to make hostel living more accessible, reliable, and stress-free for everyone."}
              </p>
            </div>
          </div>
          </div>
            
    
          <h2 className="about-subtitle">Our Services</h2>
<div className="title-underline"></div>

{about.services ? (
  about.services.split("\n").map((paragraph, index) => (
    <p key={index} className="about-description">{paragraph}</p>
  ))
) : (
  <p className="about-description">Our service details will be updated soon.</p>
)}


        
        {/* Gallery Section */}
        {[about.image1, about.image2, about.image3, about.image4].filter(Boolean).length > 0 && (
          <div className="about-gallery-section">
            <h2 className="about-subtitle">Our Gallery</h2>
            <div className="title-underline"></div>
            
            <div className="about-gallery">
              {[about.image2, about.image3, about.image4].filter(Boolean).map(
                (img, idx) => (
                  <div key={idx} className="gallery-item">
                    <img src={img} alt={`Sajilo Finder Gallery ${idx + 1}`} />
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {/* Testimonials Section */}
        {about.testimonials && about.testimonials.length > 0 && (
          <div className="about-testimonials-section">
            <h2 className="about-subtitle">What Our Clients Say</h2>
            <div className="title-underline"></div>
            
            <div className="testimonials-slider">
              {about.testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-text">"{testimonial.text}"</div>
                  <div className="testimonial-author">
                    <div className="testimonial-author-name">{testimonial.name}</div>
                    <div className="testimonial-author-title">{testimonial.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Team Section - Only show if team data exists */}
        {about.team && about.team.length > 0 && (
          <div className="about-team-section">
            <h2 className="about-subtitle">Meet Our Team</h2>
            <div className="title-underline"></div>
            
            <div className="team-grid">
              {about.team.map((member, index) => (
                <div key={index} className="team-member">
                  {member.image && <img src={member.image} alt={member.name} />}
                  <h3>{member.name}</h3>
                  <p className="member-title">{member.position}</p>
                  <p className="member-bio">{member.bio}</p>
                  <div className="member-social">
                    {member.social && Object.entries(member.social).map(([platform, url], idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                        <i className={`fa fa-${platform.toLowerCase()}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Why Choose Us Section */}
        <div className="about-why-us-section">
          <h2 className="about-subtitle">Why Choose Sajilo Finder</h2>
          <div className="title-underline"></div>
          
          <div className="why-us-grid">
            <div className="why-us-item">
              <div className="why-us-icon">
                <i className="fa fa-check-circle"></i>
              </div>
              <h3>Extensive Property Listings</h3>
              <p>Access thousands of verified property listings across the country</p>
            </div>
            <div className="why-us-item">
              <div className="why-us-icon">
                <i className="fa fa-shield"></i>
              </div>
              <h3>Verified Owners</h3>
              <p>All property owners are verified for your safety and peace of mind</p>
            </div>
            <div className="why-us-item">
              <div className="why-us-icon">
                <i className="fa fa-thumbs-up"></i>
              </div>
              <h3>User-friendly Interface</h3>
              <p>Our platform is designed to make your property search simple and intuitive</p>
            </div>
            <div className="why-us-item">
              <div className="why-us-icon">
                <i className="fa fa-headphones"></i>
              </div>
              <h3>Dedicated Support</h3>
              <p>Our team is always ready to assist you with any questions or concerns</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="about-cta" style={{backgroundImage: "url('/images/cta-background.jpg')"}}>
        <div className="cta-content">
          <h2>Ready to Find Your Perfect Home?</h2>
          <p>Start your journey with Sajilo Finder today</p>
          <button className="cta-button">Get Started</button>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default AboutUs;