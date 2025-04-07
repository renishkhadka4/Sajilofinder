import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/AdminBlog.css';

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({ title: "", content: "", image: null });
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/admin/blogs/");
      setBlogs(res.data);
    } catch (err) {
      toast.error("Failed to load blogs");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files[0]) {
      setImagePreview(URL.createObjectURL(files[0]));
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    if (formData.image) form.append("image", formData.image);

    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        await api.put(`/admin/blogs/${editingId}/`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Blog updated successfully!");
      } else {
        await api.post("/admin/blogs/", form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Blog added successfully!");
      }
      setFormData({ title: "", content: "", image: null });
      setEditingId(null);
      setImagePreview(null);
      fetchBlogs();
    } catch (error) {
      console.error("Blog save failed:", error.response?.data);
      toast.error("Failed to save blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({ title: blog.title, content: blog.content, image: null });
    setImagePreview(blog.image);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/admin/blogs/${id}/`);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", image: null });
    setEditingId(null);
    setImagePreview(null);
  };

  return (
    
    <div className="admin-blog-container">
       <AdminSidebar />
      {/* We assume AdminSidebar is already rendered at parent level */}
      <div className="admin-blog-content">
        <div className="admin-blog-inner">
          <h2 className="admin-blog-title">
            {editingId ? "Edit Blog Post" : "Create New Blog Post"}
          </h2>

          <form onSubmit={handleSubmit} className="admin-blog-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter blog title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter blog content"
                rows={6}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Featured Image</label>
              <input 
                id="image"
                type="file" 
                name="image" 
                onChange={handleChange} 
              />
              
              {imagePreview && (
                <div className="image-preview">
                  <p>Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                  />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingId ? "Update Blog" : "Publish Blog"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="blogs-section">
            <h3>Published Blogs</h3>
            
            {blogs.length === 0 ? (
              <p className="no-blogs">No blogs published yet</p>
            ) : (
              <div className="blogs-list">
                {blogs.map((blog) => (
                  <div key={blog.id} className="blog-item">
                    <div className="blog-header">
                      <h4>{blog.title}</h4>
                      <div className="blog-actions">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="blog-content">{blog.content}</p>
                    
                    {blog.image && (
                      <div className="blog-image">
                        <img
                          src={blog.image}
                          alt={blog.title}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;