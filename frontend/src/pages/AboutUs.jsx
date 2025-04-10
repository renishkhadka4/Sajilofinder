import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/AboutUs.css";
import Navbar from "../components/Navbar";

const AboutUs = () => {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    api.get("/admin/public/about/")
      .then((res) => {
        console.log("About Us Response:", res.data); // Debug log
        setAbout(res.data);
      })
      .catch((err) => console.error("Failed to fetch About Us:", err));
  }, []);

  if (!about) return <div className="about-loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="about-container">
        <h1 className="about-title">{about.title}</h1>
        <p className="about-description">{about.description}</p>

        <h2 className="about-subtitle">Our Services</h2>
        <ul className="about-services">
          {about.services_list && about.services_list.length > 0 ? (
            about.services_list.map((service, index) => (
              <li key={index}>• {service}</li>
            ))
          ) : (
            <li>No services listed.</li>
          )}
        </ul>

        <div className="about-images">
          {[about.image1, about.image2, about.image3, about.image4].map(
            (img, idx) =>
              img && (
                <img
                  key={idx}
                  src={img}
                  alt={`About ${idx + 1}`}
                  className="about-img"
                />
              )
          )}
        </div>
      </div>
    </>
  );
};

export default AboutUs;
