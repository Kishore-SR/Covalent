import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
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

  res.status(200).json({
    message: "Covalent API is running successfully!",
    documentation: "API endpoints start with /api/...",
    status: "online",
    timestamp: new Date().toISOString(),
    env: {
      JWT_SECRET_KEY: hasJwtSecret ? "EXISTS" : "MISSING",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Covalent API is running",
    time: new Date().toISOString(),
    env: {
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ? "EXISTS" : "MISSING",
      MONGODB_URI: process.env.MONGODB_URI ? "EXISTS" : "MISSING",
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

// Start server with database connection
const startServer = async () => {
  try {
    console.log("🚀 Starting Covalent server...");

    // Connect to database first
    console.log("📊 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `📊 Database: ${
          process.env.MONGODB_URI ? "Connected" : "Not configured"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();

export default app;

//this comment is just for testing new backend deployment