import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaImage, FaTrash, FaEllipsisV } from "react-icons/fa";
import api from "../api/axios";
import Sidebar from "../pages/Sidebar"; 
import '../styles/HostelChat.css';

const HostelOwnerMessenger = () => {
  const [students, setStudents] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [selectedStudentId, setSelectedStudentId] = useState(""); // ✅ Add this

  // New state to fix dropdown issue

  // 1. Get current owner
  useEffect(() => {
    api.get("/hostel_owner/auth/user/")
      .then((res) => {
        setCurrentUsername(res.data.username);
        setOwnerId(res.data.id);
      })
      .catch((err) => console.error("❌ Owner fetch failed", err));
  }, []);

  // 2. Fetch students who sent messages to this owner
  useEffect(() => {
    if (!ownerId) return;
    api.get("/hostel_owner/chat-students/")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("❌ Failed to load students", err));
  }, [ownerId]);

  // 3. Load chat history
  useEffect(() => {
    if (!selectedChat) return;

    const { student_id, hostel_id } = selectedChat;
    api.get(`/hostel_owner/chat-history/${hostel_id}/`)
      .then((res) => {
        const filtered = res.data.filter(
          (msg) =>
            (msg.sender?.toLowerCase() === currentUsername.toLowerCase() &&
              msg.receiver?.toLowerCase() === selectedChat.username.toLowerCase()) ||
            (msg.receiver?.toLowerCase() === currentUsername.toLowerCase() &&
              msg.sender?.toLowerCase() === selectedChat.username.toLowerCase())
        );
        setMessages(filtered);
      })
      .catch((err) => console.error("❌ Failed to load chat history", err));
  }, [selectedChat, currentUsername]);

  // 4. Setup WebSocket
  useEffect(() => {
    if (!selectedChat) return;
    const { hostel_id } = selectedChat;

    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostel_id}/`);
    socketRef.current = socket;

    socket.onopen = () => console.log("🟢 WebSocket connected");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.onerror = (e) => console.error("❌ WebSocket error:", e);
    socket.onclose = () => console.warn("🔴 WebSocket closed");

    return () => {
      if (socket.readyState <= 1) socket.close();
    };
  }, [selectedChat]);

  // 5. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Send message
  const sendMessage = async () => {
    if (!selectedChat || (!message.trim() && !image)) return;

    let imageUrl = null;
    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      try {
        const res = await api.post("/hostel_owner/upload-chat-image/", formData);
        imageUrl = res.data.image_url;
      } catch (err) {
        console.error("❌ Image upload failed", err);
        alert("Image upload failed");
        return;
      }
    }

    const payload = {
      sender_id: ownerId,
      receiver_id: selectedChat.student_id,
      message: message.trim() || "[Image]",
      image_url: imageUrl,
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      setMessage("");
      setImage(null);
    } else {
      alert("WebSocket is not connected.");
    }
  };

  // 7. Delete message
  const deleteMessage = async (messageId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      await api.delete(`/hostel_owner/delete-message/${messageId}/`);
      setMessages(messages.filter(msg => msg.id !== messageId));
      setShowDeleteMenu(null);
    } catch (err) {
      console.error("❌ Failed to delete message", err);
      alert("Failed to delete message");
    }
  };
  
  // 8. Delete entire conversation
  const handleDeleteConversation = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!selectedChat) return;
    const confirm = window.confirm("Delete this entire conversation?");
    if (!confirm) return;
  
    try {
      await api.delete(`/hostel_owner/delete-conversation/${selectedChat.hostel_id}/`, {
        params: { student_id: selectedChat.student_id },
      });
      setMessages([]);
      alert("Conversation deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete conversation", err);
      alert("Failed to delete conversation");
    }
  };
  
  // 9. Handle student selection change
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId); // ✅ Update the state
  
    if (studentId) {
      const student = students.find(s => s.student_id === parseInt(studentId));
      setSelectedChat(student || null);
    } else {
      setSelectedChat(null);
    }
  };
  
  

  // 10. Handle clicking outside delete menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDeleteMenu !== null) {
        setShowDeleteMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeleteMenu]);

  return (
    <div className="hostel-chat-container">
      <Sidebar />
      
      <div className="chat-main-content">
        <div className="chat-header">
          <h2>Reply to Student</h2>
          {selectedChat && (
            <div className="selected-student-info">
              <span className="student-name">{selectedChat.username}</span>
              <span className="hostel-name">{selectedChat.hostel_name || "Unknown Hostel"}</span>
            </div>
          )}
        </div>

        <div className="student-selector">
          <label>Select Student:</label>
<select
  value={selectedStudentId}
  onChange={(e) => {
    const id = e.target.value;
    setSelectedStudentId(id); // Track the selected value
    const student = students.find((s) => s.student_id === parseInt(id));
    setSelectedChat(student || null);
  }}
  className="student-dropdown"
>
  <option value="">-- Select --</option>
  {students.map((s) => (
    <option key={s.student_id} value={s.student_id}>
      {s.username} — from {s.hostel_name || "Unknown Hostel"}
    </option>
  ))}
</select>

        </div>

        {selectedChat ? (
          <>
            <div className="messages-container">
              {selectedChat && (
                <button
                  onClick={handleDeleteConversation}
                  className="delete-conversation-btn"
                >
                  <FaTrash /> Delete Entire Conversation
                </button>
              )}
              
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div className="empty-state">
                    <div className="empty-state-icon">✉️</div>
                    <h3>No messages yet</h3>
                    <p>Start the conversation with this student!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${msg.sender === currentUsername ? "message-sent" : "message-received"}`}
                  >
                    <div className="message-bubble">
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="chat-img"
                          className="message-image"
                        />
                      )}
                      <div className="message-content">
                        {msg.message}
                      </div>
                      <div className="message-timestamp">
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {msg.sender === currentUsername && (
                      <div className="message-actions">
                        <button 
                          className="message-options-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id);
                          }}
                        >
                          <FaEllipsisV />
                        </button>
                        {showDeleteMenu === msg.id && (
                          <div className="delete-menu" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="delete-btn"
                              onClick={(e) => deleteMessage(msg.id, e)}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-text-input"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              
              <div className="message-actions-container">
                <label className="file-input-label" title="Add image">
                  <FaImage />
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>
                
                {image && (
                  <div className="image-preview-indicator">
                    <span className="image-name">{image.name.length > 15 ? image.name.substring(0, 15) + '...' : image.name}</span>
                    <button 
                      className="clear-image-btn"
                      onClick={() => setImage(null)}
                    >
                      &times;
                    </button>
                  </div>
                )}
                
                <button
                  onClick={sendMessage}
                  className="send-button"
                  disabled={!message.trim() && !image}
                  title="Send message"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>No conversation selected</h3>
              <p>Please select a student from the dropdown to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelOwnerMessenger;