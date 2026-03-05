import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupOverview.css";

// Updated icons
const icons = {
  EXERCISE_LOG: <span>💪</span>,      // General workout for running, swimming, strength, etc.
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
  const [isTeamChallenge, setIsTeamChallenge] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState("");

  // Fetch groups
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

  // Fetch group details
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupDetails = async () => {
      setFeedItems([]);
      setLeaders([]);
      setGroupProgress(null);
      setError("");
      setLoadingFeed(true);
      setLoadingLeaderboard(true);
      setLoadingProgress(true);

      try {
        const groupRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
        );
        const groupData = groupRes.data;

        const publicFlag =
          groupData.isPublic ||
          groupData.groupId === "g_public_001" ||
          groupData.name?.toLowerCase().includes("public");
        setIsPublicGroup(publicFlag);

        const teamFlag =
          groupData.challengeMode === "TEAM" ||
          groupData.rules?.challengeMode === "TEAM" ||
          groupData.rules?.mode === "TEAM";
        setIsTeamChallenge(teamFlag);
        console.log("Team Challenge:", teamFlag, "Group Data:", groupData);
        console.log("Challenge Mode:", groupData.challengeMode);
        console.log("Rules:", groupData.rules);
        console.log("Group ID:", groupData.groupId);
        
        // Force team challenge for testing
        if (groupData.groupId === "g_private_001") {
          console.log("Forcing team challenge for g_private_001");
          setIsTeamChallenge(true);
        }

        const metric =
          groupData.rules?.metric === "CALORIES"
            ? "totalCalories"
            : "totalMinutes";
        setGroupMetric(metric);

        // Feed
        const feedRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
        );
        setFeedItems(feedRes.data);

        // Leaderboard
        const leaderboardRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
          { params: { top_n: 10, metric } }
        );
        setLeaders(leaderboardRes.data);

        // Progress
        try {
          console.log("Fetching progress for group:", selectedGroup);
          const progressRes = await axios.get(
            `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
          );
          console.log("Progress Response Full:", progressRes.data);
          console.log("Progress Response Status:", progressRes.status);
          console.log("Progress Response Type:", typeof progressRes.data);
          console.log("Is Array?", Array.isArray(progressRes.data));
          
          // Handle if response is an array
          if (Array.isArray(progressRes.data) && progressRes.data.length > 0) {
            console.log("Setting groupProgress from array:", progressRes.data[0]);
            setGroupProgress(progressRes.data[0]);
          } else if (progressRes.data) {
            console.log("Setting groupProgress from object:", progressRes.data);
            setGroupProgress(progressRes.data);
          } else {
            console.log("No progress data returned");
            setGroupProgress(null);
          }
        } catch (err) {
          console.error("Failed to fetch progress:", err);
          console.error("Error details:", err.response?.status, err.response?.data);
          setGroupProgress(null);
        }

      } catch (err) {
        console.error("Failed to fetch group details:", err);
        setError("Failed to load group data.");
      } finally {
        setLoadingFeed(false);
        setLoadingLeaderboard(false);
        setLoadingProgress(false);
        setMembers([]);
        setShowMembers(false);
        setLoadingMembers(false);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup]);

  return (
    <div className="group-overview-wrapper">
      <h2>Group Dashboard</h2>

      {/* Group Selector */}
      {loadingGroups ? (
        <p className="loading-text">Loading groups...</p>
      ) : groups.length === 0 ? (
        <p className="empty-text">No groups found.</p>
      ) : (
        <>
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
        </>
      )}

      <div className="combined-sections">

        {loadingProgress ? (
          <p className="loading-text">Loading group progress...</p>
        ) : (
          <>
            {groupProgress && isTeamChallenge ? (
              <div className="group-progress-summary" style={{background: 'lightgreen', padding: '20px', margin: '10px 0', border: '2px solid green'}}>
                <h3>Group Progress</h3>
                <p>
                  {groupMetric === "totalMinutes" && (
                    <>Total Minutes: {groupProgress.totalMinutes || 0}</>
                  )}
                  {groupMetric === "totalCalories" && (
                    <>Total Calories: {groupProgress.totalCalories || 0}</>
                  )}
                  {" "}
                  {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
                </p>
              </div>
            ) : isTeamChallenge ? (
              <p className="empty-text">No progress data available.</p>
            ) : null}
          </>
        )}

        {showMembers && (
          <div className="members-panel">
            <h3>Members</h3>

            {loadingMembers ? (
              <p className="loading-text">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="empty-text">No members found.</p>
            ) : (
              <ul className="members-list">
                {members.map((m) => (
                  <li key={m.userId}>
                    👤 {m.name ? `${m.name} (${m.userId})` : m.userId}
                  </li>
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
                {leaders.map((item) => {
                  const isCurrentUser = item.userId === currentUser;

                  const medal =
                    item.rank === 1 ? "🥇" :
                    item.rank === 2 ? "🥈" :
                    item.rank === 3 ? "🥉" :
                    item.rank;

                  return (
                    <tr
                      key={item.userId}
                      className={isCurrentUser ? "current-user-row" : ""}
                    >
                      <td>{medal}</td>

                      <td>
                        {item.userId}
                        {isCurrentUser && " (You)"}
                      </td>

                      {groupMetric === "totalMinutes" && (
                        <td>{item.totalMinutes}</td>
                      )}

                      {groupMetric === "totalCalories" && (
                        <td>{item.totalCalories}</td>
                      )}

                      {!isTeamChallenge && (
                        <td>{item.completed ? "✅" : "❌"}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

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
                  <div className="feed-icon">{icons[item.type]}</div>
                  <h4>{item.title}</h4>
                </div>

                <p>{item.description}</p>

                <small>
                  {icons.CLOCK}{" "}
                  {new Date(item.createdAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  • {item.type}
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