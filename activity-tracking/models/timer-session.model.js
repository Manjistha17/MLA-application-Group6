const mongoose = require('mongoose');

const timerSessionSchema = new mongoose.Schema({
    taskLabel: {
        type: String,
        default: 'Untitled Task'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // duration in seconds
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimerSession', timerSessionSchema);