const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  calories: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
