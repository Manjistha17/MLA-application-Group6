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
  LineChart,
  Line,
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
        const res = await axios.get(
          `http://localhost:8081/exercises/weekly/${username}`
        );
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

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto" }}>
      {/* Top Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Minutes (Week)
              </Typography>
              <Typography variant="h4">{totalMinutes}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Days
              </Typography>
              <Typography variant="h4">{activeDays} / 7</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Avg Minutes / Day
              </Typography>
              <Typography variant="h4">{avgMinutes}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Graph */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">
              Weekly Activity Progress
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Track your workout consistency throughout the week
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3f51b5"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgressTab;

