import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/GroupOverview.css";

const JoinPublicGroup = ({ currentUser }) => {
  const [publicGroups, setPublicGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const pubRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/groups/public`
        );
        setPublicGroups(pubRes.data);
        const userRes = await axios.get(
          `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
        );
        setUserGroups(userRes.data);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [currentUser]);

  const handleJoin = async (groupId) => {
    try {
      await axios.post(`https://d393qv373r18to.cloudfront.net/groups/${groupId}/join`, { userId: currentUser });
      // Refresh user groups
      const userRes = await axios.get(
        `https://d393qv373r18to.cloudfront.net/users/${currentUser}/groups`
      );
      setUserGroups(userRes.data);
    } catch (err) {
      alert("Failed to join group");
    }
  };

  return (
    <div className="public-groups-list">
      <h2>Join a Public Group</h2>
      {loading ? (
        <p className="loading-text">Loading public groups...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : publicGroups.length === 0 ? (
        <p className="empty-text">No public groups found.</p>
      ) : (
        <ul>
          {publicGroups.map((g) => {
            const isMember = userGroups.some((ug) => ug.groupId === g.groupId);
            return (
              <li key={g.groupId}>
                <span>{g.groupName}</span>
                {!isMember && (
                  <button onClick={() => handleJoin(g.groupId)}>Join</button>
                )}
                {isMember && <span style={{ marginLeft: 8, color: 'green' }}>(Joined)</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default JoinPublicGroup;
