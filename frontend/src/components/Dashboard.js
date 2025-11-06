import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ currentUser }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const baseUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:8080"
            : "http://authservice:8080";

        const response = await axios.get(`${baseUrl}/api/auth/user/${currentUser}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error("❌ Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDetails();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div
        className="dashboard-container"
        style={{
          backgroundImage: "url('/login_box.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="dashboard-box">
          <h2>Welcome, {currentUser}!</h2>
          <p>Loading your details...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div
        className="dashboard-container"
        style={{
          backgroundImage: "url('/login_box.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="dashboard-box">
          <h2>Welcome, {currentUser}!</h2>
          <p>Could not load your details.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundImage: "url('/login_box.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="dashboard-box">
        <h2>Welcome, {userDetails.username}!</h2>
        <div className="details-grid">
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Contact:</strong> {userDetails.contact}</p>
          <p><strong>Age:</strong> {userDetails.age}</p>
          <p><strong>Gender:</strong> {userDetails.gender}</p>
          <p><strong>Height:</strong> {userDetails.height} cm</p>
          <p><strong>Weight:</strong> {userDetails.weight} kg</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
