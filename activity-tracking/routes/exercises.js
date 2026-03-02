const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise.model');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

// Initialize Lambda client
const lambdaClient = new LambdaClient({ region: "eu-north-1" }); // replace region if needed


// GET: Retrieve all exercises
router.get('/', async (req, res) => {
    try {
      const exercises = await Exercise.find();
      res.json(exercises);
    } catch (error) {
      res.status(400).json({ error: 'Error: ' + error.message });
    }
  });
  
// // POST: Add a new exercise
// router.post('/add', async (req, res) => {
//   console.log(req.body)
//   try {
//     const { username, exerciseType, description, duration, date } = req.body;

//     const newExercise = new Exercise({
//       username,
//       exerciseType,
//       description,
//       duration: Number(duration),
//       date: Date.parse(date),
//     });

//     await newExercise.save();
//     res.json({ message: 'Exercise added!' });
//   } catch (error) {
//     res.status(400).json({ error: 'Error: ' + error.message });
//   }
// });

const mongoose = require('mongoose');

// // GET: Retrieve all activities from activity_mets_new
// router.get('/activities/', async (req, res) => {
//   try {
//     const activities = await mongoose.connection.db
//       .collection('activity_mets_new')
//       .find({})
//       .toArray();

//     res.json(activities);
//   } catch (err) {
//     console.error('Failed to fetch activities', err);
//     res.status(500).json({ error: err.message });
//   }
// });

router.get('/activities/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected yet' });
    }
    const activities = await db.collection('activity_mets_new').find({}).toArray();
    res.json(activities);
  } catch (err) {
    console.error('Failed to fetch activities', err);
    res.status(500).json({ error: err.message });
  }
});


// POST: Add a new exercise
router.post('/add', async (req, res) => {
  console.log(req.body);

  try {
    const { username, exerciseType, subActivity, description, duration, date } = req.body;

    const newExercise = new Exercise({
      username,
      exerciseType,
      subActivity, // just store the selected pace label
      description,
      duration: Number(duration),
      date: Date.parse(date),
    });

    await newExercise.save();
    // 2️⃣ Call Lambda asynchronously for badge issuance
    const payload = {
      userId: username,           // assuming username maps to userId
      exerciseId: newExercise._id.toString()
    };

    const command = new InvokeCommand({
      FunctionName: "shaktiGroupChallengeBadgeFunction", // replace with your Lambda name
      Payload: Buffer.from(JSON.stringify(payload)),
      InvocationType: "Event" // async - fire and forget
    });

    // Invoke Lambda asynchronously without waiting
    lambdaClient.send(command).catch((lambdaErr) => {
      console.error("Failed to invoke Lambda:", lambdaErr);
    });
    res.json({ message: 'Exercise added!' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error: ' + error.message });
  }
});


// GET: Retrieve an exercise by ID
router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json(exercise);
  } catch (error) {
    res.status(400).json({ error: 'Error: ' + error.message });
  }
});

// DELETE: Delete an exercise by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!deletedExercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json({ message: 'Exercise deleted.' });
  } catch (error) {
    res.status(400).json({ error: 'Error: ' + error.message });
  }
});

// PUT: Update an exercise by ID
router.put('/update/:id', async (req, res) => {
    try {
      const { username, description, duration, date } = req.body;
  
      if (!username || !description || !duration || !date) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }
  
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        res.status(404).json({ error: 'Exercise not found' });
        return;
      }
  
      exercise.username = username;
      exercise.exerciseType = exerciseType;
      exercise.description = description;
      exercise.duration = Number(duration);
      exercise.date = new Date(date);
  
      await exercise.save();
      res.json({ message: 'Exercise updated!', exercise });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the exercise' });
    }
  });
  
  // GET: Weekly workout summary for graph
router.get('/weekly/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const data = await Exercise.find({
      username,
      date: {
        $gte: new Date(last7Days[0]),
        $lte: new Date()
      }
    });

    const weekly = last7Days.map((day) => {
      const dayData = data.filter(
        d => new Date(d.date).toISOString().split("T")[0] === day
      );

      const totalDuration = dayData.reduce(
        (sum, d) => sum + Number(d.duration || 0),
        0
      );

      return {
        day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        value: totalDuration
      };
    });

    res.json(weekly);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weekly summary" });
  }
});

  module.exports = router;