import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupOverview.css";

const icons = {
  EXERCISE_LOG: <span>🏃</span>,
  AWARDED_BADGE: <span>🏅</span>,
  CLOCK: <span>⏰</span>,
};

const GroupOverview = ({ currentUser }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [feedItems, setFeedItems] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [groupProgress, setGroupProgress] = useState(null);
  const [groupMetric, setGroupMetric] = useState("totalMinutes");
  const [isPublicGroup, setIsPublicGroup] = useState(false);
  const [isTeamChallenge, setIsTeamChallenge] = useState(true); // default show
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState("");

  // Fetch all groups for the user
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await axios.get(
          `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
        );
        setGroups(res.data);
        if (res.data.length > 0) setSelectedGroup(res.data[0].groupId);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
        setError("Failed to load groups.");
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [currentUser]);

  // Fetch feed and leaderboard for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupDetails = async () => {
      // Reset states
      setFeedItems([]);
      setLeaders([]);
      setError("");
      setLoadingFeed(true);
      setLoadingLeaderboard(true);

      try {
        // 1️⃣ Get group details (to detect metric)
        const groupRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
        );
        const groupData = groupRes.data;
        // flag if this is the public/default group
        const publicFlag = groupData.isPublic ||
          groupData.groupId === "g_public_001" ||
          groupData.name?.toLowerCase().includes("public");
        setIsPublicGroup(publicFlag);
        // determine whether to treat progress as a team challenge
        // if challengeMode is TEAM, then isTeamChallenge = true
        const teamFlag = groupData.rules?.challengeMode === "TEAM" || groupData.rules?.mode === "TEAM";
        setIsTeamChallenge(teamFlag);
        const metric =
          groupData.rules?.metric === "CALORIES"
            ? "totalCalories"
            : "totalMinutes";
        setGroupMetric(metric);

        // 2️⃣ Fetch feed
        const feedRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
        );
        setFeedItems(feedRes.data);

        // 3️⃣ Fetch leaderboard
        const leaderboardRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
          { params: { top_n: 10, metric } }
        );
        setLeaders(leaderboardRes.data);

        // 4️⃣ Fetch group‑level progress summary
        try {
          const progressRes = await axios.get(
            `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
          );
          setGroupProgress(progressRes.data);
        } catch (ignore) {
          // optional endpoint, ignore failures
          setGroupProgress(null);
        }
      } catch (err) {
        console.error("Failed to fetch group details:", err);
        setError("Failed to load group data.");
      } finally {
        setLoadingFeed(false);
        setLoadingLeaderboard(false);
        // reset members when group changes
        setMembers([]);
        setShowMembers(false);
        setLoadingMembers(false);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup]);

  return (
    <div className="group-overview-wrapper">
      <h2>Group Overview</h2>

      {/* Group Selector */}
      {loadingGroups ? (
        <p className="loading-text">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="empty-text">No groups found.</p>
      ) : (
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="group-select"
        >
          {groups.map((g) => (
            <option key={g.groupId} value={g.groupId}>
              {g.groupName}
            </option>
          ))}
        </select>
      )}
      {selectedGroup && (
        <button
          className="members-btn"
          onClick={async () => {
            if (showMembers) {
              setShowMembers(false);
              return;
            }
            setShowMembers(true);
            if (members.length > 0) return;
            setLoadingMembers(true);
            try {
              const res = await axios.get(
                `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`
              );
              setMembers(res.data || []);
            } catch (e) {
              console.error("Failed to fetch members:", e);
              setMembers([]);
            } finally {
              setLoadingMembers(false);
            }
          }}
        >
          {showMembers ? "Hide Members" : "Members"}
        </button>
      )}

      <div className="combined-sections">
        {/* Leaderboard */}
        {groupProgress && !isPublicGroup && isTeamChallenge && (
          <div className="group-progress-summary">
            <h3>Group Progress</h3>
            <p>
              {groupMetric === "totalMinutes" && <>Total Minutes: {groupProgress.totalMinutes}</>}
              {groupMetric === "totalCalories" && <>Total Calories: {groupProgress.totalCalories}</>}
              {' '}
              {groupProgress.completed ? '🟢 Completed' : '🔴 Incomplete'}
            </p>
          </div>
        )}

        {showMembers && (
          <div className="members-panel">
            <h3>Members</h3>
            {loadingMembers ? (
              <p className="loading-text">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="empty-text">No members found.</p>
            ) : (
              <ul>
                {members.map((m) => (
                  <li key={m.userId}>{m.name ? `${m.name} (${m.userId})` : m.userId}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="leaderboard-section">
          <h3>Leaderboard</h3>
          {loadingLeaderboard ? (
            <p className="loading-text">Loading leaderboard...</p>
          ) : leaders.length === 0 ? (
            <p className="empty-text">No leaderboard data yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  {groupMetric === "totalMinutes" && <th>Total Minutes</th>}
                  {groupMetric === "totalCalories" && <th>Total Calories</th>}
                  {isTeamChallenge && <th>Completed</th>}
                </tr>
              </thead>
              <tbody>
                {leaders.map((item) => (
                  <tr key={item.userId}>
                    <td>{item.rank}</td>
                    <td>{item.userId}</td>
                    {groupMetric === "totalMinutes" && <td>{item.totalMinutes}</td>}
                    {groupMetric === "totalCalories" && <td>{item.totalCalories}</td>}
                    {isTeamChallenge && <td>{item.completed ? "✅" : "❌"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feed */}
        <div className="feed-section">
          <h3>Group Feed</h3>
          {loadingFeed ? (
            <p className="loading-text">Loading feed...</p>
          ) : feedItems.length === 0 ? (
            <p className="empty-text">No feed items yet.</p>
          ) : (
            feedItems.map((item) => (
              <div key={item.feed_id} className="feed-item">
                <div className="feed-item-header">
                  <div className="feed-icon">{icons[item.type] || null}</div>
                  <h4>{item.title}</h4>
                </div>
                <p>{item.description}</p>
                <small>
                  {icons.CLOCK} {new Date(item.createdAt).toLocaleString()} •
                  {item.type}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default GroupOverview;