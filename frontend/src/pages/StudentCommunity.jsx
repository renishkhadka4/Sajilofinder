import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/Communitys.css';
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const StudentCommunity = () => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentMap, setCommentMap] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community/posts/');
      const posts = res.data;

      const commentRes = await api.get('/community/comments/');
      const map = {};
      commentRes.data.forEach((comment) => {
        if (!map[comment.post]) map[comment.post] = [];
        map[comment.post].push(comment);
      });

      setPosts(posts);
      setCommentMap(map);
    } catch (error) {
      toast.error('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!caption && !image) {
      return toast.error('Please add a caption or image to create a post.');
    }

    const formData = new FormData();
    formData.append('caption', caption);
    if (image) formData.append('image', image);

    setSubmitting(true);
    try {
      await api.post('/community/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Post created successfully!');
      setCaption('');
      setImage(null);
      setPreview(null);
      fetchPosts();
    } catch (error) {
      toast.error('Error creating post. Please try again.');
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like/`);
      fetchPosts();
    } catch (error) {
      toast.error('Error liking post.');
      console.error('Error liking post:', error);
    }
  };

  const handleCommentChange = (postId, text) => {
    setNewComments({...newComments, [postId]: text});
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = newComments[postId];
    if (!commentText || commentText.trim() === '') {
      return toast.error('Please write a comment first');
    }

    try {
      await api.post('/community/comments/', {
        post: postId,
        text: commentText,
      });
      toast.success('Comment added successfully!');
      setNewComments({...newComments, [postId]: ''});
      fetchPosts();
    } catch (error) {
      toast.error('Error adding comment');
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await api.post(`/community/comments/${commentId}/like/`);
      fetchPosts();
    } catch (error) {
      toast.error('Error liking comment.');
      console.error('Error liking comment:', error);
    }
  };

  const renderComments = (comments, parentId = null) => {
    if (!comments || comments.length === 0) return null;
    
    return comments
      .filter((c) => c.parent === parentId)
      .map((comment) => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <strong>{comment.user.username}</strong>
            <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <p className="comment-text">{comment.text}</p>
          <div className="comment-actions">
            <button 
              className={`like-button ${comment.liked_by_user ? 'liked' : ''}`}
              onClick={() => handleCommentLike(comment.id)}
            >
              👍 {comment.likes_count}
            </button>
          </div>
          <div className="replies">{renderComments(comments, comment.id)}</div>
        </div>
      ));
  };

  const highlightHashtags = (text) => {
    if (!text) return '';
    
    return text.split(' ').map((word, idx) =>
      word.startsWith('#') ? (
        <span key={idx} className="hashtag">{word} </span>
      ) : (
        <span key={idx}>{word} </span>
      )
    );
  };

  return (
    <div className='renish'>
        <Navbar />
    <div className="community-page">
 
      <div className="community-container">
        
        <div className="create-post">
          <h2>Create Post</h2>
          <form onSubmit={handlePostSubmit}>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share something with the community..."
              rows="4"
            />
            <div className="file-input-container">
            <label htmlFor="image-upload" className="choose-image-button">
    📁 Choose Image
  </label>
  <input
    type="file"
    id="image-upload"
    accept="image/*"
    onChange={handleImageChange}
    className="hidden-file-input"
  />
              
              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <button 
                    type="button" 
                    className="remove-image" 
                    onClick={handleRemoveImage}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="post-button" 
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>

        <div className="post-feed">
          <h2>Community Posts</h2>
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">No posts available. Be the first to share!</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <strong>{post.author_name}</strong>
                  </div>
                  <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
                </div>
                
                <div className="post-content">
                  {post.caption && (
                    <p className="post-caption">{highlightHashtags(post.caption)}</p>
                  )}
                  {post.image && (
                    <img src={post.image} alt="Post" className="post-image" loading="lazy" />
                  )}
                </div>
                
                <div className="post-actions">
                  <button 
                    className={`like-button ${post.liked_by_user ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    ❤️ {post.likes_count}
                  </button>
                </div>

                <div className="comments-section">
                  <h4>Comments</h4>
                  {commentMap[post.id] && commentMap[post.id].length > 0 ? (
                    <div className="comments-list">
                      {renderComments(commentMap[post.id])}
                    </div>
                  ) : (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  )}
                  
                  <div className="comment-form">
                    <input
                      type="text"
                      value={newComments[post.id] || ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button 
                      onClick={() => handleCommentSubmit(post.id)}
                      className="comment-button"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    <Footer />
    </div>
    
  );
};

export default StudentCommunity;
