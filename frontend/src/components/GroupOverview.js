import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import "../styles/components/GroupOverview.css";

const icons = {
  EXERCISE_LOG: "💪",
  AWARDED_BADGE: "🏅",
  CLOCK: "⏰",
};

const GroupOverview = ({ currentUser }) => {
  const navigate = useNavigate();
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

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [error, setError] = useState("");

  /* ---------------- FETCH USER GROUPS ---------------- */
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await axios.get(
          `/users/${currentUser}/groups`
        );

        setGroups(res.data);

        if (res.data.length > 0) {
          setSelectedGroup(res.data[0].groupId);
        }
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [currentUser]);

  /* ---------------- FETCH GROUP DETAILS ---------------- */
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupDetails = async () => {
      setFeedItems([]);
      setLeaders([]);
      setGroupProgress(null);
      setMembers([]);
      setShowMembers(false);
      setError("");

      setLoadingFeed(true);
      setLoadingLeaderboard(true);
      setLoadingProgress(true);

      try {
        const groupRes = await axios.get(
          `/groups/${selectedGroup}`
        );
        const groupData = groupRes.data;

        const metric =
          groupData.rules?.metric === "CALORIES"
            ? "totalCalories"
            : "totalMinutes";
        setGroupMetric(metric);
        setGroupTarget(
          groupData.rules?.target || (metric === "totalCalories" ? 2000 : 1000)
        );
        setChallengeMode((groupData.challengeMode || "individual").toLowerCase());

        const feedRes = await axios.get(
          `/groups/${selectedGroup}/feed`
        );
        setFeedItems(feedRes.data || []);

        const leaderboardRes = await axios.get(
          `/groups/${selectedGroup}/leaderboard`,
          { params: { top_n: 10, metric } }
        );
        setLeaders(leaderboardRes.data || []);

        const progressRes = await axios.get(
          `/groups/${selectedGroup}/progress`
        );
        if (Array.isArray(progressRes.data) && progressRes.data.length > 0) {
          setGroupProgress(progressRes.data[0]);
        } else {
          setGroupProgress(progressRes.data || null);
        }
      } catch (err) {
        setError("Failed to load group data.");
      } finally {
        setLoadingFeed(false);
        setLoadingLeaderboard(false);
        setLoadingProgress(false);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup]);

  /* ---------------- MEMBERS FETCH ---------------- */
  const handleMembersToggle = async () => {
    if (showMembers) {
      setShowMembers(false);
      return;
    }

    setShowMembers(true);
    if (members.length) return;

    try {
      const res = await axios.get(
        `/groups/${selectedGroup}/members`
      );
      setMembers(res.data || []);
    } catch {
      setMembers([]);
    }
  };

  /* ---------------- LOADING / EMPTY STATES ---------------- */
  if (loadingGroups)
    return <Typography>Loading groups...</Typography>;

  if (!groups.length)
    return (
      <Box>
        <Typography>No groups yet.</Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" color="warning" onClick={() => navigate(`/JoinGroups?userId=${currentUser}`)}>Join Groups</Button>
          <Button variant="outlined" color="warning" onClick={() => navigate("/GroupCreate")}>Create Group</Button>
        </Box>
      </Box>
    );

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Group Dashboard</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" color="warning" onClick={() => navigate("/JoinGroups")}>Join Groups</Button>
        <Button variant="outlined" color="warning" onClick={() => navigate("/GroupCreate")}>Create Group</Button>
      </Box>

      <Select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        sx={{ mb: 2, minWidth: 200 }}
      >
        {groups.map((g) => (
          <MenuItem key={g.groupId} value={g.groupId}>
            {g.groupName}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        color="warning"
        sx={{ mb: 3 }}
        onClick={handleMembersToggle}
      >
        {showMembers ? "Hide Members" : "Members"}
      </Button>

      <Grid container spacing={3}>
        {/* Progress Card */}
        {challengeMode === "team" && groupProgress && (
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: "#fff7f3", border: "1px solid #fa632a" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Group Progress</Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {groupMetric === "totalMinutes"
                    ? `Total Minutes: ${groupProgress.totalMinutes || 0}`
                    : `Total Calories: ${groupProgress.totalCalories || 0}`}{" "}
                  {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    100,
                    (groupMetric === "totalMinutes"
                      ? groupProgress.totalMinutes
                      : groupProgress.totalCalories) / groupTarget * 100
                  )}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "orange",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Members Panel */}
        {showMembers && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Members</Typography>
                {members.length === 0 ? (
                  <Typography>No members found.</Typography>
                ) : (
                  <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none" }}>
                    {members.map((m) => (
                      <li key={m.userId} style={{ padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                        👤{" "}
                        <a
                          href={m.profileUrl || `/profile/${m.userId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#fa632a", textDecoration: "none", fontWeight: 500 }}
                        >
                          {m.name || m.userId}
                        </a>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Leaderboard */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Leaderboard</Typography>
              {loadingLeaderboard ? (
                <Typography>Loading leaderboard...</Typography>
              ) : leaders.length === 0 ? (
                <Typography>No leaderboard data yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>User</TableCell>
                      {groupMetric === "totalMinutes" && <TableCell>Minutes</TableCell>}
                      {groupMetric === "totalCalories" && <TableCell>Calories</TableCell>}
                      {challengeMode === "individual" && <TableCell>Completed</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaders.map((item) => {
                      const isUser = item.userId === currentUser;
                      const medal =
                        item.rank === 1 ? "🥇" :
                        item.rank === 2 ? "🥈" :
                        item.rank === 3 ? "🥉" :
                        item.rank;
                      return (
                        <TableRow key={item.userId} sx={isUser ? { bgcolor: "#fff3ed", fontWeight: 600 } : {}}>
                          <TableCell>{medal}</TableCell>
                          <TableCell>{item.userId}{isUser && " ⭐ You"}</TableCell>
                          <TableCell>{groupMetric === "totalMinutes" ? item.totalMinutes : item.totalCalories}</TableCell>
                          {challengeMode === "individual" && (
                            <TableCell align="center">{item.completed ? "✅" : "❌"}</TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Group Feed */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Group Feed</Typography>
              {loadingFeed ? (
                <Typography>Loading feed...</Typography>
              ) : feedItems.length === 0 ? (
                <Typography>No feed items yet.</Typography>
              ) : feedItems.map((item) => {
                const isUserActivity = item.userId === currentUser;
                return (
                  <Box
                    key={item.feed_id}
                    sx={{
                      border: "1px solid #f1f5f9",
                      borderLeft: isUserActivity ? "3px solid #fa632a" : "1px solid #f1f5f9",
                      borderRadius: 1,
                      p: 1.5,
                      mb: 1.5,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <span>{icons[item.type]}</span>
                      <Typography variant="subtitle1">{item.title}</Typography>
                      {isUserActivity && (
                        <Typography sx={{ ml: "auto", fontSize: 11, fontWeight: "bold", color: "#fa632a" }}>
                          Your Activity
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{item.description}</Typography>
                    <Typography variant="caption">{icons.CLOCK} {new Date(item.createdAt).toLocaleString()}</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Typography sx={{ color: "red", mt: 1 }}>{error}</Typography>}
    </Box>
  );
};

export default GroupOverview;