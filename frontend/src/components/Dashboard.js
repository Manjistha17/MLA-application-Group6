import React from "react";
import DashboardTabs from "./DashboardTabs";
import "../styles/components/Dashboard.css";

const Dashboard = ({ currentUser }) => {
  return (
    <div className="dashboardPage">
      <br />
      <div className="dashboardHeader">
        <h1 className="dashboardTitle">Welcome back, <span className="orangeText">{currentUser}</span></h1>
      </div>

      <DashboardTabs currentUser={currentUser} />
    </div>
  );
};

export default Dashboard;
