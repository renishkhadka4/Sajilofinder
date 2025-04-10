import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/ProfileSettings.css"; // ✅ Reuse the same styles if consistent

const StudentProfile = () => {
    const [user, setUser] = useState({
        username: "",
        first_name: "",
        last_name: "",
        profile_picture: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/auth/profile/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setPreviewImage(res.data.profile_picture);
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser((prev) => ({ ...prev, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append("username", user.username);
            formData.append("first_name", user.first_name);
            formData.append("last_name", user.last_name);
            if (user.profile_picture instanceof File) {
                formData.append("profile_picture", user.profile_picture);
            }

            await api.put("/auth/profile/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("✅ Student profile updated!");
            fetchProfile();
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("⚠ Could not update profile.");
        }
    };

    return (
        <div className="profile-settings">
            <h2>My Profile</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={user.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={user.first_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={user.last_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {previewImage && (
                            <div className="preview-container">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="profile-preview"
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="update-btn">Update Profile</button>

                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default StudentProfile;
