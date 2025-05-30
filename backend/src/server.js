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

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://covalents.vercel.app",
        "http://localhost:5173",
      ];
      // Allow requests with no origin (like mobile apps, curl requests, etc)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
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

// To check the status of backend deployment on vercel
app.get("/", (req, res) => {
  // Check if the JWT_SECRET_KEY exists
  const hasJwtSecret = !!process.env.JWT_SECRET_KEY;

  res.status(200).json({
    message: "Covalent API is running successfully!",
    documentation: "API endpoints start with /api/...",
    status: "online",
    env: {
      JWT_SECRET_KEY: hasJwtSecret ? "EXISTS" : "MISSING",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });
});

// Health check endpoint for Vercel
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

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  connectDB();
});
