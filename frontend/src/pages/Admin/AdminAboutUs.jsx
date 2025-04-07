import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/AboutUsAdmin.css';

const AdminAboutUs = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    services: "",
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const fetchAboutInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/about/");
      setFormData({
        title: res.data.title || "",
        description: res.data.description || "",
        services: res.data.services || "",
        image1: null,
        image2: null,
        image3: null,
        image4: null,
      });
      
      // Set existing image previews if available
      setPreviewImages({
        image1: res.data.image1 ? res.data.image1 : null,
        image2: res.data.image2 ? res.data.image2 : null,
        image3: res.data.image3 ? res.data.image3 : null,
        image4: res.data.image4 ? res.data.image4 : null,
      });
    } catch (err) {
      console.log("No existing About Us data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
      
      // Update form data
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
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
    setSaving(true);
    
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("services", formData.services);
    
    if (formData.image1) form.append("image1", formData.image1);
    if (formData.image2) form.append("image2", formData.image2);
    if (formData.image3) form.append("image3", formData.image3);
    if (formData.image4) form.append("image4", formData.image4);

    try {
      await api.post("/admin/about/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("About Us information saved successfully!");
      fetchAboutInfo();
    } catch (err) {
      toast.error("Failed to save About Us information. Please try again.");
      console.error("Error saving About Us:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchAboutInfo();
    toast.info("Form has been reset to saved values");
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading About Us information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-about-header">
          <h2>Manage About Us Section</h2>
          <div className="header-actions">
            <button 
              type="button" 
              onClick={handleReset} 
              className="reset-btn"
              disabled={saving}
            >
              Reset Form
            </button>
          </div>
        </div>
        
        <div className="about-us-form-container">
          <form onSubmit={handleSubmit} className="about-us-form">
            <div className="form-section">
              <h3>Company Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Company Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter company title"
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Company Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter detailed company description"
                  className="form-control"
                  rows={6}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="services">Services Offered</label>
                <input
                  type="text"
                  id="services"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="Enter services (comma-separated)"
                  className="form-control"
                />
                <small>Example: Web Development, Mobile Apps, UI/UX Design</small>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Image Gallery</h3>
              <p className="section-description">Upload images to showcase your company. Recommended size: 800x600px</p>
              
              <div className="image-upload-grid">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="image-upload-item">
                    <label htmlFor={`image${num}`} className="image-upload-label">
                      {previewImages[`image${num}`] ? (
                        <div className="image-preview">
                          <img 
                            src={previewImages[`image${num}`]} 
                            alt={`Preview ${num}`} 
                            className="preview-img"
                          />
                          <div className="image-overlay">
                            <span>Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <span className="upload-icon">+</span>
                          <span>Upload Image {num}</span>
                        </div>
                      )}
                    </label>
                    <input
                      type="file"
                      id={`image${num}`}
                      name={`image${num}`}
                      onChange={handleChange}
                      accept="image/*"
                      className="file-input"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save About Us"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAboutUs;