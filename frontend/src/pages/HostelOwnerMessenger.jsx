import React, { useEffect, useState, useRef } from 'react';
import { FaPaperPlane, FaSearch, FaImage, FaPaperclip, FaEllipsisV, FaTrash } from 'react-icons/fa';
import api from '../api/axios';
import '../styles/HostelChat.css';
import Sidebar from "../pages/Sidebar"; 

const HostelOwnerMessenger = ({ hostelId = 1 }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [ownerId, setOwnerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const deleteModalRef = useRef(null);

  // 1. Fetch logged-in owner
  useEffect(() => {
    api.get('/hostel_owner/auth/user/')
      .then(res => {
        setCurrentUsername(res.data.username);
        setOwnerId(res.data.id);
      })
      .catch(err => console.error("❌ Owner info fetch failed", err));
  }, []);

  // 2. WebSocket connection
  useEffect(() => {
    if (!currentUsername || !hostelId) return;

    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostelId}/`);
    socketRef.current = socket;

    socket.onopen = () => console.log("🟢 WebSocket connected");
    socket.onerror = (e) => console.error("❌ WebSocket error:", e);
    socket.onclose = () => console.warn("🔴 WebSocket closed");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        if (
          selectedChat &&
          (data.sender === selectedChat.username || data.receiver === selectedChat.username)
        ) {
          setMessages(prev => [...prev, data]);
        }
      }
    };

    return () => {
      if (socket.readyState <= 1) socket.close();
    };
  }, [currentUsername, hostelId, selectedChat]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Load student chat list
  useEffect(() => {
    api.get('/hostel_owner/students/')
      .then(res => setChats(res.data.students ?? []))
      .catch(err => console.error("❌ fetchChats failed", err));
  }, []);

  // 5. Load chat messages
  const fetchMessages = async (chatUser) => {
    setSelectedChat(chatUser);
    try {
      const res = await api.get(`/hostel_owner/chat-history/${hostelId}/`);
      const filtered = res.data.filter(
        (msg) =>
          (msg.sender === currentUsername && msg.receiver === chatUser.username) ||
          (msg.sender === chatUser.username && msg.receiver === currentUsername)
      );
      setMessages(filtered);
      
      // Focus message input when chat is selected
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error("❌ fetchMessages failed:", err);
    }
  };

  // 6. Send message
  const sendMessage = () => {
    if (!selectedChat || (!message.trim() && !image)) return;
  
    const payload = {
      sender_id: ownerId,
      receiver_id: selectedChat.id,
      message: message.trim() || '[Image]',
      image_url: image ? URL.createObjectURL(image) : null,
    };
  
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      setMessage('');
      setImage(null);
      
      // Add optimistic message
      const optimisticMessage = {
        id: Date.now(),
        sender: currentUsername,
        receiver: selectedChat.username,
        message: message.trim() || '[Image]',
        image_url: image ? URL.createObjectURL(image) : null,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
    } else {
      console.warn("⚠️ WebSocket not open.");
    }
  };
  
  // 7. Delete message
  const openDeleteModal = (msg, event) => {
    event.preventDefault();
    setMessageToDelete(msg);
    setShowDeleteModal(true);
    
    // Position the delete modal near the message
    if (deleteModalRef.current && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      deleteModalRef.current.style.top = `${event.clientY}px`;
      deleteModalRef.current.style.left = `${event.clientX}px`;
    }
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };
  
  const deleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      // Call API to delete the message
      await api.delete(`/hostel_owner/delete-message/${messageToDelete.id}/`);


      
      // Update messages list by removing the deleted message
      setMessages(messages.filter(msg => msg.id !== messageToDelete.id));
      
      // If using WebSocket, broadcast the deletion
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          action: 'delete_message',
          message_id: messageToDelete.id
        }));
      }
      
      // Close the modal
      closeDeleteModal();
    } catch (err) {
      console.error("❌ deleteMessage failed:", err);
    }
  };
  
  // Click outside to close delete modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        closeDeleteModal();
      }
    };
    
    if (showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal]);
  
  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials from username
  const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle message context menu (right-click)
  const handleMessageContextMenu = (msg, event) => {
    // Only allow deletion of user's own messages
    if (msg.sender === currentUsername) {
      openDeleteModal(msg, event);
      event.preventDefault(); // Prevent default context menu
    }
  };

  return (
    <div className="messenger-container">
      <div className={`sidebar-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar />
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="messenger-content">
        {/* Chat List Panel */}
        <div className="chat-list-panel">
          <div className="chat-list-header">
            <h2>Messages</h2>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                className="search-input"
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-list">
            {filteredChats.length === 0 ? (
              <div className="no-chats-message">
                {searchQuery ? 'No matching students found' : 'No students available'}
              </div>
            ) : filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => fetchMessages(chat)}
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              >
                <div className="chat-avatar-container">
                  <div className="chat-initial-avatar">
                    {getInitials(chat.username)}
                  </div>
                  <span className="online-indicator"></span>
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-name">{chat.username}</span>
                    <span className="chat-time">12:45 PM</span>
                  </div>
                  <div className="chat-preview">
                    {chat.last_message || 'Click to start chatting...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-initial-avatar chat-user-avatar">
                    {getInitials(selectedChat.username)}
                  </div>
                  <div>
                    <div className="chat-user-name">{selectedChat.username}</div>
                    <div className="chat-user-status">Online</div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="header-action-button">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">
                      <FaPaperPlane />
                    </div>
                    <p className="empty-chat-title">No messages yet</p>
                    <p className="empty-chat-subtitle">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSender = msg.sender === currentUsername;
                    const showAvatar = 
                      idx === 0 || 
                      (messages[idx - 1] && messages[idx - 1].sender !== msg.sender);
                    
                    return (
                      <div 
                        key={idx} 
                        className={`message-container ${isSender ? 'sender' : 'receiver'}`}
                        onContextMenu={(e) => isSender && handleMessageContextMenu(msg, e)}
                      >
                        {!isSender && showAvatar && (
                          <div className="message-initial-avatar">
                            {getInitials(selectedChat.username)}
                          </div>
                        )}
                        
                        <div className={`message-content ${!isSender && !showAvatar ? 'with-indent' : ''}`}>
                          <div 
                            className={`message-bubble ${isSender ? 'sender-bubble' : 'receiver-bubble'}`}
                            onClick={(e) => isSender && openDeleteModal(msg, e)}
                          >
                            {msg.image_url && (
                              <div className="message-image-container">
                                <img 
                                  src={msg.image_url} 
                                  alt="chat-img" 
                                  className="message-image"
                                />
                              </div>
                            )}
                            <div className="message-text">{msg.message}</div>
                            {isSender && (
                              <div className="message-actions-overlay">
                                <FaTrash className="delete-message-icon" />
                              </div>
                            )}
                          </div>
                          <div className={`message-time ${isSender ? 'sender-time' : 'receiver-time'}`}>
                            {formatTimestamp(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <input
                    ref={messageInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  
                  <div className="message-actions">
                    <label className="message-action-button">
                      <FaPaperclip />
                      <input type="file" className="hidden-input" onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    
                    <label className="message-action-button">
                      <FaImage />
                      <input type="file" accept="image/*" className="hidden-input" onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    
                    <button 
                      onClick={sendMessage}
                      className="send-button"
                      disabled={!message.trim() && !image}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
                
                {image && (
                  <div className="image-preview">
                    <div className="image-name">
                      {image.name}
                    </div>
                    <button 
                      onClick={() => setImage(null)}
                      className="remove-image"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <FaPaperPlane />
              </div>
              <h3 className="welcome-title">Your Messages</h3>
              <p className="welcome-subtitle">
                Select a student from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Message Modal */}
      {showDeleteModal && (
        <div className="delete-message-modal" ref={deleteModalRef}>
          <div className="delete-message-options">
            <button 
              className="delete-message-button"
              onClick={deleteMessage}
            >
              <FaTrash /> Delete Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelOwnerMessenger;