//backend\controllers\userController.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verificationEmail = require("../emailTemplates/verificationEmail");
const util = require("util");
const mongoose = require('mongoose');
// Secret key for JWT (replace with your own secret key stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretJwtKey12345'; // Default value for local dev

const sendGoalReminderEmails = async () => {
  try {
    const users = await User.find();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const user of users) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Your Health and Wellness Goal Reminder",
        html: `
          <h1>Stay on Track with Your Goals!</h1>
          <p>Hello ${user.name},</p>
          <p>This is a friendly reminder to stay on track with your health and wellness goals.</p>
          <p>Here are your goals:</p>
          <ul>
            <li><strong>Daily Steps:</strong> 12,000 steps</li>
            <li><strong>Weekly Workouts:</strong> 7 workouts</li>
            <li><strong>Calorie Target:</strong> 2,200 calories/day</li>
          </ul>
          <p>Keep going! You're doing great!</p>
          <p>Best regards,</p>
          <p>The Health and Wellness Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${user.email}`);
    }
  } catch (error) {
    console.error("Error sending reminder emails:", error);
  }
};

// Schedule the goal reminder emails
cron.schedule("0 9 * * *", async () => {
  console.log("Running daily goal reminder email task...");
  await sendGoalReminderEmails();
});


const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Register request body:", req.body);

  if (!name || !email || !password) {
    console.error("Missing required fields");
    return res.status(400).json({ message: "Missing required fields (name, email, password)" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token after newUser is created
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    newUser.verificationToken = verificationToken;

    await newUser.save();
    console.log("User saved successfully:", newUser);

       // Send Welcome Email
       const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to the Health and Wellness App!",
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>Thank you for registering with the Health and Wellness App.</p>
          <p>Start tracking your goals and stay healthy!</p>
          <p>Best regards,</p>
          <p>The Health and Wellness Team</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered successfully",
      user: { name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user. Please try again." });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with:", { email, password });

  try {
    const user = await User.findOne({ email });
    console.log("User lookup result:", user ? `Found user: ${user.email}` : "User not found");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    console.log("JWT token generated:", token);

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    console.log("Email verification attempt with token:", token);

    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token payload:", decoded);

    if (!decoded.id) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    // Query the database using mongoose's ObjectId conversion
    // const user = await User.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
    // console.log("User query result:", user);
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(decoded.id) });
    console.log("User query result:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid verification link or user not found" });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = null; // Optionally nullify the verification token
    await user.save();
 // Send Email Verification Success Notification
 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: "Email Verified Successfully",
  html: `
    <h1>Email Verified</h1>
    <p>Hello ${user.name},</p>
    <p>Your email address has been successfully verified. You can now access all features of the Health and Wellness App.</p>
    <p>Thank you for verifying your email!</p>
    <p>Best regards,</p>
    <p>The Health and Wellness Team</p>
  `,
};

await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email verified successfully" });

  } catch (error) {
    console.error("Error verifying token:", error.message);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: "Token expired" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};



const getUserById = async (req, res) => {
  console.log("Fetching user with ID:", req.params.id);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const contactUs = async (req, res) => {
  const { name, email, message } = req.body;
  console.log("Contact form submission:", { name, email, message });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail app password
      },
      debug: true,  // Enables detailed logging
      logger: true, // Enables transport logger
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Your Gmail address (sending email from here)
      to: email,  // Send to the email provided by the user
      subject: "New Contact Form Submission",
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Send email to the user's email address
    await transporter.sendMail(mailOptions);
    console.log("Contact form email sent");

    // Respond back to the client that the message was sent successfully
    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    res.status(500).json({ message: "Failed to send your message. Please try again later." });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const { userId, username, email, height, weight, gender, age } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being updated and if the new email is already in use
    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ email });
      if (emailInUse) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    // Update the user's profile data
    user.username = username || user.username;
    user.email = email || user.email;
    user.height = height || user.height;
    user.weight = weight || user.weight;
    user.gender = gender || user.gender;
    user.age = age || user.age;

    // Save the updated user data
    await user.save();
 // Send Profile Update Notification Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Profile Update Notification",
      html: `
        <h1>Profile Updated Successfully</h1>
        <p>Hello ${user.name},</p>
        <p>Your profile has been updated with the following changes:</p>
        <ul>
          ${username ? `<li><strong>Username:</strong> ${username}</li>` : ""}
          ${email ? `<li><strong>Email:</strong> ${email}</li>` : ""}
          ${height ? `<li><strong>Height:</strong> ${height} cm</li>` : ""}
          ${weight ? `<li><strong>Weight:</strong> ${weight} kg</li>` : ""}
          ${gender ? `<li><strong>Gender:</strong> ${gender}</li>` : ""}
          ${age ? `<li><strong>Age:</strong> ${age}</li>` : ""}
        </ul>
        <p>If you didn't make these changes, please contact support immediately.</p>
        <p>Best regards,</p>
        <p>The Health and Wellness Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Send a success response
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  verifyEmail,
  getUserById,
  contactUs,
};
