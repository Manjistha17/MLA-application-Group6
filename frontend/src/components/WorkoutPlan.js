import React, { useEffect, useState } from "react";
import "../styles/components/WorkoutPlan.css";
import axios from "axios";
import { markExerciseComplete } from "../components/exercises";

// Group exercises by week
const groupByWeek = (workouts = []) => {
  const weeks = {};
  workouts.forEach(ex => {
    const week = Math.ceil(ex.day_index / 7);
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(ex);
  });
  return weeks;
};

// Group exercises by day
const groupByDay = (exercises = []) => {
  const days = {};
  exercises.forEach(ex => {
    if (!days[ex.day_index]) days[ex.day_index] = [];
    days[ex.day_index].push(ex);
  });
  return days;
};

const WorkoutPlan = ({ currentUser }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWeeks, setActiveWeeks] = useState({});

  console.log("WorkoutPlan component rendered with currentUser:", currentUser);

  // Fetch workout plans
  useEffect(() => {
    console.log("WorkoutPlan useEffect called, currentUser:", currentUser);
    
    if (!currentUser) {
      console.log("No currentUser, returning early");
      setLoading(false);
      return;
    }

    const userId = currentUser.username ?? currentUser._id ?? currentUser;
    console.log("Fetching workout plans for userId:", userId);
    console.log("Full currentUser object:", currentUser);

    axios
      .get("/workouts/user-workout-plan/all", {
        params: { user_id: userId }
      })
      .then(({ data }) => {
        console.log("✓ Success - Workout plans fetched:", data);
        setPlans(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("✗ Error fetching plans:", err.message);
        console.error("Full error:", err);
      })
      .finally(() => {
        console.log("Workout plans fetch completed");
        setLoading(false);
      });
  }, [currentUser]);

  // Mark exercise completed
  const handleMarkCompleted = async (plan, exercise) => {
    // Optimistic UI update
    setPlans(prev =>
      prev.map(p =>
        p._id !== plan._id
          ? p
          : {
              ...p,
              workouts: p.workouts.map(w =>
                w.exercise_id === exercise.exercise_id
                  ? { ...w, completed: true }
                  : w
              )
            }
      )
    );

    try {
      await markExerciseComplete(
        plan.user_id,
        plan.plan_id || plan._id,
        exercise
      );
    } catch (err) {
      console.error("Failed to mark exercise:", err);

      // Rollback on failure
      setPlans(prev =>
        prev.map(p =>
          p._id !== plan._id
            ? p
            : {
                ...p,
                workouts: p.workouts.map(w =>
                  w.exercise_id === exercise.exercise_id
                    ? { ...w, completed: false }
                    : w
                )
              }
        )
      );
    }
  };

  if (loading) return <p className="loading-text">Loading workout plans...</p>;
  if (!plans.length) return <p className="empty-text">No workout plans found.</p>;

  return (
    <div className="workout-plan-wrapper">
      {plans.map(plan => {
        const weeks = groupByWeek(plan.workouts);
        const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b);
        const activeWeek = activeWeeks[plan._id] || weekNumbers[0];
        const days = groupByDay(weeks[activeWeek] || []);

        return (
          <div key={plan._id} className="plan-container">
            <h2 className="plan-title">
              {plan.goal_type.toUpperCase()} – {plan.level}
            </h2>
            <p className="plan-meta">
              {plan.number_of_weeks} Weeks • {plan.total_days} Days
            </p>

            {/* Week tabs */}
            <div className="week-tabs">
              {weekNumbers.map(week => (
                <button
                  key={week}
                  className={`week-tab ${activeWeek === week ? "active" : ""}`}
                  onClick={() =>
                    setActiveWeeks(prev => ({ ...prev, [plan._id]: week }))
                  }
                >
                  Week {week}
                </button>
              ))}
            </div>

            {/* Exercises per day */}
            <div className="week-content">
              {Object.keys(days)
                .map(Number)
                .sort((a, b) => a - b)
                .map(day => (
                  <div key={day} className="day-section">
                    <h4>Day {day}</h4>
                    {days[day].map(exercise => (
                      <div
                        key={exercise.exercise_id}
                        className={`exercise-item ${
                          exercise.completed ? "completed" : ""
                        }`}
                      >
                        <div className="exercise-info">
                          <span>
                            {exercise.activity}
                            {exercise.sub_activity
                              ? ` – ${exercise.sub_activity}`
                              : ""}
                          </span>
                          <span>{exercise.minutes} min</span>
                        </div>
                        <button
                          disabled={exercise.completed}
                          onClick={() =>
                            handleMarkCompleted(plan, exercise)
                          }
                        >
                          {exercise.completed
                            ? "Completed ✓"
                            : "Mark Completed"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutPlan;
