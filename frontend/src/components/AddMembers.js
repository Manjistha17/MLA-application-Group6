import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Button, Avatar, Chip, CircularProgress,
  InputAdornment, Stack, TextField, Typography, Alert,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { hdrSx, mutedSx, primaryBtnSx, fieldSx, C } from "./GroupStyles";

const AddMembers = ({ currentUser, groupId, onBack }) => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get("https://d393qv373r18to.cloudfront.net/users/")
      .then(res => { setUsers(res.data); setFiltered(res.data); })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.username.toLowerCase().includes(q)));
  }, [search, users]);

  const toggle = u => setSelected(p => p.includes(u) ? p.filter(x => x !== u) : [...p, u]);

  const handleAdd = async () => {
    if (!selected.length) { setError("Select at least one user"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await axios.post(`https://d393qv373r18to.cloudfront.net/groups/${groupId}/add-members`, { members: selected });
      setSuccess(`${selected.length} member(s) added!`);
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add members");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
    <Box sx={{ fontFamily: "var(--font-family-base)", width: "100%", maxWidth: 500 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" mb={2} gap={1}>
        <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: C.groups.bg, color: C.groups.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PersonAddAlt1Icon fontSize="small" />
        </Box>
        <Box flex={1}>
          <Typography sx={hdrSx}>Add Members</Typography>
          {groupId && <Typography sx={{ ...mutedSx, fontSize: "11px" }}>Group: {groupId}</Typography>}
        </Box>
        <Button size="small" startIcon={<ArrowBackIcon sx={{ fontSize: "14px !important" }} />}
          onClick={() => onBack()}
          sx={{ color: "var(--color-text-muted)", textTransform: "none", fontFamily: "var(--font-family-base)", fontSize: "12px", borderRadius: "var(--radius-md)", "&:hover": { color: "var(--color-primary)", bgcolor: "var(--color-primary-soft)" } }}>
          Back
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: "var(--radius-md)", py: 0.5 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1.5, borderRadius: "var(--radius-md)", py: 0.5 }}>{success}</Alert>}

      <TextField size="small" placeholder="Search users..." value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ ...fieldSx, mb: 1.5, maxWidth: 260 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {selected.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {selected.map(u => (
            <Chip key={u} label={u} size="small" onDelete={() => toggle(u)}
              sx={{ fontFamily: "var(--font-family-base)", fontSize: "12px", bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)", borderRadius: "var(--radius-sm)", "& .MuiChip-deleteIcon": { color: "var(--color-primary)" } }} />
          ))}
        </Box>
      )}

      {loadingUsers ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={22} sx={{ color: "var(--color-primary)" }} />
        </Box>
      ) : (
        <Box sx={{ maxHeight: 280, overflowY: "auto", mb: 2 }}>
          <Stack spacing={0.5}>
            {filtered.map(user => {
              const sel = selected.includes(user.username);
              return (
                <Box key={user.username} onClick={() => toggle(user.username)} sx={{
                  display: "flex", alignItems: "center", gap: 1.5, p: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${sel ? "var(--color-primary)" : "var(--color-border-subtle)"}`,
                  bgcolor: sel ? "var(--color-primary-soft)" : "var(--color-bg-muted)",
                  cursor: "pointer", transition: "all 0.15s",
                  "&:hover": { borderColor: "var(--color-primary)", bgcolor: "var(--color-primary-soft)" },
                }}>
                  <Avatar sx={{ width: 26, height: 26, fontSize: "11px", fontWeight: 700, bgcolor: sel ? "var(--color-primary)" : "var(--color-border-subtle)", color: sel ? "#fff" : "var(--color-text-muted)" }}>
                    {user.username[0]?.toUpperCase()}
                  </Avatar>
                  <Typography sx={{ flex: 1, fontFamily: "var(--font-family-base)", fontSize: "13px", fontWeight: sel ? 700 : 400, color: sel ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                    {user.username}
                  </Typography>
                  {sel && <CheckCircleOutlineIcon fontSize="small" sx={{ color: "var(--color-primary)" }} />}
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      <Button fullWidth variant="contained" onClick={handleAdd}
        disabled={loading || !selected.length}
        startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <PersonAddAlt1Icon />}
        sx={{ ...primaryBtnSx, py: 1, "&.Mui-disabled": { bgcolor: "var(--color-primary-soft)", color: "var(--color-primary)" } }}>
        {loading ? "Adding…" : `Add ${selected.length > 0 ? selected.length : ""} Member${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </Box>
    </Box>
  );
};

export default AddMembers;