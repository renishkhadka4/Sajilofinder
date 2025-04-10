import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams } from "react-router-dom";
import "../styles/Blog.css";
import Navbar from "../components/Navbar";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api.get(`/admin/public/blogs/${id}/`)
      .then(res => setBlog(res.data))
      .catch(err => console.error("Error fetching blog:", err));
  }, [id]);

  if (!blog) return <div className="about-loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="blog-detail-container">
        {blog.image && <img src={blog.image} alt={blog.title} className="blog-detail-image" />}
        <h1 className="blog-detail-title">{blog.title}</h1>
        <p className="blog-detail-content">{blog.content}</p>
      </div>
    </>
  );
};

export default BlogDetail;
