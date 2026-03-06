import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://d393qv373r18to.cloudfront.net/api/admin/users");
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
        await axios.put(`https://d393qv373r18to.cloudfront.net/api/admin/users/${username}/role`, { role: newRole });
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
        await axios.delete(`https://d393qv373r18to.cloudfront.net/api/admin/users/${username}`);
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
    <Box sx={{ padding: 3 }}>
      <Card
        sx={{
          maxWidth: 1000,
          margin: "0 auto",
          borderRadius: 3,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Admin Panel
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={4}
          >
            Manage users and roles.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {loading ? (
            <Box textAlign="center" mt={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.username}>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <TextField
                          select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.username, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteUser(u.username)}
                          sx={{ textTransform: "none" }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Confirmation Dialog */}
          <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">Confirm Action</DialogTitle>
            <Divider />
            <DialogContent>
              <Typography>{confirmMessage}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowConfirm(false)} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={() => confirmAction && confirmAction()}
                color="error"
                variant="contained"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPanel;