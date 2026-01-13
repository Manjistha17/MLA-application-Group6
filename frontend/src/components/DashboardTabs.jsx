import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Overview from "./OverviewTab";
import Workouts from './WorkoutsTab'
// import Progress from "./Progress";

const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState(0); // Overview default

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
      </Tabs>

      {activeTab === 0 && <Overview />}
      {activeTab === 1 && <div><Workouts/></div>}
      {activeTab === 2 && <div>Progress coming soon</div>}
    </Box>
  );
};

export default DashboardTabs;
