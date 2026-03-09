import {
  AppBar,
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
  Typography
} from "@mui/material";
import { useState } from "react";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

import { useNavigate } from "react-router-dom";
import "../../styles/components/Header.loggedIn.css";

const AppHeader = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      className="appHeader"
      sx={{
        backgroundColor: 'var(--color-bg-main)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <Toolbar className="loggedHeader__toolbar" disableGutters>

        {/* LEFT: LOGO + NAME */}
        <div
          className="loggedHeader__left"
          onClick={() => navigate("/")}
        >
          <span className="loggedHeader__logo">
            <img src="/logo.png" alt="Shakti 360 Logo" />
          </span>
          <Typography component="span" sx={{ fontWeight: 800, color: "var(--color-text-primary)" }}>Shakti°</Typography>
          <Typography component="span" sx={{ fontWeight: 400, color: "var(--color-text-primary)" }}>360</Typography>
        </div>

        {/* RIGHT: AVATAR */}
        <div className="loggedHeader__right">
          <Avatar
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              cursor: "pointer",
              bgcolor: "var(--color-primary)",
              color: "#ffffff",
              width: 38,
              height: 38,
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            {currentUser?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Edit Profile
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <DarkModeIcon fontSize="small" />
              </ListItemIcon>
              Dark Mode
              <Switch
                edge="end"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogout();
                navigate("/login");
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </div>

      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;