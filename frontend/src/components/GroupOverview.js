// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import "../styles/components/GroupOverview.css";

// // // // Icons
// // // const icons = {
// // //   EXERCISE_LOG: <span>💪</span>,
// // //   AWARDED_BADGE: <span>🏅</span>,
// // //   CLOCK: <span>⏰</span>,
// // // };

// // // const GroupOverview = ({ currentUser }) => {
// // //   const [groups, setGroups] = useState([]);
// // //   const [selectedGroup, setSelectedGroup] = useState("");
// // //   const [feedItems, setFeedItems] = useState([]);
// // //   const [leaders, setLeaders] = useState([]);
// // //   const [members, setMembers] = useState([]);
// // //   const [showMembers, setShowMembers] = useState(false);
// // //   const [groupProgress, setGroupProgress] = useState(null);
// // //   const [groupMetric, setGroupMetric] = useState("totalMinutes");
// // //   const [loadingGroups, setLoadingGroups] = useState(true);
// // //   const [loadingFeed, setLoadingFeed] = useState(false);
// // //   const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
// // //   const [loadingProgress, setLoadingProgress] = useState(false);
// // //   const [error, setError] = useState("");

// // //   useEffect(() => {
// // //     const fetchGroups = async () => {
// // //       setLoadingGroups(true);
// // //       try {
// // //         const res = await axios.get(
// // //           `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
// // //         );
// // //         setGroups(res.data);
// // //         if (res.data.length > 0) setSelectedGroup(res.data[0].groupId);
// // //       } catch (err) {
// // //         setError("Failed to load groups.");
// // //       } finally {
// // //         setLoadingGroups(false);
// // //       }
// // //     };
// // //     fetchGroups();
// // //   }, [currentUser]);

// // //   useEffect(() => {
// // //     if (!selectedGroup) return;
// // //     const fetchGroupDetails = async () => {
// // //       setFeedItems([]);
// // //       setLeaders([]);
// // //       setGroupProgress(null);
// // //       setError("");
// // //       setLoadingFeed(true);
// // //       setLoadingLeaderboard(true);
// // //       setLoadingProgress(true);

// // //       try {
// // //         const groupRes = await axios.get(
// // //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
// // //         );
// // //         const groupData = groupRes.data;
// // //         const metric =
// // //           groupData.rules?.metric === "CALORIES"
// // //             ? "totalCalories"
// // //             : "totalMinutes";
// // //         setGroupMetric(metric);

// // //         const feedRes = await axios.get(
// // //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
// // //         );
// // //         setFeedItems(feedRes.data);

// // //         const leaderboardRes = await axios.get(
// // //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
// // //           { params: { top_n: 10, metric } }
// // //         );
// // //         setLeaders(leaderboardRes.data);

// // //         const progressRes = await axios.get(
// // //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
// // //         );
// // //         if (Array.isArray(progressRes.data) && progressRes.data.length > 0) {
// // //           setGroupProgress(progressRes.data[0]);
// // //         } else if (progressRes.data) {
// // //           setGroupProgress(progressRes.data);
// // //         } else {
// // //           setGroupProgress(null);
// // //         }
// // //       } catch (err) {
// // //         setError("Failed to load group data.");
// // //       } finally {
// // //         setLoadingFeed(false);
// // //         setLoadingLeaderboard(false);
// // //         setLoadingProgress(false);
// // //         setMembers([]);
// // //         setShowMembers(false);
// // //       }
// // //     };
// // //     fetchGroupDetails();
// // //   }, [selectedGroup]);

// // //   if (loadingGroups) return <p className="loading-text">Loading groups...</p>;

// // //   if (!groups.length) {
// // //     return (
// // //       <div className="no-groups-container">
// // //         <p className="empty-text">No groups yet.</p>
// // //         <div className="empty-actions">
// // //           <button onClick={() => {}}>Join Groups</button>
// // //           <button onClick={() => {}}>Create Group</button>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="group-overview-wrapper">
// // //       <h2>Group Dashboard</h2>

// // //       {/* Group selector */}
// // //       <select
// // //         value={selectedGroup}
// // //         onChange={(e) => setSelectedGroup(e.target.value)}
// // //         className="group-select"
// // //       >
// // //         {groups.map((g) => (
// // //           <option key={g.groupId} value={g.groupId}>
// // //             {g.groupName}
// // //           </option>
// // //         ))}
// // //       </select>

