import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/components/JoinGroups.css";

const JoinGroups = ({ currentUser }) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "/groups/public",
          { params: { userId: currentUser } }
        ); // endpoint to get all joinable groups
        setAvailableGroups(res.data || []);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableGroups();
  }, []);

  const handleJoinGroup = async (groupId) => {
  setJoiningGroupId(groupId);

  try {
    const res = await axios.post(
      `/groups/${groupId}/join`,
      { userId: currentUser }
    );

    if (res.data.joined) {
      alert("Successfully joined the group!");
      navigate("/GroupOverview");
    } else {
      alert(res.data.message || "Could not join group.");
    }

  } catch (err) {
    alert("Failed to join the group.");
  } finally {
    setJoiningGroupId(null);
  }
};

  if (loading) return <p className="loading-text">Loading groups...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="join-groups-wrapper">
      <h2>Join Groups</h2>
      {availableGroups.length === 0 ? (
        <p className="empty-text">No groups available to join.</p>
      ) : (
        <ul className="groups-list">
          {availableGroups.map((group) => (
            <li key={group.groupId} className="group-card">
              <div className="group-info">
                <h4>{group.groupName}</h4>
                <p>{group.description || "No description available."}</p>
              </div>
              <button
                className="join-btn"
                disabled={joiningGroupId === group.groupId}
                onClick={() => handleJoinGroup(group.groupId)}
              >
                {joiningGroupId === group.groupId ? "Joining..." : "Join"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinGroups;