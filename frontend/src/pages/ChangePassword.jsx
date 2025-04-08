import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../pages/Sidebar";
import "../styles/ChangePassoword.css";

const ChangePassword = () => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({ ...prevData, [name]: value }));
        
        // Run validation checks when new password changes
        if (name === "new_password") {
            validatePassword(value);
        }
        
        // Check if passwords match when either new_password or confirm_password changes
        if (name === "new_password" || name === "confirm_password") {
            setValidationErrors(prev => ({
                ...prev,
                match: passwordData.confirm_password === value || 
                      (name === "confirm_password" && passwordData.new_password === value)
            }));
        }
    };

    const validatePassword = (password) => {
        setValidationErrors({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
            match: password === passwordData.confirm_password && password !== ""
        });
    };

    const allValidationsPassed = () => {
        return Object.values(validationErrors).every(value => value === true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        // Validate form data
        if (!passwordData.current_password) {
            setError("⚠ Please enter your current password.");
            return;
        }
        
        if (!passwordData.new_password) {
            setError("⚠ Please enter a new password.");
            return;
        }
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("⚠ New passwords don't match.");
            return;
        }
        
        if (!allValidationsPassed()) {
            setError("⚠ Please ensure your password meets all requirements.");
            return;
        }
        
        setLoading(true);
        let token = localStorage.getItem("token");
        
        try {
            await api.put("/auth/change-password/", {
                old_password: passwordData.current_password,
                new_password: passwordData.new_password
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage("✅ Password updated successfully!");
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });
            
            // Reset validations
            setValidationErrors({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false,
                match: false
            });
            
            // Navigate back to profile after successful password change (optional)
            setTimeout(() => {
                navigate("/profile");
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
            <Sidebar />
            <div className="dashboard-main">
                <div className="change-password-page">
                    <h1>Change Your Password</h1>
                    <p className="page-description">
                        Update your password to keep your account secure. Your new password must meet all the requirements below.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handleChange}
                                placeholder="Enter your current password"
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
                                placeholder="Enter your new password"
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
                                placeholder="Confirm your new password"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="password-requirements">
                            <h3>Password Requirements</h3>
                            <ul className="requirements-list">
                                <li className={validationErrors.length ? "valid" : "invalid"}>
                                    At least 8 characters long
                                </li>
                                <li className={validationErrors.uppercase ? "valid" : "invalid"}>
                                    At least one uppercase letter (A-Z)
                                </li>
                                <li className={validationErrors.lowercase ? "valid" : "invalid"}>
                                    At least one lowercase letter (a-z)
                                </li>
                                <li className={validationErrors.number ? "valid" : "invalid"}>
                                    At least one number (0-9)
                                </li>
                                <li className={validationErrors.special ? "valid" : "invalid"}>
                                    At least one special character (!@#$%^&*)
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
                                onClick={() => navigate("/profile")}
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
        </div>
    );
};

export default ChangePassword;