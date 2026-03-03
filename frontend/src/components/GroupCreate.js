import React, { useState } from "react";
import axios from "axios";
import "../styles/components/GroupCreate.css";

const GroupCreate = ({ currentUser, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        "http://16.171.162.5:8005/groups/create",
        {
          name: groupName,
          visibility,
          adminId: currentUser,
        }
      );
      setSuccess("Group created successfully!");
      setGroupName("");
      setVisibility("public");
      if (onGroupCreated) onGroupCreated(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create group. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-create-wrapper">
      <h3>Create a Fitness Group</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Group Name</label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>
    </div>
  );
};

export default GroupCreate;
