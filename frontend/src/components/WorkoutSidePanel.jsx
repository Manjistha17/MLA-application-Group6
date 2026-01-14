import "../styles/components/WorkoutsTab.css";
const WorkoutSidePanel = () => {
    return (
        <div className="workoutSideCard">
            <h3>Today</h3>

            <div className="sideItem">
                <span>Date</span>
                <strong>{new Date().toLocaleDateString()}</strong>
            </div>

            <div className="sideItem">
                <span>Goal</span>
                <strong>30 minutes</strong>
            </div>

            <div className="sideDivider" />

            <h3>Last Workout</h3>

            <div className="sideItem">
                <span>Activity</span>
                <strong>Running</strong>
            </div>

            <div className="sideItem">
                <span>Duration</span>
                <strong>25 mins</strong>
            </div>

            <div className="sideHint">
                Consistency beats intensity 💪
            </div>
        </div>
    );
};
export default WorkoutSidePanel;
