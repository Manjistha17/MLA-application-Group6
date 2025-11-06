import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = ({ currentUser }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 🔹 Detect if we’re running locally or in Docker
        const baseUrl = window.location.hostname === "localhost"
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
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Welcome, {currentUser}!</h2>
        <p>Loading your details...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Welcome, {currentUser}!</h2>
        <p>❌ Could not load your details.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Welcome, {userDetails.username}!</h2>
      <p>📧 Email: {userDetails.email}</p>
      <p>📞 Contact: {userDetails.contact}</p>
      <p>🎂 Age: {userDetails.age}</p>
      <p>👩 Gender: {userDetails.gender}</p>
      <p>📏 Height: {userDetails.height} cm</p>
      <p>⚖️ Weight: {userDetails.weight} kg</p>
    </div>
  );
};

export default Dashboard;
