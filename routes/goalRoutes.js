// backend/routes/goalRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { setGoal, getGoals, updateGoal, sendReminder } = require('../controllers/goalController');

const router = express.Router();

// Define your routes
router.post('/', protect, setGoal); // Create a new goal
router.get('/', protect, getGoals); // Get all goals for the user
router.put('/update', protect, updateGoal); // Update a specific goal
router.post('/reminder', protect, sendReminder); // Send reminder email

module.exports = router;
