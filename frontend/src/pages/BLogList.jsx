import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import "../styles/Blog.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/admin/public/blogs/")
      .then(res => {
        setBlogs(res.data);
        setAllBlogs(res.data);
      })
      .catch(err => console.error("Error fetching blogs:", err));
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setBlogs(allBlogs);
    } else {
      const filteredBlogs = allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(term.toLowerCase()) || 
        blog.content.toLowerCase().includes(term.toLowerCase())
      );
      setBlogs(filteredBlogs);
    }
  };

  return (
    <>
      <Navbar />
      <div className="blog-container">
        <h1 className="blog-heading">Latest Blogs</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="blog-grid">
          {blogs.length > 0 ? (
            blogs.map(blog => (
              <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card">
                {blog.image && <img src={blog.image} alt={blog.title} className="blog-image" />}
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-snippet">
                  {blog.content.slice(0, 100)}...
                </p>
              </Link>
            ))
          ) : (
            <p className="no-results">No blogs found matching your search.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogList;