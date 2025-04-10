import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/Community.css';
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar";// Use student sidebar

const StudentCommunity = () => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentMap, setCommentMap] = useState({});

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
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!caption && !image) return toast.error('Add a caption or image.');

    const formData = new FormData();
    formData.append('caption', caption);
    if (image) formData.append('image', image);

    setSubmitting(true);
    try {
      await api.post('/community/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Post created!');
      setCaption('');
      setImage(null);
      setPreview(null);
      fetchPosts();
    } catch {
      toast.error('Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like/`);
      fetchPosts();
    } catch {
      toast.error('Error liking post.');
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentMap((prev) => ({ ...prev, [`new-${postId}`]: text }));
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentMap[`new-${postId}`];
    if (!commentText) return toast.error('Write a comment first');

    try {
      await api.post('/community/comments/', {
        post: postId,
        text: commentText,
      });
      toast.success('Comment added!');
      fetchPosts();
    } catch {
      toast.error('Error adding comment');
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await api.post(`/community/comments/${commentId}/like/`);
      fetchPosts();
    } catch {
      toast.error('Error liking comment.');
    }
  };

  const renderComments = (comments, parentId = null) => {
    return comments
      .filter((c) => c.parent === parentId)
      .map((comment) => (
        <div key={comment.id} className="comment">
          <strong>{comment.user.username}</strong>: {comment.text}
          <button onClick={() => handleCommentLike(comment.id)}>
            👍 {comment.liked_by_user ? 'Unlike' : 'Like'}
          </button>
          <div className="replies">{renderComments(comments, comment.id)}</div>
        </div>
      ));
  };

  const highlightHashtags = (text) => {
    return text.split(' ').map((word, idx) =>
      word.startsWith('#') ? (
        <span key={idx} className="hashtag">{word} </span>
      ) : (
        <span key={idx}>{word} </span>
      )
    );
  };

  return (
    <div className="community-page">
      <Navbar />
      <div className="create-post">
        <h2>Create Post</h2>
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something..."
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" className="preview-image" />}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>

      <div className="post-feed">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <strong>{post.author_name}</strong>
                <span>{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <p>{highlightHashtags(post.caption)}</p>
              {post.image && <img src={post.image} alt="Post" className="post-image" />}
              <div className="post-actions">
                <button onClick={() => handleLike(post.id)}>❤️ {post.likes_count}</button>
              </div>

              <div className="comments-section">
                <h4>Comments</h4>
                {commentMap[post.id] ? (
                  renderComments(commentMap[post.id])
                ) : (
                  <p>No comments yet.</p>
                )}
                <div className="comment-form">
                  <input
                    type="text"
                    value={commentMap[`new-${post.id}`] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button onClick={() => handleCommentSubmit(post.id)}>Post</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentCommunity;
