import React, { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import "../styles/ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError("");

    try {
      await api.post("/admin/contact-messages/", formData);
      setSuccess("Your message has been sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-description">
          Have a question, feedback, or concern? Send us a message.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">Send Message</button>

          {success && <p className="success-msg">{success}</p>}
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </>
  );
};

export default ContactUs;
