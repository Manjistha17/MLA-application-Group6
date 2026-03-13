import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Collapse,
  Divider, MenuItem, Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, LinearProgress, Avatar,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import StarIcon from "@mui/icons-material/Star";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

import JoinGroups from "./JoinGroups";
import GroupCreate from "./GroupCreate";
import AddMembers from "./AddMembers";
import { cardSx, hdrSx, mutedSx, primaryBtnSx, outlinedBtnSx, C } from "./GroupStyles";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
const FEED_ICON = { EXERCISE_LOG: "💪", AWARDED_BADGE: "🏅" };

// ─── Dashboard view (all hooks here, no early returns before them) ─────────────
const GroupDashboard = ({ currentUser, onNav }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [feedItems, setFeedItems] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [groupProgress, setGroupProgress] = useState(null);
  const [groupMetric, setGroupMetric] = useState("totalMinutes");
  const [groupTarget, setGroupTarget] = useState(1000);
  const [challengeMode, setChallengeMode] = useState("individual");
  const [groupCreatedBy, setGroupCreatedBy] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`)
      .then(res => { setGroups(res.data); if (res.data.length > 0) setSelectedGroup(res.data[0].groupId); })
      .catch(() => setError("Failed to load groups."))
      .finally(() => setLoadingGroups(false));
  }, [currentUser]);

  useEffect(() => {
    if (!selectedGroup) return;
    setFeedItems([]); setLeaders([]); setGroupProgress(null); setMembers([]); setGroupCreatedBy(null);
    setShowMembers(false); setError("");
    setLoadingFeed(true); setLoadingLeaderboard(true);
    const load = async () => {
      try {
        const gRes = await axios.get(`https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`);
        const g = gRes.data;
        const metric = g.rules?.metric === "CALORIES" ? "totalCalories" : "totalMinutes";
        setGroupMetric(metric);
        setGroupTarget(g.rules?.target || (metric === "totalCalories" ? 2000 : 1000));
        setChallengeMode((g.challengeMode || "individual").toLowerCase());
        setGroupCreatedBy(g.createdBy || null);
        const [fRes, lRes, pRes] = await Promise.all([
          axios.get(`https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`),
          axios.get(`https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`, { params: { top_n: 10, metric } }),
          axios.get(`https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`),
        ]);
        setFeedItems(fRes.data || []);
        setLeaders(lRes.data || []);
        const p = pRes.data;
        setGroupProgress(Array.isArray(p) && p.length ? p[0] : p || null);
      } catch { setError("Failed to load group data."); }
      finally { setLoadingFeed(false); setLoadingLeaderboard(false); }
    };
    load();
  }, [selectedGroup]);

  const handleMembersToggle = async () => {
    if (showMembers) { setShowMembers(false); return; }
    setShowMembers(true);
    if (members.length) return;
    try {
      const res = await axios.get(`https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`);
      setMembers(res.data || []);
    } catch { setMembers([]); }
  };

  if (loadingGroups) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress sx={{ color: "var(--color-primary)" }} />
    </Box>
  );

  if (!groups.length) return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Box sx={{ width: 68, height: 68, borderRadius: "50%", bgcolor: C.groups.bg, color: C.groups.color, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
        <GroupsIcon sx={{ fontSize: 34 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)", mb: 0.5 }}>
        No groups yet
      </Typography>
      <Typography sx={{ ...mutedSx, mb: 3 }}>Join or create a group to get started</Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="contained" startIcon={<SearchIcon sx={{ color: "#fff" }} />} onClick={() => onNav("join")} sx={{ ...primaryBtnSx, fontSize: "13px" }}>Browse Groups</Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onNav("create")} sx={{ ...outlinedBtnSx, fontSize: "13px" }}>Create Group</Button>
      </Stack>
    </Box>
  );

  const progressValue = groupProgress
    ? Math.min(100, ((groupMetric === "totalMinutes" ? groupProgress.totalMinutes : groupProgress.totalCalories) / groupTarget) * 100)
    : 0;
  const currentUserRank = leaders.find(l => l.userId === currentUser);

  return (
    <Box sx={{ fontFamily: "var(--font-family-base)" }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography variant="h6" sx={hdrSx}>Group Dashboard</Typography>
          <Typography sx={mutedSx}>Track challenges and activity with your groups</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<SearchIcon />} onClick={() => onNav("join")} sx={{ ...outlinedBtnSx, fontSize: "13px" }}>Join Groups</Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => onNav("create")} sx={{ ...primaryBtnSx, fontSize: "13px" }}>Create Group</Button>
        </Stack>
      </Stack>

      {/* Group selector */}
      <Card sx={{ ...cardSx, mb: 2.5 }}>
        <CardContent sx={{ py: "12px !important", px: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
            <Typography sx={{ fontWeight: 700, color: "#3b82f6", fontSize: "13px", fontFamily: "var(--font-family-base)", whiteSpace: "nowrap", letterSpacing: 0.2 }}>
              Active Group
            </Typography>
            <Select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} size="small"
              sx={{ minWidth: 200, borderRadius: "var(--radius-md)", fontFamily: "var(--font-family-base)", fontSize: "13px", color: "var(--color-text-primary)", "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-subtle)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-primary)" } }}>
              {groups.map(g => (
                <MenuItem key={g.groupId} value={g.groupId} sx={{ fontFamily: "var(--font-family-base)", fontSize: "13px" }}>{g.groupName}</MenuItem>
              ))}
            </Select>
            <Button size="small" variant={showMembers ? "contained" : "outlined"}
              startIcon={<PeopleIcon fontSize="small" sx={{ color: showMembers ? "#fff" : "#3b82f6" }} />}
              onClick={handleMembersToggle}
              sx={{ borderRadius: "var(--radius-md)", textTransform: "none", fontFamily: "var(--font-family-base)", fontWeight: 600, fontSize: "13px",
                ...(showMembers
                  ? { bgcolor: "var(--color-primary)", color: "#fff", boxShadow: "none", "&:hover": { bgcolor: "var(--color-primary-hover)", boxShadow: "none" } }
                  : { borderColor: "#3b82f6", color: "#3b82f6", "&:hover": { bgcolor: "rgba(59,130,246,0.08)", borderColor: "#3b82f6" } }
                )
              }}>
              {showMembers ? "Hide Members" : "Members"}
            </Button>
            {groupCreatedBy === currentUser && (
              <Button size="small" variant="outlined" startIcon={<PersonAddAlt1Icon fontSize="small" />}
                onClick={() => onNav("addMembers", selectedGroup)}
                sx={{ borderRadius: "var(--radius-md)", textTransform: "none", fontFamily: "var(--font-family-base)", fontWeight: 600, fontSize: "13px", borderColor: "var(--color-primary)", color: "var(--color-primary)", "&:hover": { bgcolor: "var(--color-primary-soft)", borderColor: "var(--color-primary)" } }}>
                Add Members
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Members panel */}
      <Collapse in={showMembers}>
        <Card sx={{ ...cardSx, mb: 2.5 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <PeopleIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
              <Typography sx={hdrSx}>Members</Typography>
            </Stack>
            <Divider sx={{ borderColor: "var(--color-border-subtle)", mb: 1.5 }} />
            {members.length === 0 ? (
              <Typography sx={mutedSx}>No members found.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {members.map(m => (
                  <Chip key={m.userId}
                    avatar={<Avatar sx={{ bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)", fontSize: "12px" }}>{(m.name || m.userId)?.[0]?.toUpperCase()}</Avatar>}
                    label={m.name || m.userId}
                    sx={{ fontFamily: "var(--font-family-base)", fontSize: "13px", bgcolor: "var(--color-bg-muted)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-sm)" }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Main grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 2.5 }}>
        <Stack spacing={2.5}>

          {/* Team progress */}
          {challengeMode === "team" && groupProgress && (
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <FitnessCenterIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
                  <Typography sx={hdrSx}>Team Progress</Typography>
                  <Chip label={groupProgress.completed ? "Completed ✓" : "In Progress"} size="small"
                    sx={{ ml: "auto", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-family-base)", bgcolor: groupProgress.completed ? "rgba(22,163,74,0.12)" : "var(--color-primary-soft)", color: groupProgress.completed ? "#16a34a" : "var(--color-primary)" }} />
                </Stack>
                <Divider sx={{ borderColor: "var(--color-border-subtle)", mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)", lineHeight: 1, mb: 0.5 }}>
                  {groupMetric === "totalMinutes" ? (groupProgress.totalMinutes || 0) : (groupProgress.totalCalories || 0)}
                </Typography>
                <Typography sx={{ ...mutedSx, mb: 1.5 }}>
                  of {groupTarget} {groupMetric === "totalMinutes" ? "minutes" : "calories"} ({Math.round(progressValue)}%)
                </Typography>
                <LinearProgress variant="determinate" value={progressValue}
                  sx={{ height: 8, borderRadius: 5, bgcolor: "var(--color-bg-muted)", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, var(--color-primary), #ff8a5c)", borderRadius: 5 } }} />
              </CardContent>
            </Card>
          )}

          {/* Your rank */}
          {currentUserRank && (
            <Card sx={{ ...cardSx, border: "1px solid var(--color-primary)" }}>
              <CardContent sx={{ py: "14px !important" }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "var(--radius-md)", bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <StarIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "var(--color-primary)", fontFamily: "var(--font-family-base)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Your Ranking
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)" }}>
                      {MEDAL[currentUserRank.rank] || `#${currentUserRank.rank}`}&nbsp;
                      <span style={{ color: "var(--color-text-muted)", fontWeight: 400, fontSize: "13px" }}>
                        {groupMetric === "totalMinutes" ? `${currentUserRank.totalMinutes} mins` : `${currentUserRank.totalCalories} kcal`}
                      </span>
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <EmojiEventsIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
                <Typography sx={hdrSx}>Leaderboard</Typography>
              </Stack>
              <Divider sx={{ borderColor: "var(--color-border-subtle)", mb: 1 }} />
              {loadingLeaderboard ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={22} sx={{ color: "var(--color-primary)" }} />
                </Box>
              ) : leaders.length === 0 ? (
                <Typography sx={mutedSx}>No leaderboard data yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Rank", "User", groupMetric === "totalMinutes" ? "Mins" : "Kcal", challengeMode === "individual" ? "Done" : null]
                        .filter(Boolean).map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, color: "var(--color-text-muted)", fontFamily: "var(--font-family-base)", fontSize: "11px", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--color-border-subtle)", pb: 0.5 }}>{h}</TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaders.map(item => {
                      const isUser = item.userId === currentUser;
                      return (
                        <TableRow key={item.userId} sx={{ bgcolor: isUser ? "var(--color-primary-soft)" : "transparent", "&:hover": { bgcolor: "var(--color-bg-muted)" }, "& td": { borderBottom: "1px solid var(--color-border-subtle)" } }}>
                          <TableCell sx={{ fontFamily: "var(--font-family-base)", fontSize: "14px", py: 1 }}>{MEDAL[item.rank] || item.rank}</TableCell>
                          <TableCell sx={{ fontFamily: "var(--font-family-base)", fontSize: "13px", color: isUser ? "var(--color-primary)" : "var(--color-text-primary)", fontWeight: isUser ? 700 : 400 }}>{item.userId}{isUser && " ★"}</TableCell>
                          <TableCell sx={{ fontFamily: "var(--font-family-base)", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>{groupMetric === "totalMinutes" ? item.totalMinutes : item.totalCalories}</TableCell>
                          {challengeMode === "individual" && <TableCell sx={{ fontSize: "14px" }}>{item.completed ? "✅" : "❌"}</TableCell>}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Stack>

        {/* Feed */}
        <Card sx={cardSx}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <RssFeedIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />
              <Typography sx={hdrSx}>Group Feed</Typography>
              <Chip label={`${feedItems.length} items`} size="small"
                sx={{ ml: "auto", fontSize: "11px", fontFamily: "var(--font-family-base)", bgcolor: "var(--color-bg-muted)", color: "var(--color-text-muted)" }} />
            </Stack>
            <Divider sx={{ borderColor: "var(--color-border-subtle)", mb: 1.5 }} />
            {loadingFeed ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={22} sx={{ color: "var(--color-primary)" }} />
              </Box>
            ) : feedItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography sx={{ fontSize: "2rem", mb: 1 }}>🏃</Typography>
                <Typography sx={mutedSx}>No activity yet. Be the first to log!</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 520, overflowY: "auto", pr: 0.5 }}>
                {feedItems.map(item => {
                  const isUser = item.userId === currentUser;
                  return (
                    <Box key={item.feed_id} sx={{
                      p: 1.5, borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-subtle)",
                      borderLeft: `3px solid ${isUser ? "var(--color-primary)" : "#3b82f6"}`,
                      bgcolor: isUser ? "var(--color-primary-soft)" : "var(--color-bg-muted)",
                      transition: "transform 0.15s", "&:hover": { transform: "translateY(-1px)" },
                    }}>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <span style={{ fontSize: "15px" }}>{FEED_ICON[item.type] || "📋"}</span>
                          <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "var(--color-text-primary)", fontFamily: "var(--font-family-base)" }}>{item.title}</Typography>
                        </Stack>
                        {isUser && <Chip label="You" size="small" sx={{ fontSize: "10px", fontWeight: 700, height: 18, bgcolor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-family-base)" }} />}
                      </Stack>
                      <Typography sx={{ fontSize: "12px", color: "var(--color-text-secondary)", fontFamily: "var(--font-family-base)", mb: 0.5 }}>{item.description}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-family-base)" }}>⏰ {new Date(item.createdAt).toLocaleString()}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Typography sx={{ color: "#dc2626", mt: 2, fontFamily: "var(--font-family-base)", fontSize: "13px" }}>{error}</Typography>
      )}
    </Box>
  );
};

// ─── Shell: manages which sub-view is active ──────────────────────────────────
const GroupOverview = ({ currentUser }) => {
  const [view, setView] = useState("overview"); // "overview" | "join" | "create" | "addMembers"
  const [addMembersGroupId, setAddMembersGroupId] = useState(null);

  const handleNav = (target, groupId = null) => {
    if (!target || target === "overview") { setView("overview"); return; }
    if (target === "addMembers" && groupId) setAddMembersGroupId(groupId);
    setView(target);
  };

  if (view === "join")       return <JoinGroups   currentUser={currentUser} onBack={handleNav} />;
  if (view === "create")     return <GroupCreate  currentUser={currentUser} onBack={handleNav} onGroupCreated={() => {}} />;
  if (view === "addMembers") return <AddMembers   currentUser={currentUser} groupId={addMembersGroupId} onBack={handleNav} />;

  return <GroupDashboard currentUser={currentUser} onNav={handleNav} />;
};

export default GroupOverview;