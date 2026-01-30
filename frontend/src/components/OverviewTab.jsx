import React, { useState, useEffect } from "react";
import axios from "axios";

// Icons
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WhatshotIcon from "@mui/icons-material/Whatshot";

// MUI
import { LinearProgress, Divider } from "@mui/material";

// CSS
import "../styles/components/Overview.css";

const OverviewTab = ({ currentUser }) => {
  const [stats, setStats] = useState({
    caloriesBurned: 0,
    activeMinutes: 0,
    workoutCount: 0,
    streak: 0,
    activities: [],
  });

  const [nutrition, setNutrition] = useState({
    calories: 0,
    water: 0,
  });

  const calorieGoal =
    Number(localStorage.getItem("dailyCaloriesGoal")) || 2000;

  const waterGoal =
    Number(localStorage.getItem("dailyWaterGoal")) || 2500;

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = `/api/stats/daily/?user=${currentUser}`;
        const response = await axios.get(url);

        if (Array.isArray(response.data?.stats)) {
          const exercises = response.data.stats;
          const streak = response.data?.streak || 0;

          const totalCalories = exercises.reduce(
            (sum, ex) => sum + (ex.totalCalories || 0),
            0
          );

          const totalMinutes = exercises.reduce(
            (sum, ex) => sum + (ex.totalDuration || 0),
            0
          );

          const activities = exercises.map((ex) => ({
            activity: ex.exerciseType,
            subActivity: ex.subActivity || "",
          }));

          setStats({
            caloriesBurned: totalCalories.toFixed(0),
            activeMinutes: totalMinutes,
            workoutCount: exercises.length,
            streak,
            activities,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    const fetchNutrition = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5005/nutrition/${today}/${currentUser}`
        );

        const totalCalories = res.data.reduce(
          (sum, item) => sum + Number(item.calories || 0),
          0
        );

        const totalWater = res.data.reduce(
          (sum, item) => sum + Number(item.water || 0),
          0
        );

        setNutrition({
          calories: totalCalories,
          water: totalWater,
        });
      } catch (error) {
        console.error("Failed to fetch nutrition summary", error);
      }
    };

    if (currentUser) {
      fetchStats();
      fetchNutrition();
    }
  }, [currentUser, today]);

  return (
    <div className="overviewGrid">
      {/* Calories Burned */}
      <div className="statCard">
        <div className="statHeader">
          <div className="iconWrapper">
            <LocalFireDepartmentIcon fontSize="small" />
          </div>
          <span>Calories Burned</span>
        </div>
        <div className="statValue">{stats.caloriesBurned} kcal</div>
      </div>

      {/* Active Minutes */}
      <div className="statCard">
        <div className="statHeader">
          <div className="iconWrapper">
            <AccessTimeIcon fontSize="small" />
          </div>
          <span>Active Minutes</span>
        </div>
        <div className="statValue">{stats.activeMinutes} mins</div>
      </div>

      {/* Workouts */}
      <div className="statCard">
        <div className="statHeader">
          <div className="iconWrapper">
            <FitnessCenterIcon fontSize="small" />
          </div>
          <span>Workouts</span>
        </div>

        {stats.activities.length > 0 ? (
          <div className="activitiesWrapper">
            {stats.activities.map((act, idx) => (
              <div className="activityChip" key={idx}>
                {act.subActivity
                  ? `${act.activity} – ${act.subActivity}`
                  : act.activity}
              </div>
            ))}
          </div>
        ) : (
          <div className="statValue smallText">No workouts today</div>
        )}
      </div>

      {/* Streak */}
      <div className="statCard">
        <div className="statHeader">
          <div className="iconWrapper">
            <WhatshotIcon fontSize="small" />
          </div>
          <span>Streak</span>
        </div>
        <div className="statValue">{stats.streak} days</div>
      </div>

      {/* Nutrition Summary with Progress Bars */}
      <div className="statCard">
        <div className="statHeader">
          <span>Today’s Nutrition Summary</span>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Calories */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Calories</span>
              <strong>
                {nutrition.calories} / {calorieGoal} kcal
              </strong>
            </div>

            <LinearProgress
              variant="determinate"
              value={Math.min(
                (nutrition.calories / calorieGoal) * 100,
                100
              )}
              sx={{ height: 10, borderRadius: 5, mt: 1 }}
            />
          </div>

          {/* Water */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Water Intake</span>
              <strong>
                {nutrition.water} / {waterGoal} ml
              </strong>
            </div>

            <LinearProgress
              variant="determinate"
              value={Math.min(
                (nutrition.water / waterGoal) * 100,
                100
              )}
              sx={{ height: 10, borderRadius: 5, mt: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
