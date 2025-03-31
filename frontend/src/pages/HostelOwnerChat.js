import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from './ChatWindow';

const HostelOwnerChat = () => {
  const { hostelId, receiverId } = useParams(); // receiverId is actually student_id
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id'); // Hostel owner's ID
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error(" Hostel Owner ID not found in localStorage.");
    }
  }, []);

  console.log(" Debugging Chat Data:", { hostelId, userId, receiverId });

  if (!userId || !hostelId || !receiverId) {
    return <h2>Error: Missing Chat Data</h2>;
  }

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", padding: "1rem 0", background: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
        Chat with Student
      </h2>
      <ChatWindow
        hostelId={parseInt(hostelId)}
        userId={parseInt(userId)}   // Hostel Owner (Sender)
        receiverId={parseInt(receiverId)} // Student (Receiver)
      />
    </div>
  );
};

export default HostelOwnerChat;
