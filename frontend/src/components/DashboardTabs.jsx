import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Overview from "./OverviewTab";
import Workouts from "./WorkoutsTab";
import GoalSettingPage from "./GoalSettingPage";
import WorkoutPlan from "./WorkoutPlan";
import FoodHydration from "./FoodHydration";
import ProgressTab from "./ProgressTab";
import AdminPanel from "./AdminPanel";
import GroupOverview from "./GroupOverview";

const DashboardTabs = ({ currentUser, role }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tipVersion, setTipVersion] = useState(0);

  const bumpTip = () => setTipVersion((v) => v + 1);

  // Define tabs based on role
  const tabs =
    role?.toLowerCase() === "admin"
      ? [
          {
            label: "Admin Panel",
            component: <AdminPanel currentUser={currentUser} />,
          },
        ]
      : [
          {
            label: "Overview",
            component: (
              <Overview
                currentUser={currentUser}
                onNavigate={setActiveTab}
                tipVersion={tipVersion}
              />
            ),
          },
          {
            label: "Goals",
            component: <GoalSettingPage currentUser={currentUser} />,
          },
          {
            label: "Workout Plan",
            component: <WorkoutPlan currentUser={currentUser} />,
          },
          {
            label: "Workouts",
            component: (
              <Workouts
                currentUser={currentUser}
                onTipRefresh={bumpTip}
              />
            ),
          },
          {
            label: "Progress",
            component: <ProgressTab />,
          },
          {
            label: "Food & Hydration",
            component: (
              <FoodHydration
                currentUser={currentUser}
                onTipRefresh={bumpTip}
              />
            ),
          },
          {
            label: "Groups",
            component: <GroupOverview currentUser={currentUser} />,
          },
        ];

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
        {tabs.map((t, i) => (
          <Tab key={i} label={t.label} />
        ))}
      </Tabs>

      {/* Render the active tab's content */}
      {tabs[activeTab].component}
    </Box>
  );
};

export default DashboardTabs;