import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../pages/Sidebar"; 
import "../styles/ProfileSettings.css";

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        first_name: "",
        last_name: "",
        profile_picture: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            let token = localStorage.getItem("token");
            const response = await api.get("/auth/profile/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
            setPreviewImage(response.data.profile_picture);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser((prevUser) => ({ ...prevUser, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        let token = localStorage.getItem("token");

        try {
            let formData = new FormData();
            formData.append("username", user.username);
            formData.append("first_name", user.first_name);
            formData.append("last_name", user.last_name);

            if (user.profile_picture instanceof File) {
                formData.append("profile_picture", user.profile_picture);
            }

            await api.put("/auth/profile/", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            setMessage("✅ Profile updated successfully!");
            fetchUserProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("⚠ Failed to update profile.");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        // Validate password data
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
        } catch (error) {
            console.error("Error changing password:", error);
            if (error.response && error.response.status === 400) {
                setError("⚠ Incorrect current password.");
            } else {
                setError("⚠ Failed to update password.");
            }
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <div className="profile-settings">
                    <h1>Profile Settings</h1>
                    {loading ? (
                        <p className="loading-indicator">Loading...</p>
                    ) : (
                        <>
                            <div className="settings-container">
                                <div className="profile-section">
                                    <h2>Personal Information</h2>
                                    <form onSubmit={handleSubmit} className="profile-form">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input type="text" name="username" value={user.username} onChange={handleChange} />
                                        </div>

                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input type="text" name="first_name" value={user.first_name} onChange={handleChange} />
                                        </div>

                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" name="last_name" value={user.last_name} onChange={handleChange} />
                                        </div>

                                        <div className="form-group">
                                            <label>Profile Picture</label>
                                            <div className="file-input-container">
                                                <input 
                                                    type="file" 
                                                    name="profile_picture" 
                                                    accept="image/*" 
                                                    onChange={handleImageChange} 
                                                    id="profile-picture-input" 
                                                />
                                                <label htmlFor="profile-picture-input" className="file-input-label">
                                                    Choose Image
                                                </label>
                                            </div>
                                            {previewImage && (
                                                <div className="preview-container">
                                                    <img src={previewImage} alt="Profile Preview" className="profile-preview" />
                                                </div>
                                            )}
                                        </div>

                                        <button type="submit" className="update-btn">Update Profile</button>
                                    </form>
                                </div>

                                <div className="password-section">
                                    <h2>Change Password</h2>
                                    <form onSubmit={handlePasswordSubmit} className="password-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                name="current_password"
                                                value={passwordData.current_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter your current password"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter your new password"
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirm_password"
                                                value={passwordData.confirm_password}
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm your new password"
                                            />
                                        </div>
                                        
                                        <button type="submit" className="password-btn">Update Password</button>
                                    </form>
                                </div>
                            </div>

                            {message && <p className="success-message">{message}</p>}
                            {error && <p className="error-message">{error}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;