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
import PersonSharpIcon from '@mui/icons-material/PersonSharp';


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
      color="transparent"
      className="appHeader"
      sx={{
        backgroundColor: "#ffffff",   
      }}
    >
      <Toolbar disableGutters>

        {/* LEFT */}
        <div className="headerLeft" onClick={() => navigate("/login")}>
          <span className="appName">Shakti 360</span>
        </div>

        {/* RIGHT */}
        <div className="headerRight">
          <Avatar
            className="userAvatar"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {currentUser ? (
              <PersonSharpIcon color="primary" />
            ) : (
              <PersonSharpIcon color="primary" />
            )}
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
