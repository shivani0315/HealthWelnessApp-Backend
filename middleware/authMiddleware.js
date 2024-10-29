// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from header

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
            req.user = await User.findById(decoded.id).select('-password'); // Get user from token
            next(); // Call next middleware
        } catch (error) {
            console.error('Not authorized, token failed', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
