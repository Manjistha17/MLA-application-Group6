import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Stack, Divider, LinearProgress, Chip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const AICoach = ({ currentUser }) => {
  const [coachMessage, setCoachMessage] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    const calorieGoal = Number(localStorage.getItem("dailyCaloriesGoal")) || 2000;
    const waterGoal = Number(localStorage.getItem("dailyWaterGoal")) || 2500;
    if (!currentUser) return;
    setCoachLoading(true);
    axios.get(`/coach/daily-tip?username=${currentUser}&calorie_goal=${calorieGoal}&water_goal=${waterGoal}`)
      .then(res => setCoachMessage(res.data.message))
      .catch(() => setCoachMessage("Keep pushing — every step counts!"))
      .finally(() => setCoachLoading(false));
  }, [currentUser]);

  return (
    <Box sx={{ mt: 0 }}>
      <Card sx={{
        borderRadius: "14px",
        border: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--shadow-sm)",
        backgroundColor: "var(--color-bg-surface)",
      }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "12px",
              bgcolor: "rgba(234,88,12,0.12)", color: "#ea580c",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              🏋️
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>
              Your Daily Coach
            </Typography>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
              label="AI Powered"
              size="small"
              sx={{
                ml: "auto !important",
                fontSize: "11px",
                fontWeight: 600,
                bgcolor: "rgba(234,88,12,0.12)",
                color: "#ea580c",
                border: "1px solid rgba(234,88,12,0.25)",
                "& .MuiChip-icon": { color: "#ea580c" },
              }}
            />
          </Stack>
          <Divider sx={{ mb: 2, borderColor: "var(--color-border-subtle)" }} />
          {coachLoading ? (
            <LinearProgress sx={{ borderRadius: 5 }} />
          ) : (
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "var(--color-text-secondary)" }}>
              {coachMessage || "No tip available today."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AICoach;