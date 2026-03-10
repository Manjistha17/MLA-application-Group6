import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../styles/components/AddMembers.css"; // make sure to use new CSS

const API_BASE = "";

const AddMembers = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupId = queryParams.get("groupId");

  const [users, setUsers] = useState([]); // array of user objects
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/`);
        setUsers(res.data); // res.data is array of objects { username: "..." }
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const toggleUser = (username) => {
    setSelectedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setError("Select at least one user to add");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_BASE}/groups/${groupId}/add-members`, {
        members: selectedUsers,
      });
      setSuccess("Members added successfully!");
      setSelectedUsers([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-members-wrapper">
      <h3>Add Members to Group</h3>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="users-list">
        {users.length === 0 && !error && <p>Loading users...</p>}

        {users.map((user) => (
          <div className="user-item" key={user.username}>
            <label>
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.username)}
                onChange={() => toggleUser(user.username)}
              />{" "}
              {user.username}
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleAddMembers} disabled={loading}>
        {loading ? "Adding..." : "Add Selected Members"}
      </button>
    </div>
  );
};

export default AddMembers;