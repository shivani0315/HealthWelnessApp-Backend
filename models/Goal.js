const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: {
        type: String,
        enum: ['Steps', 'Workouts', 'Calories'], // Include all goal types
        required: true,
    },
    target: { type: Number, required: true }, // Change this to Number if target is numeric
    progress: { type: Number, default: 0 }, // Track progress
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;
