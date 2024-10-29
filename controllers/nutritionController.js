const Nutrition = require('../models/Nutrition');

exports.logNutrition = async (req, res) => {
  const { food, calories, protein, carbs, fats } = req.body;
  try {
    // Create a nutrition entry with the current date or a provided date
    const nutrition = await Nutrition.create({
      userId: req.user.id,
      food,
      calories,
      protein,
      carbs,
      fats,
      date: new Date().toISOString(), // Store date in ISO format
    });
    res.status(201).json(nutrition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNutrition = async (req, res) => {
  try {
    // Retrieve nutrition logs and ensure date consistency
    const nutritionLogs = await Nutrition.find({ userId: req.user.id });
    res.json(nutritionLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
