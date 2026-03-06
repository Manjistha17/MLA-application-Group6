// import React, { useState } from "react";
// import { Tabs, Tab, Box } from "@mui/material";
// import Overview from "./OverviewTab";
// import Workouts from "./WorkoutsTab";
// import GoalSettingPage from "./GoalSettingPage";
// import WorkoutPlan from "./WorkoutPlan";
// import FoodHydration from "./FoodHydration";
// import GroupOverview from "./GroupOverview";
// import GroupCreateTab from "./GroupCreateTab";
// // import GroupFeed from "./GroupFeed";
// // import Leaderboard from "./Leaderboard";
// import ProgressTab from "./ProgressTab";
// import AdminPanel from "./AdminPanel";

// const DashboardTabs = ({ currentUser, role }) => {
//   const [activeTab, setActiveTab] = useState(0);

//   // Define tabs based on role
//   const tabs =
//     role?.toLowerCase() === "admin"
//       ? [
//           {
//             label: "Admin Panel",
//             component: <AdminPanel currentUser={currentUser} />,
//           },
//         ]
//       : [
//           { label: "Overview", component: <Overview currentUser={currentUser} /> },
//           { label: "Goals", component: <GoalSettingPage currentUser={currentUser} /> },
//           { label: "Workout Plan", component: <WorkoutPlan currentUser={currentUser} /> },
//           { label: "Workouts", component: <Workouts currentUser={currentUser} /> },
//           { label: "Progress", component: <ProgressTab /> },
//           { label: "Food & Hydration", component: <FoodHydration currentUser={currentUser} /> },
//         ];

//   return (
//     <Box sx={{ width: "100%" }}>
//       <Tabs
//         value={activeTab}
//         onChange={(e, v) => setActiveTab(v)}
//         textColor="primary"
//         indicatorColor="primary"
//         sx={{
//           borderBottom: "1px solid var(--color-border-subtle)",
//           mb: 3,
//           "& .MuiTab-root": {
//             textTransform: "none",
//             fontWeight: 500,
//             fontSize: "15px",
//             minHeight: "48px",
//           },
//         }}
//       >
//         <Tab label="Overview" />
//         <Tab label="Goals" />
//         <Tab label="Workout Plan" />
//         <Tab label="Workouts" />
//         <Tab label="Progress" />
//         <Tab label="Food & Hydration" />
//         <Tab label="Group Dashboard" />
//         <Tab label="Create Group" />
//         {/* <Tab label="Group Feed" /> */}
//         {/* <Tab label="Leaderboard" /> */}
//       </Tabs>

//       {activeTab === 0 && <Overview currentUser={currentUser} />}
//       {activeTab === 3 && <Workouts currentUser={currentUser} />}
//       {activeTab === 4 && <ProgressTab />}
//       {activeTab === 1 && <GoalSettingPage currentUser={currentUser} />}
//       {activeTab === 2 && <WorkoutPlan currentUser={currentUser} />}
//       {activeTab === 5 && <FoodHydration currentUser={currentUser} />}
//       {activeTab === 6 && <GroupOverview currentUser={currentUser} />}
//       {activeTab === 7 && <GroupCreateTab currentUser={currentUser} />}
//       {/* {activeTab === 8 && <GroupFeed currentUser={currentUser} />} */}
//       {/* {activeTab === 9 && <Leaderboard currentUser={currentUser} />} */}
//     </Box>
//   );
// };

// export default DashboardTabs;

import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Overview from "./OverviewTab";
import Workouts from "./WorkoutsTab";
import GoalSettingPage from "./GoalSettingPage";
import WorkoutPlan from "./WorkoutPlan";
import FoodHydration from "./FoodHydration";
import GroupOverview from "./GroupOverview";
import GroupCreateTab from "./GroupCreateTab";
// import GroupFeed from "./GroupFeed";
// import Leaderboard from "./Leaderboard";
import ProgressTab from "./ProgressTab";
import AdminPanel from "./AdminPanel";

const DashboardTabs = ({ currentUser, role }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Define tabs dynamically based on role
  const tabs =
    role?.toLowerCase() === "admin"
      ? [
          {
            label: "Admin Panel",
            component: <AdminPanel currentUser={currentUser} />,
          },
        ]
      : [
          { label: "Overview", component: <Overview currentUser={currentUser} /> },
          { label: "Goals", component: <GoalSettingPage currentUser={currentUser} /> },
          { label: "Workout Plan", component: <WorkoutPlan currentUser={currentUser} /> },
          { label: "Workouts", component: <Workouts currentUser={currentUser} /> },
          { label: "Progress", component: <ProgressTab /> },
          { label: "Food & Hydration", component: <FoodHydration currentUser={currentUser} /> },
          { label: "Group Dashboard", component: <GroupOverview currentUser={currentUser} /> },
          { label: "Create Group", component: <GroupCreateTab currentUser={currentUser} /> },
          // { label: "Group Feed", component: <GroupFeed currentUser={currentUser} /> },
          // { label: "Leaderboard", component: <Leaderboard currentUser={currentUser} /> },
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
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>

      {/* Render the active tab’s content */}
      {tabs[activeTab].component}
    </Box>
  );
};

export default DashboardTabs;