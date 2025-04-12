import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Lock } from "lucide-react";
import "../styles/StudentChangePassword.css";

const PasswordRequirement = ({ met, label }) => (
  <div className={`requirement-item ${met ? "requirement-met" : "requirement-unmet"}`}>
    {met ? <CheckCircle className="requirement-icon-success" size={16} /> : <XCircle className="requirement-icon-error" size={16} />}
    <span>{label}</span>
  </div>
);

const StudentChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: "",
    success: false
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  // Check password match when either password changes
  useEffect(() => {
    if (formData.new_password || formData.confirm_password) {
      setValidations(prev => ({
        ...prev,
        match: 
          formData.new_password === formData.confirm_password && 
          formData.confirm_password !== ""
      }));
    }
  }, [formData.new_password, formData.confirm_password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "new_password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    setValidations(prev => ({
      ...prev,
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const allValidationsPassed = () => {
    const allRequirementsMet = Object.values(validations).every(Boolean);
    return allRequirementsMet && 
           formData.current_password.trim() !== "" && 
           formData.new_password.trim() !== "" && 
           formData.confirm_password.trim() !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({
      loading: false,
      message: "",
      error: "",
      success: false
    });

    if (!formData.current_password) {
      return setStatus(prev => ({ ...prev, error: "Please enter your current password." }));
    }

    if (!formData.new_password) {
      return setStatus(prev => ({ ...prev, error: "Please enter a new password." }));
    }

    if (formData.new_password !== formData.confirm_password) {
      return setStatus(prev => ({ ...prev, error: "Passwords do not match." }));
    }

    if (!allValidationsPassed()) {
      return setStatus(prev => ({ ...prev, error: "Password must meet all requirements." }));
    }

    setStatus(prev => ({ ...prev, loading: true }));
    const token = localStorage.getItem("token");

    try {
      await api.put(
        "/auth/change-password/",
        {
          old_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus({
        loading: false,
        message: "Password updated successfully!",
        error: "",
        success: true
      });

      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      
      // Reset validations
      setValidations({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false
      });

      // Redirect to login after successful password change
      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.response && error.response.status === 400) {
        setStatus({
          loading: false,
          message: "",
          error: "Incorrect current password.",
          success: false
        });
      } else {
        setStatus({
          loading: false,
          message: "",
          error: "Failed to update password. Please try again later.",
          success: false
        });
      }
    }
  };

  return (
    <div className="password-change-page-wrapper">
      <Navbar />
      <div className="password-change-content">
        <div className="password-change-container">
          <div className="password-change-header">
            <div className="password-change-icon-wrapper">
              <Lock className="password-change-icon" size={28} />
            </div>
            <h1 className="password-change-title">Change Password</h1>
            <p className="password-change-description">
              Update your password to keep your account secure
            </p>
          </div>

          {status.error && (
            <div className="password-change-alert password-change-alert-error">
              <AlertTriangle size={18} />
              <span>{status.error}</span>
            </div>
          )}

          {status.success && (
            <div className="password-change-alert password-change-alert-success">
              <CheckCircle size={18} />
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="password-change-form">
            <div className="password-change-form-group">
              <label htmlFor="current_password" className="password-change-label">Current Password</label>
              <div className="password-change-input-wrapper">
                <input
                  id="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  disabled={status.loading}
                  className="password-change-input"
                />
                <button 
                  type="button"
                  className="password-change-toggle-btn"
                  onClick={() => togglePasswordVisibility("current")}
                  tabIndex="-1"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-change-form-group">
              <label htmlFor="new_password" className="password-change-label">New Password</label>
              <div className="password-change-input-wrapper">
                <input
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  disabled={status.loading}
                  className="password-change-input"
                />
                <button 
                  type="button"
                  className="password-change-toggle-btn"
                  onClick={() => togglePasswordVisibility("new")}
                  tabIndex="-1"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-change-form-group">
              <label htmlFor="confirm_password" className="password-change-label">Confirm New Password</label>
              <div className="password-change-input-wrapper">
                <input
                  id="confirm_password"
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  disabled={status.loading}
                  className="password-change-input"
                />
                <button 
                  type="button"
                  className="password-change-toggle-btn"
                  onClick={() => togglePasswordVisibility("confirm")}
                  tabIndex="-1"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-change-requirements">
              <h3 className="password-change-requirements-title">Password Requirements</h3>
              <div className="password-change-requirements-grid">
                <PasswordRequirement met={validations.length} label="At least 8 characters" />
                <PasswordRequirement met={validations.uppercase} label="At least one uppercase letter" />
                <PasswordRequirement met={validations.lowercase} label="At least one lowercase letter" />
                <PasswordRequirement met={validations.number} label="At least one number" />
                <PasswordRequirement met={validations.special} label="At least one special character" />
                <PasswordRequirement met={validations.match} label="Passwords match" />
              </div>
            </div>

            <div className="password-change-actions">
              <button
                type="button"
                className="password-change-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={status.loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`password-change-submit-btn ${allValidationsPassed() ? "password-change-submit-btn-enabled" : "password-change-submit-btn-disabled"}`}
                disabled={status.loading || !allValidationsPassed()}
              >
                {status.loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentChangePassword;