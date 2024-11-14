const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path to your User model

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token:', token);  // Log the token to verify it's correct

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);  // Log the decoded token to verify its content

            // Fetch the user from the database using the decoded ID
            req.user = await User.findById(decoded.id).select('-password');
            console.log('Authenticated user:', req.user);  // Log the user object to verify it's populated

            // Continue with the request
            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
