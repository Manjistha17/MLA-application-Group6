import React, { useState, useEffect, useCallback } from "react";
import {
  Box, TextField, Button, Typography, Stack, Card, CardContent,
  LinearProgress, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Paper, MenuItem, Chip,
  InputAdornment, CircularProgress, Snackbar, Alert, Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import axiosBase from "axios";


const cardSx = {
  borderRadius: 3,
  backgroundColor: "var(--color-bg-surface)",
  border: "1px solid var(--color-border-subtle)",
  boxShadow: "var(--shadow-sm)",
};

const textFieldSx = {
  "& .MuiInputLabel-root": { color: "var(--color-text-secondary)" },
  "& .MuiOutlinedInput-root": {
    color: "var(--color-text-primary)",
    "& fieldset": { borderColor: "var(--color-border-subtle)" },
    "&:hover fieldset": { borderColor: "var(--color-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-primary)" },
  },
  "& .MuiSvgIcon-root": { color: "var(--color-text-secondary)" },
};

const textFieldStandardSx = {
  "& .MuiInput-root": {
    color: "var(--color-text-primary)",
    "&:before": { borderBottomColor: "var(--color-border-subtle)" },
    "&:hover:before": { borderBottomColor: "var(--color-primary)" },
    "&:after": { borderBottomColor: "var(--color-primary)" },
  },
  "& .MuiInputLabel-root": { color: "var(--color-text-secondary)" },
};
// Axios instance that automatically sends the nutrition JWT token
const axios = axiosBase.create();
axios.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("nutritionToken");
  if (!token) {
    // Token missing (e.g. existing session before security was added) — fetch one now
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

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const MEAL_COLORS = {
  Breakfast: "#FF9800", Lunch: "#4CAF50", Dinner: "#2196F3", Snack: "#9C27B0",
};
const PORTION_UNITS = ["g", "ml", "oz", "cup", "piece", "slice", "tbsp", "tsp"];
const TOTAL_GLASSES = 8;

const WaterGlasses = ({ water, waterGoal }) => {
  const mlPerGlass = waterGoal / TOTAL_GLASSES;
  const filled = Math.min(Math.floor(water / mlPerGlass), TOTAL_GLASSES);
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center" mt={1}>
      {Array.from({ length: TOTAL_GLASSES }).map((_, i) => (
        <Tooltip key={i} title={`${Math.round(mlPerGlass * (i + 1))} ml`}>
          <Box sx={{
            fontSize: 28,
            opacity: i < filled ? 1 : 0.2,
            transition: "opacity 0.3s ease",
            cursor: "default",
            filter: i < filled ? "none" : "grayscale(100%)",
          }}>
            💧
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
};

const MacroChip = ({ label, value, color }) => (
  <Chip
    label={`${label}: ${Math.round(value || 0)}g`}
    size="small"
    sx={{ bgcolor: color + "20", color: color, fontWeight: 700, border: `1px solid ${color}40` }}
  />
);

const FoodHydration = () => {
  const [food, setFood] = useState("");
  const [portionSize, setPortionSize] = useState(100);
  const [portionUnit, setPortionUnit] = useState("g");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [water, setWater] = useState("");

  const [summary, setSummary] = useState({ calories: 0, water: 0, protein: 0, carbs: 0, fat: 0 });
  const [logs, setLogs] = useState([]);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  const [calorieGoal, setCalorieGoal] = useState(
    Number(localStorage.getItem("dailyCaloriesGoal")) || 2000
  );
  const [waterGoal, setWaterGoal] = useState(
    Number(localStorage.getItem("dailyWaterGoal")) || 2500
  );

  const username = localStorage.getItem("currentUser");
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const fetchSummary = useCallback(async () => {
    if (!username) return;
    try {
      const res = await axios.get(`https://d393qv373r18to.cloudfront.net/nutrition/${selectedDate}/${username}`);
      const foodLogs = res.data.filter((i) => i.food);
      setLogs(foodLogs);
      setSummary({
        calories: res.data.reduce((s, i) => s + Number(i.calories || 0), 0),
        water: res.data.reduce((s, i) => s + Number(i.water || 0), 0),
        protein: foodLogs.reduce((s, i) => s + Number(i.protein || 0), 0),
        carbs: foodLogs.reduce((s, i) => s + Number(i.carbs || 0), 0),
        fat: foodLogs.reduce((s, i) => s + Number(i.fat || 0), 0),
      });
    } catch (err) { console.error("Failed to fetch summary", err); }
  }, [selectedDate, username]);

  const fetchCaloriesBurned = useCallback(async () => {
    if (!username) return;
    try {
      const res = await axios.get(`https://d393qv373r18to.cloudfront.net/api/stats/daily/?user=${username}`);
      if (Array.isArray(res.data?.stats)) {
        const burned = res.data.stats.reduce((s, ex) => s + (ex.totalCalories || 0), 0);
        setCaloriesBurned(Math.round(burned));
      }
    } catch { setCaloriesBurned(0); }
  }, [username]);

  useEffect(() => {
    fetchSummary();
    fetchCaloriesBurned();
  }, [fetchSummary, fetchCaloriesBurned]);

  const handleAiLookup = async (showToast = true) => {
    if (!food.trim()) return;
    setAiLoading(true);
    try {
      const res = await axios.post("https://d393qv373r18to.cloudfront.net/nutrition/ai-lookup", {
        food: food.trim(), portionSize: Number(portionSize), portionUnit,
      });
      setCalories(res.data.calories);
      setProtein(res.data.protein || 0);
      setCarbs(res.data.carbs || 0);
      setFat(res.data.fat || 0);
      setAiNote(res.data.note || "");
      setAiDone(true);
      if (showToast) showSnack(`AI estimated ${res.data.calories} kcal for ${food}`);
    } catch { showSnack("AI lookup failed — enter calories manually", "error"); }
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    if (!aiDone || !food.trim()) return;
    const timer = setTimeout(() => handleAiLookup(false), 600);
    return () => clearTimeout(timer);
  }, [portionSize, portionUnit]); // eslint-disable-line

  const fetchSuggestions = async () => {
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const res = await axios.post("https://d393qv373r18to.cloudfront.net/nutrition/ai-suggest", {
        caloriesConsumed: summary.calories,
        calorieGoal,
        caloriesBurned,
        mealType,
        loggedFoods: logs.map((l) => l.food),
      });
      setSuggestions(res.data);
    } catch { showSnack("Failed to get suggestions", "error"); }
    finally { setSuggestLoading(false); }
  };

  const saveFood = async (e) => {
    e.preventDefault();
    if (!username || !isToday) return;
    try {
      await axios.post("https://d393qv373r18to.cloudfront.net/nutrition/log", {
        userId: username, food: food.trim(),
        portionSize: Number(portionSize), portionUnit,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        mealType, water: 0, date: today,
      });
      setFood(""); setPortionSize(100); setPortionUnit("g");
      setCalories(""); setProtein(0); setCarbs(0); setFat(0);
      setAiDone(false); setAiNote(""); setMealType("Breakfast");
      fetchSummary();
      refreshCoachTip();
      showSnack("Food logged!");
    } catch { showSnack("Failed to save food", "error"); }
  };

  const saveWater = async (amount) => {
    if (!username || !isToday) return;
    try {
      await axios.post("https://d393qv373r18to.cloudfront.net/nutrition/log", {
        userId: username, food: "", calories: 0,
        mealType: "", water: amount, date: today,
      });
      fetchSummary();
      refreshCoachTip();
      showSnack(`+${amount} ml logged 💧`);
    } catch { showSnack("Failed to save water", "error"); }
  };

  const updateFood = async (id, item) => {
    try {
      await axios.put(`https://d393qv373r18to.cloudfront.net/nutrition/${id}`, item);
      fetchSummary();
      showSnack("Updated");
    } catch { showSnack("Update failed", "error"); }
  };

  const deleteLog = async (id) => {
    try {
      await axios.delete(`https://d393qv373r18to.cloudfront.net/nutrition/${id}`);
      fetchSummary();
      showSnack("Deleted", "info");
    } catch { showSnack("Delete failed", "error"); }
  };

  const saveGoals = () => {
    localStorage.setItem("dailyCaloriesGoal", calorieGoal);
    localStorage.setItem("dailyWaterGoal", waterGoal);
    showSnack("Goals updated!");
  };

  const netCalories = summary.calories - caloriesBurned;
  const caloriePercent = Math.min((summary.calories / calorieGoal) * 100, 100);
  const hydrationPercent = Math.min((summary.water / waterGoal) * 100, 100);
  const calorieColor = caloriePercent > 90 ? "error" : caloriePercent > 70 ? "warning" : "primary";

  const groupedLogs = MEAL_TYPES.reduce((acc, meal) => {
    const items = logs.filter((l) => l.mealType === meal);
    if (items.length > 0) acc[meal] = items;
    return acc;
  }, {});

  const refreshCoachTip = async () => {
    try {
      // Delete cached tip so next fetch generates a fresh one
      await axios.delete(`https://d393qv373r18to.cloudfront.net/coach/daily-tip/invalidate?username=${username}`);
      // Fetch fresh tip
      await axios.get(`https://d393qv373r18to.cloudfront.net/coach/daily-tip?username=${username}`);
    } catch {
      // silently fail
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto" }}>

      {/* Date Picker */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isToday ? "Today" : new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {!isToday && (
            <Button size="small" variant="outlined" onClick={() => setSelectedDate(today)}>
              Back to Today
            </Button>
          )}
          <TextField
            type="date" size="small" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            inputProps={{ max: today }}
            sx={{ width: 160, ...textFieldSx }}
          />
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 3 }}>

        {/* LEFT COLUMN */}
        <Stack spacing={3}>

          {/* Water */}
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <WaterDropIcon color="info" />
                <Typography variant="h6">Quick Water Log</Typography>
                {!isToday && <Chip label="View only" size="small" color="warning" />}
              </Stack>
              <WaterGlasses water={summary.water} waterGoal={waterGoal} />
              <Typography variant="body2" color="var(--color-text-secondary)" textAlign="center" mt={1} mb={2}>
                {summary.water} / {waterGoal} ml
              </Typography>
              {isToday && (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {[150, 250, 330, 500, 750].map((ml) => (
                      <Button key={ml} variant="outlined" size="small"
                        onClick={() => saveWater(ml)} sx={{ borderRadius: 2 }}>
                        +{ml} ml
                      </Button>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <TextField label="Custom (ml)" type="number" value={water}
                      onChange={(e) => setWater(e.target.value)} size="small" sx={{ flex: 1, ...textFieldSx }} />
                    <Button variant="contained" sx={{
                      backgroundColor: "var(--color-primary)",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "var(--color-primary-hover)" },
                      "&.Mui-disabled": {
                        backgroundColor: "var(--color-bg-muted)",
                        color: "var(--color-text-muted)",
                      },
                    }} disabled={!water}
                      onClick={() => { if (water) saveWater(Number(water)); setWater(""); }}>
                      Add
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Log Food */}
          {isToday && (
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <LocalFireDepartmentIcon color="error" />
                  <Typography variant="h6">Log Food</Typography>
                </Stack>
                <form onSubmit={saveFood}>
                  <Stack spacing={2}>
                    <TextField select label="Meal Type" value={mealType}
                      onChange={(e) => setMealType(e.target.value)} fullWidth sx={textFieldSx}>
                      {MEAL_TYPES.map((m) => (
                        <MenuItem key={m} value={m}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: MEAL_COLORS[m] }} />
                            <span>{m}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField label="Food Name" value={food} required fullWidth
                      placeholder="e.g. Chicken biryani, Dosa, Oats..."
                      onChange={(e) => { setFood(e.target.value); setAiDone(false); setCalories(""); }}
                      helperText="Enter any food — hit ✨ to auto-calculate"
                      sx={textFieldSx} />

                    <Stack direction="row" spacing={1}>
                      <TextField label="Portion Size" type="number" value={portionSize} required
                        onChange={(e) => setPortionSize(e.target.value)}
                        inputProps={{ min: 1 }} sx={{ flex: 2, ...textFieldSx }} />
                      <TextField select label="Unit" value={portionUnit}
                        onChange={(e) => setPortionUnit(e.target.value)} sx={{ flex: 1, ...textFieldSx }}>
                        {PORTION_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </TextField>
                    </Stack>

                    <Tooltip title="Auto-calculate calories + macros using AI">
                      <span>
                        <Button variant="outlined" sx={{
                          backgroundColor: "var(--color-primary)",
                          color: "#ffffff",
                          "&:hover": { backgroundColor: "var(--color-primary-hover)" },
                          "&.Mui-disabled": {
                            backgroundColor: "var(--color-bg-muted)",
                            color: "var(--color-text-muted)",
                          },
                        }} fullWidth
                          onClick={() => handleAiLookup(true)}
                          disabled={!food.trim() || aiLoading}
                          startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}>
                          {aiLoading ? "Calculating..." : "Auto-Calculate with AI"}
                        </Button>
                      </span>
                    </Tooltip>

                    {aiDone && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <MacroChip label="P" value={protein} color="#2196F3" />
                        <MacroChip label="C" value={carbs} color="#FF9800" />
                        <MacroChip label="F" value={fat} color="#F44336" />
                      </Stack>
                    )}

                    <TextField label="Calories (kcal)" type="number" value={calories}
                      onChange={(e) => { setCalories(e.target.value); setAiDone(false); }}
                      fullWidth required
                      helperText={aiDone ? (aiNote || "AI-estimated — you can override") : "Or enter manually"}
                      InputProps={{
                        endAdornment: aiDone && (
                          <InputAdornment position="end">
                            <Chip label="AI" size="small" color="secondary"
                              icon={<AutoAwesomeIcon />} sx={{ height: 22 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        ...textFieldSx,
                        "& .MuiOutlinedInput-root": {
                          color: "var(--color-text-primary)",
                          "& fieldset": { borderColor: aiDone ? "secondary.main" : "var(--color-border-subtle)" },
                          "&:hover fieldset": { borderColor: "var(--color-primary)" },
                          "&.Mui-focused fieldset": { borderColor: "var(--color-primary)" },
                        },
                        "& .MuiFormHelperText-root": { color: "var(--color-text-muted)" },
                      }}
                    />

                    <Button type="submit" variant="contained" size="large"
                      disabled={!food || !calories || !portionSize}
                      sx={{
                        backgroundColor: "var(--color-primary)",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "var(--color-primary-hover)" },
                        "&.Mui-disabled": {
                          backgroundColor: "var(--color-bg-muted)",
                          color: "var(--color-text-muted)",
                        },
                      }}>
                      Save Food
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* RIGHT COLUMN */}
        <Stack spacing={3}>

          {/* Summary */}
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6">
                {isToday ? "Today's Summary" : "Day Summary"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="var(--color-text-secondary)">
                      Calories Eaten
                    </Typography>
                    <Typography variant="body2" fontWeight={600}
                      color={caloriePercent > 90 ? "error.main" : "var(--color-text-secondary)"}>
                      {Math.round(caloriePercent)}%
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.calories}
                    <Typography component="span" variant="body1" color="var(--color-text-secondary)" ml={1}>
                      / {calorieGoal} kcal
                    </Typography>
                  </Typography>
                  <LinearProgress variant="determinate" value={caloriePercent}
                    color={calorieColor} sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                </Box>

                {caloriesBurned > 0 && (
                  <Box sx={{ bgcolor: "var(--color-bg-muted)", borderRadius: 2, p: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FitnessCenterIcon fontSize="small" color="success" />
                        <Typography variant="body2">Burned from exercise</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        -{caloriesBurned} kcal
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="var(--color-text-secondary)">Net calories</Typography>
                      <Typography variant="body2" fontWeight={700}
                        color={netCalories > calorieGoal ? "error.main" : "success.main"}>
                        {netCalories} kcal
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {(summary.protein > 0 || summary.carbs > 0 || summary.fat > 0) && (
                  <Box>
                    <Typography variant="body2" color="var(--color-text-secondary)" mb={1}>Macros</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <MacroChip label="Protein" value={summary.protein} color="#2196F3" />
                      <MacroChip label="Carbs" value={summary.carbs} color="#FF9800" />
                      <MacroChip label="Fat" value={summary.fat} color="#F44336" />
                    </Stack>
                  </Box>
                )}

                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="var(--color-text-secondary)">Hydration</Typography>
                    <Typography variant="body2" fontWeight={600} color="var(--color-text-secondary)">
                      {Math.round(hydrationPercent)}%
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700}>
                    {summary.water}
                    <Typography component="span" variant="body1" color="var(--color-text-secondary)" ml={1}>
                      / {waterGoal} ml
                    </Typography>
                  </Typography>
                  <LinearProgress variant="determinate" value={hydrationPercent}
                    color="info" sx={{ height: 10, borderRadius: 5, mt: 1 }} />
                  <Typography variant="caption" color="var(--color-text-secondary)">
                    {Math.max(0, waterGoal - summary.water)} ml remaining
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* AI Meal Suggestions */}
          {isToday && (
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TipsAndUpdatesIcon color="warning" />
                    <Typography variant="h6">AI Meal Suggestions</Typography>
                  </Stack>
                  <Button size="small" variant="outlined" color="warning"
                    onClick={fetchSuggestions} disabled={suggestLoading}
                    startIcon={suggestLoading ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}>
                    {suggestLoading ? "Thinking..." : "Suggest"}
                  </Button>
                </Stack>
                {suggestions.length === 0 && !suggestLoading && (
                  <Typography variant="body2" color="var(--color-text-secondary)">
                    Hit "Suggest" to get AI-powered meal ideas based on your remaining calories.
                  </Typography>
                )}
                <Stack spacing={1.5}>
                  {suggestions.map((s, i) => (
                    <Box key={i} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="body2" fontWeight={700}>{s.name}</Typography>
                        <Chip label={`~${s.calories} kcal`} size="small" color="warning" variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="var(--color-text-secondary)">{s.reason}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Food Log */}
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                {isToday ? "Today's Food Log" : "Food Log"}
              </Typography>
              {Object.keys(groupedLogs).length === 0 ? (
                <Typography variant="body2" color="var(--color-text-secondary)" textAlign="center" py={2}>
                  No food logged {isToday ? "yet today" : "on this day"}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {Object.entries(groupedLogs).map(([meal, items]) => (
                    <Box key={meal}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: MEAL_COLORS[meal] }} />
                        <Typography variant="subtitle2" fontWeight={700}>{meal}</Typography>
                        <Typography variant="caption" color="var(--color-text-secondary)">
                          ({items.reduce((s, i) => s + Number(i.calories || 0), 0)} kcal)
                        </Typography>
                      </Stack>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, backgroundColor: "var(--color-bg-surface)" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "var(--color-bg-muted)" }}>
                              <TableCell sx={{ color: "var(--color-text-secondary)" }}><b>Food</b></TableCell>
                              <TableCell sx={{ color: "var(--color-text-secondary)" }}><b>Portion</b></TableCell>
                              <TableCell sx={{ color: "var(--color-text-secondary)" }}><b>kcal</b></TableCell>
                              {isToday && <TableCell sx={{ color: "var(--color-text-secondary)" }} align="center"><b>Actions</b></TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item) => (
                              <TableRow key={item._id} hover>
                                <TableCell>
                                  <TextField variant="standard" value={item.food}
                                    onChange={(e) => setLogs((prev) =>
                                      prev.map((l) => l._id === item._id ? { ...l, food: e.target.value } : l)
                                    )} sx={{ minWidth: 90, ...textFieldStandardSx }}
                                    InputProps={{ readOnly: !isToday }} />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {item.portionSize || 100}{item.portionUnit || "g"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <TextField variant="standard" type="number" value={item.calories}
                                    onChange={(e) => setLogs((prev) =>
                                      prev.map((l) => l._id === item._id ? { ...l, calories: e.target.value } : l)
                                    )} sx={{ width: 55, ...textFieldStandardSx }}
                                    InputProps={{ readOnly: !isToday }} />
                                </TableCell>
                                {isToday && (
                                  <TableCell align="center">
                                    <IconButton color="primary" size="small"
                                      onClick={() => updateFood(item._id, item)}>
                                      <SaveIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" size="small"
                                      onClick={() => deleteLog(item._id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h6" mb={2}>Daily Goals</Typography>
              <Stack spacing={2}>
                <TextField label="Calories Goal (kcal)" type="number" value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)} fullWidth sx={textFieldSx}
                  InputProps={{ endAdornment: <InputAdornment position="end">kcal</InputAdornment> }} />
                <TextField label="Water Goal (ml)" type="number" value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)} fullWidth sx={textFieldSx}
                  InputProps={{ endAdornment: <InputAdornment position="end">ml</InputAdornment> }} />
                <Button variant="contained" onClick={saveGoals}>Save Goals</Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FoodHydration;
