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
  Badge,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { useNavigate } from "react-router-dom";
import "../../styles/components/Header.loggedIn.css";

const AppHeader = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(
        `http://16.171.162.5:8005/users/${currentUser}/notifications`
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications', res.status);
      }
    } catch (err) {
      console.error('Notification fetch error', err);
    }
  };

  const handleNotifClick = (e) => {
    setNotifAnchor(e.currentTarget);
    loadNotifications();
  };
  const handleNotifClose = () => {
    setNotifAnchor(null);
    // determine unread before marking them read
    const unreadItems = notifications.filter((n) => !n.isRead);

    // update local state to mark read
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      }))
    );
    // send patch for unread items
    unreadItems.forEach((n) => {
      fetch(
        `http://16.171.162.5:8005/users/${currentUser}/notifications/${n.notificationId}?isRead=true`,
        { method: 'PATCH' }
      ).catch((e) => console.error('failed mark read', e));
    });
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
          <Badge
            badgeContent={notifications.filter((n) => !n.isRead).length}
            color="error"
            overlap="circular"
          >
            <NotificationsIcon
              className="loggedHeader__notif"
              color="action"
              sx={{ cursor: 'pointer', marginRight: 2 }}
              onClick={handleNotifClick}
            />
          </Badge>

          {/* notifications menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ maxWidth: 400, whiteSpace: 'normal' }}
          >
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              notifications.map((n) => (
                <MenuItem
                  key={n.notificationId}
                  onClick={handleNotifClose}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>{n.title}</strong>
                    <span style={{ fontSize: 12, whiteSpace: 'normal' }}>
                      {n.message}
                    </span>
                    {n.createdAt && (
                      <span style={{ fontSize: 10, color: '#666' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </MenuItem>
              ))
            )}
          </Menu>

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