import "../styles/components/WorkoutsTab.css";
import TrackExercise from "./trackExercise";

const WorkoutsTab = ({ currentUser, onTipRefresh }) => {
  return (
    <div className="workoutsLayout">
      {/* LEFT: Primary action */}
      <div className="workoutsMain">
        <TrackExercise currentUser={currentUser} onTipRefresh={onTipRefresh} />
      </div>

    </div>
  );
};

export default WorkoutsTab;