import React, { useState, useEffect } from "react";
import axios from "axios";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

import { Box, Card, CardContent, Typography, Stack, LinearProgress, Divider, Chip, Tooltip } from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";

import "../styles/components/Overview.css";

const TOTAL_GLASSES = 8;

const WaterGlasses = ({ water, waterGoal }) => {
  const mlPerGlass = waterGoal / TOTAL_GLASSES;
  const filled = Math.min(Math.floor(water / mlPerGlass), TOTAL_GLASSES);
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={1}>
      {Array.from({ length: TOTAL_GLASSES }).map((_, i) => (
        <Tooltip key={i} title={`${Math.round(mlPerGlass * (i + 1))} ml`}>
          <Box sx={{ fontSize: 20, opacity: i < filled ? 1 : 0.2, transition: "opacity 0.3s", filter: i < filled ? "none" : "grayscale(100%)" }}>💧</Box>
        </Tooltip>
      ))}
    </Stack>
  );
};

const MacroChip = ({ label, value, color }) => (
  <Chip label={`${label}: ${Math.round(value || 0)}g`} size="small"
    sx={{ bgcolor: color + "20", color, fontWeight: 700, border: `1px solid ${color}40` }} />
);

const OverviewTab = ({ currentUser }) => {
  const [stats, setStats] = useState({ caloriesBurned: 0, activeMinutes: 0, streak: 0, activities: [] });
  const [nutrition, setNutrition] = useState({ calories: 0, water: 0, protein: 0, carbs: 0, fat: 0 });
  const [weeklyData, setWeeklyData] = useState([]);

  const calorieGoal = Number(localStorage.getItem("dailyCaloriesGoal")) || 2000;
  const waterGoal = Number(localStorage.getItem("dailyWaterGoal")) || 2500;
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!currentUser) return;
    axios.get(`https://d393qv373r18to.cloudfront.net/api/stats/daily/?user=${currentUser}`).then(res => {
      if (Array.isArray(res.data?.stats)) {
        const ex = res.data.stats;
        setStats({
          caloriesBurned: ex.reduce((s, e) => s + (e.totalCalories || 0), 0).toFixed(0),
          activeMinutes: ex.reduce((s, e) => s + (e.totalDuration || 0), 0),
          streak: res.data?.streak || 0,
          activities: ex.map(e => ({ activity: e.exerciseType, subActivity: e.subActivity || "" })),
        });
      }
    }).catch(() => {});

    axios.get(`https://d393qv373r18to.cloudfront.net/nutrition/${today}/${currentUser}`).then(res => {
      const food = res.data.filter(i => i.food);
      setNutrition({
        calories: res.data.reduce((s, i) => s + Number(i.calories || 0), 0),
        water: res.data.reduce((s, i) => s + Number(i.water || 0), 0),
        protein: food.reduce((s, i) => s + Number(i.protein || 0), 0),
        carbs: food.reduce((s, i) => s + Number(i.carbs || 0), 0),
        fat: food.reduce((s, i) => s + Number(i.fat || 0), 0),
      });
    }).catch(() => {});

    axios.get(`https://d393qv373r18to.cloudfront.net/exercises/weekly/${currentUser}`).then(res => setWeeklyData(res.data)).catch(() => {});
  }, [currentUser, today]);

  const caloriePercent = Math.min((nutrition.calories / calorieGoal) * 100, 100);
  const hydrationPercent = Math.min((nutrition.water / waterGoal) * 100, 100);
  const calorieColor = caloriePercent > 90 ? "error" : caloriePercent > 70 ? "warning" : "primary";

  return (
    <Box sx={{ width: "100%" }}>

      {/* Row 1 — 4 equal cards using CSS grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 2,
        mb: 3,
      }}>
        {[
          { icon: <LocalFireDepartmentIcon fontSize="small" />, title: "Calories Burned", value: `${stats.caloriesBurned} kcal` },
          { icon: <AccessTimeIcon fontSize="small" />, title: "Active Minutes", value: `${stats.activeMinutes} mins` },
          null, // workouts handled separately
          { icon: <WhatshotIcon fontSize="small" />, title: "Streak", value: `${stats.streak} days` },
        ].map((item, idx) => {
          if (idx === 2) return (
            <Card key={idx} sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "none" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#bbdefb", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FitnessCenterIcon fontSize="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Workouts</Typography>
                </Stack>
                {stats.activities.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {stats.activities.map((act, i) => (
                      <Box key={i} sx={{ px: 1, py: 0.5, fontSize: "0.75rem", borderRadius: 1, border: "1px solid #2563eb", color: "#2563eb", bgcolor: "#bbdefb" }}>
                        {act.subActivity ? `${act.activity} – ${act.subActivity}` : act.activity}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No workouts today</Typography>
                )}
              </CardContent>
            </Card>
          );
          return (
            <Card key={idx} sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "none" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#bbdefb", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#2563eb">{item.value}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Row 2 — Nutrition + Graph using CSS grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "5fr 7fr",
        gap: 2,
      }}>

        {/* Nutrition */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Today's Nutrition Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Calories</Typography>
                  <Typography variant="body2" fontWeight={600} color={caloriePercent > 90 ? "error.main" : "text.secondary"}>
                    {Math.round(caloriePercent)}%
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  {nutrition.calories}
                  <Typography component="span" variant="body1" color="text.secondary" ml={1}>/ {calorieGoal} kcal</Typography>
                </Typography>
                <LinearProgress variant="determinate" value={caloriePercent} color={calorieColor} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                <Typography variant="caption" color="text.secondary">{Math.max(0, calorieGoal - nutrition.calories)} kcal remaining</Typography>
                {(nutrition.protein > 0 || nutrition.carbs > 0 || nutrition.fat > 0) && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                    <MacroChip label="Protein" value={nutrition.protein} color="#2196F3" />
                    <MacroChip label="Carbs" value={nutrition.carbs} color="#FF9800" />
                    <MacroChip label="Fat" value={nutrition.fat} color="#F44336" />
                  </Stack>
                )}
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <WaterDropIcon fontSize="small" color="info" />
                    <Typography variant="body2" color="text.secondary">Hydration</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">{Math.round(hydrationPercent)}%</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  {nutrition.water}
                  <Typography component="span" variant="body1" color="text.secondary" ml={1}>/ {waterGoal} ml</Typography>
                </Typography>
                <LinearProgress variant="determinate" value={hydrationPercent} color="info" sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                <Typography variant="caption" color="text.secondary">{Math.max(0, waterGoal - nutrition.water)} ml remaining</Typography>
                <WaterGlasses water={nutrition.water} waterGoal={waterGoal} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Graph */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={1}>Weekly Activity Progress</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>Track your workout consistency throughout the week</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#3f51b5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
};

export default OverviewTab;
