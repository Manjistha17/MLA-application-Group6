import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Card,
} from "react-bootstrap";
import axios from "axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use relative path, Nginx will forward to backend
      const response = await axios.get("/api/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (username, newRole) => {
    try {
      await axios.put(`/api/admin/users/${username}/role`, { role: newRole });
      setSuccess(`Updated ${username} to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError("Failed to update role.");
    }
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    try {
      await axios.delete(`/api/admin/users/${username}`);
      setSuccess(`Deleted user ${username}`);
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="mb-3">Admin Panel</h2>
      <p className="text-muted">Manage users and roles.</p>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.username}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <Form.Select
                    value={u.role}
                    onChange={(e) => updateRole(u.username, e.target.value)}
                  >
                    {/* Only user and admin roles */}
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteUser(u.username)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

export default AdminPanel;