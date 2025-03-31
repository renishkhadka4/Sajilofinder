import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../pages/Sidebar"; // ✅ Sidebar included
import "../styles/ProfileSettings.css";

const ProfileSettings = () => {
    const [user, setUser] = useState({
        username: "",
        first_name: "",
        last_name: "",
        profile_picture: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [newPassword, setNewPassword] = useState({ old_password: "", new_password: "" });
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
            setPreviewImage(response.data.profile_picture); //  Show profile picture preview
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser((prevUser) => ({ ...prevUser, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file)); //  Show uploaded image preview
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

            setMessage(" Profile updated successfully!");
            fetchUserProfile(); //  Refetch updated user data
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("⚠ Failed to update profile.");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        let token = localStorage.getItem("token");

        if (!newPassword.old_password || !newPassword.new_password) {
            setError("⚠ Please enter both old and new passwords.");
            return;
        }

        try {
            await api.put("/auth/change-password/", newPassword, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage(" Password updated successfully!");
            setNewPassword({ old_password: "", new_password: "" }); //  Clear password fields
        } catch (error) {
            console.error("Error changing password:", error);
            setError("⚠ Failed to update password.");
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar /> {/*  Include the Sidebar */}
            <div className="dashboard-main">
                <div className="profile-settings">
                    <h1>Profile Settings</h1>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit}>
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
                                    <input type="file" name="profile_picture" accept="image/*" onChange={handleImageChange} />
                                    {previewImage && <img src={previewImage} alt="Profile Preview" className="profile-preview" />}
                                </div>

                                <button type="submit">Update Profile</button>
                            </form>

                            <form onSubmit={handlePasswordChange}>
                                <h2>Change Password</h2>
                                <input
                                    type="password"
                                    name="old_password"
                                    placeholder="Old Password"
                                    value={newPassword.old_password}
                                    onChange={(e) => setNewPassword({ ...newPassword, old_password: e.target.value })}
                                />
                                <input
                                    type="password"
                                    name="new_password"
                                    placeholder="New Password"
                                    value={newPassword.new_password}
                                    onChange={(e) => setNewPassword({ ...newPassword, new_password: e.target.value })}
                                />
                                <button type="submit">Change Password</button>
                            </form>

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
