// init_activity_mets_mongoose.js
const mongoose = require('mongoose');

const activity_mets_new = [
  {
    activity: "Running",
    dropdown_label: "Select Intensity",
    sub_activity_options: [
      { name: "Slow", description: "Easy pace, comfortable run", met: 6.0 },
      { name: "Moderate", description: "Moderate pace, can talk but slightly breathless", met: 8.3 },
      { name: "Fast", description: "Fast pace, challenging run", met: 11.5 }
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
      { name: "Strength Training", description: "Weightlifting / resistance exercises", met: 6.0 },
      { name: "Cardio Machines", description: "Treadmill, elliptical, bike", met: 5.5 },
      { name: "Yoga / Pilates", description: "Flexibility and core exercises", met: 3.0 }
    ]
  },
  {
    activity: "Home",
    dropdown_label: "Select Activity Type",
    sub_activity_options: [
      { name: "Bodyweight Exercise", description: "Push-ups, squats, lunges, etc.", met: 4.0 },
      { name: "Stretching / Yoga", description: "Flexibility and relaxation", met: 2.5 },
      { name: "Household Chores", description: "Cleaning, gardening, moving furniture", met: 3.0 }
    ]
  }
];

async function initActivityMets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test'); // replace with your DB URI
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop existing collection if it exists
    const collections = await db.listCollections({ name: 'activity_mets_new' }).toArray();
    if (collections.length > 0) {
      await db.collection('activity_mets_new').drop();
      console.log('Dropped existing collection: activity_mets_new');
    }

    // Insert new activity METs data
    await db.collection('activity_mets_new').insertMany(activity_mets_new);
    console.log('✅ activity_mets_new initialized successfully!');

    // Close connection
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error initializing activity METs:', err);
  }
}

// Run the script
initActivityMets();
