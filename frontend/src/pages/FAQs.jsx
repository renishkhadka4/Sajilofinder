import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/FAQs.css';

// FAQ data with categories
const faqData = {
  booking: [
    {
      question: "How do I book a hostel?",
      answer: "Browse hostels, select your preferred one, choose dates and a room, then proceed to book. You'll need to complete payment to confirm.",
      keywords: ["book", "booking", "reserve", "reservation"]
    },
    {
      question: "Can I book multiple rooms at once?",
      answer: "Yes, you can book multiple rooms in a single transaction. Select all desired rooms before proceeding to checkout.",
      keywords: ["multiple", "rooms", "book", "several"]
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, but cancellation policies vary by hostel. Check the specific cancellation rules under the hostel details before booking. Most hostels offer free cancellation up to 48 hours before check-in.",
      keywords: ["cancel", "cancellation", "refund"]
    }
  ],
  payment: [
    {
      question: "What payment methods are accepted?",
      answer: "Currently, we support online payments via Khalti, eSewa, and major credit/debit cards. Cash-on-arrival may be available for some hostels but requires pre-approval.",
      keywords: ["payment", "pay", "khalti", "cash", "credit", "debit", "esewa"]
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers.",
      keywords: ["secure", "security", "encryption", "safe", "payment"]
    },
    {
      question: "Can I get a receipt for my booking?",
      answer: "Yes, a receipt is automatically emailed to you after successful payment. You can also download it from your booking history in your account.",
      keywords: ["receipt", "invoice", "bill", "email"]
    }
  ],
  communication: [
    {
      question: "How do I contact the hostel owner?",
      answer: "You can chat with the hostel owner directly through the in-app chat on each hostel's page. For urgent matters, premium users can also access direct phone numbers.",
      keywords: ["contact", "message", "chat", "communicate", "owner"]
    },
    {
      question: "How quickly can I expect a response from hostel owners?",
      answer: "Most hostel owners respond within 2-4 hours. Our platform highlights quick-responding owners with a special badge.",
      keywords: ["response", "reply", "quick", "fast", "owner"]
    }
  ],
  platform: [
    {
      question: "Who can list a hostel?",
      answer: "Only registered Hostel Owners can list and manage hostels. Admins must verify each hostel before it becomes publicly visible. The verification process typically takes 2-3 business days.",
      keywords: ["list", "listing", "register", "add", "hostel"]
    },
    {
      question: "What is the role of the Admin?",
      answer: "Admins moderate listings, manage complaints, review payments, and ensure fair use of the platform. They also verify new hostels and handle dispute resolution between guests and owners.",
      keywords: ["admin", "administrator", "moderate", "verify", "role"]
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, our mobile app is available for both iOS and Android devices. Search for 'HostelFinder' in your app store to download.",
      keywords: ["app", "mobile", "android", "ios", "download"]
    }
  ]
};

// Convert the categorized data into a flat array for search
const getAllFaqs = () => {
  const allFaqs = [];
  Object.entries(faqData).forEach(([category, items]) => {
    items.forEach(item => {
      allFaqs.push({
        ...item,
        category
      });
    });
  });
  return allFaqs;
};

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredFaqs, setFilteredFaqs] = useState(getAllFaqs());
  const [expandedCategories, setExpandedCategories] = useState({});
  const searchInputRef = useRef(null);

  // Handle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Handle FAQ item toggle
  const toggleFaq = (category, index) => {
    const key = `${category}-${index}`;
    setActiveIndex(activeIndex === key ? null : key);
  };

  // Filter FAQs based on search term and category
  useEffect(() => {
    const allFaqs = getAllFaqs();
    
    if (searchTerm.trim() === '' && activeCategory === 'all') {
      setFilteredFaqs(allFaqs);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filtered = allFaqs.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      
      if (!matchesCategory) return false;
      
      if (searchTerm.trim() === '') return true;
      
      const matchesQuestion = faq.question.toLowerCase().includes(lowerSearchTerm);
      const matchesAnswer = faq.answer.toLowerCase().includes(lowerSearchTerm);
      const matchesKeyword = faq.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerSearchTerm)
      );
      
      return matchesQuestion || matchesAnswer || matchesKeyword;
    });
    
    setFilteredFaqs(filtered);
  }, [searchTerm, activeCategory]);

  // Group filtered FAQs by category
  const groupedFilteredFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Initialize all categories as expanded
    const initialExpandedState = {};
    Object.keys(faqData).forEach(category => {
      initialExpandedState[category] = true;
    });
    setExpandedCategories(initialExpandedState);
  }, []);

  // Format category name for display
  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="faq-page">
      <Navbar />
      <div className="faq-hero">
        <div className="faq-hero-content">
          <h1>How can we help you?</h1>
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="faq-container">
        <div className="category-tabs">
          <button 
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {Object.keys(faqData).map((category) => (
            <button 
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {formatCategoryName(category)}
            </button>
          ))}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="no-results">
            <h3>No FAQs found matching "{searchTerm}"</h3>
            <p>Try using different keywords or browse by category</p>
            <button onClick={() => setSearchTerm('')} className="reset-search">
              Clear Search
            </button>
          </div>
        ) : (
          <div className="faq-content">
            {Object.entries(groupedFilteredFaqs).map(([category, faqs]) => (
              <div key={category} className="faq-category">
                <div 
                  className="category-header" 
                  onClick={() => toggleCategory(category)}
                >
                  <h2>{formatCategoryName(category)}</h2>
                  {expandedCategories[category] ? 
                    <ChevronUp size={24} /> : 
                    <ChevronDown size={24} />
                  }
                </div>
                
                {expandedCategories[category] && (
                  <div className="category-items">
                    {faqs.map((faq, index) => {
                      const key = `${category}-${index}`;
                      const isActive = activeIndex === key;
                      
                      return (
                        <div 
                          key={key} 
                          className={`faq-item ${isActive ? 'active' : ''}`}
                        >
                          <div 
                            className="faq-question"
                            onClick={() => toggleFaq(category, index)}
                          >
                            <span>{faq.question}</span>
                            {isActive ? 
                              <ChevronUp size={20} /> : 
                              <ChevronDown size={20} />
                            }
                          </div>
                          
                          <div className={`faq-answer ${isActive ? 'open' : ''}`}>
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="contact-support">
          <h3>Still have questions?</h3>
          <p>If you couldn't find the answer you were looking for, please contact our support team.</p>
          <button className="contact-btn">Contact Support</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQs;