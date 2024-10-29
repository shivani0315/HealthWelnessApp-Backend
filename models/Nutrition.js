const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  date: { type: Date, default: Date.now }, // Ensure date is in Date format
});

module.exports = mongoose.model('Nutrition', nutritionSchema);
