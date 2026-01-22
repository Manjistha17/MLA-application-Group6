/* import React from "react";
import "../styles/components/Dashboard.css";

const Dashboard = ({ currentUser }) => {
  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <h1 className="dashboardTitle">Welcome back, {currentUser}</h1>
        <p className="dashboardSubtitle">
          Here’s a snapshot of your fitness activity
        </p>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <div className="statTitle">Calories Burned</div>
          <div className="statValue">—</div>
        </div>

        <div className="statCard">
          <div className="statTitle">Active Minutes</div>
          <div className="statValue">—</div>
        </div>

        <div className="statCard">
          <div className="statTitle">Workouts</div>
          <div className="statValue">—</div>
        </div>

        <div className="statCard">
          <div className="statTitle">Streak</div>
          <div className="statValue">—</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 */

import React from "react";
import DashboardTabs from "./DashboardTabs";
import "../styles/components/Dashboard.css";

const Dashboard = ({ currentUser }) => {
  // Check if email is verified (assuming email_verified field exists)
  const isEmailVerified = currentUser?.email_verified || currentUser?.emailVerified;

  return (
    <div className="dashboardPage">
      {/* Email verification banner */}
      {!isEmailVerified && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#856404" }}>
            ⚠️ Please verify your email to unlock password reset and other features.
          </span>
          <a href="/verify-email" style={{ color: "#0056b3", textDecoration: "underline" }}>
            Verify Now
          </a>
        </div>
      )}

      <br />
      <div className="dashboardHeader">
        <h1 className="dashboardTitle">Welcome back, {currentUser}</h1>
      </div>

      <DashboardTabs currentUser={currentUser} />
    </div>
  );
};

export default Dashboard;
