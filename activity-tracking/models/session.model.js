const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    username: { type: String, required: true },
    label: { type: String, required: false },
    exerciseType: {
      type: String,
      required: false,
      enum: ['Running', 'Cycling', 'Swimming', 'Gym', 'Other'],
    },
    description: { type: String, required: false },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
    durationSeconds: { type: Number, required: false, min: 0 },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
