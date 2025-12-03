const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise.model');


/**
 * @swagger
 * /exercises:
 *   get:
 *     summary: Retrieve all exercises
 *     description: Get a list of all exercises in the database
 *     tags: [Exercises]
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   exerciseType:
 *                     type: string
 *                   subActivity:
 *                     type: string
 *                   description:
 *                     type: string
 *                   duration:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Error retrieving exercises
 */
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

/**
 * @swagger
 * /exercises/activities:
 *   get:
 *     summary: Retrieve all activities with MET values
 *     description: Get a list of all activities from the activity_mets_new collection with their sub-activity options and MET values
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: A list of activities with MET values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   activity:
 *                     type: string
 *                   sub_activity_options:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         met:
 *                           type: number
 *       500:
 *         description: Failed to fetch activities
 */
router.get('/activities/', async (req, res) => {
  try {
    const activities = await mongoose.connection.db
      .collection('activity_mets_new')
      .find({})
      .toArray();

    res.json(activities);
  } catch (err) {
    console.error('Failed to fetch activities', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /exercises/add:
 *   post:
 *     summary: Add a new exercise
 *     description: Create a new exercise entry with details like username, exercise type, sub-activity, description, duration, and date
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - exerciseType
 *               - duration
 *               - date
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the person performing the exercise
 *               exerciseType:
 *                 type: string
 *                 description: Type of exercise (e.g., Running, Swimming)
 *               subActivity:
 *                 type: string
 *                 description: Sub-activity or pace (e.g., Moderate pace, Fast pace)
 *               description:
 *                 type: string
 *                 description: Additional description of the exercise
 *               duration:
 *                 type: number
 *                 description: Duration of exercise in minutes
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the exercise
 *     responses:
 *       200:
 *         description: Exercise added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or error adding exercise
 */
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
    res.json({ message: 'Exercise added!' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error: ' + error.message });
  }
});


/**
 * @swagger
 * /exercises/{id}:
 *   get:
 *     summary: Retrieve an exercise by ID
 *     description: Get a specific exercise by its unique ID
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 exerciseType:
 *                   type: string
 *                 subActivity:
 *                   type: string
 *                 description:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 date:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Exercise not found
 *       400:
 *         description: Error retrieving exercise
 */
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

/**
 * @swagger
 * /exercises/{id}:
 *   delete:
 *     summary: Delete an exercise by ID
 *     description: Remove a specific exercise from the database
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       200:
 *         description: Exercise deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Exercise not found
 *       400:
 *         description: Error deleting exercise
 */
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

/**
 * @swagger
 * /exercises/update/{id}:
 *   put:
 *     summary: Update an exercise by ID
 *     description: Modify an existing exercise's details
 *     tags: [Exercises]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - description
 *               - duration
 *               - date
 *             properties:
 *               username:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 exercise:
 *                   type: object
 *       400:
 *         description: Invalid input or missing required fields
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Error updating exercise
 */
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
  
  module.exports = router;