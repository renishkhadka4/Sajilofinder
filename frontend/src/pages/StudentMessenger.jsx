import React, { useEffect, useState, useRef } from 'react';
import { FaPaperPlane, FaImage } from 'react-icons/fa';
import api from '../api/axios';

const StudentMessenger = ({ hostelId = 1 }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [owner, setOwner] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [studentId, setStudentId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch student profile
  useEffect(() => {
    api.get('/students/profile/')
      .then(res => {
        setCurrentUsername(res.data.username);
        setStudentId(res.data.id);
      })
      .catch(err => console.error("❌ Failed to get student info", err));
  }, []);

  // 2. Setup WebSocket
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostelId}/`);
    socketRef.current = socket;

    socket.onopen = () => console.log("🟢 Student WebSocket connected");
    socket.onerror = (e) => console.error("❌ WebSocket error:", e);
    socket.onclose = () => console.warn("🔴 WebSocket closed");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        setMessages(prev => [...prev, data]);
      }
    };

    return () => {
      if (socket.readyState <= 1) socket.close();
    };
  }, [hostelId]);

  // 3. Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Load chat history
  useEffect(() => {
    if (!hostelId) return;
    api.get(`/students/chat-history/${hostelId}/`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("❌ Message history fetch failed", err));
  }, [hostelId]);

  // 5. Fetch hostel owner info
  useEffect(() => {
    if (!hostelId) return;
    api.get(`/students/get-owner/${hostelId}/`)
      .then(res => setOwner(res.data))
      .catch(err => console.error("❌ Failed to get owner info", err));
  }, [hostelId]);

  // 6. Send message
  const sendMessage = () => {
    if (!message && !image) return;
    if (!owner?.id || !studentId) {
      alert("❌ Missing sender or receiver ID");
      return;
    }

    const payload = {
      sender_id: studentId,
      receiver_id: owner.id,
      message: message || '[Image]',
      image_url: image ? URL.createObjectURL(image) : null,
    };

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      setMessage('');
      setImage(null);
    } else {
      console.warn("⚠️ WebSocket is not open.");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 font-semibold text-lg">
        Chat with Hostel Owner
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex ${msg.sender === currentUsername ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${msg.sender === currentUsername ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.image_url && <img src={msg.image_url} alt="chat-img" className="mb-2 max-w-full rounded" />}
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 flex items-center">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded border mr-2"
        />
        <label>
          <FaImage className="text-gray-600 cursor-pointer mr-2" />
          <input type="file" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
        </label>
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default StudentMessenger;
