const express = require('express');
const { logNutrition, getNutrition } = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, logNutrition);
router.get('/', protect, getNutrition);

module.exports = router;
