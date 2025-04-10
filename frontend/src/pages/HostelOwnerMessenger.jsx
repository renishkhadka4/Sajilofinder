import React, { useEffect, useState, useRef } from "react";
import { FaPaperPlane, FaImage } from "react-icons/fa";
import api from "../api/axios";

const HostelOwnerMessenger = () => {
  const [students, setStudents] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

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
    if (!selectedChat || (!message && !image)) return;

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

  return (
    <div className="h-screen flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-2">Reply to Student</h2>

      <div className="mb-4">
        <label>Select Student:</label>
        <select
          className="ml-2 border rounded p-1"
          value={selectedChat?.student_id || ""}
          onChange={(e) => {
            const student = students.find(s => s.student_id === parseInt(e.target.value));
            setSelectedChat(student || null);
          }}
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
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 border rounded">
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t mt-2 p-3 flex items-center bg-white">
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
        </>
      ) : (
        <div className="text-gray-600">No student selected.</div>
      )}
    </div>
  );
};

export default HostelOwnerMessenger;
