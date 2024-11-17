const express = require("express");
const { addWorkout, getWorkouts, getWorkoutAnalytics } = require("../controllers/workoutController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Workout analytics route (protected)
router.get('/analytics', protect, getWorkoutAnalytics);

// Add and get workouts route (protected)
router.route("/")
  .post(protect, addWorkout) // POST to add a workout
  .get(protect, getWorkouts); // GET to get all workouts

module.exports = router;
