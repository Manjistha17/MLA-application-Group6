import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Overview from "./OverviewTab";
import Workouts from "./WorkoutsTab";
import GoalSettingPage from "./GoalSettingPage";
import WorkoutPlan from "./WorkoutPlan";

const DashboardTabs = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
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
        <Tab label="Progress" />
        <Tab label="Goals" />
        <Tab label="Track Workout" />
      </Tabs>

      {activeTab === 0 && <Overview currentUser={currentUser} />}
      {activeTab === 1 && <Workouts currentUser={currentUser} />}
      {activeTab === 2 && <div>Progress coming soon</div>}
      {activeTab === 3 && <GoalSettingPage currentUser={currentUser} />}
      {activeTab === 4 && <WorkoutPlan currentUser={currentUser} />}
    </Box>
  );
};

export default DashboardTabs;