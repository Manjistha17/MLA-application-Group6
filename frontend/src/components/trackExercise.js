import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
} from "@mui/material";

import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import PoolIcon from "@mui/icons-material/Pool";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { trackExercise } from "../api";
import Timer from "./Timer";

const activitiesConfig = [
  { key: "Running", label: "Running", icon: <DirectionsRunIcon fontSize="large" /> },
  { key: "Swimming", label: "Swimming", icon: <PoolIcon fontSize="large" /> },
  { key: "Cycling", label: "Cycling", icon: <DirectionsBikeIcon fontSize="large" /> },
  { key: "Yoga", label: "Yoga", icon: <SelfImprovementIcon fontSize="large" /> },
  { key: "Gym", label: "Weights", icon: <FitnessCenterIcon fontSize="large" /> },
  { key: "Other", label: "Others", icon: <HelpOutlineIcon fontSize="large" /> },
];

const TrackExercise = (props) => {
  console.log("ALL PROPS:", props);
  const { currentUser } = props;
  const [state, setState] = useState({
    exerciseType: "",
    duration: 0,
    subActivity: "",
    date: new Date(),
  });

  const [trackingMode, setTrackingMode] = useState("manual");
  const [manualDuration, setManualDuration] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [timerSession, setTimerSession] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success | error

  /* -------------------------------
     Fetch activities (once)
  -------------------------------- */
  useEffect(() => {
    axios
      .get("/exercises/activities/")
      .then((res) => setActivities(res.data))
      .catch(() => {
        setMessageType("error");
        setMessage("Failed to load activities.");
      });
  }, []);


  const handleExerciseTypeSelect = (type) => {
    const activity = activities.find((a) => a.activity === type);
    setState((prev) => ({ ...prev, exerciseType: type, subActivity: "" }));
    setSelectedActivity(activity || null);
  };

  const handleTimerStop = (sessionData) => {
    setTimerSession(sessionData);
    if (sessionData?.duration) {
      setState((prev) => ({
        ...prev,
        duration: Math.round(sessionData.duration / 60),
      }));
    }
  };


  const onSubmit = async () => {
    setMessage("");

    if (!currentUser) {
      setMessageType("error");
      setMessage("User session is still loading. Please try again.");
      return;
    }

    if (!state.exerciseType) {
      setMessageType("error");
      setMessage("Please select an activity type.");
      return;
    }

    let finalDuration;
    let description;

    if (trackingMode === "timer") {
      if (!timerSession?.duration) {
        setMessageType("error");
        setMessage("Please stop the timer before saving.");
        return;
      }

      // ✅ FIX: never allow 0 minutes
      finalDuration = Math.ceil(timerSession.duration / 60);
      description = `${state.exerciseType} session`;

    } else {
      const parsedDuration = Number(manualDuration);

      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        setMessageType("error");
        setMessage("Please enter a valid duration in minutes.");
        return;
      }

      finalDuration = parsedDuration;
      description = `${state.exerciseType} manual entry`;
    }

    try {
      await trackExercise({
        username: currentUser,
        exerciseType: state.exerciseType,
        subActivity: state.subActivity,
        date: state.date.toISOString(),
        duration: finalDuration,
        description,
      });

      setMessageType("success");
      setMessage("Exercise logged successfully!");

      // ✅ Clean reset
      setState({
        exerciseType: "",
        duration: 0,
        subActivity: "",
        date: new Date(),
      });
      setManualDuration("");
      setTimerSession(null);
      setSelectedActivity(null);

    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to log exercise."
      );
    }
  };


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Track Exercise
          </Typography>

          <ToggleButtonGroup
            fullWidth
            value={trackingMode}
            exclusive
            onChange={(e, v) => setTrackingMode(v ?? "manual")}
            sx={{
              mb: 4,
              "& .MuiToggleButton-root": {
                borderColor: "divider",
                color: "text.secondary",
                "&.Mui-selected": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  backgroundColor: "rgba(25, 118, 210, 0.08)", // subtle blue
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.12)",
                },
              },
            }}
          >

            <ToggleButton value="manual">Manual Entry</ToggleButton>
            <ToggleButton value="timer">Timer Mode</ToggleButton>
          </ToggleButtonGroup>

          <Typography fontWeight={500} mb={1.5}>
            Select Activity
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              mb: 4,
            }}
          >
            {activitiesConfig.map((item) => {
              const selected = state.exerciseType === item.key;

              return (
                <Card
                  key={item.key}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: selected ? "primary.main" : "divider",
                  }}
                >
                  <CardActionArea onClick={() => handleExerciseTypeSelect(item.key)}>
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      {item.icon}
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>

          {trackingMode === "timer" && (
            <Box mb={4}>
              <Timer onTimerStop={handleTimerStop} />
            </Box>
          )}

          {trackingMode === "manual" && (
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={manualDuration}
              onChange={(e) => setManualDuration(e.target.value)}
              sx={{ mb: 4 }}
            />
          )}

          {selectedActivity && (
            <TextField
              fullWidth
              select
              label={selectedActivity.dropdown_label}
              value={state.subActivity}
              onChange={(e) =>
                setState({ ...state, subActivity: e.target.value })
              }
              SelectProps={{ native: true }}
              sx={{ mb: 4 }}
            >
              <option value=""></option>
              {selectedActivity.sub_activity_options.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </TextField>
          )}

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={onSubmit}
            disabled={trackingMode === "timer" && !timerSession?.duration}
          >
            Save Exercise
          </Button>

          {message && (
            <Typography
              mt={2}
              textAlign="center"
              color={messageType === "success" ? "success.main" : "error.main"}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TrackExercise;
