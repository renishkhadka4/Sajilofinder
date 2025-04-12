import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PencilIcon, UserCircleIcon } from "lucide-react";
import api from "../api/axios";
import "../styles/StudentProfile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const StudentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
    profile_picture: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { message: "Please login to view your profile" } });
      return;
    }
    
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/auth/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      // Set preview image only if it exists in the response
      if (res.data.profile_picture) {
        setPreviewImage(res.data.profile_picture);
      }
      setCharCount(res.data.bio?.length || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Unable to fetch profile data";
      toast.error(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!user.username.trim()) errors.username = "Username is required";
    if (!user.first_name.trim()) errors.first_name = "First name is required";
    if (!user.last_name.trim()) errors.last_name = "Last name is required";
    
    if (user.bio && user.bio.length > 500) errors.bio = "Bio must be less than 500 characters";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    
    if (name === "bio") {
      setCharCount(value.length);
    }
    
    setIsDirty(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, profile_picture: "Image must be less than 5MB" }));
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, profile_picture: "Please select a valid image (JPEG, PNG, GIF, WebP)" }));
      return;
    }
    
    // Clear any previous error
    setFormErrors(prev => ({ ...prev, profile_picture: null }));
    
    // Store the file object in user state
    setUser((prev) => ({ ...prev, profile_picture: file }));
    
    // Create a URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("first_name", user.first_name);
      formData.append("last_name", user.last_name);
      formData.append("bio", user.bio || "");
      
      // Only append profile_picture if it's a File object
      if (user.profile_picture instanceof File) {
        formData.append("profile_picture", user.profile_picture);
      }

      await api.put("/auth/profile/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
      setIsDirty(false);
      fetchProfile(); // Refresh data after successful update
    } catch (err) {
      const errorData = err.response?.data || {};
      
      if (errorData.errors) {
        setFormErrors(errorData.errors);
      } else {
        toast.error(errorData.message || "Failed to update profile");
      }
      
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsDirty(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">
          <p>Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-picture-container">
              {previewImage ? (
                <div className="profile-picture-wrapper">
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="profile-picture"
                  />
                </div>
              ) : (
                <div className="profile-picture-placeholder">
                  <UserCircleIcon size={80} />
                </div>
              )}
              
              <label htmlFor="profile-picture-upload" className="change-picture-btn">
                <PencilIcon size={16} />
                <span>Change picture</span>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden-upload"
                />
              </label>
              {formErrors.profile_picture && (
                <p className="error-text">{formErrors.profile_picture}</p>
              )}
            </div>
            
            <div className="profile-info">
              <h3 title={`${user.first_name} ${user.last_name}`}>
                {user.first_name} {user.last_name}
              </h3>
              <p className="username">@{user.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Account Information</h2>
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  className={formErrors.username ? "input-error" : ""}
                />
                {formErrors.username && (
                  <p className="error-text">{formErrors.username}</p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={user.first_name}
                    onChange={handleChange}
                    className={formErrors.first_name ? "input-error" : ""}
                  />
                  {formErrors.first_name && (
                    <p className="error-text">{formErrors.first_name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={user.last_name}
                    onChange={handleChange}
                    className={formErrors.last_name ? "input-error" : ""}
                  />
                  {formErrors.last_name && (
                    <p className="error-text">{formErrors.last_name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>About Me</h2>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={user.bio || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell others a bit about yourself..."
                  className={formErrors.bio ? "input-error" : ""}
                ></textarea>
                <div className="character-count">
                  {charCount}/500 characters
                </div>
                {formErrors.bio && (
                  <p className="error-text">{formErrors.bio}</p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="save-btn" 
                disabled={saving || !isDirty}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentProfile;