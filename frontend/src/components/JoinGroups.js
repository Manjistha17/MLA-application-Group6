import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  InputAdornment, Stack, TextField, Typography, Alert,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import { cardSx, hdrSx, mutedSx, primaryBtnSx, fieldSx } from "./GroupStyles";

const JOIN_COLOR = { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" };

const JoinGroups = ({ currentUser, onBack }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [joinedIds, setJoinedIds] = useState([]);

  useEffect(() => {
    axios.get("https://d393qv373r18to.cloudfront.net/groups/public", { params: { userId: currentUser } })
      .then(res => { setAllGroups(res.data || []); setFiltered(res.data || []); })
      .catch(() => setError("Failed to load groups."))
      .finally(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(allGroups.filter(g =>
      g.groupName.toLowerCase().includes(q) ||
      (g.description || "").toLowerCase().includes(q)
    ));
  }, [search, allGroups]);

  const handleJoin = async (groupId) => {
    setJoiningId(groupId);
    try {
      const res = await axios.post(`https://d393qv373r18to.cloudfront.net/groups/${groupId}/join`, { userId: currentUser });
      if (res.data.joined) {
        setJoinedIds(p => [...p, groupId]);
        setTimeout(() => onBack("overview"), 900);
      } else {
        setError(res.data.message || "Could not join group.");
      }
    } catch { setError("Failed to join group."); }
    finally { setJoiningId(null); }
  };

  return (
    <Box sx={{ fontFamily: "var(--font-family-base)" }}>

      {/* Header — Back left | title+icon centered | Create New right */}
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5, minHeight: 40 }}>
        {/* Left: Back */}
        <Button size="small" startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => onBack()}
          sx={{ position: "absolute", left: 0, color: "var(--color-text-muted)", textTransform: "none", fontFamily: "var(--font-family-base)", fontSize: "12px", borderRadius: "var(--radius-md)", "& .MuiButton-startIcon svg": { color: "inherit" }, "&:hover": { color: "var(--color-primary)", bgcolor: "var(--color-primary-soft)" } }}>
          Back
        </Button>

        {/* Center: icon + title */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: JOIN_COLOR.bg, color: JOIN_COLOR.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GroupsIcon fontSize="small" />
          </Box>
          <Typography sx={hdrSx}>Browse Groups</Typography>
        </Stack>

        {/* Right: Create New */}
        <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => onBack("create")}
          sx={{
            position: "absolute", right: 0,
            borderColor: "var(--color-primary)", color: "var(--color-primary)",
            borderRadius: "var(--radius-md)", textTransform: "none",
            fontFamily: "var(--font-family-base)", fontWeight: 600, fontSize: "12px",
            "& .MuiButton-startIcon svg": { color: "inherit" },
            "&:hover": { bgcolor: "var(--color-primary-soft)", borderColor: "var(--color-primary)" },
          }}>
          Create New
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}
          sx={{ mb: 1.5, borderRadius: "var(--radius-md)", fontFamily: "var(--font-family-base)", py: 0.5 }}>
          {error}
        </Alert>
      )}

      {/* Search — centered */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <TextField size="small" placeholder="Search groups..." value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ...fieldSx, width: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={26} sx={{ color: "var(--color-primary)" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <GroupsIcon sx={{ fontSize: 34, color: "var(--color-text-muted)", mb: 1 }} />
          <Typography sx={{ fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)", fontSize: "14px", mb: 0.5 }}>
            {search ? "No groups match your search" : "No groups available"}
          </Typography>
          <Typography sx={{ ...mutedSx, fontSize: "12px", mb: 2 }}>
            {search ? "Try a different term" : "Be the first to create one!"}
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />}
            onClick={() => onBack("create")} sx={{ ...primaryBtnSx, fontSize: "13px" }}>
            Create a Group
          </Button>
        </Box>
      ) : (
        <>
          <Typography sx={{ ...mutedSx, fontSize: "11px", mb: 1.5, textAlign: "center" }}>
            {filtered.length} group{filtered.length !== 1 ? "s" : ""} available
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5 }}>
            {filtered.map(group => {
              const isJoining = joiningId === group.groupId;
              const isJoined = joinedIds.includes(group.groupId);
              return (
                <Card key={group.groupId} sx={{
                  ...cardSx, boxShadow: "none", position: "relative",
                  border: `1px solid ${isJoined ? JOIN_COLOR.color : "var(--color-border-subtle)"}`,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  "&:hover": { borderColor: JOIN_COLOR.color, boxShadow: "var(--shadow-sm)" },
                }}>
                  {/* Public/Private badge — pinned top-right */}
                  <Chip
                    label={group.visibility === "PRIVATE" ? "Private" : "Public"}
                    size="small"
                    sx={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: "9px", fontWeight: 700, height: 16,
                      fontFamily: "var(--font-family-base)",
                      bgcolor: group.visibility === "PRIVATE" ? "rgba(139,92,246,0.12)" : "var(--color-bg-muted)",
                      color: group.visibility === "PRIVATE" ? "#8b5cf6" : "var(--color-text-muted)",
                    }}
                  />
                  <CardContent sx={{ p: "14px !important", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

                    {/* Icon */}
                    <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: JOIN_COLOR.bg, color: JOIN_COLOR.color, display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                      <GroupsIcon sx={{ fontSize: 18 }} />
                    </Box>

                    {/* Name */}
                    <Typography sx={{ fontWeight: 700, fontFamily: "var(--font-family-base)", color: "var(--color-text-primary)", fontSize: "13px", lineHeight: 1.3, mb: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {group.groupName}
                    </Typography>

                    {/* Description */}
                    <Typography sx={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-family-base)", fontSize: "12px", lineHeight: 1.5, mb: 1.25, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {group.description || "No description available."}
                    </Typography>

                    {/* Join button — centered, natural width */}
                    <Button size="small"
                      variant={isJoined ? "outlined" : "contained"}
                      disabled={isJoining}
                      startIcon={isJoined ? <CheckIcon sx={{ fontSize: "12px !important", color: JOIN_COLOR.color }} /> : null}
                      onClick={() => !isJoined && handleJoin(group.groupId)}
                      sx={{
                        borderRadius: "var(--radius-sm)", textTransform: "none",
                        fontFamily: "var(--font-family-base)", fontWeight: 700,
                        fontSize: "12px", px: 2.5, py: 0.5, boxShadow: "none",
                        ...(isJoined
                          ? { borderColor: JOIN_COLOR.color, color: JOIN_COLOR.color, bgcolor: JOIN_COLOR.bg, "&:hover": { bgcolor: JOIN_COLOR.bg } }
                          : { bgcolor: "var(--color-primary)", color: "#fff", "&:hover": { bgcolor: "var(--color-primary-hover)", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)" } }
                        ),
                      }}>
                      {isJoining ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : isJoined ? "Joined ✓" : "Join"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};

export default JoinGroups;