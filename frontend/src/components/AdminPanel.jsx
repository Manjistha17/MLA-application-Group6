import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Form,
  Card,
  Modal,
} from "react-bootstrap";
import axios from "axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
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

  const handleUpdateRole = (username, newRole) => {
    setConfirmMessage(`Are you sure you want to change ${username}'s role to ${newRole}?`);
    setConfirmAction(() => async () => {
      try {
        await axios.put(`/api/admin/users/${username}/role`, { role: newRole });
        setSuccess(`Updated ${username} to ${newRole}`);
        fetchUsers();
      } catch (err) {
        setError("Failed to update role.");
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleDeleteUser = (username) => {
    setConfirmMessage(`Delete user ${username}?`);
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/admin/users/${username}`);
        setSuccess(`Deleted user ${username}`);
        fetchUsers();
      } catch (err) {
        setError("Failed to delete user.");
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
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
                    onChange={(e) => handleUpdateRole(u.username, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(u.username)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => confirmAction && confirmAction()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AdminPanel;