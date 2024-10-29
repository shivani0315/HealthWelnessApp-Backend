const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Set up the transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email: ' + error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Function to send reminders to users
const sendReminder = (userEmail, userName) => {
  const subject = 'Goal Progress Reminder';
  const message = `Hello ${userName}, don’t forget to check your goal progress today!`;

  sendEmail(userEmail, subject, message);
};

// Schedule a reminder every day at 10:00 AM
cron.schedule('0 8 * * *', async () => {
    try {
      const users = await User.find(); // Fetch users from the database
      users.forEach(user => {
        const { email, goals } = user; // Destructure user to get email and goals
        goals.forEach(goal => {
          if (!goal.completed) { // Check if the goal is not completed
            sendReminder(email, goal.type); // Pass email and goal type to sendReminder
          }
        });
      });
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  });
  

module.exports = { sendEmail, sendReminder };
