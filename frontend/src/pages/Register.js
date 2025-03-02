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
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={registerImage} alt="Hostel" />
      </div>
      <div className="register-form">
        <h2>Create an account</h2>
        <p>Let's get started with your 30 days free trial</p>

        {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="password2" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} required />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="Student">Student</option>
            <option value="HostelOwner">Hostel Owner</option>
          </select>

          <button type="submit">Create Account</button>
        </form>

        <div className="google-signup">
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" />
          <span>Sign up with Google</span>
        </div>

        <div className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
