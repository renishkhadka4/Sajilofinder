import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("login/", loginData);
      console.log("Login API Response:", response.data); // ✅ Debug API response
  
      const { access, role, username } = response.data; // ✅ Get username
  
      if (!username) {
        console.error("⚠️ Username is missing in API response. Fix backend.");
        return;
      }
  
      // ✅ Store user details
      localStorage.setItem("token", access);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify({ username })); // ✅ Store username
  
      console.log("Stored User:", localStorage.getItem("user")); // ✅ Debugging localStorage
  
      // ✅ Redirect based on role
      if (role === "HostelOwner") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data); // ✅ Log error
      setError(err.response?.data?.detail || "Login failed");
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-image">
      <img src={require('../Assests/hostel.jpg')} alt="Hostel View" />
      </div>
      <div className="login-form-container">
        <div className="login-form">
          <h2>
            WELCOME <span className="highlight">BACK</span>
          </h2>
          <p>Welcome back! Please enter your details.</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <div className="options">
              <label>
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <a href="/forgot-password">Forgot password?</a>
            </div>
            <button type="submit" className="login-button">
              Sign in
            </button>
          </form>
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up for free!</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
