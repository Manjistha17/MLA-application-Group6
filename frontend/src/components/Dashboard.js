import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ currentUser }) => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    axios
      .get(`/stats/${currentUser}`)
      .then((res) => {
        setStats(res.data.stats || []);
      })
      .catch((err) => console.error("Error fetching dashboard stats:", err));
  }, [currentUser]);

  const userStats = stats.find((item) => item.username === currentUser);

  // 🟣 Extract dynamic exercise list
  const exercises = userStats?.exercises || [];

  // 🟣 Detect if new user (no exercises)
  const isNewUser = exercises.length === 0;

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundImage: 'url("/login_box.jpg")'
      }}
    >
      <div className="dashboard-box">
        <h2>Welcome to the MLA Fitness App, {currentUser}!</h2>

        {isNewUser ? (
          <>
            <p className="subtitle">Let's start your fitness journey!</p>
          </>
        ) : (
          <>
            <p className="subtitle">Keep up the good progress!</p>
            <p className="subtitle">Your complete fitness journey with us:</p>

            <div className="stats-box">
              {exercises.map((ex, index) => (
                <p key={index}>
                  <strong>{ex.exerciseType}:</strong> {ex.totalDuration} mins!
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
