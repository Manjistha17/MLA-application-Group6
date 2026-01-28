import "../styles/components/WorkoutsTab.css";
import TrackExercise from "./trackExercise";

const WorkoutsTab = ({ currentUser }) => {
  return (
    <div className="workoutsLayout">
      {/* LEFT: Primary action */}
      <div className="workoutsMain">
        <TrackExercise currentUser={currentUser} />
      </div>

      {/* RIGHT: Context / support */}
     {/*  <div className="workoutsSide">
        <WorkoutSidePanel currentUser={currentUser} /> 
      </div> */}
    </div>
  );
};


export default WorkoutsTab