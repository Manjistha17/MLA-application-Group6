import React, { useState, useEffect } from "react";
import axiosBase from "axios";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Box, Card, CardContent, Typography, Stack, LinearProgress, Divider, Chip, Tooltip } from "@mui/material";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Area, AreaChart } from "recharts";
import AICoach from "./AICoach";

import "../styles/components/Overview.css";

// Axios instance that automatically sends the nutrition JWT token
const axios = axiosBase.create();
axios.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("nutritionToken");
  if (!token) {
    const username = localStorage.getItem("username");
    if (username) {
      try {
        const res = await axiosBase.post("https://d393qv373r18to.cloudfront.net/nutrition/token", { username });
        token = res.data.token;
        localStorage.setItem("nutritionToken", token);
      } catch {
        console.warn("Could not refresh nutrition token");
      }
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const TOTAL_GLASSES = 8;

// Per-card color tokens
const CARD_COLORS = {
  calories: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  minutes: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  workouts: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
  streak: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
};

const cardSx = {
  borderRadius: "14px",
  border: "1px solid var(--color-border-subtle)",
  boxShadow: "var(--shadow-sm)",
  backgroundColor: "var(--color-bg-surface)",
  transition: "box-shadow 0.2s, transform 0.2s",
};

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

const OverviewTab = ({ currentUser, onNavigate }) => {
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
    }).catch(() => { });

    axios.get(`https://d393qv373r18to.cloudfront.net/nutrition/${today}/${currentUser}`).then(res => {
      const food = res.data.filter(i => i.food);
      setNutrition({
        calories: res.data.reduce((s, i) => s + Number(i.calories || 0), 0),
        water: res.data.reduce((s, i) => s + Number(i.water || 0), 0),
        protein: food.reduce((s, i) => s + Number(i.protein || 0), 0),
        carbs: food.reduce((s, i) => s + Number(i.carbs || 0), 0),
        fat: food.reduce((s, i) => s + Number(i.fat || 0), 0),
      });
    }).catch(() => { });

    axios.get(`https://d393qv373r18to.cloudfront.net/exercises/weekly/${currentUser}`).then(res => setWeeklyData(res.data)).catch(() => { });
  }, [currentUser, today]);

  const caloriePercent = Math.min((nutrition.calories / calorieGoal) * 100, 100);
  const hydrationPercent = Math.min((nutrition.water / waterGoal) * 100, 100);
  const calorieColor = caloriePercent > 90 ? "error" : caloriePercent > 70 ? "warning" : "primary";

  const statCards = [
    { key: "calories", icon: <LocalFireDepartmentIcon fontSize="small" />, title: "Calories Burned", value: `${stats.caloriesBurned}`, sub: "kcal", badge: "Today" },
    { key: "minutes", icon: <AccessTimeIcon fontSize="small" />, title: "Active Minutes", value: `${stats.activeMinutes}`, sub: "mins", badge: "Today" },
    null,
    { key: "streak", icon: <WhatshotIcon fontSize="small" />, title: "Streak", value: `${stats.streak}`, sub: "days in a row", badge: stats.streak > 0 ? "Keep going!" : "Start today!" },
  ];

  return (
    <Box sx={{ width: "100%" }}>

      {/* ── Row 1 — 4 stat cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2, mb: 3 }}>
        {statCards.map((item, idx) => {

          // Workouts card
          if (idx === 2) {
            const c = CARD_COLORS.workouts;
            return (
              <Card key={idx} onClick={() => onNavigate(3)} sx={{
                ...cardSx,
                cursor: "pointer",
                "&:hover": { boxShadow: "var(--shadow-md)", transform: "translateY(-2px)", borderColor: c.color },
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                    <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FitnessCenterIcon fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 600, px: 1, py: 0.3, borderRadius: "999px", bgcolor: c.bg, color: c.color }}>
                      {stats.activities.length} activities
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "var(--color-text-secondary)" }} mb={0.5}>Workouts</Typography>

                  {stats.activities.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                      {stats.activities.map((act, i) => (
                        <Box key={i} sx={{ px: 1, py: 0.4, fontSize: "0.72rem", borderRadius: "999px", border: `1px solid ${c.color}`, color: c.color, bgcolor: c.bg, fontWeight: 500 }}>
                          {act.subActivity ? `${act.activity} – ${act.subActivity}` : act.activity}
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="h4" fontWeight={800} sx={{ color: c.color, lineHeight: 1 }}>0</Typography>
                      <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>logged today</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          }

          // Standard stat card
          const c = CARD_COLORS[item.key];
          return (
            <Card key={idx} sx={{ ...cardSx, "&:hover": { boxShadow: "var(--shadow-md)", transform: "translateY(-2px)" } }}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 600, px: 1, py: 0.3, borderRadius: "999px", bgcolor: c.bg, color: c.color }}>
                    {item.badge}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "var(--color-text-secondary)" }} mb={0.5}>{item.title}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: c.color, lineHeight: 1 }}>{item.value}</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-text-secondary)" }}>{item.sub}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* ── Row 2 — Nutrition + Graph (equal 1fr 1fr) ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>

        {/* Nutrition */}
        <Card onClick={() => onNavigate(5)} sx={{ ...cardSx, cursor: "pointer", "&:hover": { boxShadow: "var(--shadow-md)", transform: "translateY(-2px)" } }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>Today's Nutrition Summary</Typography>
              <Typography variant="caption" sx={{ color: "var(--color-primary)", fontWeight: 600, cursor: "pointer" }}>View →</Typography>
            </Stack>
            <Divider sx={{ mb: 2, borderColor: "var(--color-border-subtle)" }} />
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: "var(--color-text-secondary)" }}>Calories</Typography>
                  <Typography variant="body2" fontWeight={600} color={caloriePercent > 90 ? "error.main" : "text.secondary"}>
                    {Math.round(caloriePercent)}%
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>
                  {nutrition.calories}
                  <Typography component="span" variant="body1" sx={{ color: "var(--color-text-secondary)" }} ml={1}>/ {calorieGoal} kcal</Typography>
                </Typography>
                <LinearProgress variant="determinate" value={caloriePercent} color={calorieColor} sx={{ height: 8, borderRadius: 5, mt: 1 }} />
                <Typography variant="caption" sx={{ color: "var(--color-text-secondary)" }}>{Math.max(0, calorieGoal - nutrition.calories)} kcal remaining</Typography>
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
                    <Typography variant="body2" sx={{ color: "var(--color-text-secondary)" }}>Hydration</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "var(--color-text-secondary)" }}>{Math.round(hydrationPercent)}%</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>
                  {nutrition.water}
                  <Typography component="span" variant="body1" sx={{ color: "var(--color-text-secondary)" }} ml={1}>/ {waterGoal} ml</Typography>
                </Typography>
                <LinearProgress variant="determinate" value={hydrationPercent} color="info" sx={{ height: 8, borderRadius: 5, mt: 1 }} />
                <Typography variant="caption" sx={{ color: "var(--color-text-secondary)" }}>{Math.max(0, waterGoal - nutrition.water)} ml remaining</Typography>
                <WaterGlasses water={nutrition.water} waterGoal={waterGoal} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Graph */}
        <Card onClick={() => onNavigate(4)} sx={{ ...cardSx, cursor: "pointer", "&:hover": { boxShadow: "var(--shadow-md)", transform: "translateY(-2px)" } }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>Weekly Activity Progress</Typography>
              <Typography variant="caption" sx={{ color: "var(--color-primary)", fontWeight: 600, cursor: "pointer" }}>View →</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "var(--color-text-secondary)" }} mb={2}>Track your workout consistency throughout the week</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)", borderRadius: "8px", color: "var(--color-text-primary)" }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#blueGrad)" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </Box>

      {/* ── Row 3 — AI Coach ── */}
      <AICoach currentUser={currentUser} />

    </Box>
  );
};

export default OverviewTab;