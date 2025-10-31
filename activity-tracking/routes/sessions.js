const express = require('express');
const router = express.Router();
const Session = require('../models/session.model');

// POST /sessions/start - start a new timer session
router.post('/start', async (req, res) => {
  try {
    const { username, label, exerciseType, description } = req.body;
    if (!username) return res.status(400).json({ error: 'username is required' });

    // Prevent duplicate starts: check for an existing running session for this user
    const running = await Session.findOne({ username, endTime: null });
    if (running) {
      return res.status(400).json({ error: 'Timer is already running' });
    }

    const session = new Session({
      username,
      label,
      exerciseType,
      description,
      startTime: new Date(),
    });

    await session.save();
    res.json({ message: 'Timer started', session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// POST /sessions/stop - stop the currently running session for a user
router.post('/stop', async (req, res) => {
  try {
    const { username, sessionId } = req.body;
    if (!username && !sessionId) return res.status(400).json({ error: 'username or sessionId is required' });

    let session;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) return res.status(404).json({ error: 'Session not found' });
      if (session.endTime) return res.status(400).json({ error: 'Session already stopped' });
    } else {
      session = await Session.findOne({ username, endTime: null }).sort({ startTime: -1 });
    }
    if (!session) {
      return res.status(400).json({ error: 'No active timer to stop' });
    }

    session.endTime = new Date();
    session.durationSeconds = Math.round((session.endTime - session.startTime) / 1000);
    await session.save();

    res.json({ message: 'Timer stopped', session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// GET /sessions?user=username - list sessions for a user
router.get('/', async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: 'user query param required' });

    const sessions = await Session.find({ username: user }).sort({ startTime: -1 });
    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
