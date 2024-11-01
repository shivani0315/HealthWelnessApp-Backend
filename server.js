//backend\server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cron = require('node-cron'); // Import node-cron
const { sendReminder } = require('./config/nodemailer'); // Import your email sending function
const User = require('./models/User'); // Adjust the path according to your structure

dotenv.config();
connectDB();

const app = express();

// Set up CORS to allow requests from your frontend
app.use(cors({
  origin: 'https://healthwelnessapp.netlify.app' // Allow requests from your frontend
}));
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
