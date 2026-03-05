import React from "react";
import DashboardTabs from "./DashboardTabs";
import "../styles/components/Dashboard.css";

const Dashboard = ({ currentUser }) => {
  const role = localStorage.getItem("role"); // ✅ read role

  return (
    <div className="dashboardPage">
      <br />
      <div className="dashboardHeader">
        <h1 className="dashboardTitle">Welcome back, {currentUser}</h1>
        {/* Show role only if user is admin */}
        {role === "admin" && (
          <p className="dashboardSubtitle">
           Welcome: <strong>{role}</strong>
          </p>
      )}

      </div>

      {/* ✅ pass role into DashboardTabs */}
      <DashboardTabs currentUser={currentUser} role={role} />

      {role === "admin" && (
        <div className="adminPanel">
          <h2>Admin Controls</h2>
          <p>Here you can manage users, view reports, or configure settings.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;