// MessageInput.jsx
import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      onSend(text);
      setText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="message-input" style={{ display: "flex", padding: "0.5rem" }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        style={{
          flex: 1,
          padding: "0.5rem",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginRight: "0.5rem",
        }}
      />
      <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
