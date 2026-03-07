import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";

function GoalSettingPage({ currentUser }) {
  const [goalType, setGoalType] = useState("weight loss");
  const [level, setLevel] = useState("beginner");
  const [numberOfWeeks, setNumberOfWeeks] = useState(2);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreatePlan = async () => {
    setError(null);
    setPlan(null);
    setLoading(true);

    try {
      const userId = currentUser?.username ?? currentUser?._id ?? currentUser;

      const response = await axios.post("/workouts/create/user-workout-plan", {
        user_id: userId,
        goal_type: goalType,
        level,
        number_of_weeks: parseInt(numberOfWeeks),
      });

      setPlan(response.data);
    } catch (error) {
      console.error("Error creating workout plan:", error);
      if (error.response?.status === 409) {
        setError("A workout plan with these settings already exists for you.");
      } else {
        setError("Error creating workout plan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Card
        sx={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 3,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Set Your Fitness Goals
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
          >
            Customize your workout plan based on your goal, fitness level and
            timeline.
          </Typography>

          <Grid container spacing={3} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Goal Type"
                fullWidth
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
              >
                <MenuItem value="weight loss">Weight Loss</MenuItem>
                <MenuItem value="muscle gain">Muscle Gain</MenuItem>
                <MenuItem value="endurance">Endurance</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Fitness Level"
                fullWidth
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Number of Weeks"
                type="number"
                fullWidth
                value={numberOfWeeks}
                onChange={(e) => setNumberOfWeeks(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreatePlan}
              disabled={loading}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Workout Plan"
              )}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {plan && (
            <Box mt={5}>
              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="h5"
                fontWeight="bold"
                textAlign="center"
                gutterBottom
              >
                Your Personalized Workout Plan
              </Typography>

              <List>
                {plan.workouts.map((w) => (
                  <ListItem
                    key={w.day_index}
                    sx={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={`Day ${w.day_index}: ${w.activity}`}
                      secondary={`${w.sub_activity} • ${w.minutes} minutes`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default GoalSettingPage;