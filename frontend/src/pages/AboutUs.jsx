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
  const [isVisible, setIsVisible] = useState({});

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

  // Add scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.animate-section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, [loading]);

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
      "Virtual Tours": "Explore properties remotely with our immersive virtual tour technology.",
      "Mortgage Calculator": "Plan your finances with our easy-to-use mortgage calculator.",
      "Paperwork": "Streamline the paperwork process with our digital document management system.",
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
      
      {/* Hero Section with Parallax Effect */}
      <div className="about-hero" style={{backgroundImage: "url('/images/hero-background.jpg')"}}>
        <div className="about-hero-content">
          <h1 className="about-title animate-text">ABOUT US</h1>
          <div className="title-underline animate-underline"></div>
        </div>
      </div>
      
      <div className="about-container">
        {/* Main Content Section */}
        <div id="story-section" className="about-main animate-section">
          <div className="about-text-content">
            <h2 className={`about-subtitle ${isVisible['story-section'] ? 'fade-in' : ''}`}>Our Story</h2>
            <div className={`title-underline blue-underline ${isVisible['story-section'] ? 'width-animate' : ''}`}></div>
            <p className={`about-description ${isVisible['story-section'] ? 'slide-up' : ''}`}>
              {about.description || defaultDescription}
            </p>
            
            {/* Mission Statement */}
            <div className={`about-mission ${isVisible['story-section'] ? 'fade-in-delay' : ''}`}>
              <h2 className="about-subtitle">Our Mission</h2>
              <p className="about-description">
                {about.mission || "Our mission at Sajilo Finder is to revolutionize the way students and professionals in Nepal find and book hostels. We aim to create a transparent, trusted, and user-friendly platform that simplifies accommodation discovery, ensures quality service, and connects hostel seekers with verified providers. Through smart technology, secure payments, and community-driven features, we strive to make hostel living more accessible, reliable, and stress-free for everyone."}
              </p>
            </div>
          </div>
        </div>
            
        {/* Services Section */}
        <div id="services-section" className="animate-section">
          <h2 className={`about-subtitle ${isVisible['services-section'] ? 'fade-in' : ''}`}>Our Services</h2>
          <div className={`title-underline blue-underline ${isVisible['services-section'] ? 'width-animate' : ''}`}></div>
          
          {about.services ? (
            about.services.split("\n").map((paragraph, index) => (
              <p key={index} className={`about-description ${isVisible['services-section'] ? 'slide-up-staggered' : ''}`} style={{animationDelay: `${index * 0.2}s`}}>
                {paragraph}
              </p>
            ))
          ) : (
            <div className="about-services-grid">
              {["Property Search", "Home Listing", "Virtual Tours", "Mortgage Calculator", "Paperwork", "Customer Support"].map((service, index) => (
                <div 
                  key={index} 
                  className={`service-card ${isVisible['services-section'] ? 'pop-in' : ''}`}
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="service-icon pulse-animation">
                    {getServiceIcon(service)}
                  </div>
                  <h3 className="service-title">{service}</h3>
                  <p className="service-description">{getServiceDescription(service)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Gallery Section */}
        {[about.image1, about.image2, about.image3, about.image4].filter(Boolean).length > 0 && (
          <div id="gallery-section" className="about-gallery-section animate-section">
            <h2 className={`about-subtitle ${isVisible['gallery-section'] ? 'fade-in' : ''}`}>Our Gallery</h2>
            <div className={`title-underline blue-underline ${isVisible['gallery-section'] ? 'width-animate' : ''}`}></div>
            
            <div className="about-gallery">
              {[about.image1, about.image2, about.image3, about.image4].filter(Boolean).map(
                (img, idx) => (
                  <div 
                    key={idx} 
                    className={`gallery-item ${isVisible['gallery-section'] ? 'fade-scale' : ''}`}
                    style={{animationDelay: `${idx * 0.2}s`}}
                  >
                    <img src={img} alt={`Sajilo Finder Gallery ${idx + 1}`} />
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {/* Why Choose Us Section */}
        <div id="why-us-section" className="about-why-us-section animate-section">
          <h2 className={`about-subtitle ${isVisible['why-us-section'] ? 'fade-in' : ''}`}>Why Choose Sajilo Finder</h2>
          <div className={`title-underline blue-underline ${isVisible['why-us-section'] ? 'width-animate' : ''}`}></div>
          
          <div className="why-us-grid">
            <div className={`why-us-item ${isVisible['why-us-section'] ? 'slide-in-left' : ''}`}>
              <div className="why-us-icon float-animation">
                <FaSearch />
              </div>
              <h3>Extensive Property Listings</h3>
              <p>Access thousands of verified property listings across the country</p>
            </div>
            <div className={`why-us-item ${isVisible['why-us-section'] ? 'slide-in-left' : ''}`} style={{animationDelay: '0.2s'}}>
              <div className="why-us-icon float-animation">
                <FaAward />
              </div>
              <h3>Verified Owners</h3>
              <p>All property owners are verified for your safety and peace of mind</p>
            </div>
            <div className={`why-us-item ${isVisible['why-us-section'] ? 'slide-in-left' : ''}`} style={{animationDelay: '0.4s'}}>
              <div className="why-us-icon float-animation">
                <FaLightbulb />
              </div>
              <h3>User-friendly Interface</h3>
              <p>Our platform is designed to make your property search simple and intuitive</p>
            </div>
            <div className={`why-us-item ${isVisible['why-us-section'] ? 'slide-in-left' : ''}`} style={{animationDelay: '0.6s'}}>
              <div className="why-us-icon float-animation">
                <FaHeadset />
              </div>
              <h3>Dedicated Support</h3>
              <p>Our team is always ready to assist you with any questions or concerns</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Section with Parallax */}
      <div className="about-cta" style={{backgroundImage: "url('/images/cta-background.jpg')"}}>
        <div className="cta-content">
          <h2 className="cta-title">Ready to Find Your Perfect Home?</h2>
          <p className="cta-subtitle">Start your journey with Sajilo Finder today</p>
          <button className="cta-button pulse-button">Get Started</button>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default AboutUs;