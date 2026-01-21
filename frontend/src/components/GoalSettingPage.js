import React, { useState } from "react";
import "../styles/GoalSettingPage.css"; // optional if you want custom styles

function GoalSettingPage() {
  const [goalType, setGoalType] = useState("weight_loss");
  const [level, setLevel] = useState("beginner");
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [plan, setPlan] = useState(null);

  const handleCreatePlan = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/createWorkoutPlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_type: goalType,
          level,
          number_of_weeks: numberOfWeeks,
        }),
      });

      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error("Error creating workout plan:", error);
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