import React from "react";
import "../styles/components/WorkoutsTab.css";
import TrackExercise from "./trackExercise";
import WorkoutSidePanel from "./WorkoutSidePanel";

const WorkoutsTab = ({currentUser}) => {
  return (
    <div className="workoutsLayout">
      {/* LEFT: Primary action */}
      <div className="workoutsMain">
        <TrackExercise currentUser={currentUser} />
      </div>

      {/* RIGHT: Context / support */}
      {/* <div className="workoutsSide">
        <WorkoutSidePanel />
      </div> */}
    </div>
  );
};


export default WorkoutsTab