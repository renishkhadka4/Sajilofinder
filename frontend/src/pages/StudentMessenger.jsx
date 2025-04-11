import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaPaperPlane, FaImage, FaTimes, FaBuilding, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/StudentChat.css";

const StudentMessenger = ({ selectedHostelId = null, inPopup = false }) => {
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
 
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = "auto";
      messageInputRef.current.style.height = `${Math.min(messageInputRef.current.scrollHeight, 120)}px`;
    }
  };

  // Fetch current student info
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }

        const res = await api.get("/students/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUsername(res.data.username);
        setStudentId(res.data.id);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to get student info";
        console.error("❌", errorMsg);
        setError(errorMsg);
      }
    };

    fetchStudentProfile();
  }, []);

  // Fetch verified hostels and set default if provided
  useEffect(() => {
    const fetchVerifiedHostels = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const res = await api.get("/hostel_owner/verified-hostels/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setHostels(res.data);
        
        if (selectedHostelId) {
          const match = res.data.find((h) => h.id === selectedHostelId);
          if (match) setHostelId(match.id);
          else setError(`Hostel with ID ${selectedHostelId} not found in your verified hostels.`);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to load hostels";
        console.error("❌", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedHostels();
  }, [selectedHostelId]);

  // Fetch owner when hostel is selected
  useEffect(() => {
    if (!hostelId) return;
    
    const fetchOwner = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/students/get-owner/${hostelId}/`);
        setOwner(res.data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Owner not found";
        console.error("❌", errorMsg);
        setError(errorMsg);
        setOwner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [hostelId]);

  // Setup WebSocket after owner + hostelId are available
  useEffect(() => {
    if (!hostelId || !owner) return;

    // Close any existing connection
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostelId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");
      setError(null);
    };
    
    socket.onerror = (e) => {
      console.error("❌ WebSocket error:", e);
      setError("Connection error. Please try again later.");
    };
    
    socket.onclose = (e) => {
      console.warn("🔴 WebSocket closed", e.reason ? `Reason: ${e.reason}` : "");
      if (!e.wasClean) {
        setError("Connection lost. Please refresh the page.");
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
      } else if (data.typing) {
        // Handle typing indicator
        if (data.sender !== currentUsername) {
          setIsTyping(true);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (socket.readyState <= 1) socket.close();
    };
  }, [hostelId, owner, currentUsername]);

  // Load chat history
  useEffect(() => {
    if (!hostelId || !owner || !currentUsername) return;
    
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const res = await api.get(`/students/chat-history/${hostelId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const filtered = res.data.filter(
          (msg) =>
            (msg.sender?.toLowerCase() === currentUsername?.toLowerCase() &&
              msg.receiver?.toLowerCase() === owner.username?.toLowerCase()) ||
            (msg.receiver?.toLowerCase() === currentUsername?.toLowerCase() &&
              msg.sender?.toLowerCase() === owner.username?.toLowerCase())
        );
        
        setMessages(filtered);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to load chat history";
        console.error("❌", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [hostelId, owner, currentUsername]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea when text changes
  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  // Emit typing indicator
  const emitTypingStatus = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && owner) {
      socketRef.current.send(
        JSON.stringify({
          typing: true,
          sender: currentUsername,
          receiver: owner.username,
        })
      );
    }
  }, [currentUsername, owner]);

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    emitTypingStatus();
  };

  // Handle image selection
  
  // Remove selected image

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp || Date.now());
    const today = new Date();
    
    // Same day - show only time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Not today - show date and time
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    }) + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !owner || !studentId) return;

    
    try {
      setIsSending(true);
      setError(null);
      
      const messageContent = message.trim();

      
      const payload = {
        sender_id: studentId,
        receiver_id: owner.id,
        message: messageContent,
        hostel_id: hostelId
      };

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
        setMessage("");
     
        
        // Focus back to input after sending
        setTimeout(() => {
          messageInputRef.current?.focus();
          autoResizeTextarea();
        }, 0);
      } else {
        throw new Error("WebSocket connection is not available");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to send message";
      console.error("❌", errorMsg);
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  // Handle enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.timestamp || Date.now());
    const dateStr = date.toDateString();
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(msg);
    return groups;
  }, {});

  // Clear error after 5 seconds
  useEffect(() => {
    if (!error) return;
    
    const timer = setTimeout(() => {
      setError(null);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className={`student-chat-container ${inPopup ? 'in-popup' : ''}`}>
      {!inPopup && <Navbar />}

      <div className="chat-main-container">
        {/* Fixed Header */}
        <div className="chat-header">
          <h1>Chat with Hostel Owner</h1>
          {owner && (
            <div className="owner-badge">
              <div className="owner-avatar">
                {owner.username?.charAt(0).toUpperCase()}
              </div>
              <div className="owner-info">
                <span className="owner-name">{owner.username}</span>
                <span className="owner-status online">Online</span>
              </div>
            </div>
          )}
        </div>

        {!(inPopup && selectedHostelId) && (
  <div className="hostel-selector">
    <label htmlFor="hostel-select">Select Hostel:</label>
    <select
      id="hostel-select"
      value={hostelId || ""}
      onChange={(e) => setHostelId(Number(e.target.value) || null)}
      disabled={!!selectedHostelId || loading}
      className="hostel-select-dropdown"
    >
      <option value="">-- Select a hostel to chat --</option>
      {hostels.map((h) => (
        <option key={h.id} value={h.id}>
          {h.name}
        </option>
      ))}
    </select>
  </div>
)}


        {error && (
          <div className="error-message">
            <FaExclamationCircle />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="close-error"
              aria-label="Dismiss error"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Scrollable Messages Area */}
        <div className="messages-container" ref={messagesContainerRef}>
          {loading ? (
            <div className="loading-spinner">
              <FaSpinner className="spinner-icon" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 && hostelId ? (
            <div className="empty-state">
              <FaBuilding className="empty-icon" />
              <h3>No messages yet</h3>
              <p>Start a conversation with the hostel owner.</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date} className="message-day-group">
                <div className="date-divider">
                  <span>
                    {new Date(date).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                {dayMessages.map((msg, idx) => {
                  const isCurrentUser = msg.sender === currentUsername;
                  const showSenderInfo = idx === 0 || 
                    dayMessages[idx - 1]?.sender !== msg.sender;
                  
                  return (
                    <div
                      key={idx}
                      className={`message-wrapper ${
                        isCurrentUser ? "outgoing" : "incoming"
                      }`}
                    >
                      <div
                        className={`message-bubble ${
                          isCurrentUser ? "outgoing" : "incoming"
                        }`}
                      >
                        {showSenderInfo && !isCurrentUser && (
                          <div className="sender-name">{msg.sender}</div>
                        )}
                        
                       
                        {msg.message !== "[Image]" && (
                          <div className="message-text">{msg.message}</div>
                        )}
                        
                        <div className="message-time">
                          {formatMessageTime(msg.timestamp)}
                        </div>
                        
                        {msg.hostel_name && (
                          <div className="hostel-tag">
                            <FaBuilding size={12} />
                            {msg.hostel_name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {isTyping && owner && (
            <div className="typing-indicator">
              <span>{owner.username} is typing</span>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Image Preview + Input Area */}
        <div className="chat-input-section">
         

          <div className="message-input-container">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder={owner ? `Message to ${owner.username}...` : "Select a hostel to start chatting..."}
              className="message-input"
              disabled={!hostelId || !owner || isSending}
              rows={1}
            />
            
            <div className="message-actions">
             
              
              <button
                onClick={sendMessage}
                className={`send-button ${isSending ? 'sending' : ''}`}
                disabled={!message.trim() || !hostelId || !owner || isSending}

                aria-label="Send message"
              >
                {isSending ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMessenger;