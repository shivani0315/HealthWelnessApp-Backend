// userRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import your protect middleware


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, async (req, res) => {
    res.json(req.user); // Return the authenticated user's details
});

module.exports = router;