// // //       {/* Members toggle */}
// // //       <button
// // //         className="members-btn"
// // //         onClick={async () => {
// // //           if (showMembers) {
// // //             setShowMembers(false);
// // //             return;
// // //           }
// // //           setShowMembers(true);
// // //           if (members.length) return;

// // //           try {
// // //             const res = await axios.get(
// // //               `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`
// // //             );
// // //             setMembers(res.data || []);
// // //           } catch {
// // //             setMembers([]);
// // //           }
// // //         }}
// // //       >
// // //         {showMembers ? "Hide Members" : "Members"}
// // //       </button>

// // //       <div className="combined-sections">
// // //         {/* Progress */}
// // //         {loadingProgress ? (
// // //           <p className="loading-text">Loading group progress...</p>
// // //         ) : groupProgress ? (
// // //           <div className="group-progress-summary">
// // //             <h3>Group Progress</h3>
// // //             <p className="progress-value">
// // //               {groupMetric === "totalMinutes"
// // //                 ? `Total Minutes: ${groupProgress.totalMinutes || 0}`
// // //                 : `Total Calories: ${groupProgress.totalCalories || 0}`}{" "}
// // //               {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
// // //             </p>
// // //             {/* Example progress bar */}
// // //             <div className="progress-bar">
// // //               <div
// // //                 className="progress-fill"
// // //                 style={{
// // //                   width: `${
// // //                     groupMetric === "totalMinutes"
// // //                       ? Math.min(
// // //                           100,
// // //                           (groupProgress.totalMinutes / 1000) * 100
// // //                         )
// // //                       : Math.min(
// // //                           100,
// // //                           (groupProgress.totalCalories / 2000) * 100
// // //                         )
// // //                   }%`,
// // //                 }}
// // //               ></div>
// // //             </div>
// // //           </div>
// // //         ) : (
// // //           <p className="empty-text">No progress data available.</p>
// // //         )}

// // //         {/* Members Panel */}
// // //         {showMembers && (
// // //           <div className="members-panel">
// // //             <h3>Members</h3>
// // //             {members.length === 0 ? (
// // //               <p className="empty-text">No members found.</p>
// // //             ) : (
// // //               <ul className="members-list">
// // //                 {members.map((m) => (
// // //                   <li key={m.userId}>
// // //                     👤{" "}
// // //                     <a
// // //                       href={m.profileUrl || `/profile/${m.userId}`}
// // //                       target="_blank"
// // //                       rel="noopener noreferrer"
// // //                     >
// // //                       {m.name || m.userId}
// // //                     </a>
// // //                   </li>
// // //                 ))}
// // //               </ul>
// // //             )}
// // //           </div>
// // //         )}

