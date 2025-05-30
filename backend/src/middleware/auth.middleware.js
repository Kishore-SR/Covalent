import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error - Missing JWT_SECRET_KEY",
        error: "ENV_VAR_MISSING",
      });
    }

    // Try to get token from cookie first
    let token = req.cookies.jwt;

    // If no cookie token, check Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};
