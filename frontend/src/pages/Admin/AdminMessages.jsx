import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/Adminmessages.css';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-messages/');
      setMessages(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this message?');
    if (!confirm) return;

    try {
      await api.delete(`/admin/contact-messages/${id}/`);
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-messages-header">
          <h2>Contact Messages</h2>
          <button className="refresh-btn" onClick={fetchMessages}>
            Refresh Data
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchMessages}>Try Again</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No messages available.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sender</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr key={msg.id}>
                    <td>{idx + 1}</td>
                    <td className="sender-name">{msg.name}</td>
                    <td className="sender-email">
                      <a href={`mailto:${msg.email}`}>{msg.email}</a>
                    </td>
                    <td className="message-content">{msg.message}</td>
                    <td className="message-date">{new Date(msg.created_at).toLocaleString()}</td>
                    <td>
                      <button 
                        onClick={() => deleteMessage(msg.id)} 
                        className="delete-btn"
                        aria-label="Delete message"
                      >
                        <span className="delete-icon">🗑️</span>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;