// ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import axios from "axios";

const ChatWindow = ({ hostelId, userId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${hostelId}/`);



  
    socketRef.current.onopen = () => {
      console.log(" WebSocket connected");
      setConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(" Message received:", data); // Add this
      setMessages((prev) => [...prev, data]);
    };
    
    
  
    socketRef.current.onclose = () => {
      console.log(" WebSocket disconnected");
      setConnected(false);
    };
  
    return () => socketRef.current.close();
  }, [hostelId]);
  

  const sendMessage = (text) => {
    const socket = socketRef.current;
    const messageObj = {
      sender_id: userId || null,
      receiver_id: receiverId || null,
      message: text || "",
    };
  
    console.log(" Sending message:", messageObj);  // Debugging log
  
    if (!messageObj.sender_id || !messageObj.receiver_id || !messageObj.message) {
      console.warn(" Error: Missing sender_id, receiver_id, or message.");
      return;
    }
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(messageObj));
    } else {
      console.warn("WebSocket is not open yet.");
    }
  };
  
  
  

  return (
    <div className="chat-window">
      <MessageList messages={messages} currentUserId={userId} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;
