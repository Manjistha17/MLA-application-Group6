import React, { useState } from "react";
import axios from "axios";
import "../styles/GoalSettingPage.css";

function GoalSettingPage({ currentUser }) {
  const [goalType, setGoalType] = useState("weight_loss");
  const [level, setLevel] = useState("beginner");
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  console.log("GoalSettingPage component rendered with currentUser:", currentUser);

  const handleCreatePlan = async () => {
    console.log("Create Plan button clicked");
    setError(null);
    try {
      const userId = currentUser.username ?? currentUser._id ?? currentUser;
      console.log("Creating plan for userId:", userId);

      const response = await axios.post("/workouts/create/user-workout-plan", {
        user_id: userId,
        goal_type: goalType,
        level,
        number_of_weeks: parseInt(numberOfWeeks),
      });

      console.log("Workout plan created:", response.data);
      setPlan(response.data);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      if (error.response?.status === 409) {
        setError("A workout plan with these settings already exists for you.");
      } else {
        setError("Error creating workout plan. Please try again.");
      }
    }
  };

  return (
    <div className="goal-page">
      <h2>Set Your Fitness Goal</h2>

      <div className="form-group">
        <label>Goal Type:</label>
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="endurance">Endurance</option>
        </select>

        <label>Level:</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label>Number of Weeks:</label>
        <input
          type="number"
          value={numberOfWeeks}
          onChange={(e) => setNumberOfWeeks(e.target.value)}
        />
      </div>

      <button onClick={handleCreatePlan}>Create Workout Plan</button>

      {error && (
        <div className="error-message" style={{ color: "red", marginTop: "10px" }}>
          {error}
        </div>
      )}

      {plan && (
        <div className="plan">
          <h3>Your Workout Plan</h3>
          <ul>
            {plan.workouts.map((w) => (
              <li key={w.day_index}>
                Day {w.day_index}: {w.activity} ({w.sub_activity}) - {w.minutes} mins
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GoalSettingPage;