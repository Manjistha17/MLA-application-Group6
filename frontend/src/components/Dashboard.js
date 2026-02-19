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
  return (
    <div className="dashboardPage">
      <br />
      <div className="dashboardHeader">
        <h1 className="dashboardTitle">Welcome back, {currentUser}</h1>
      </div>

      <DashboardTabs currentUser={currentUser} />
    </div>
  );
};

export default Dashboard;
