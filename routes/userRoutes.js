const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  getUserById,
  updateUserProfile,
  contactUs,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/contact", contactUs);

// Protected Routes
router.get("/:id", protect, getUserById);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
