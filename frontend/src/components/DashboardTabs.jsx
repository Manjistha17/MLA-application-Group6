import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Overview from "./OverviewTab";
import Workouts from "./WorkoutsTab";
import GoalSettingPage from "./GoalSettingPage";
import WorkoutPlan from "./WorkoutPlan";
import FoodHydration from "./FoodHydration";
import GroupOverview from "./GroupOverview";
// import GroupFeed from "./GroupFeed";
// import Leaderboard from "./Leaderboard";
import ProgressTab from "./ProgressTab";

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
        <Tab label="Goals" />
        <Tab label="Workout Plan" />
        <Tab label="Workouts" />
        <Tab label="Progress" />
        <Tab label="Food & Hydration" />
        <Tab label="Group Overview" />
        {/* <Tab label="Group Feed" /> */}
        {/* <Tab label="Leaderboard" /> */}
      </Tabs>

      {activeTab === 0 && <Overview currentUser={currentUser} />}
      {activeTab === 3 && <Workouts currentUser={currentUser} />}
      {activeTab === 4 && <ProgressTab />}
      {activeTab === 1 && <GoalSettingPage currentUser={currentUser} />}
      {activeTab === 2 && <WorkoutPlan currentUser={currentUser} />}
      {activeTab === 5 && <FoodHydration currentUser={currentUser} />}
      {activeTab === 6 && <GroupOverview currentUser={currentUser} />}
      {/* {activeTab === 7 && <GroupFeed currentUser={currentUser} />} */}
      {/* {activeTab === 8 && <Leaderboard currentUser={currentUser} />} */}
    </Box>
  );
};

export default DashboardTabs;
