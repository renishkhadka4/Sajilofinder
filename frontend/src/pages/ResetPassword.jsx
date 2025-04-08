import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import '../styles/ResetPassword.css';
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Password strength",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let strengthMessage = "Very weak";
    
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    if (score === 1) strengthMessage = "Weak";
    else if (score === 2) strengthMessage = "Medium";
    else if (score === 3) strengthMessage = "Strong";
    else if (score === 4) strengthMessage = "Very strong";
    
    setPasswordStrength({ score, message: strengthMessage });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (passwordStrength.score < 2) {
      setError("Please use a stronger password");
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post("/password/reset/", { 
        token, 
        new_password: formData.newPassword 
      });
      
      setMessage("Password reset successful! Redirecting to login...");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password. Token may be expired.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if token is valid on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        await api.get(`/password/validate-token/${token}`);
      } catch (err) {
        setError("Invalid or expired password reset link");
      }
    };
    
    validateToken();
  }, [token]);

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 className="reset-password-title">Reset Your Password</h2>
        <p className="reset-password-subtitle">Please enter your new password below</p>
        
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="success-alert">
            <span className="success-icon">✅</span>
            <span>{message}</span>
          </div>
        )}
        
        <form onSubmit={handleReset} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
            <div className="password-strength">
              <div className="strength-meter">
                <div 
                  className={`strength-meter-fill strength-${passwordStrength.score}`}
                  style={{ width: `${passwordStrength.score * 25}%` }}
                ></div>
              </div>
              <span className="strength-text">{passwordStrength.message}</span>
            </div>
            <p className="password-requirements">
              Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword" 
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="reset-button"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        
        <div className="form-footer">
          <a href="/login" className="form-link">Return to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;