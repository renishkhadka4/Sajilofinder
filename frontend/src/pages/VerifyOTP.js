import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import '../styles/VerfiyOTP.css';
import otpImage from '../Assests/otp.jpg';  // Add an illustrative image for OTP verification

function VerifyOTP() {
  const [otpData, setOtpData] = useState({ email: '', otp: '' });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('verify-otp/', otpData);
      navigate('/login');  // Redirect to login after successful OTP verification
    } catch (err) {
      setError(err.response?.data?.detail || 'OTP verification failed');
    }
  };

  const handleBack = () => {
    navigate('/register');  // Prevent going back in browser, redirect to registration form
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-image">
        <img src={otpImage} alt="OTP Verification" />
      </div>
      <div className="verify-otp-form">
        <h2>Verify Your Account</h2>
        <p>Please enter the OTP sent to your email to verify your account.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
          <button type="submit">Verify OTP</button>
          <button type="button" onClick={handleBack}>Back to Registration</button>
        </form>

        <div className="resend-otp">
          Didn't receive the code? <a href="#">Resend OTP</a>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
