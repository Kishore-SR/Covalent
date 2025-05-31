import express from "express";

const debugRouter = express.Router();

// Environment variable debugging endpoint
debugRouter.get("/env", (req, res) => {
  const mongoUri = process.env.MONGODB_URI || "NOT_SET";

  // Create a sanitized version that hides credentials
  let sanitizedUri = "NOT_SET";
  if (mongoUri !== "NOT_SET") {
    sanitizedUri = mongoUri.replace(
      /\/\/([^:]+):([^@]+)@/,
      "//[username]:[password]@"
    );
  }

  res.json({
    message: "Environment variables debug info",
    env: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      MONGODB_URI_SET: !!process.env.MONGODB_URI,
      MONGODB_URI_LENGTH: mongoUri.length,
      MONGODB_URI_PREFIX: mongoUri.substring(0, 20) + "...",
      MONGODB_URI_SANITIZED: sanitizedUri,
      MONGODB_URI_VALID_FORMAT:
        mongoUri.startsWith("mongodb://") ||
        mongoUri.startsWith("mongodb+srv://"),
      JWT_SECRET_KEY_SET: !!process.env.JWT_SECRET_KEY,
      STREAM_API_KEY_SET: !!process.env.STREAM_API_KEY,
      STREAM_API_SECRET_SET: !!process.env.STREAM_API_SECRET,
    },
  });
});

// MongoDB connection test endpoint
debugRouter.get("/test-mongodb", async (req, res) => {
  try {
    const mongoose = await import("mongoose");

    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: "MONGODB_URI environment variable is not set",
      });
    }

    const mongoUri = process.env.MONGODB_URI;
    const sanitizedUri = mongoUri.replace(
      /\/\/([^:]+):([^@]+)@/,
      "//[username]:[password]@"
    );

    // Validate URI format
    if (
      !mongoUri.startsWith("mongodb://") &&
      !mongoUri.startsWith("mongodb+srv://")
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://",
        uri_preview: mongoUri.substring(0, 15) + "...",
      });
    }

    console.log(`Attempting to connect to MongoDB: ${sanitizedUri}`);

    // Set a short timeout to avoid hanging the request
    const connection = await mongoose.default.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    const dbInfo = {
      host: connection.connection.host,
      name: connection.connection.name,
      port: connection.connection.port,
      models: Object.keys(connection.models),
    };

    await mongoose.default.disconnect();

    return res.json({
      success: true,
      message: "Successfully connected to MongoDB",
      database: dbInfo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to connect to MongoDB",
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
});

export default debugRouter;