// // //         {/* Leaderboard */}
// // //         <div className="leaderboard-section">
// // //           <h3>Leaderboard</h3>
// // //           {loadingLeaderboard ? (
// // //             <p className="loading-text">Loading leaderboard...</p>
// // //           ) : leaders.length === 0 ? (
// // //             <p className="empty-text">No leaderboard data yet.</p>
// // //           ) : (
// // //             <table>
// // //               <thead>
// // //                 <tr>
// // //                   <th>Rank</th>
// // //                   <th>User</th>
// // //                   {groupMetric === "totalMinutes" && <th>Minutes</th>}
// // //                   {groupMetric === "totalCalories" && <th>Calories</th>}
// // //                   {/* Challenge Mode Column */}
// // //                   {leaders.some((l) => l.completed !== undefined) && (
// // //                     <th>Completed</th>
// // //                   )}
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {leaders.map((item) => {
// // //                   const isUser = item.userId === currentUser;
// // //                   const medal =
// // //                     item.rank === 1
// // //                       ? "🥇"
// // //                       : item.rank === 2
// // //                       ? "🥈"
// // //                       : item.rank === 3
// // //                       ? "🥉"
// // //                       : item.rank;
// // //                   return (
// // //                     <tr
// // //                       key={item.userId}
// // //                       className={isUser ? "current-user-row" : ""}
// // //                     >
// // //                       <td>{medal}</td>
// // //                       <td>{item.userId}{isUser && " ⭐ You"}</td>
// // //                       {groupMetric === "totalMinutes" ? (
// // //                         <td>{item.totalMinutes}</td>
// // //                       ) : (
// // //                         <td>{item.totalCalories}</td>
// // //                       )}
// // //                       {item.completed !== undefined && (
// // //                         <td style={{ textAlign: "center" }}>
// // //                           {item.completed ? "✅" : "❌"}
// // //                         </td>
// // //                       )}
// // //                     </tr>
// // //                   );
// // //                 })}
// // //               </tbody>
// // //             </table>
// // //           )}
// // //         </div>

// // //         {/* Feed Section */}
// // //         <div className="feed-section">
// // //           <h3>Group Feed</h3>
// // //           {loadingFeed ? (
// // //             <p className="loading-text">Loading feed...</p>
// // //           ) : feedItems.length === 0 ? (
// // //             <p className="empty-text">No feed items yet.</p>
// // //           ) : (
// // //             feedItems.map((item) => {
// // //               const isUserActivity = item.userId === currentUser;
// // //               return (
// // //                 <div
// // //                   key={item.feed_id}
// // //                   className={`feed-item ${
// // //                     isUserActivity ? "user-activity" : ""
// // //                   }`}
// // //                 >
// // //                   <div className="feed-item-header">
// // //                     <div className="feed-icon">{icons[item.type]}</div>
// // //                     <h4>{item.title}</h4>
// // //                     {isUserActivity && <span className="you-badge">Your Activity</span>}
// // //                   </div>
// // //                   <p>{item.description}</p>
// // //                   <small>
// // //                     {icons.CLOCK} {new Date(item.createdAt).toLocaleString()}
// // //                   </small>
// // //                 </div>
// // //               );
// // //             })
// // //           )}
// // //         </div>
// // //       </div>

// // //       {error && <p className="error-text">{error}</p>}
// // //     </div>
// // //   );
// // // };

// // // export default GroupOverview;
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import "../styles/components/GroupOverview.css";

// // // Icons
// // const icons = {
// //   EXERCISE_LOG: <span>💪</span>,
// //   AWARDED_BADGE: <span>🏅</span>,
// //   CLOCK: <span>⏰</span>,
// // };

// // const GroupOverview = ({ currentUser }) => {
// //   const [groups, setGroups] = useState([]);
// //   const [selectedGroup, setSelectedGroup] = useState("");
// //   const [feedItems, setFeedItems] = useState([]);
// //   const [leaders, setLeaders] = useState([]);
// //   const [members, setMembers] = useState([]);
// //   const [showMembers, setShowMembers] = useState(false);
// //   const [groupProgress, setGroupProgress] = useState(null);
// //   const [groupMetric, setGroupMetric] = useState("totalMinutes");
// //   const [challengeMode, setChallengeMode] = useState("");
// //   const [loadingGroups, setLoadingGroups] = useState(true);
// //   const [loadingFeed, setLoadingFeed] = useState(false);
// //   const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
// //   const [loadingProgress, setLoadingProgress] = useState(false);
// //   const [error, setError] = useState("");

// //   // Fetch user's groups
// //   useEffect(() => {
// //     const fetchGroups = async () => {
// //       setLoadingGroups(true);
// //       try {
// //         const res = await axios.get(
// //           `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
// //         );
// //         setGroups(res.data);
// //         if (res.data.length > 0) setSelectedGroup(res.data[0].groupId);
// //       } catch (err) {
// //         setError("Failed to load groups.");
// //       } finally {
// //         setLoadingGroups(false);
// //       }
// //     };
// //     fetchGroups();
// //   }, [currentUser]);

// //   // Fetch selected group details
// //   useEffect(() => {
// //     if (!selectedGroup) return;
// //     const fetchGroupDetails = async () => {
// //       setFeedItems([]);
// //       setLeaders([]);
// //       setGroupProgress(null);
// //       setError("");
// //       setLoadingFeed(true);
// //       setLoadingLeaderboard(true);
// //       setLoadingProgress(true);

// //       try {
// //         const groupRes = await axios.get(
// //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
// //         );
// //         const groupData = groupRes.data;

// //         const metric =
// //           groupData.rules?.metric === "CALORIES"
// //             ? "totalCalories"
// //             : "totalMinutes";
// //         setGroupMetric(metric);

// //         // Set challenge mode
// //         setChallengeMode(groupData.rules?.challengeMode || "individual");

// //         // Fetch feed
// //         const feedRes = await axios.get(
// //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
// //         );
// //         setFeedItems(feedRes.data);

// //         // Fetch leaderboard
// //         const leaderboardRes = await axios.get(
// //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
// //           { params: { top_n: 10, metric } }
// //         );
// //         setLeaders(leaderboardRes.data);

// //         // Fetch group progress
// //         const progressRes = await axios.get(
// //           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
// //         );
// //         if (Array.isArray(progressRes.data) && progressRes.data.length > 0) {
// //           setGroupProgress(progressRes.data[0]);
// //         } else if (progressRes.data) {
// //           setGroupProgress(progressRes.data);
// //         } else {
// //           setGroupProgress(null);
// //         }
// //       } catch (err) {
// //         setError("Failed to load group data.");
// //       } finally {
// //         setLoadingFeed(false);
// //         setLoadingLeaderboard(false);
// //         setLoadingProgress(false);
// //         setMembers([]);
// //         setShowMembers(false);
// //       }
// //     };
// //     fetchGroupDetails();
// //   }, [selectedGroup]);

// //   if (loadingGroups) return <p className="loading-text">Loading groups...</p>;

// //   if (!groups.length) {
// //     return (
// //       <div className="no-groups-container">
// //         <p className="empty-text">No groups yet.</p>
// //         <div className="empty-actions">
// //           <button className="join-btn" onClick={() => alert("Join Groups clicked")}>Join Groups</button>
// //           <button className="create-btn" onClick={() => alert("Create Group clicked")}>Create Group</button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="group-overview-wrapper">
// //       <h2>Group Dashboard</h2>

// //       {/* Top Action Buttons */}
// //       <div className="group-actions">
// //         <button className="join-btn" onClick={() => alert("Join Groups clicked")}>
// //           Join Groups
// //         </button>
// //         <button className="create-btn" onClick={() => alert("Create Group clicked")}>
// //           Create Group
// //         </button>
// //       </div>

// //       {/* Group Selector */}
// //       <select
// //         value={selectedGroup}
// //         onChange={(e) => setSelectedGroup(e.target.value)}
// //         className="group-select"
// //       >
// //         {groups.map((g) => (
// //           <option key={g.groupId} value={g.groupId}>
// //             {g.groupName}
// //           </option>
// //         ))}
// //       </select>

// //       {/* Members Toggle */}
// //       <button
// //         className="members-btn"
// //         onClick={async () => {
// //           if (showMembers) {
// //             setShowMembers(false);
// //             return;
// //           }
// //           setShowMembers(true);
// //           if (members.length) return;

// //           try {
// //             const res = await axios.get(
// //               `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`
// //             );
// //             setMembers(res.data || []);
// //           } catch {
// //             setMembers([]);
// //           }
// //         }}
// //       >
// //         {showMembers ? "Hide Members" : "Members"}
// //       </button>

// //       <div className="combined-sections">
// //         {/* Group Progress - only for team mode */}
// //         {challengeMode === "team" && (
// //           <>
// //             {loadingProgress ? (
// //               <p className="loading-text">Loading group progress...</p>
// //             ) : groupProgress ? (
// //               <div className="group-progress-summary">
// //                 <h3>Group Progress</h3>
// //                 <p className="progress-value">
// //                   {groupMetric === "totalMinutes"
// //                     ? `Total Minutes: ${groupProgress.totalMinutes || 0}`
// //                     : `Total Calories: ${groupProgress.totalCalories || 0}`}{" "}
// //                   {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
// //                 </p>
// //                 <div className="progress-bar">
// //                   <div
// //                     className="progress-fill"
// //                     style={{
// //                       width: `${
// //                         groupMetric === "totalMinutes"
// //                           ? Math.min(100, (groupProgress.totalMinutes / 1000) * 100)
// //                           : Math.min(100, (groupProgress.totalCalories / 2000) * 100)
// //                       }%`,
// //                     }}
// //                   ></div>
// //                 </div>
// //               </div>
// //             ) : (
// //               <p className="empty-text">No progress data available.</p>
// //             )}
// //           </>
// //         )}

// //         {/* Members Panel */}
// //         {showMembers && (
// //           <div className="members-panel">
// //             <h3>Members</h3>
// //             {members.length === 0 ? (
// //               <p className="empty-text">No members found.</p>
// //             ) : (
// //               <ul className="members-list">
// //                 {members.map((m) => (
// //                   <li key={m.userId}>
// //                     👤{" "}
// //                     <a
// //                       href={m.profileUrl || `/profile/${m.userId}`}
// //                       target="_blank"
// //                       rel="noopener noreferrer"
// //                     >
// //                       {m.name || m.userId}
// //                     </a>
// //                   </li>
// //                 ))}
// //               </ul>
// //             )}
// //           </div>
// //         )}

// //         {/* Leaderboard */}
// //         <div className="leaderboard-section">
// //           <h3>Leaderboard</h3>
// //           {loadingLeaderboard ? (
// //             <p className="loading-text">Loading leaderboard...</p>
// //           ) : leaders.length === 0 ? (
// //             <p className="empty-text">No leaderboard data yet.</p>
// //           ) : (
// //             <table>
// //               <thead>
// //                 <tr>
// //                   <th>Rank</th>
// //                   <th>User</th>
// //                   {groupMetric === "totalMinutes" && <th>Minutes</th>}
// //                   {groupMetric === "totalCalories" && <th>Calories</th>}
// //                   {challengeMode === "individual" && <th>Completed</th>}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {leaders.map((item) => {
// //                   const isUser = item.userId === currentUser;
// //                   const medal =
// //                     item.rank === 1 ? "🥇" :
// //                     item.rank === 2 ? "🥈" :
// //                     item.rank === 3 ? "🥉" :
// //                     item.rank;

// //                   return (
// //                     <tr key={item.userId} className={isUser ? "current-user-row" : ""}>
// //                       <td>{medal}</td>
// //                       <td>{item.userId}{isUser && " ⭐ You"}</td>
// //                       {groupMetric === "totalMinutes" ? (
// //                         <td>{item.totalMinutes}</td>
// //                       ) : (
// //                         <td>{item.totalCalories}</td>
// //                       )}
// //                       {challengeMode === "individual" && (
// //                         <td style={{ textAlign: "center" }}>
// //                           {item.completed ? "✅" : "❌"}
// //                         </td>
// //                       )}
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           )}
// //         </div>

// //         {/* Feed Section */}
// //         <div className="feed-section">
// //           <h3>Group Feed</h3>
// //           {loadingFeed ? (
// //             <p className="loading-text">Loading feed...</p>
// //           ) : feedItems.length === 0 ? (
// //             <p className="empty-text">No feed items yet.</p>
// //           ) : (
// //             feedItems.map((item) => {
// //               const isUserActivity = item.userId === currentUser;
// //               return (
// //                 <div
// //                   key={item.feed_id}
// //                   className={`feed-item ${isUserActivity ? "user-activity" : ""}`}
// //                 >
// //                   <div className="feed-item-header">
// //                     <div className="feed-icon">{icons[item.type]}</div>
// //                     <h4>{item.title}</h4>
// //                     {isUserActivity && <span className="you-badge">Your Activity</span>}
// //                   </div>
// //                   <p>{item.description}</p>
// //                   <small>
// //                     {icons.CLOCK} {new Date(item.createdAt).toLocaleString()}
// //                   </small>
// //                 </div>
// //               );
// //             })
// //           )}
// //         </div>
// //       </div>

// //       {error && <p className="error-text">{error}</p>}
// //     </div>
// //   );
// // };

// // export default GroupOverview;
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../styles/components/GroupOverview.css";

// const icons = {
//   EXERCISE_LOG: <span>💪</span>,
//   AWARDED_BADGE: <span>🏅</span>,
//   CLOCK: <span>⏰</span>,
// };

// const GroupOverview = ({ currentUser }) => {
//   const [groups, setGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState("");
//   const [feedItems, setFeedItems] = useState([]);
//   const [leaders, setLeaders] = useState([]);
//   const [members, setMembers] = useState([]);
//   const [showMembers, setShowMembers] = useState(false);

//   const [groupProgress, setGroupProgress] = useState(null);
//   const [groupMetric, setGroupMetric] = useState("totalMinutes");
//   const [challengeMode, setChallengeMode] = useState("individual");

//   const [loadingGroups, setLoadingGroups] = useState(true);
//   const [loadingFeed, setLoadingFeed] = useState(false);
//   const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(false);

//   const [error, setError] = useState("");

//   /* ---------------- FETCH USER GROUPS ---------------- */

//   useEffect(() => {
//     const fetchGroups = async () => {
//       setLoadingGroups(true);
//       try {
//         const res = await axios.get(
//           `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
//         );

//         setGroups(res.data);

//         if (res.data.length > 0) {
//           setSelectedGroup(res.data[0].groupId);
//         }
//       } catch (err) {
//         setError("Failed to load groups.");
//       } finally {
//         setLoadingGroups(false);
//       }
//     };

//     fetchGroups();
//   }, [currentUser]);

//   /* ---------------- FETCH GROUP DETAILS ---------------- */

//   useEffect(() => {
//     if (!selectedGroup) return;

//     const fetchGroupDetails = async () => {
//       setFeedItems([]);
//       setLeaders([]);
//       setGroupProgress(null);
//       setMembers([]);
//       setShowMembers(false);
//       setError("");

//       setLoadingFeed(true);
//       setLoadingLeaderboard(true);
//       setLoadingProgress(true);

//       try {
//         const groupRes = await axios.get(
//           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
//         );

//         const groupData = groupRes.data;

//         /* Metric */
//         const metric =
//           groupData.rules?.metric === "CALORIES"
//             ? "totalCalories"
//             : "totalMinutes";

//         setGroupMetric(metric);

//         /* Challenge Mode Fix */
//         const mode = (
//           groupData.challengeMode || "individual"
//         ).toLowerCase();

//         setChallengeMode(mode);

//         /* Feed */
//         const feedRes = await axios.get(
//           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
//         );

//         setFeedItems(feedRes.data || []);

//         /* Leaderboard */
//         const leaderboardRes = await axios.get(
//           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
//           { params: { top_n: 10, metric } }
//         );

//         setLeaders(leaderboardRes.data || []);

//         /* Progress */
//         const progressRes = await axios.get(
//           `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
//         );

//         if (Array.isArray(progressRes.data) && progressRes.data.length > 0) {
//           setGroupProgress(progressRes.data[0]);
//         } else {
//           setGroupProgress(progressRes.data || null);
//         }
//       } catch (err) {
//         setError("Failed to load group data.");
//       } finally {
//         setLoadingFeed(false);
//         setLoadingLeaderboard(false);
//         setLoadingProgress(false);
//       }
//     };

//     fetchGroupDetails();
//   }, [selectedGroup]);

//   /* ---------------- MEMBERS FETCH ---------------- */

//   const handleMembersToggle = async () => {
//     if (showMembers) {
//       setShowMembers(false);
//       return;
//     }

//     setShowMembers(true);

//     if (members.length) return;

//     try {
//       const res = await axios.get(
//         `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`
//       );

//       setMembers(res.data || []);
//     } catch {
//       setMembers([]);
//     }
//   };

//   /* ---------------- LOADING / EMPTY STATES ---------------- */

//   if (loadingGroups) return <p className="loading-text">Loading groups...</p>;

//   if (!groups.length) {
//     return (
//       <div className="no-groups-container">
//         <p className="empty-text">No groups yet.</p>

//         <div className="empty-actions">
//           <button
//             className="join-btn"
//             onClick={() => alert("Join Groups clicked")}
//           >
//             Join Groups
//           </button>

//           <button
//             className="create-btn"
//             onClick={() => alert("Create Group clicked")}
//           >
//             Create Group
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- UI ---------------- */

//   return (
//     <div className="group-overview-wrapper">
//       <h2>Group Dashboard</h2>

//       {/* Top Buttons */}

//       <div className="group-actions">
//         <button
//           className="join-btn"
//           onClick={() => alert("Join Groups clicked")}
//         >
//           Join Groups
//         </button>

//         <button
//           className="create-btn"
//           onClick={() => alert("Create Group clicked")}
//         >
//           Create Group
//         </button>
//       </div>

//       {/* Group Selector */}

//       <select
//         value={selectedGroup}
//         onChange={(e) => setSelectedGroup(e.target.value)}
//         className="group-select"
//       >
//         {groups.map((g) => (
//           <option key={g.groupId} value={g.groupId}>
//             {g.groupName}
//           </option>
//         ))}
//       </select>

//       {/* Members Button */}

//       <button className="members-btn" onClick={handleMembersToggle}>
//         {showMembers ? "Hide Members" : "Members"}
//       </button>

//       <div className="combined-sections">

//         {/* GROUP PROGRESS (TEAM ONLY) */}

//         {challengeMode === "team" && groupProgress && (
//           <div className="group-progress-summary">
//             <h3>Group Progress</h3>

//             <p className="progress-value">
//               {groupMetric === "totalMinutes"
//                 ? `Total Minutes: ${groupProgress.totalMinutes || 0}`
//                 : `Total Calories: ${groupProgress.totalCalories || 0}`}

//               {" "}
//               {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
//             </p>

//             <div className="progress-bar">
//               <div
//                 className="progress-fill"
//                 style={{
//                   width:
//                     groupMetric === "totalMinutes"
//                       ? `${Math.min(
//                           100,
//                           (groupProgress.totalMinutes / 1000) * 100
//                         )}%`
//                       : `${Math.min(
//                           100,
//                           (groupProgress.totalCalories / 2000) * 100
//                         )}%`,
//                 }}
//               ></div>
//             </div>
//           </div>
//         )}

//         {/* MEMBERS PANEL */}

//         {showMembers && (
//           <div className="members-panel">
//             <h3>Members</h3>

//             {members.length === 0 ? (
//               <p className="empty-text">No members found.</p>
//             ) : (
//               <ul className="members-list">
//                 {members.map((m) => (
//                   <li key={m.userId}>
//                     👤{" "}
//                     <a
//                       href={m.profileUrl || `/profile/${m.userId}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       {m.name || m.userId}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

//         {/* LEADERBOARD */}

//         <div className="leaderboard-section">
//           <h3>Leaderboard</h3>

//           {loadingLeaderboard ? (
//             <p className="loading-text">Loading leaderboard...</p>
//           ) : leaders.length === 0 ? (
//             <p className="empty-text">No leaderboard data yet.</p>
//           ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Rank</th>
//                   <th>User</th>

//                   {groupMetric === "totalMinutes" && <th>Minutes</th>}
//                   {groupMetric === "totalCalories" && <th>Calories</th>}

//                   {challengeMode === "individual" && <th>Completed</th>}
//                 </tr>
//               </thead>

//               <tbody>
//                 {leaders.map((item) => {
//                   const isUser = item.userId === currentUser;

//                   const medal =
//                     item.rank === 1
//                       ? "🥇"
//                       : item.rank === 2
//                       ? "🥈"
//                       : item.rank === 3
//                       ? "🥉"
//                       : item.rank;

//                   return (
//                     <tr
//                       key={item.userId}
//                       className={isUser ? "current-user-row" : ""}
//                     >
//                       <td>{medal}</td>

//                       <td>
//                         {item.userId}
//                         {isUser && " ⭐ You"}
//                       </td>

//                       {groupMetric === "totalMinutes" ? (
//                         <td>{item.totalMinutes}</td>
//                       ) : (
//                         <td>{item.totalCalories}</td>
//                       )}

//                       {challengeMode === "individual" && (
//                         <td style={{ textAlign: "center" }}>
//                           {item.completed ? "✅" : "❌"}
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* GROUP FEED */}

