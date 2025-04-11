import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/StudentChnagePassword.css";
import Footer from "../components/Footer";
const StudentChangePassword = () => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  // Fix: Add useEffect to check password match when either password changes
  useEffect(() => {
    if (passwordData.new_password || passwordData.confirm_password) {
      setValidationErrors(prev => ({
        ...prev,
        match: 
          passwordData.new_password === passwordData.confirm_password && 
          passwordData.confirm_password !== ""
      }));
    }
  }, [passwordData.new_password, passwordData.confirm_password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "new_password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    setValidationErrors((prev) => ({
      ...prev,
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }));
  };

  const allValidationsPassed = () => {
    // Fix: Check if all validations are true and both passwords are entered
    const allRequirementsMet = Object.values(validationErrors).every(Boolean);
    return allRequirementsMet && 
           passwordData.current_password.trim() !== "" && 
           passwordData.new_password.trim() !== "" && 
           passwordData.confirm_password.trim() !== "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!passwordData.current_password) {
      return setError("⚠ Please enter your current password.");
    }

    if (!passwordData.new_password) {
      return setError("⚠ Please enter a new password.");
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return setError("⚠ Passwords do not match.");
    }

    if (!allValidationsPassed()) {
      return setError("⚠ Password must meet all requirements.");
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await api.put(
        "/auth/change-password/",
        {
          old_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage("✅ Password updated successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
      // Reset validations after successful password change
      setValidationErrors({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false
      });

      setTimeout(() => {
        localStorage.removeItem("token"); // ✅ Clear token
       
        navigate("/login"); // ✅ Redirect to login
      }, 2000);
      
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response && error.response.status === 400) {
        setError("⚠ Incorrect current password.");
      } else {
        setError("⚠ Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-main">
        <div className="change-password-page">
          <h1>Change Password</h1>
          <p className="page-description">
            Please enter your current and new password below.
          </p>

          <form onSubmit={handleSubmit} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <div className="password-requirements">
              <h3>Password Requirements</h3>
              <ul className="requirements-list">
                <li className={validationErrors.length ? "valid" : "invalid"}>
                  At least 8 characters
                </li>
                <li className={validationErrors.uppercase ? "valid" : "invalid"}>
                  At least one uppercase letter
                </li>
                <li className={validationErrors.lowercase ? "valid" : "invalid"}>
                  At least one lowercase letter
                </li>
                <li className={validationErrors.number ? "valid" : "invalid"}>
                  At least one number
                </li>
                <li className={validationErrors.special ? "valid" : "invalid"}>
                  At least one special character
                </li>
                <li className={validationErrors.match ? "valid" : "invalid"}>
                  Passwords match
                </li>
              </ul>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                
                disabled={loading || !allValidationsPassed()}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentChangePassword;