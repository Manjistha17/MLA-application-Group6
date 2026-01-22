import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/components/Overview.css";

const OverviewTab = ({ currentUser }) => {
  const [stats, setStats] = useState({
    caloriesBurned: 0,
    activeMinutes: 0,
    workoutCount: 0,
    streak: 0,
    activities: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = `/api/stats/daily/?user=${currentUser}`;
        const response = await axios.get(url);

        if (response.data.stats && Array.isArray(response.data.stats)) {
          const exercises = response.data.stats;
          
          // Calculate totals
          const totalCalories = exercises.reduce((sum, ex) => sum + (ex.totalCalories || 0), 0);
          const totalMinutes = exercises.reduce((sum, ex) => sum + (ex.totalDuration || 0), 0);
          const workoutCount = exercises.length;

          // Extract activities and sub-activities
          const activities = exercises.map(ex => ({
            activity: ex.exerciseType,
            subActivity: ex.subActivity || '',
          }));

          setStats({
            caloriesBurned: totalCalories.toFixed(0),
            activeMinutes: totalMinutes,
            workoutCount: workoutCount,
            streak: 0,
            activities: activities,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    if (currentUser) {
      fetchStats();
    }
  }, [currentUser]);

  return (
    <div className="overviewGrid">
      <div className="statCard">
        <h3>Calories Burned</h3>
        <p className="statValue">{stats.caloriesBurned}</p>
        <span>kcal</span>
      </div>
      <div className="statCard">
        <h3>Active Minutes</h3>
        <p className="statValue">{stats.activeMinutes}</p>
        <span>mins</span>
      </div>
      <div className="statCard">
        <h3>Workouts</h3>
        <div className="statValue">
          {stats.activities.length > 0 ? (
            <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
              {stats.activities.map((act, idx) => (
                <li key={idx}>
                  {act.activity}
                  {act.subActivity && ` - ${act.subActivity}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>No workouts today</p>
          )}
        </div>
      </div>
      <div className="statCard">
        <h3>Streak</h3>
        <p className="statValue">{stats.streak}</p>
        <span>days</span>
      </div>
    </div>
  );
};

export default OverviewTab;
