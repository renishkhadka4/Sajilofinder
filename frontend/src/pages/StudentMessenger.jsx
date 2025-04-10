import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaImage } from "react-icons/fa";
import api from "../api/axios";

const StudentMessenger = ({ selectedHostelId = null }) => {
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch current student info
  useEffect(() => {
    const token = localStorage.getItem("token");
    api.get("/students/profile/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setCurrentUsername(res.data.username);
        setStudentId(res.data.id);
      })
      .catch((err) => {
        console.error("❌ Failed to get student info", err.response?.data || err.message);
      });
  }, []);

  // 2. Fetch verified hostels and set default if provided
  useEffect(() => {
    const token = localStorage.getItem("token");
    api.get("/hostel_owner/verified-hostels/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setHostels(res.data);
        if (selectedHostelId) {
          const match = res.data.find((h) => h.id === selectedHostelId);
          if (match) setHostelId(match.id);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load hostels", err.response?.data || err.message);
      });
  }, [selectedHostelId]);

  // 3. Fetch owner when hostel is selected
  useEffect(() => {
    if (!hostelId) return;

    api.get(`/students/get-owner/${hostelId}/`)
      .then((res) => {
        setOwner(res.data);
      })
      .catch((err) => {
        alert("❌ Owner not found!");
        console.error("❌ Error fetching owner:", err);
      });
  }, [hostelId]);

  // 4. Setup WebSocket after owner + hostelId are available
  useEffect(() => {
    if (!hostelId || !owner) return;

    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostelId}/`);
    socketRef.current = socket;

    socket.onopen = () => console.log("🟢 WebSocket connected");
    socket.onerror = (e) => console.error("❌ WebSocket error:", e);
    socket.onclose = () => console.warn("🔴 WebSocket closed");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.error) {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => {
      if (socket.readyState <= 1) socket.close();
    };
  }, [hostelId, owner]);

  // 5. Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Send message
  const sendMessage = async () => {
    if (!message && !image) return;
    if (!owner) return alert("❌ Owner information not found!");

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
      sender_id: studentId,
      receiver_id: owner.id,
      message: message || "[Image]",
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
// After setting owner
useEffect(() => {
  if (!hostelId || !owner) return;

  const token = localStorage.getItem("token");
  api.get(`/students/chat-history/${hostelId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      const filtered = res.data.filter(
        (msg) =>
          (msg.sender?.toLowerCase() === currentUsername?.toLowerCase() &&
            msg.receiver?.toLowerCase() === owner.username?.toLowerCase()) ||
          (msg.receiver?.toLowerCase() === currentUsername?.toLowerCase() &&
            msg.sender?.toLowerCase() === owner.username?.toLowerCase())
      );
      setMessages(filtered);
    })
    .catch((err) => {
      console.error("❌ Failed to load chat history:", err);
    });
}, [hostelId, owner, currentUsername]);

  
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 font-semibold text-lg">
        Chat with Hostel Owner
      </div>

      <div className="p-4 border-b">
        <label>Select Hostel:</label>
        <select
          className="ml-2 border rounded p-1"
          value={hostelId || ""}
          onChange={(e) => setHostelId(Number(e.target.value))}
          disabled={!!selectedHostelId} // 🔒 Lock dropdown if preselected
        >
          <option value="">-- Select --</option>
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${msg.sender === currentUsername ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === currentUsername ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {msg.image_url && (
                <img
                  src={msg.image_url}
                  alt="chat-img"
                  className="mb-2 max-w-full rounded"
                />
              )}
              {msg.message}
              {msg.hostel_name && (
                <div className="text-xs mt-1 text-gray-600 italic">
                  🏠 {msg.hostel_name}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 flex items-center bg-white">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded border mr-2"
        />
        <label>
          <FaImage className="text-gray-600 cursor-pointer mr-2" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default StudentMessenger;
