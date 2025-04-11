import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import registerImage from '../Assests/hostel.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setMessage('Passwords do not match!');
      return;
    }

    setLoading(true); // Set loading to true when form is submitted
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! Redirecting to OTP verification...');
        navigate('/verify-otp');  // Redirect to OTP verification page
      } else {
        console.error('Backend Error:', JSON.stringify(data));
        setMessage(data.detail || JSON.stringify(data) || 'Registration failed.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setMessage('Error connecting to the server.');
    } finally {
      setLoading(false); // Set loading to false regardless of outcome
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={registerImage} alt="Hostel" />
      </div>
      <div className="register-form">
        <div className="register-form-wrapper">
          <h2>Create an account</h2>
          <p className="subtitle">Let's get started with your 30 days free trial</p>

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              <span className="message-icon">
                {message.includes('successful') ? '✓' : '!'} 
              </span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input
                id="password2"
                type="password"
                name="password2"
                placeholder="••••••••"
                value={formData.password2}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Select Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="HostelOwner">Hostel Owner</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              {loading && <span className="spinner"></span>}
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-text">or</span>
          </div>

          <button type="button" className="google-signup">
            <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
            <span>Sign up with Google</span>
          </button>

          <div className="login-link">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;