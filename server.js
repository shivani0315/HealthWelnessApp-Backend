//backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { sendReminder } = require('./config/nodemailer');
const User = require('./models/User'); // Adjust the path according to your structure

dotenv.config();
connectDB();

const app = express();

// Set up CORS to allow requests from both local and production environments
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://healthwelnessapp.netlify.app', // Production (replace with your deployed frontend URL)
  'https://healthwelnessapp.onrender.com' // Production backend URL (for Render)
];

// Enable CORS middleware with additional configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow custom headers (e.g., Authorization for JWT)
}));

// Handle preflight requests (OPTIONS)
app.options('*', cors()); // This will handle all OPTIONS requests globally

app.use(express.json());

// Import Routes
const userRoutes = require('./routes/userRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const goalRoutes = require('./routes/goalRoutes');

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the API! Please use the following endpoints: /api/users, /api/exercises, /api/nutrition, /api/goals');
});

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/goals', goalRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
