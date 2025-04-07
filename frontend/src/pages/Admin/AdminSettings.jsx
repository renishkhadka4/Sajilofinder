import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/AdminSetting.css';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    profile_picture: null,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailStep, setEmailStep] = useState("input"); // input | verify
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/profile/");
      setFormData(res.data);
      
      // Set profile image if available
      if (res.data.profile_picture) {
        setProfileImage(res.data.profile_picture);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && name === "profile_picture") {
      // Preview profile image
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
      
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = new FormData();
      payload.append("first_name", formData.first_name);
      payload.append("last_name", formData.last_name);
      
      if (formData.profile_picture instanceof File) {
        payload.append("profile_picture", formData.profile_picture);
      }

      await api.patch("/admin/profile/", payload);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const requestEmailChange = async () => {
    if (!newEmail) {
      toast.error("Please enter new email");
      return;
    }
    
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setSendingOtp(true);
    try {
      await api.post("/admin/profile/request-email-change/", { new_email: newEmail });
      toast.success("OTP sent to your new email address");
      setEmailStep("verify");
    } catch (err) {
      console.error("Error sending OTP:", err);
      toast.error("Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }
    
    setVerifyingOtp(true);
    try {
      await api.post("/admin/profile/verify-email-change/", { otp });
      toast.success("Email changed successfully!");
      setFormData(prev => ({ ...prev, email: newEmail }));
      setEmailStep("input");
      setNewEmail("");
      setOtp("");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast.error("Invalid verification code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-settings-header">
          <h2>Admin Profile Settings</h2>
        </div>
        
        <div className="settings-container">
          <div className="settings-panel">
            <div className="profile-section">
              <h3>Personal Information</h3>
              
              <div className="profile-image-container">
                <div className="profile-image">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <div className="profile-initials">
                      {formData.first_name && formData.last_name ? 
                        `${formData.first_name.charAt(0)}${formData.last_name.charAt(0)}` : 
                        formData.username?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <label htmlFor="profile_picture" className="change-image-btn">
                  Change Image
                </label>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    disabled
                    value={formData.username || ""}
                    className="form-control disabled"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled
                    value={formData.email || ""}
                    className="form-control disabled"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      placeholder="Enter your first name"
                      value={formData.first_name || ""}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      placeholder="Enter your last name"
                      value={formData.last_name || ""}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="file-input"
                />
                
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
                      "Save Profile"
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="email-change-section">
              <h3>Change Email Address</h3>
              <p className="section-description">
                Update your email address by verifying with a one-time password.
              </p>
              
              {emailStep === "input" ? (
                <div className="email-change-form">
                  <div className="form-group">
                    <label htmlFor="new-email">New Email Address</label>
                    <input
                      type="email"
                      id="new-email"
                      placeholder="Enter your new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <button
                    onClick={requestEmailChange}
                    className="otp-btn"
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? (
                      <>
                        <span className="spinner-small"></span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </div>
              ) : (
                <div className="otp-verification-form">
                  <div className="form-group">
                    <label htmlFor="otp">Verification Code</label>
                    <input
                      type="text"
                      id="otp"
                      placeholder="Enter the 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="form-control"
                    />
                    <small>A verification code has been sent to {newEmail}</small>
                  </div>
                  
                  <div className="otp-actions">
                    <button
                      onClick={() => {
                        setEmailStep("input");
                        setOtp("");
                      }}
                      className="back-btn"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={verifyEmailOtp}
                      className="verify-btn"
                      disabled={verifyingOtp}
                    >
                      {verifyingOtp ? (
                        <>
                          <span className="spinner-small"></span>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;