//         <div className="feed-section">
//           <h3>Group Feed</h3>

//           {loadingFeed ? (
//             <p className="loading-text">Loading feed...</p>
//           ) : feedItems.length === 0 ? (
//             <p className="empty-text">No feed items yet.</p>
//           ) : (
//             feedItems.map((item) => {
//               const isUserActivity = item.userId === currentUser;

//               return (
//                 <div
//                   key={item.feed_id}
//                   className={`feed-item ${
//                     isUserActivity ? "user-activity" : ""
//                   }`}
//                 >
//                   <div className="feed-item-header">
//                     <div className="feed-icon">{icons[item.type]}</div>

//                     <h4>{item.title}</h4>

//                     {isUserActivity && (
//                       <span className="you-badge">Your Activity</span>
//                     )}
//                   </div>

//                   <p>{item.description}</p>

//                   <small>
//                     {icons.CLOCK}{" "}
//                     {new Date(item.createdAt).toLocaleString()}
//                   </small>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {error && <p className="error-text">{error}</p>}
//     </div>
//   );
// };

// export default GroupOverview;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupOverview.css";

const icons = {
  EXERCISE_LOG: <span>💪</span>,
  AWARDED_BADGE: <span>🏅</span>,
  CLOCK: <span>⏰</span>,
};

