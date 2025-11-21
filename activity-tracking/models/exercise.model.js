<<<<<<< HEAD
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    username: { type: String, required: true },
    exerciseType: {
      type: String,
      required: true,
      enum: ['Running', 'Cycling', 'Swimming', 'Gym', 'Yoga','Other']
    },
    subActivity: {
      type: String,
      required: false,  // Set to true if you want to make pace mandatory
      // enum: ['Slow', 'Moderate', 'Fast']
    },
    description: { type: String, required: false },
    duration: { 
        type: Number, 
        required: true,
        validate: {
            validator: Number.isInteger,
            message: 'Duration should be an integer.'
        },
        min: [1, 'Duration should be positive.']
    },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
=======
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema(
  {
    username: { type: String, required: true },
    exerciseType: {
      type: String,
      required: true,
      enum: ['Running', 'Cycling', 'Swimming', 'Gym', 'Other']
    },
    subActivity: {
      type: String,
      required: false,  // Set to true if you want to make pace mandatory
      // enum: ['Slow', 'Moderate', 'Fast']
    },
    description: { type: String, required: false },
  // Duration stored in seconds (integer >= 1)
  duration: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'Duration should be an integer (seconds).'
    },
    min: [1, 'Duration should be at least 1 second.']
  },
    date: { type: Date, required: true },
    startTime: { type: Date, required: false },
    endTime: { type: Date, required: false },
  },
  { timestamps: true }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
>>>>>>> d38aa20 (feat: complete timer enhancement with pause/reset + login fixes + docker improvements)
