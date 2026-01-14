import React from "react";
import "../styles/components/Overview.css";

const OverviewTab = () => {
  return (
    <div className="overviewGrid">
      <div className="statCard">Calories Burned</div>
      <div className="statCard">Active Minutes</div>
      <div className="statCard">Workouts</div>
      <div className="statCard">Streak</div>

      {/* Later:
        - charts
        - weekly goals
        - recent workouts
      */}
    </div>
  );
};

export default OverviewTab;
