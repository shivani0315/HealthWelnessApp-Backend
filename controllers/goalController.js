
// Set a new goal for the user
const Goal = require('../models/Goal');
const { sendEmail } = require('../config/nodemailer');

// Set a new goal for the user
exports.setGoal = async (req, res) => {
    const { type, target } = req.body; // Only retrieve type and target
    try {
        // Log the goal setting attempt for debugging
        console.log('Setting new goal:', { userId: req.user.id, type, target });

        // Create the goal
        const goal = await Goal.create({ userId: req.user.id, type, target });

        // Send confirmation email
        await sendEmail(req.user.email, 'Goal Set', `Your goal of ${target} for ${type} has been set.`);
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Failed to create goal', error: error.message });
    }
};



// Get all goals for the logged-in user
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
    }
};

// Send a reminder email for a specific goal
exports.sendReminder = async (req, res) => {
    const { email, goalType } = req.body;
    try {
        await sendEmail(email, 'Goal Reminder', `This is a reminder to keep working on your goal: ${goalType}.`);
        res.status(200).json({ message: 'Reminder sent successfully' });
    } catch (error) {
        console.error('Error sending reminder:', error);
        res.status(500).json({ message: 'Failed to send reminder', error: error.message });
    }
};

// Update a goal for the user
exports.updateGoal = async (req, res) => {
    const { type, target, progress = 0 } = req.body; // Set default progress to 0 if not provided
    const userId = req.user.id;

    try {
        // Log the goal update attempt for debugging
        console.log('Updating goal:', { userId, type, target, progress });

        const updatedGoal = await Goal.findOneAndUpdate(
            { type, userId },
            { target, progress }, // Update the target and progress
            { new: true }
        );

        if (!updatedGoal) {
            // If no existing goal found, create a new one
            const newGoal = await Goal.create({ userId, type, target, progress }); // Include progress when creating
            await sendEmail(req.user.email, 'New Goal Set', `Your new goal of ${target} for ${type} has been set.`);
            return res.status(201).json(newGoal);
        }

        // Respond with the updated goal
        res.status(200).json(updatedGoal);
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Failed to update goal', error: error.message });
    }
};
