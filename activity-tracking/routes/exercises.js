const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise.model');

/**
 * @swagger
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Exercise ID
 *         username:
 *           type: string
 *           description: Username of the person
 *         exerciseType:
 *           type: string
 *           description: Type of exercise
 *         subActivity:
 *           type: string
 *           description: Sub-activity or pace
 *         description:
 *           type: string
 *           description: Exercise description
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         date:
 *           type: string
 *           format: date-time
 *           description: Exercise date
 */

/**
 * @swagger
 * /exercises:
 *   get:
 *     summary: Retrieve all exercises
 *     description: Get a list of all exercises from the database
 *     tags: [Exercises]
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Error retrieving exercises
 */
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

/**
 * @swagger
 * /exercises/activities:
 *   get:
 *     summary: Retrieve all activities from activity_mets_new collection
 *     description: Get a list of all activities with their MET values
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: A list of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error fetching activities
 */
// GET: Retrieve all activities from activity_mets_new
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
 *     description: Create a new exercise entry in the database
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
 *               exerciseType:
 *                 type: string
 *               subActivity:
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
 *         description: Exercise added successfully
 *       400:
 *         description: Error adding exercise
 */
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
 *     description: Get a single exercise by its ID
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
 *         description: Exercise details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       404:
 *         description: Exercise not found
 *       400:
 *         description: Error retrieving exercise
 */
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

/**
 * @swagger
 * /exercises/{id}:
 *   delete:
 *     summary: Delete an exercise by ID
 *     description: Remove an exercise from the database
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
 *       404:
 *         description: Exercise not found
 *       400:
 *         description: Error deleting exercise
 */
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

/**
 * @swagger
 * /exercises/update/{id}:
 *   put:
 *     summary: Update an exercise by ID
 *     description: Update an existing exercise in the database
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
 *       400:
 *         description: All fields are required
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Error updating exercise
 */
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