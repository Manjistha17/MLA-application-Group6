import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/Leaderboard.css";

const Leaderboard = () => {
  // Hardcoded group ID
  const groupId = "g_public_001";
  const topN = 10;

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching leaderboard for group:", groupId);

    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `http://16.171.162.5:8005/groups/${groupId}/leaderboard`,
          { params: { top_n: topN, metric: "totalMinutes" } }
        );
        console.log("Leaderboard response:", response.data);
        setLeaders(response.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="loading-text">Loading leaderboard...</p>;
  if (!leaders.length) return <p className="empty-text">No leaderboard data yet.</p>;

  return (
    <div className="leaderboard-wrapper">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Total Minutes</th>
            <th>Total Calories</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map(item => (
            <tr key={item.userId}>
              <td>{item.rank}</td>
              <td>{item.userId}</td>
              <td>{item.totalMinutes}</td>
              <td>{item.totalCalories}</td>
              <td>{item.completed ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;