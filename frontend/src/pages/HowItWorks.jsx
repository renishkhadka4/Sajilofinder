import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/HowItWorks.css';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTabChange = (tab) => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setIsVisible(true);
    }, 300);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className={`tab-content ${isVisible ? 'visible' : ''}`}>
            <h2 className="tab-title">For Students</h2>
            <div className="process-timeline">
              <div className="process-step">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3>Search & Discover</h3>
                  <p>Utilize our advanced search algorithm to find your ideal hostel based on location, budget, amenities, and ratings. Our intelligent filters help narrow down options that perfectly match your requirements.</p>
                  <div className="step-features">
                    <span>Map Integration</span>
                    <span>Real-time Availability</span>
                    <span>Price Comparison</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Evaluate & Compare</h3>
                  <p>Access comprehensive hostel profiles featuring high-resolution gallery, virtual tours, detailed amenities list, and authentic reviews from previous tenants to make informed decisions.</p>
                  <div className="step-features">
                    <span>360° Room Views</span>
                    <span>Verified Reviews</span>
                    <span>Neighborhood Insights</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Secure Booking</h3>
                  <p>Reserve your preferred room through our streamlined booking process. Select your desired duration, room type, and additional services before completing the reservation with our secure payment gateway.</p>
                  <div className="step-features">
                    <span>Flexible Booking Options</span>
                    <span>Secure Payments</span>
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Seamless Communication</h3>
                  <p>Connect directly with hostel management through our integrated messaging system. Discuss specific requirements, ask questions, and coordinate your arrival details for a smooth transition.</p>
                  <div className="step-features">
                    <span>Real-time Chat</span>
                    <span>Document Sharing</span>
                    <span>Notification Alerts</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">05</div>
                <div className="step-content">
                  <h3>Community Engagement</h3>
                  <p>Enhance the community by sharing your authentic experience through detailed reviews and ratings. Your feedback helps future students make informed decisions and incentivizes hostels to maintain high standards.</p>
                  <div className="step-features">
                    <span>Multi-criteria Ratings</span>
                    <span>Photo Reviews</span>
                    <span>Reward Points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'owners':
        return (
          <div className={`tab-content ${isVisible ? 'visible' : ''}`}>
            <h2 className="tab-title">For Hostel Owners</h2>
            <div className="process-timeline">
              <div className="process-step">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3>Onboarding & Setup</h3>
                  <p>Register and verify your business credentials to gain access to our comprehensive property management system. Our guided setup ensures your hostel profile is optimized for maximum visibility.</p>
                  <div className="step-features">
                    <span>Business Verification</span>
                    <span>Profile Optimization</span>
                    <span>SEO Integration</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Inventory Management</h3>
                  <p>Create detailed listings for your property with our intuitive floor plan builder. Configure room types, assign features, set dynamic pricing strategies, and manage real-time availability calendars.</p>
                  <div className="step-features">
                    <span>Bulk Room Upload</span>
                    <span>Dynamic Pricing</span>
                    <span>Seasonal Adjustments</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Booking Administration</h3>
                  <p>Monitor incoming booking requests through a centralized dashboard. Review student profiles, manage reservation approvals, and automate confirmation workflows to streamline your operations.</p>
                  <div className="step-features">
                    <span>Customizable Workflows</span>
                    <span>Automated Responses</span>
                    <span>Occupancy Tracking</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Revenue Management</h3>
                  <p>Track payments, deposits, and refunds through our integrated financial portal. Generate detailed reports on occupancy rates, revenue forecasts, and seasonal trends to optimize your business strategy.</p>
                  <div className="step-features">
                    <span>Payment Processing</span>
                    <span>Financial Analytics</span>
                    <span>Tax Documentation</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">05</div>
                <div className="step-content">
                  <h3>Reputation Building</h3>
                  <p>Enhance your market position by engaging with student feedback, showcasing property improvements, and highlighting your hostel's unique value propositions through our promotion tools.</p>
                  <div className="step-features">
                    <span>Review Management</span>
                    <span>Featured Listings</span>
                    <span>Promotional Campaigns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'admins':
        return (
          <div className={`tab-content ${isVisible ? 'visible' : ''}`}>
            <h2 className="tab-title">For Platform Administrators</h2>
            <div className="process-timeline">
              <div className="process-step">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3>Quality Assurance</h3>
                  <p>Implement comprehensive verification protocols for new hostel registrations to maintain platform integrity. Review property details, legal documentation, and safety compliance before approving listings.</p>
                  <div className="step-features">
                    <span>Document Verification</span>
                    <span>Compliance Checking</span>
                    <span>Safety Standards</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>Content Moderation</h3>
                  <p>Maintain platform quality through active monitoring of user-generated content including reviews, photos, and messages to ensure all interactions adhere to community guidelines.</p>
                  <div className="step-features">
                    <span>AI-Assisted Screening</span>
                    <span>Content Flagging</span>
                    <span>Review Appeals</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>Transaction Oversight</h3>
                  <p>Supervise the financial ecosystem through monitoring payment flows, resolving disputes, and ensuring secure processing of all transactions between students and hostel owners.</p>
                  <div className="step-features">
                    <span>Payment Verification</span>
                    <span>Dispute Resolution</span>
                    <span>Fraud Prevention</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>Analytics & Reporting</h3>
                  <p>Generate comprehensive insights through advanced analytics to track platform performance, user engagement metrics, and market trends to drive strategic decision-making.</p>
                  <div className="step-features">
                    <span>Custom Reporting</span>
                    <span>Market Analysis</span>
                    <span>Performance Metrics</span>
                  </div>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">05</div>
                <div className="step-content">
                  <h3>Platform Development</h3>
                  <p>Oversee continuous improvement through feature development, content updates, and system optimizations based on user feedback and emerging market requirements.</p>
                  <div className="step-features">
                    <span>Feature Implementation</span>
                    <span>Content Management</span>
                    <span>User Experience Refinement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="how-it-works-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Experience the Future of Hostel Finding</h1>
            <p>Discover how our innovative platform transforms the hostel hunting journey for everyone involved</p>
          </div>
        </div>

        <div className="how-it-works-container">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} 
              onClick={() => handleTabChange('students')}
            >
              <div className="tab-icon student-icon"></div>
              <span>For Students</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'owners' ? 'active' : ''}`} 
              onClick={() => handleTabChange('owners')}
            >
              <div className="tab-icon owner-icon"></div>
              <span>For Hostel Owners</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`} 
              onClick={() => handleTabChange('admins')}
            >
              <div className="tab-icon admin-icon"></div>
              <span>For Administrators</span>
            </button>
          </div>

          {renderContent()}

          <div className="benefits-section">
            <h2>Why Choose Sajilo Finder?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon security-icon"></div>
                <h3>Verified Listings</h3>
                <p>Every hostel undergoes thorough verification to ensure authentic and reliable accommodations for students.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon payments-icon"></div>
                <h3>Secure Payments</h3>
                <p>Integrated with trusted payment gateways for seamless and protected financial transactions.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon support-icon"></div>
                <h3>24/7 Support</h3>
                <p>Round-the-clock assistance available for both students and hostel owners throughout the process.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon insights-icon"></div>
                <h3>Data-Driven Insights</h3>
                <p>Comprehensive analytics and reporting to make informed decisions for all stakeholders.</p>
              </div>
            </div>
          </div>

          <div className="testimonials-section">
            <h2>What Our Users Say</h2>
            <div className="testimonial-carousel">
              <div className="testimonial-card">
                <div className="testimonial-quote">"Sajilo Finder transformed my hostel hunting experience from stressful to enjoyable. Found my perfect accommodation in just a day!"</div>
                <div className="testimonial-author">
                  <div className="author-avatar student-avatar"></div>
                  <div className="author-details">
                    <h4>Aarav Sharma</h4>
                    <p>Computer Science Student</p>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-quote">"As a hostel owner, this platform has revolutionized our booking management and increased our occupancy rate by 40% in just three months."</div>
                <div className="testimonial-author">
                  <div className="author-avatar owner-avatar"></div>
                  <div className="author-details">
                    <h4>Sarita Poudel</h4>
                    <p>Green Valley Hostel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of students and hostel owners already benefiting from Sajilo Finder</p>
            <div className="cta-buttons">
              <button className="cta-button primary">Find a Hostel</button>
              <button className="cta-button secondary">List Your Property</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HowItWorks;