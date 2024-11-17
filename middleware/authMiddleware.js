const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Ensure the JWT_SECRET is defined in the environment variables
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return res.status(500).json({ message: "Server configuration error" });
  }

  // Check if Authorization header is present and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];  // Extract the token

      if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");  // Attach the user data to the request object
      next();  // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Token verification failed:", error.message);

      // Handle different token error scenarios
      // if (error.name === "JsonWebTokenError") {
      //   return res.status(401).json({ message: "Invalid token" });
      // }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      return res.status(401).json({ message: "Token verification failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = protect;
