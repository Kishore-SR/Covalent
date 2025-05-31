import express from "express";
import "dotenv/config";
import authRoutes from "../src/routes/auth.routes.js";
import { connectDB } from "../src/lib/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "../src/routes/user.route.js";
import chatRoutes from "../src/routes/chat.route.js";
import debugRouter from "./debug.js";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://covalents.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
      ];
      // Allow requests with no origin (like mobile apps, curl requests, etc)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("⚠️ Blocked by CORS:", origin);
        callback(null, true); // Temporarily allow all origins for debugging
      }
    },
    credentials: true, //allow frontend to access cookies
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Request body:", {
      ...req.body,
      password: req.body.password ? "[HIDDEN]" : undefined,
    });
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Health check endpoints
app.get("/", (req, res) => {
  const hasJwtSecret = !!process.env.JWT_SECRET_KEY;
  const hasMongoDB = !!process.env.MONGODB_URI;

  // Get the first 10 characters of the MongoDB URI for debugging
  const mongoURIPreview = process.env.MONGODB_URI
    ? `${process.env.MONGODB_URI.substring(0, 10)}...`
    : "MISSING";

  // Perform basic validation on the MongoDB URI
  let mongoURIStatus = "UNKNOWN";
  if (!process.env.MONGODB_URI) {
    mongoURIStatus = "MISSING";
  } else {
    const uri = process.env.MONGODB_URI.trim();
    if (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) {
      mongoURIStatus = "VALID_FORMAT";
    } else if (uri.includes("mongodb.net")) {
      mongoURIStatus = "MISSING_PROTOCOL";
    } else if (uri.startsWith('"') || uri.startsWith("'")) {
      mongoURIStatus = "HAS_QUOTES";
    } else {
      mongoURIStatus = "INVALID_FORMAT";
    }
  }

  res.status(200).json({
    message: "Covalent API is running successfully!",
    documentation: "API endpoints start with /api/...",
    status: "online",
    timestamp: new Date().toISOString(),
    env: {
      JWT_SECRET_KEY: hasJwtSecret ? "EXISTS" : "MISSING",
      MONGODB_URI: hasMongoDB ? "EXISTS" : "MISSING",
      MONGODB_URI_PREVIEW: mongoURIPreview,
      MONGODB_URI_STATUS: mongoURIStatus,
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });
});

app.get("/api/health", (req, res) => {
  // Perform basic validation on the MongoDB URI
  let mongoURIStatus = "UNKNOWN";
  let mongoURIPreview = "NONE";

  if (!process.env.MONGODB_URI) {
    mongoURIStatus = "MISSING";
  } else {
    const uri = process.env.MONGODB_URI.trim();
    mongoURIPreview = `${uri.substring(0, 15)}...`;

    if (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")) {
      mongoURIStatus = "VALID_FORMAT";
    } else if (uri.includes("mongodb.net")) {
      mongoURIStatus = "MISSING_PROTOCOL";
    } else if (uri.startsWith('"') || uri.startsWith("'")) {
      mongoURIStatus = "HAS_QUOTES";
    } else {
      mongoURIStatus = "INVALID_FORMAT";
    }
  }

  res.status(200).json({
    status: "ok",
    message: "Covalent API is running",
    time: new Date().toISOString(),
    env: {
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? "EXISTS" : "MISSING",
      MONGODB_URI: process.env.MONGODB_URI ? "EXISTS" : "MISSING",
      MONGODB_URI_STATUS: mongoURIStatus,
      MONGODB_URI_PREVIEW: mongoURIPreview,
      STREAM_API_KEY: process.env.STREAM_API_KEY ? "EXISTS" : "MISSING",
      STREAM_API_SECRET: process.env.STREAM_API_SECRET ? "EXISTS" : "MISSING",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/debug", debugRouter);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:");
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.error("Request path:", req.path);
  console.error("Request method:", req.method);

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      error: error.message,
      type: "VALIDATION_ERROR",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
      error: "INVALID_ID",
      type: "CAST_ERROR",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Duplicate field value",
      error: "DUPLICATE_FIELD",
      type: "MONGO_DUPLICATE",
    });
  }

  // Generic error response
  res.status(500).json({
    message: "Internal server error",
    error: error.message,
    type: "INTERNAL_SERVER_ERROR",
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.originalUrl);
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "POST /api/auth/login",
      "POST /api/auth/signup",
      "POST /api/auth/logout",
      "GET /api/auth/me",
      "POST /api/auth/onboarding",
      "GET /api/auth/check-username/:username",
    ],
  });
});

// Connect to database
console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  JWT_EXISTS: !!process.env.JWT_SECRET_KEY,
  STREAM_API_EXISTS: !!process.env.STREAM_API_KEY,
  MONGODB_URI_FORMAT: process.env.MONGODB_URI
    ? process.env.MONGODB_URI.startsWith("mongodb://") ||
      process.env.MONGODB_URI.startsWith("mongodb+srv://")
      ? "VALID"
      : "INVALID"
    : "MISSING",
});

// Attempt database connection with retry logic
let retries = 3;
let connected = false;

while (retries > 0 && !connected) {
  try {
    console.log(
      `⏳ Attempting to connect to MongoDB (${retries} retries left)...`
    );
    await connectDB();
    console.log("✅ Database connected successfully");
    connected = true;
  } catch (error) {
    console.error(
      `❌ Failed to connect to database (attempt ${4 - retries}/3):`,
      error.message
    );
    retries--;

    if (retries > 0) {
      // Wait for a short period before retrying
      console.log("⏳ Waiting 1 second before retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.error(
        "❌ All database connection attempts failed. API will continue but database-dependent features will not work."
      );
    }
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
});

// For Vercel serverless functions, we export the app instead of listening on a port
export default app;
