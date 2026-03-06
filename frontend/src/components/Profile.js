import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = ({ currentUser }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!currentUser) return;

  axios.get(`https://d393qv373r18to.cloudfront.net/api/auth/details/${currentUser}`)
    .then(res => setUserDetails(res.data))
    .catch(err => console.error("Error loading profile:", err))
    .finally(() => setLoading(false));
}, [currentUser]);

  if (loading) {
    return (
      <div
        className="profile-container"
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
        <div className="profile-box">
          <h2>Welcome, {currentUser}!</h2>
          <p>Loading your details...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div
        className="profile-container"
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
        <div className="profile-box">
          <h2>Welcome, {currentUser}!</h2>
          <p>Could not load your details.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="profile-container"
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
      <div className="profile-box">
        <h2>Welcome, {userDetails.username}!</h2>
        <button
          className="edit-profile-btn"
          onClick={() => window.location.href = "/edit-profile"}
        >
          Edit Profile
        </button>
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

export default Profile;
