import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/Hostels.css";
import Navbar from "../components/Navbar";

const Hostels = () => {
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await api.get("/hostel_owner/hostels/");
        setHostels(response.data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
      }
    };
    fetchHostels();
  }, []);

  return (
    <div>
      <Navbar /> 
      <div className="hostels-container">
        <h1 className="page-title">Available Hostels</h1>
        <div className="hostel-grid">
          {hostels.map((hostel) => (
            <div key={hostel.id} className="hostel-card">
              <Link to={`/hostel/${hostel.id}`}>
                <img
                  src={hostel.images.length > 0 ? hostel.images[0].image : "no-image.jpg"}
                  alt={hostel.name}
                  className="hostel-image"
                />
                <h3>{hostel.name}</h3>
                <p>📍 {hostel.address}</p>
                <p>🏠 Owned by: {hostel.owner}</p>
                <p>Rs {hostel.price || "N/A"}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hostels;
