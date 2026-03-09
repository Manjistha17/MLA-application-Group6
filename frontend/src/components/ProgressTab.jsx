import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
} from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import axios from "axios";

const ProgressTab = () => {
  const [data, setData] = useState([]);
  const username = localStorage.getItem("currentUser");

  useEffect(() => {
    if (!username) return;

    const fetchWeeklyProgress = async () => {
      try {
        const res = await axios.get(`/exercises/weekly/${username}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load weekly progress", err);
      }
    };

    fetchWeeklyProgress();
  }, [username]);

  const totalMinutes = data.reduce((sum, d) => sum + d.value, 0);
  const activeDays = data.filter((d) => d.value > 0).length;
  const avgMinutes = activeDays ? Math.round(totalMinutes / activeDays) : 0;

  const cardSx = {
    borderRadius: 3,
    backgroundColor: "var(--color-bg-surface)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--shadow-sm)",
  };

  const summaryCards = [
    { label: "Total Minutes (Week)", value: totalMinutes },
    { label: "Active Days", value: `${activeDays} / 7` },
    { label: "Avg Minutes / Day", value: avgMinutes },
  ];

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto" }}>

      {/* Top Summary Cards */}
      <Grid container spacing={3} mb={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="body2" color="var(--color-text-secondary)">
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Graph */}
      <Card sx={cardSx}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "var(--color-text-primary)" }}>
              Weekly Activity Progress
            </Typography>
            <Typography variant="body2" color="var(--color-text-secondary)">
              Track your workout consistency throughout the week
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-text-muted)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-muted)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#progressGrad)"
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Stack>
        </CardContent>
      </Card>

    </Box>
  );
};

export default ProgressTab;