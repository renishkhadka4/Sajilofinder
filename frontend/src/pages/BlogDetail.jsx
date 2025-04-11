import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useParams } from "react-router-dom";
import "../styles/B;ogDetails.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api.get(`/admin/public/blogs/${id}/`)
      .then(res => setBlog(res.data))
      .catch(err => console.error("Error fetching blog:", err));
  }, [id]);

  if (!blog) return <div className="loading-container">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="blog-detail-container">
        {blog.image && (
          <div className="blog-image-container">
            <img src={blog.image} alt={blog.title} className="blog-image" />
          </div>
        )}
        <h1 className="blog-title">{blog.title}</h1>
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>
      <Footer />
    </>
    
  );
};

export default BlogDetail;