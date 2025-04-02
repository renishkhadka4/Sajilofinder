import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/ProfileSettings.css";

const StudentProfileSettings = () => {
    const [profile, setProfile] = useState({
        phone_number: "",
        first_name: "",
        last_name: "",
        profile_picture: null,
    });
    

    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    const fetchStudentProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/students/students/profile/", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile(res.data);
            setPreviewImage(res.data.profile_picture);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError("⚠ Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile((prev) => ({ ...prev, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("phone_number", profile.phone_number);
            formData.append("first_name", profile.first_name);
            formData.append("last_name", profile.last_name);
            if (profile.profile_picture instanceof File) {
                formData.append("profile_picture", profile.profile_picture);
            }
            

            await api.put("/students/students/profile/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("✅ Profile updated successfully!");
            fetchStudentProfile();
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("⚠ Failed to update profile.");
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-main">
                <div className="profile-settings">
                    <h1>Student Profile Settings</h1>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profile.first_name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={profile.last_name || ""}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={profile.phone_number || ""}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Profile Picture</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="profile-preview" />
                                )}
                            </div>

                            <button type="submit">Update Profile</button>

                            {message && <p className="success-message">{message}</p>}
                            {error && <p className="error-message">{error}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfileSettings;
