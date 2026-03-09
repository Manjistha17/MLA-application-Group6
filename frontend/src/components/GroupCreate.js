import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/components/GroupCreate.css";

const API_BASE = "https://d393qv373r18to.cloudfront.net";

const GroupCreate = ({ currentUser, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("CHALLENGE");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [challengeMode, setChallengeMode] = useState("INDIVIDUAL");
  const [activityTypes, setActivityTypes] = useState("");
  const [metric, setMetric] = useState("MINUTES");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdGroupId, setCreatedGroupId] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        type,
        visibility,
        status,
        description,
        rules: {
          activityTypes: activityTypes
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s),
          metric,
          target: parseInt(target),
        },
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        createdBy: currentUser,
        challengeMode,
      };

      const res = await axios.post(`${API_BASE}/groups/create`, payload);

      setSuccess("Group created successfully!");
      setCreatedGroupId(res.data.groupId);

      // Reset form
      setName("");
      setType("CHALLENGE");
      setVisibility("PUBLIC");
      setStatus("ACTIVE");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setChallengeMode("INDIVIDUAL");
      setActivityTypes("");
      setMetric("MINUTES");
      setTarget("");

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

        <div className="form-group">
          <label htmlFor="activityTypes">Activity Types (comma-separated)</label>
          <input
            id="activityTypes"
            type="text"
            value={activityTypes}
            onChange={(e) => setActivityTypes(e.target.value)}
            placeholder="e.g., Swimming, Running"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="metric">Metric</label>
          <select
            id="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="MINUTES">Minutes</option>
            <option value="CALORIES">Calories</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="target">Target</label>
          <input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </form>

      {createdGroupId && (
        <button
          className="add-members-btn"
          onClick={() => navigate(`/AddMembers?groupId=${createdGroupId}`)}
        >
          Add Members
        </button>
      )}
    </div>
  );
};

export default GroupCreate;