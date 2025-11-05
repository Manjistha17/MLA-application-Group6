const mongoose = require('mongoose');
const { Schema } = mongoose;

const calorieRateSchema = new Schema(
  {
    exerciseType: {
      type: String,
      required: true,
      unique: true,
      enum: ['Running', 'Cycling', 'Swimming', 'Gym', 'Walking', 'Other']
    },
    caloriesPerMinute: {
      type: Number,
      required: true,
      min: [0, 'Calories per minute must be a non-negative number']
    }
  },
  { timestamps: true }
);

const CalorieRate = mongoose.model('CalorieRate', calorieRateSchema);

module.exports = CalorieRate;
