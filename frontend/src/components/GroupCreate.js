import React, { useState } from "react";
import axios from "axios";
import "../styles/components/GroupCreate.css";


const GroupCreate = ({ currentUser, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("CHALLENGE");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [challengeMode, setChallengeMode] = useState("INDIVIDUAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name,
        type,
        visibility,
        status,
        description,
        rules: {
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          createdBy: currentUser,
          challengeMode,
        },
        adminId: currentUser,
      };
      const res = await axios.post(
        "https://d393qv373r18to.cloudfront.netru/groups/create",
        payload
      );
      setSuccess("Group created successfully!");
      setName("");
      setType("CHALLENGE");
      setVisibility("PUBLIC");
      setStatus("ACTIVE");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setChallengeMode("INDIVIDUAL");
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
          <label htmlFor="name">Group Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="CHALLENGE">Challenge</option>
            <option value="SOCIAL">Social</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="visibility">Visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="challengeMode">Challenge Mode</label>
          <select
            id="challengeMode"
            value={challengeMode}
            onChange={(e) => setChallengeMode(e.target.value)}
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="TEAM">Team</option>
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
