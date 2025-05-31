import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🔐 ProtectRoute middleware called for:", req.method, req.path);
    
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("❌ JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error - Missing JWT_SECRET_KEY",
        error: "ENV_VAR_MISSING",
      });
    }

    // Try to get token from cookie first
    let token = req.cookies.jwt;
    console.log("🍪 Cookie token:", token ? "EXISTS" : "NOT_FOUND");

    // If no cookie token, check Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("🔑 Bearer token:", token ? "EXISTS" : "NOT_FOUND");
    }

    if (!token) {
      console.log("❌ No token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    console.log("🔍 Attempting to verify token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    if (!decoded) {
      console.log("❌ Token verification failed - decoded is null/undefined");
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    console.log("✅ Token verified successfully, userId:", decoded.userId);

    console.log("🔍 Searching for user in database...");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("❌ User not found in database for userId:", decoded.userId);
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    console.log("✅ User found:", user.username || user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error in protectRoute middleware:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token format",
        error: "INVALID_TOKEN"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Unauthorized - Token expired",
        error: "TOKEN_EXPIRED"
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        message: "Unauthorized - Token not active",
        error: "TOKEN_NOT_ACTIVE"
      });
    }

    // Handle database connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error("💾 Database connection error in protectRoute");
      return res.status(500).json({ 
        message: "Database connection error",
        error: "DB_CONNECTION_ERROR"
      });
    }

    // Generic error response
    res.status(500).json({ 
      message: "Internal server error in authentication",
      error: "AUTH_MIDDLEWARE_ERROR",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};