import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSpinner, FaCheck, FaTrashAlt, FaBell, FaCheckDouble, FaFilter, FaSort, FaSearch, FaEllipsisV, FaReply, FaComments } from "react-icons/fa";
import api from "../api/axios";
import "../styles/Notifications.css";
import Sidebar from "../pages/Sidebar";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState({});

  // Fetch notifications data
  const fetchNotifications = useCallback(async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");
      
      const res = await api.get("/hostel_owner/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh notifications every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchNotifications(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchNotifications]);

  // Format timestamp to relative time with enhanced accuracy
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // If more than a week old, show full date
    return notificationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/hostel_owner/notifications/${notificationId}/mark_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/hostel_owner/notifications/mark_all_read/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Clear selected notifications after marking all as read
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/hostel_owner/notifications/${notificationId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );

      // Remove from selected if it was selected
      if (selectedNotifications.includes(notificationId)) {
        setSelectedNotifications(prevSelected => 
          prevSelected.filter(id => id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete selected notifications
  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      const token = localStorage.getItem("token");
      
      // Create an array of promises for each deletion
      const deletePromises = selectedNotifications.map(id => 
        api.delete(`/hostel_owner/notifications/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Update state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => !selectedNotifications.includes(notification.id))
      );
      
      // Clear selection
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error deleting selected notifications:", error);
    }
  };

  // Toggle notification selection
  const toggleSelection = (notificationId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(prevSelected => 
        prevSelected.filter(id => id !== notificationId)
      );
    } else {
      setSelectedNotifications(prevSelected => [...prevSelected, notificationId]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      const filteredNotifications = getFilteredNotifications();
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
    setSelectAll(!selectAll);
  };

  // Get filtered and sorted notifications with search
  const getFilteredNotifications = useCallback(() => {
    let filtered = [...notifications];
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.message.toLowerCase().includes(searchLower) || 
        (notification.type && notification.type.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply read/unread filter
    if (filter === "read") {
      filtered = filtered.filter(n => n.is_read);
    } else if (filter === "unread") {
      filtered = filtered.filter(n => !n.is_read);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    return filtered;
  }, [notifications, filter, sortBy, searchTerm]);

  // Get notification icon based on type with improved mapping
  const getNotificationIcon = (notification) => {
    const iconMap = {
      booking: "🏨",
      reservation: "📅",
      student: "👨‍🎓",
      payment: "💰",
      maintenance: "🔧",
      system: "⚙️",
      feedback: "💬",
      alert: "⚠️",
      info: "ℹ️",
      message: "✉️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      comment: "💬"
    };
    
    return iconMap[notification.type] || "🔔";
  };

  // Memoized filtered notifications to prevent recalculation on every render
  const filteredNotifications = useMemo(() => getFilteredNotifications(), 
    [getFilteredNotifications]);
  
  // Count of unread notifications
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.is_read).length, [notifications]);
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Additional handling based on notification type
    if (notification.deep_link) {
      window.location.href = notification.deep_link;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilter("all");
    setSortBy("newest");
    setSearchTerm("");
  };

  // Reset selection
  const resetSelection = () => {
    setSelectedNotifications([]);
    setSelectAll(false);
  };

  // Toggle expanded comments
  const toggleExpandComments = (notificationId) => {
    setExpandedComments(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  // Start replying to a notification or comment
  const handleReplyClick = (notificationId, commentId = null) => {
    setReplyingTo({
      notificationId,
      commentId
    });
    setReplyText("");
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  // Submit a reply
  const submitReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      const { notificationId, commentId } = replyingTo;
      
      const payload = {
        content: replyText,
        parent_id: commentId
      };
      
      const res = await api.post(`/hostel_owner/notifications/${notificationId}/comments/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update notifications with the new comment
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => {
          if (notification.id !== notificationId) return notification;
          
          const updatedNotification = { ...notification };
          
          if (!updatedNotification.comments) {
            updatedNotification.comments = [];
          }
          
          if (commentId) {
            // Add reply to a comment
            updatedNotification.comments = updatedNotification.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), res.data]
                };
              }
              return comment;
            });
          } else {
            // Add comment to the notification
            updatedNotification.comments = [...updatedNotification.comments, res.data];
          }
          
          return updatedNotification;
        })
      );
      
      // Auto-expand comments for this notification
      setExpandedComments(prev => ({
        ...prev,
        [notificationId]: true
      }));
      
      // Clear reply state
      cancelReply();
      
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  // Group notifications by day for better organization
  const groupNotificationsByDay = useMemo(() => {
    const groups = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);

  // Render comments for a notification
  const renderComments = (notification) => {
    if (!notification.comments || notification.comments.length === 0) {
      return null;
    }
    
    const isExpanded = expandedComments[notification.id] || false;
    const commentCount = notification.comments.length;
    
    return (
      <div className="notification-comments">
        <button 
          className="comments-toggle" 
          onClick={(e) => {
            e.stopPropagation();
            toggleExpandComments(notification.id);
          }}
        >
          <FaComments />
          <span>
            {isExpanded ? "Hide" : "Show"} {commentCount} comment{commentCount !== 1 ? 's' : ''}
          </span>
        </button>
        
        {isExpanded && (
          <div className="comments-list">
            {notification.comments.map(comment => renderComment(comment, notification.id))}
            
            <button 
              className="add-comment-button"
              onClick={(e) => {
                e.stopPropagation();
                handleReplyClick(notification.id);
              }}
            >
              <FaReply /> Add Comment
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render a single comment with its replies
  const renderComment = (comment, notificationId, indent = 0) => {
    return (
      <div 
        key={comment.id} 
        className="comment-item"
        style={{ marginLeft: `${indent * 20}px` }}
      >
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">{comment.author_name || "User"}</span>
            <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
          </div>
          <div className="comment-text">{comment.content}</div>
          <div className="comment-actions">
            <button 
              className="reply-button"
              onClick={(e) => {
                e.stopPropagation();
                handleReplyClick(notificationId, comment.id);
              }}
            >
              <FaReply /> Reply
            </button>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => renderComment(reply, notificationId, indent + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render reply input
  const renderReplyInput = () => {
    if (!replyingTo) return null;
    
    const { notificationId, commentId } = replyingTo;
    
    return (
      <div className="reply-input-container">
        <div className="reply-header">
          <h4>{commentId ? "Reply to comment" : "Add a comment"}</h4>
          <button className="close-button" onClick={cancelReply}>×</button>
        </div>
        <textarea
          className="reply-textarea"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your comment..."
          rows={3}
          autoFocus
        />
        <div className="reply-actions">
          <button className="cancel-button" onClick={cancelReply}>Cancel</button>
          <button 
            className="submit-button" 
            onClick={submitReply}
            disabled={!replyText.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="notifications-page">
      <Sidebar />
      <div className="notifications-content">
        <div className="notifications-header">
          <div className="notifications-title">
            <FaBell className="title-icon" />
            <h1>Notifications</h1>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </div>
          
          <div className="notifications-actions">
            <button 
              className="action-button refresh-button" 
              onClick={() => fetchNotifications(false)}
              disabled={isRefreshing}
              title="Refresh notifications"
            >
              <FaSpinner className={`button-icon ${isRefreshing ? 'spinning' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button className="action-button mark-all-button" onClick={markAllAsRead} title="Mark all as read">
                <FaCheckDouble className="button-icon" />
                <span className="button-text">Mark all read</span>
              </button>
            )}
            
            {selectedNotifications.length > 0 && (
              <button className="action-button delete-button" onClick={deleteSelected} title="Delete selected">
                <FaTrashAlt className="button-icon" />
                <span className="button-text">Delete ({selectedNotifications.length})</span>
              </button>
            )}
            
            <button 
              className={`action-button filter-toggle-button ${showFilters ? 'active' : ''}`} 
              onClick={() => setShowFilters(!showFilters)}
              title="Show filters"
            >
              <FaFilter className="button-icon" />
              <span className="button-text">Filter</span>
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="notifications-filters">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="filter-controls">
              <div className="filter-group">
                <label>Show:</label>
                <div className="filter-buttons">
                  <button 
                    className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </button>
                  <button 
                    className={`filter-button ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                  >
                    Read
                  </button>
                </div>
              </div>
              
              <div className="filter-group">
                <label>Sort:</label>
                <div className="filter-buttons">
                  <button 
                    className={`filter-button ${sortBy === 'newest' ? 'active' : ''}`}
                    onClick={() => setSortBy('newest')}
                  >
                    Newest first
                  </button>
                  <button 
                    className={`filter-button ${sortBy === 'oldest' ? 'active' : ''}`}
                    onClick={() => setSortBy('oldest')}
                  >
                    Oldest first
                  </button>
                </div>
              </div>
              
              {(filter !== "all" || sortBy !== "newest" || searchTerm) && (
                <button className="reset-filters" onClick={clearFilters}>
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button" 
              onClick={() => fetchNotifications()}
            >
              Try again
            </button>
          </div>
        )}
        
        <div className="notifications-list">
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-container">
              <FaBell className="empty-icon" />
              <h3>No notifications found</h3>
              <p>
                {searchTerm 
                  ? `No results found for "${searchTerm}"`
                  : filter !== "all" 
                    ? `There are no ${filter} notifications at the moment.` 
                    : "You don't have any notifications yet."}
              </p>
              {(searchTerm || filter !== "all") && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="notifications-content">
              {selectedNotifications.length > 0 && (
                <div className="selection-toolbar">
                  <span className="selection-count">
                    {selectedNotifications.length} selected
                  </span>
                  <div className="selection-actions">
                    <button 
                      className="selection-action" 
                      onClick={deleteSelected}
                      title="Delete selected"
                    >
                      <FaTrashAlt />
                      <span>Delete</span>
                    </button>
                    <button 
                      className="selection-action" 
                      onClick={resetSelection}
                      title="Cancel selection"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="select-all-row">
                <label className="select-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <span className="checkmark"></span>
                  <span className="select-all-text">Select all</span>
                </label>
                <span className="notification-count">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {Object.entries(groupNotificationsByDay).map(([day, dayNotifications]) => (
                <div key={day} className="notification-day-group">
                  <div className="day-header">{day}</div>
                  
                  {dayNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.is_read ? 'read' : 'unread'} ${selectedNotifications.includes(notification.id) ? 'selected' : ''}`}
                    >
                      <div className="notification-main" onClick={() => handleNotificationClick(notification)}>
                        <div className="notification-checkbox">
                          <label className="select-checkbox">
                            <input 
                              type="checkbox" 
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e) => toggleSelection(notification.id, e)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                        
                        <div className="notification-icon">
                          {getNotificationIcon(notification)}
                        </div>
                        
                        <div className="notification-content">
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-meta">
                            <span className="notification-time">{formatTimeAgo(notification.created_at)}</span>
                            {notification.type && (
                              <span className={`notification-type ${notification.type}`}>{notification.type}</span>
                            )}
                            {notification.comments && notification.comments.length > 0 && (
                              <span className="comment-count">
                                <FaComments /> {notification.comments.length}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="notification-actions">
                          {!notification.is_read && (
                            <button 
                              className="action-icon mark-read-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button 
                            className="action-icon reply-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplyClick(notification.id);
                            }}
                            title="Reply"
                          >
                            <FaReply />
                          </button>
                          <button 
                            className="action-icon delete-button" 
                            onClick={(e) => deleteNotification(notification.id, e)}
                            title="Delete notification"
                          >
                            <FaTrashAlt />
                          </button>
                          <div className="action-icon more-button">
                            <FaEllipsisV />
                            <div className="action-dropdown">
                              {!notification.is_read && (
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}>
                                  Mark as read
                                </button>
                              )}
                              <button onClick={(e) => {
                                e.stopPropagation();
                                handleReplyClick(notification.id);
                              }}>
                                Reply
                              </button>
                              <button onClick={(e) => deleteNotification(notification.id, e)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments section */}
                      {renderComments(notification)}
                      
                      {/* Reply input if replying to this notification */}
                      {replyingTo && replyingTo.notificationId === notification.id && !replyingTo.commentId && (
                        <div className="notification-reply">
                          {renderReplyInput()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Floating reply box for comment replies */}
              {replyingTo && replyingTo.commentId && (
                <div className="floating-reply-box">
                  {renderReplyInput()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;