// init_activity_mets_safe.js
const mongoose = require("mongoose");

const activity_mets_new = [
  {
    activity: "Running",
    dropdown_label: "Select Intensity",
    sub_activity_options: [
      { name: "Slow", description: "Easy pace, comfortable run", met: 6.0 },
      { name: "Moderate", description: "Moderate pace, slightly breathless", met: 8.3 },
      { name: "Fast", description: "Fast pace, challenging", met: 11.5 }
    ]
  },
  {
    activity: "Swimming",
    dropdown_label: "Select Intensity",
    sub_activity_options: [
      { name: "Light", description: "Easy swimming / casual pace", met: 6.0 },
      { name: "Moderate", description: "Continuous laps at moderate effort", met: 8.0 },
      { name: "Vigorous", description: "Fast laps / competitive pace", met: 10.0 }
    ]
  },
  {
    activity: "Walking",
    dropdown_label: "Select Intensity",
    sub_activity_options: [
      { name: "Slow", description: "Leisurely walk", met: 2.0 },
      { name: "Moderate", description: "Brisk walk", met: 3.5 },
      { name: "Fast", description: "Power walk", met: 4.5 }
    ]
  },
  {
    activity: "Cycling",
    dropdown_label: "Select Intensity",
    sub_activity_options: [
      { name: "Slow", description: "Casual cycling", met: 4.0 },
      { name: "Moderate", description: "Moderate pace cycling", met: 6.8 },
      { name: "Fast", description: "Fast cycling", met: 10.0 }
    ]
  },
  {
    activity: "Gym",
    dropdown_label: "Select Workout Type",
    sub_activity_options: [
      { name: "Strength Training", description: "Weightlifting / resistance", met: 6.0 },
      { name: "Cardio Machines", description: "Treadmill, elliptical", met: 5.5 },
      { name: "Yoga / Pilates", description: "Flexibility and core", met: 3.0 }
    ]
  },
  {
    activity: "Home",
    dropdown_label: "Select Activity Type",
    sub_activity_options: [
      { name: "Bodyweight Exercise", description: "Push-ups, squats", met: 4.0 },
      { name: "Stretching / Yoga", description: "Flexibility", met: 2.5 },
      { name: "Household Chores", description: "Cleaning, gardening", met: 3.0 }
    ]
  }
];

async function initActivityMets() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("activity_mets_new");

    for (const activity of activity_mets_new) {
      const existing = await collection.findOne({ activity: activity.activity });

      if (existing) {
        console.log(`✔ Already exists → ${activity.activity}`);
      } else {
        await collection.insertOne(activity);
        console.log(`➕ Inserted → ${activity.activity}`);
      }
    }

    console.log("🎉 Activity MET initialization complete!");
  } catch (err) {
    console.error("❌ Error initializing activity METs:", err);
  }
}

module.exports = initActivityMets;
