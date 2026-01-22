import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import Overview from "./OverviewTab";
import Workouts from "./WorkoutsTab";

const DashboardTabs = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = props;

  // Map routes → tab index
  const getActiveTab = () => {
    if (location.pathname.startsWith("/workouts")) return 1;
    if (location.pathname.startsWith("/goals")) return 2;
    return 0; // default: overview
  };

  const activeTab = getActiveTab();

  const handleTabChange = (e, newValue) => {
    if (newValue === 0) navigate("/dashboard");
    if (newValue === 1) navigate("/workouts");
    if (newValue === 2) navigate("/goals");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          borderBottom: "1px solid var(--color-border-subtle)",
          mb: 3,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "15px",
            minHeight: "48px",
          },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Workouts" />
        <Tab label="Goals" />
      </Tabs>

      {activeTab === 0 && <Overview />}
      {activeTab === 1 && <Workouts currentUser={currentUser}/>}
      {activeTab === 2 && <div>Goals</div>}
    </Box>
  );
};

export default DashboardTabs;
