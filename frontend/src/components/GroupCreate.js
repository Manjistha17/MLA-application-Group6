import React, { useState } from "react";
import axios from "axios";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Stack, TextField, Typography, Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import { cardSx, hdrSx, mutedSx, primaryBtnSx, outlinedBtnSx, fieldSx, C } from "./GroupStyles";

const ACTIVITY_SUGGESTIONS = ["Running", "Swimming", "Cycling", "Yoga", "HIIT", "Walking", "Strength", "Pilates", "Boxing", "Rowing"];
const STEPS = ["Group Info", "Challenge Rules", "Review & Create"];

const GroupCreate = ({ currentUser, onBack, onGroupCreated }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("CHALLENGE");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [challengeMode, setChallengeMode] = useState("INDIVIDUAL");
  const [activityChips, setActivityChips] = useState([]);
  const [customActivity, setCustomActivity] = useState("");
  const [metric, setMetric] = useState("MINUTES");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdGroupId, setCreatedGroupId] = useState(null);
  const [createdName, setCreatedName] = useState("");

  const toggleActivity = a => setActivityChips(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const addCustom = () => {
    const v = customActivity.trim();
    if (v && !activityChips.includes(v)) setActivityChips(p => [...p, v]);
    setCustomActivity("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!name.trim()) return "Group name is required.";
      if (!description.trim()) return "Description is required.";
      if (!startDate || !endDate) return "Start and end dates are required.";
      if (new Date(endDate) < new Date(startDate)) return "End date must be after start date.";
    }
    if (step === 1) {
      if (!activityChips.length) return "Select at least one activity.";
      if (!target || isNaN(target) || Number(target) <= 0) return "Enter a valid target number.";
    }
    return null;
  };

  const next = () => { const e = validateStep(); if (e) { setError(e); return; } setError(""); setStep(s => s + 1); };
  const back = () => { setError(""); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.post("/groups/create", {
        name, type, visibility, status: "ACTIVE", description,
        rules: { activityTypes: activityChips, metric, target: parseInt(target) },
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        createdBy: currentUser, challengeMode,
      });
      setCreatedGroupId(res.data.groupId);
      setCreatedName(name);
      setStep(3);
      if (onGroupCreated) onGroupCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally { setLoading(false); }
  };

  const toggleSx = active => ({
    px: 2, py: 0.5, borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "13px",
    fontFamily: "var(--font-family-base)", fontWeight: 600, transition: "all 0.15s", userSelect: "none",
    bgcolor: active ? "var(--color-primary)" : "var(--color-bg-muted)",
    color: active ? "#fff" : "var(--color-text-muted)",
    border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border-subtle)"}`,
    "&:hover": { borderColor: "var(--color-primary)" },
  });

  const labelSx = {
    fontWeight: 600, fontSize: "12px", color: "var(--color-text-muted)",
    fontFamily: "var(--font-family-base)", mb: 0.75, display: "block",
    textTransform: "uppercase", letterSpacing: 0.4,
  };

  // ── Success screen ──
  if (step === 3) return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
    <Box sx={{ textAlign: "center", py: 4, fontFamily: "var(--font-family-base)", maxWidth: 580, width: "100%" }}>
      <Box sx={{ width: 58, height: 58, borderRadius: "50%", bgcolor: "rgba(22,163,74,0.12)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 30 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)", fontSize: "16px", mb: 0.5 }}>
        Group Created!
      </Typography>
      <Typography sx={{ ...mutedSx, fontSize: "13px", mb: 3 }}>
        Your group <strong>{createdName}</strong> is live.
      </Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="contained" startIcon={<PersonAddAlt1Icon />}
          onClick={() => onBack("addMembers", createdGroupId)}
          sx={{ ...primaryBtnSx, fontSize: "13px" }}>
          Add Members
        </Button>
        <Button variant="outlined" onClick={() => onBack()}
          sx={{ ...outlinedBtnSx, fontSize: "13px" }}>
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
    <Box sx={{ fontFamily: "var(--font-family-base)", width: "100%", maxWidth: 580 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" mb={2.5} gap={1}>
        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: C.create.bg, color: C.create.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <AddIcon fontSize="small" />
        </Box>
        <Typography sx={{ ...hdrSx, flex: 1 }}>Create a Group</Typography>
        <Button size="small" startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => onBack()}
          sx={{ color: "var(--color-text-muted)", textTransform: "none", fontFamily: "var(--font-family-base)", fontSize: "12px", borderRadius: "var(--radius-md)", "&:hover": { color: "var(--color-primary)", bgcolor: "var(--color-primary-soft)" } }}>
          Back
        </Button>
      </Stack>

      {/* Step indicators */}
      <Stack direction="row" spacing={1} mb={2.5}>
        {STEPS.map((label, i) => (
          <Box key={i} sx={{ flex: 1 }}>
            <Box sx={{ height: 3, borderRadius: 2, bgcolor: i <= step ? "var(--color-primary)" : "var(--color-bg-muted)", mb: 0.5, transition: "background 0.3s" }} />
            <Typography sx={{ fontSize: "10px", color: i === step ? "var(--color-primary)" : "var(--color-text-muted)", fontFamily: "var(--font-family-base)", fontWeight: i === step ? 700 : 400 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: "var(--radius-md)", fontFamily: "var(--font-family-base)", py: 0.5 }}>{error}</Alert>}

      {/* ── Step 0: Group Info ── */}
      {step === 0 && (
        <Stack spacing={2}>
          <Box>
            <Typography component="label" sx={labelSx}>Group Name *</Typography>
            <TextField fullWidth size="small" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning Warriors" sx={fieldSx} />
          </Box>
          <Box>
            <Typography component="label" sx={labelSx}>Description *</Typography>
            <TextField fullWidth size="small" multiline rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this group about?" sx={fieldSx} />
          </Box>
          <Stack direction="row" spacing={3}>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>Type</Typography>
              <Stack direction="row" spacing={0.75}>
                {["CHALLENGE", "SOCIAL"].map(v => (
                  <Box key={v} onClick={() => setType(v)} sx={toggleSx(type === v)}>
                    {v[0] + v.slice(1).toLowerCase()}
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>Visibility</Typography>
              <Stack direction="row" spacing={0.75}>
                {["PUBLIC", "PRIVATE"].map(v => (
                  <Box key={v} onClick={() => setVisibility(v)} sx={{ ...toggleSx(visibility === v), display: "flex", alignItems: "center", gap: 0.5 }}>
                    {v === "PUBLIC" ? <PublicIcon sx={{ fontSize: 13 }} /> : <LockIcon sx={{ fontSize: 13 }} />}
                    {v[0] + v.slice(1).toLowerCase()}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>Start Date *</Typography>
              <TextField fullWidth size="small" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Box>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>End Date *</Typography>
              <TextField fullWidth size="small" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Box>
          </Stack>
        </Stack>
      )}

      {/* ── Step 1: Challenge Rules ── */}
      {step === 1 && (
        <Stack spacing={2}>
          <Box>
            <Typography component="label" sx={labelSx}>Challenge Mode</Typography>
            <Stack direction="row" spacing={0.75}>
              {["INDIVIDUAL", "TEAM"].map(v => (
                <Box key={v} onClick={() => setChallengeMode(v)} sx={toggleSx(challengeMode === v)}>
                  {v[0] + v.slice(1).toLowerCase()}
                </Box>
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography component="label" sx={labelSx}>Activities *</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
              {ACTIVITY_SUGGESTIONS.map(a => (
                <Box key={a} onClick={() => toggleActivity(a)} sx={{
                  px: 1.5, py: 0.4, borderRadius: "999px", cursor: "pointer", fontSize: "12px",
                  fontFamily: "var(--font-family-base)", fontWeight: 600, transition: "all 0.15s", userSelect: "none",
                  bgcolor: activityChips.includes(a) ? "var(--color-primary)" : "var(--color-bg-muted)",
                  color: activityChips.includes(a) ? "#fff" : "var(--color-text-muted)",
                  border: `1px solid ${activityChips.includes(a) ? "var(--color-primary)" : "var(--color-border-subtle)"}`,
                }}>
                  {a}
                </Box>
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              <TextField size="small" placeholder="Add custom activity…" value={customActivity}
                onChange={e => setCustomActivity(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                sx={{ ...fieldSx, flex: 1 }} />
              <Button size="small" variant="outlined" onClick={addCustom} sx={{ ...outlinedBtnSx, fontSize: "12px", px: 1.5 }}>Add</Button>
            </Stack>
            {activityChips.filter(a => !ACTIVITY_SUGGESTIONS.includes(a)).length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.75 }}>
                {activityChips.filter(a => !ACTIVITY_SUGGESTIONS.includes(a)).map(a => (
                  <Chip key={a} label={a} size="small" onDelete={() => toggleActivity(a)}
                    sx={{ fontFamily: "var(--font-family-base)", fontSize: "12px", bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)", borderRadius: "var(--radius-sm)" }} />
                ))}
              </Box>
            )}
          </Box>
          <Stack direction="row" spacing={3}>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>Track By</Typography>
              <Stack direction="row" spacing={0.75}>
                {["MINUTES", "CALORIES"].map(v => (
                  <Box key={v} onClick={() => setMetric(v)} sx={toggleSx(metric === v)}>
                    {v[0] + v.slice(1).toLowerCase()}
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box flex={1}>
              <Typography component="label" sx={labelSx}>Target ({metric === "MINUTES" ? "mins" : "kcal"}) *</Typography>
              <TextField fullWidth size="small" type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder={metric === "MINUTES" ? "e.g. 600" : "e.g. 5000"} sx={fieldSx} />
            </Box>
          </Stack>
        </Stack>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <Card sx={{ ...cardSx, bgcolor: "var(--color-bg-muted)" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, fontFamily: "var(--font-family-base)", color: "var(--color-text-primary)", mb: 1.5 }}>
              Review your group
            </Typography>
            {[
              ["Name", name], ["Description", description], ["Type", type], ["Visibility", visibility],
              ["Dates", `${startDate} → ${endDate}`], ["Mode", challengeMode],
              ["Activities", activityChips.join(", ")], ["Target", `${target} ${metric.toLowerCase()}`],
            ].map(([k, v]) => (
              <Stack key={k} direction="row" spacing={1} mb={0.75}>
                <Typography sx={{ fontWeight: 700, fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "var(--font-family-base)", width: 90, flexShrink: 0 }}>{k}</Typography>
                <Typography sx={{ fontSize: "13px", color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)" }}>{v}</Typography>
              </Stack>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2.5}>
        {step > 0 && (
          <Button size="small" variant="outlined" onClick={back} sx={{ ...outlinedBtnSx, fontSize: "13px" }}>Back</Button>
        )}
        {step < 2
          ? <Button size="small" variant="contained" onClick={next} sx={{ ...primaryBtnSx, fontSize: "13px" }}>Next</Button>
          : <Button size="small" variant="contained" onClick={handleSubmit} disabled={loading}
              startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
              sx={{ ...primaryBtnSx, fontSize: "13px" }}>
              {loading ? "Creating…" : "Create Group"}
            </Button>
        }
      </Stack>
    </Box>
    </Box>
  );
};

export default GroupCreate;