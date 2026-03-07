import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Stack, Divider, LinearProgress } from "@mui/material";

const AICoach = ({ currentUser }) => {
  const [coachMessage, setCoachMessage] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setCoachLoading(true);
    axios.get(`http://localhost:8000/coach/daily-tip?username=${currentUser}`)
      .then(res => setCoachMessage(res.data.message))
      .catch(() => setCoachMessage("Keep pushing — every step counts!"))
      .finally(() => setCoachLoading(false));
  }, [currentUser]);

  return (
    <Box sx={{ mt: 2 }}>
      <Card sx={{
        borderRadius: 2,
        border: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--shadow-sm)",
        backgroundColor: "var(--color-bg-surface)",
      }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="h6" sx={{ color: "var(--color-text-primary)" }}>
              🏋️ Your Daily Coach
            </Typography>
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