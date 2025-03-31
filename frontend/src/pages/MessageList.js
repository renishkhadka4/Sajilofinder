
import React from "react";

const MessageList = ({ messages, currentUserId }) => {
  return (
    <div className="message-list" style={{ padding: "1rem", height: "400px", overflowY: "auto" }}>
      {messages.map((msg, index) => {
        const isSender = msg.sender_id === currentUserId || msg.sender === currentUserId;
        return (
          <div
            key={index}
            style={{
              textAlign: isSender ? "right" : "left",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: isSender ? "#DCF8C6" : "#F1F0F0",
                borderRadius: "10px",
                maxWidth: "70%",
              }}
            >
              <strong>{isSender ? "You" : msg.sender}</strong>
              <div>{msg.message}</div>
              <small style={{ fontSize: "0.7rem", color: "#888" }}>
                {msg.timestamp}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
