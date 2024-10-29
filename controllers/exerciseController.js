const Exercise = require('../models/Exercise');

exports.logExercise = async (req, res) => {
  const { type, duration, distance, calories } = req.body;
  try {
    const exercise = await Exercise.create({ userId: req.user.id, type, duration, distance, calories });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ userId: req.user.id });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
