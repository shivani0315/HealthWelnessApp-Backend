const express = require('express');
const { logExercise, getExercises } = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, logExercise);
router.get('/', protect, getExercises);

module.exports = router;
