import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const KhaltiVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState(" Verifying payment...");

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (!pidx) {
      setStatusMessage(" Invalid payment callback. No pidx provided.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.post(
          "/students/bookings/verify-payment/",
          { pidx },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setStatusMessage(" Payment verified successfully! Booking confirmed.");
          setTimeout(() => {
            navigate("/my-bookings");
          }, 3000); //  Redirect to bookings after 3 sec
        } else {
          setStatusMessage(" Payment verification failed. Please try again.");
        }
      } catch (error) {
        console.error(" Error verifying payment:", error);
        setStatusMessage(" Error verifying payment. Try again or contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>{statusMessage}</h2>
      </div>
    </div>
  );
};

export default KhaltiVerify;
