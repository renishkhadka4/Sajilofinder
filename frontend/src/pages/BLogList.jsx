import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import "../styles/Blog.css";
import Navbar from "../components/Navbar";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/admin/public/blogs/")
      .then(res => setBlogs(res.data))
      .catch(err => console.error("Error fetching blogs:", err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="blog-container">
        <h1 className="blog-heading">Latest Blogs</h1>
        <div className="blog-grid">
          {blogs.map(blog => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card">
              {blog.image && <img src={blog.image} alt={blog.title} className="blog-image" />}
              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-snippet">
                {blog.content.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogList;
