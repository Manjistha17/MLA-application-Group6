import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  ListItemIcon,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";

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
        backgroundColor: '#ffffff', 
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
          <span className="loggedHeader__name">Shakti 360</span>
        </div>

        {/* RIGHT: AVATAR */}
        <div className="loggedHeader__right">
          <Avatar
            className="loggedHeader__avatar"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <PersonSharpIcon color="primary" />
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