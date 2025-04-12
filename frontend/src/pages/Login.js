import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setLoginData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setError(""); // Clear error when user types
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!loginData.email) {
      setError("Email is required");
      return false;
    }
    
    if (!loginData.password) {
      setError("Password is required");
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post("login/", loginData);
      
      // Save or remove email based on remember me
      if (rememberMe) {
        localStorage.setItem("savedEmail", loginData.email);
      } else {
        localStorage.removeItem("savedEmail");
      }
      
      const { access, role, username } = response.data;
      
      if (!access || !role) {
        throw new Error("Invalid response data");
      }

      // Store user details
      localStorage.setItem("token", access);
      localStorage.setItem("role", role);
      
      if (username) {
        localStorage.setItem("user", JSON.stringify({ username }));
      }
      
      // Success feedback before redirect
      setError("");
      
      // Redirect based on role
      setTimeout(() => {
        if (role === "Admin") {
          navigate("/admin/Dashboard");
        } else if (role === "HostelOwner") {
          navigate("/dashboard");
        } else {
          if (onLoginSuccess) {
            onLoginSuccess(); // used in popup
          } else {
            if (role === "Admin") {
              navigate("/admin/Dashboard");
            } else if (role === "HostelOwner") {
              navigate("/dashboard");
            } else {
              navigate("/"); // fallback
            }
          }
          
        }
      }, 500);
      
    } catch (err) {
      console.error("Login Error:", err);
      
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to connect to server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={require('../Assests/hostel.jpg')} alt="Hostel View" />
        <div className="image-overlay">
          <div className="overlay-content">
            <h1>Find Your Perfect Stay</h1>
            <p>Discover comfortable and affordable hostels tailored to your needs</p>
          </div>
        </div>
      </div>
      
      <div className="login-form-container">
        <div className="login-form">
          <h2>
            WELCOME <span className="highlight">BACK</span>
          </h2>
          <p className="form-subtitle">Please enter your details to access your account</p>
          
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleChange}
                className={error && error.includes("email") ? "input-error" : ""}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleChange}
                  className={error && error.includes("password") ? "input-error" : ""}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
            </div>
            
           
            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
         
          
          <p className="signup-link">
            Don't have an account? <a href="/register">Sign up for free!</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;