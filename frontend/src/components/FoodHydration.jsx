import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from "@mui/material";
import axios from "axios";

const FoodHydration = () => {
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [water, setWater] = useState("");
  const [, setMsg] = useState("");
  const [summary, setSummary] = useState({ calories: 0, water: 0 });
  const [logs, setLogs] = useState([]);

  const [calorieGoal, setCalorieGoal] = useState(
    Number(localStorage.getItem("dailyCaloriesGoal")) || 2000
  );
  const [waterGoal, setWaterGoal] = useState(
    Number(localStorage.getItem("dailyWaterGoal")) || 2500
  );

  const today = new Date().toISOString().split("T")[0];
  const username = localStorage.getItem("currentUser");

  const fetchSummary = useCallback(async () => {
    if (!username) return;

    try {
      const res = await axios.get(
        `http://localhost:5005/nutrition/${today}/${username}`
      );

      setLogs(res.data.filter((i) => i.food));

      const totalCalories = res.data.reduce(
        (sum, item) => sum + Number(item.calories),
        0
      );

      const totalWater = res.data.reduce(
        (sum, item) => sum + Number(item.water),
        0
      );

      setSummary({ calories: totalCalories, water: totalWater });
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  }, [today, username]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const saveGoals = () => {
    localStorage.setItem("dailyCaloriesGoal", calorieGoal);
    localStorage.setItem("dailyWaterGoal", waterGoal);
    setMsg("Goals updated");
  };

  const saveFood = async (e) => {
    e.preventDefault();
    if (!username) return;

    try {
      await axios.post("http://localhost:5005/nutrition/log", {
        userId: username,
        food,
        calories,
        water: 0,
        date: today,
      });

      setFood("");
      setCalories("");
      fetchSummary();
      setMsg("Food logged");
    } catch (err) {
      console.error(err);
      setMsg("Failed to save food");
    }
  };

  const saveWater = async (amount) => {
    if (!username) return;

    try {
      await axios.post("http://localhost:5005/nutrition/log", {
        userId: username,
        food: "",
        calories: 0,
        water: amount,
        date: today,
      });

      fetchSummary();
      setMsg("Water logged");
    } catch (err) {
      console.error(err);
      setMsg("Failed to save water");
    }
  };

  const updateFood = async (id, updated) => {
    try {
      await axios.put(`http://localhost:5005/nutrition/${id}`, updated);
      fetchSummary();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteLog = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/nutrition/${id}`);
      fetchSummary();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const caloriePercent = Math.min(
    (summary.calories / calorieGoal) * 100,
    100
  );

  const hydrationPercent = Math.min(
    (summary.water / waterGoal) * 100,
    100
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 3,
        maxWidth: 1200,
        margin: "auto",
      }}
    >
      {/* LEFT COLUMN */}
      <Stack spacing={3}>
        {/* Quick Water */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Quick Water Log
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => saveWater(250)}>
                  +250 ml
                </Button>
                <Button variant="outlined" onClick={() => saveWater(500)}>
                  +500 ml
                </Button>
                <Button variant="outlined" onClick={() => saveWater(750)}>
                  +750 ml
                </Button>
              </Stack>

              <TextField
                label="Custom Water (ml)"
                type="number"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={() => {
                  if (water) saveWater(Number(water));
                  setWater("");
                }}
              >
                Add Water
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Food Log */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Log Food
            </Typography>

            <form onSubmit={saveFood}>
              <Stack spacing={2}>
                <TextField
                  label="Food"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  fullWidth
                  required
                />

                <Button type="submit" variant="contained" size="large">
                  Save Food
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>

      {/* RIGHT COLUMN */}
      <Stack spacing={3}>
        {/* Summary */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6">Today’s Summary</Typography>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Calories
                </Typography>

                <Typography variant="h4">
                  {summary.calories} / {calorieGoal} kcal
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={caloriePercent}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Water Intake
                </Typography>

                <Typography variant="h4">
                  {summary.water} / {waterGoal} ml
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={hydrationPercent}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Food Table */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Today’s Food Log
            </Typography>

            <Stack spacing={2}>
              {logs.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto auto",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    value={item.food}
                    onChange={(e) =>
                      setLogs((prev) =>
                        prev.map((l) =>
                          l._id === item._id
                            ? { ...l, food: e.target.value }
                            : l
                        )
                      )
                    }
                  />

                  <TextField
                    type="number"
                    value={item.calories}
                    onChange={(e) =>
                      setLogs((prev) =>
                        prev.map((l) =>
                          l._id === item._id
                            ? { ...l, calories: e.target.value }
                            : l
                        )
                      )
                    }
                  />

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => updateFood(item._id, item)}
                  >
                    Save
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteLog(item._id)}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Daily Goals
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Calories Goal (kcal)"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                fullWidth
              />

              <TextField
                label="Water Goal (ml)"
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                fullWidth
              />

              <Button variant="contained" onClick={saveGoals}>
                Save Goals
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default FoodHydration;
