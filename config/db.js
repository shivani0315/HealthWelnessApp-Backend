//backend\config\db.js
require('dotenv').config();  // Load environment variables

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Log the Mongo URI to verify it's being loaded correctly
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tshivani0315:QwertYuiop@cluster0.fmq6b.mongodb.net/health_wellness?retryWrites=true&w=majority&appName=Cluster0';

    const conn = await mongoose.connect(MONGO_URI);  // Removed deprecated options

    console.log("MongoDB connected");

  } catch (error) {
    console.error(`Error in DB connection: ${error.message}`);
    process.exit(1);  // Exit process if connection fails
  }
};

module.exports = connectDB;
