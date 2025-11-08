const router = require('express').Router();
const TimerSession = require('../models/timer-session.model');
const auth = require('../middleware/auth');

// Create a new timer session
router.post('/timer-sessions', auth, async (req, res) => {
    try {
        const { taskLabel, startTime, endTime, duration } = req.body;
        
        const timerSession = new TimerSession({
            taskLabel,
            startTime,
            endTime,
            duration,
            userId: req.user.id
        });

        await timerSession.save();
        res.status(201).json(timerSession);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all timer sessions for the current user
router.get('/timer-sessions', auth, async (req, res) => {
    try {
        const sessions = await TimerSession.find({ userId: req.user.id })
            .sort({ startTime: -1 }); // Sort by start time, most recent first
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific timer session
router.get('/timer-sessions/:id', auth, async (req, res) => {
    try {
        const session = await TimerSession.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!session) {
            return res.status(404).json({ message: 'Timer session not found' });
        }
        
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;