const GroupOverview = ({ currentUser }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [feedItems, setFeedItems] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const [groupProgress, setGroupProgress] = useState(null);
  const [groupMetric, setGroupMetric] = useState("totalMinutes");
  const [groupTarget, setGroupTarget] = useState(1000); // Default fallback target
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
          `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
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
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}`
        );

        const groupData = groupRes.data;

        /* Metric */
        const metric =
          groupData.rules?.metric === "CALORIES"
            ? "totalCalories"
            : "totalMinutes";

        setGroupMetric(metric);

        /* Target */
        setGroupTarget(groupData.rules?.target || (metric === "totalCalories" ? 2000 : 1000));

        /* Challenge Mode */
        const mode = (groupData.challengeMode || "individual").toLowerCase();
        setChallengeMode(mode);

        /* Feed */
        const feedRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/feed`
        );

        setFeedItems(feedRes.data || []);

        /* Leaderboard */
        const leaderboardRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/leaderboard`,
          { params: { top_n: 10, metric } }
        );

        setLeaders(leaderboardRes.data || []);

        /* Progress */
        const progressRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/progress`
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
        `https://d393qv373r18to.cloudfront.net/groups/${selectedGroup}/members`
      );

      setMembers(res.data || []);
    } catch {
      setMembers([]);
    }
  };

  /* ---------------- LOADING / EMPTY STATES ---------------- */

  if (loadingGroups) return <p className="loading-text">Loading groups...</p>;

  if (!groups.length) {
    return (
      <div className="no-groups-container">
        <p className="empty-text">No groups yet.</p>

        <div className="empty-actions">
          <button
            className="join-btn"
            onClick={() => alert("Join Groups clicked")}
          >
            Join Groups
          </button>

          <button
            className="create-btn"
            onClick={() => alert("Create Group clicked")}
          >
            Create Group
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="group-overview-wrapper">
      <h2>Group Dashboard</h2>

      {/* Top Buttons */}

      <div className="group-actions">
        <button
          className="join-btn"
          onClick={() => alert("Join Groups clicked")}
        >
          Join Groups
        </button>

        <button
          className="create-btn"
          onClick={() => alert("Create Group clicked")}
        >
          Create Group
        </button>
      </div>

      {/* Group Selector */}

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

      {/* Members Button */}

      <button className="members-btn" onClick={handleMembersToggle}>
        {showMembers ? "Hide Members" : "Members"}
      </button>

      <div className="combined-sections">

        {/* GROUP PROGRESS (TEAM ONLY) */}

        {challengeMode === "team" && groupProgress && (
          <div className="group-progress-summary">
            <h3>Group Progress</h3>

            <p className="progress-value">
              {groupMetric === "totalMinutes"
                ? `Total Minutes: ${groupProgress.totalMinutes || 0}`
                : `Total Calories: ${groupProgress.totalCalories || 0}`}

              {" "}
              {groupProgress.completed ? "🟢 Completed" : "🔴 Incomplete"}
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    groupProgress
                      ? Math.min(
                          100,
                          (
                            (groupMetric === "totalMinutes"
                              ? groupProgress.totalMinutes
                              : groupProgress.totalCalories
                            ) / groupTarget
                          ) * 100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* MEMBERS PANEL */}

        {showMembers && (
          <div className="members-panel">
            <h3>Members</h3>

            {members.length === 0 ? (
              <p className="empty-text">No members found.</p>
            ) : (
              <ul className="members-list">
                {members.map((m) => (
                  <li key={m.userId}>
                    👤{" "}
                    <a
                      href={m.profileUrl || `/profile/${m.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.name || m.userId}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* LEADERBOARD */}

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

                  {groupMetric === "totalMinutes" && <th>Minutes</th>}
                  {groupMetric === "totalCalories" && <th>Calories</th>}

                  {challengeMode === "individual" && <th>Completed</th>}
                </tr>
              </thead>

              <tbody>
                {leaders.map((item) => {
                  const isUser = item.userId === currentUser;

                  const medal =
                    item.rank === 1
                      ? "🥇"
                      : item.rank === 2
                      ? "🥈"
                      : item.rank === 3
                      ? "🥉"
                      : item.rank;

                  return (
                    <tr
                      key={item.userId}
                      className={isUser ? "current-user-row" : ""}
                    >
                      <td>{medal}</td>

                      <td>
                        {item.userId}
                        {isUser && " ⭐ You"}
                      </td>

                      {groupMetric === "totalMinutes" ? (
                        <td>{item.totalMinutes}</td>
                      ) : (
                        <td>{item.totalCalories}</td>
                      )}

                      {challengeMode === "individual" && (
                        <td style={{ textAlign: "center" }}>
                          {item.completed ? "✅" : "❌"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* GROUP FEED */}

        <div className="feed-section">
          <h3>Group Feed</h3>

          {loadingFeed ? (
            <p className="loading-text">Loading feed...</p>
          ) : feedItems.length === 0 ? (
            <p className="empty-text">No feed items yet.</p>
          ) : (
            feedItems.map((item) => {
              const isUserActivity = item.userId === currentUser;

              return (
                <div
                  key={item.feed_id}
                  className={`feed-item ${
                    isUserActivity ? "user-activity" : ""
                  }`}
                >
                  <div className="feed-item-header">
                    <div className="feed-icon">{icons[item.type]}</div>

                    <h4>{item.title}</h4>

                    {isUserActivity && (
                      <span className="you-badge">Your Activity</span>
                    )}
                  </div>

                  <p>{item.description}</p>

                  <small>
                    {icons.CLOCK}{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                </div>
              );
            })
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default GroupOverview;