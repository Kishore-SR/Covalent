import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Initialize
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function testMongoConnection() {
  console.log("🔍 MongoDB Connection Tester");
  console.log("============================");

  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is not defined");
    process.exit(1);
  }

  // Get and sanitize the URI
  const uri = process.env.MONGODB_URI.trim();
  const sanitizedUri = uri.replace(
    /\/\/([^:]+):([^@]+)@/,
    "//[username]:[password]@"
  );

  console.log(`🔗 Attempting to connect to: ${sanitizedUri}`);

  // Basic validation
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.error(
      "❌ Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://"
    );

    // Try to automatically fix it
    let fixedUri = uri;

    // Remove quotes if present
    if (
      (uri.startsWith('"') && uri.endsWith('"')) ||
      (uri.startsWith("'") && uri.endsWith("'"))
    ) {
      fixedUri = uri.substring(1, uri.length - 1);
      console.log("🔧 Removed quotes from URI");
    }

    // Add protocol if missing
    if (
      !fixedUri.startsWith("mongodb://") &&
      !fixedUri.startsWith("mongodb+srv://")
    ) {
      if (fixedUri.includes("mongodb.net")) {
        fixedUri = `mongodb+srv://${fixedUri}`;
        console.log("🔧 Added mongodb+srv:// prefix");
      } else {
        fixedUri = `mongodb://${fixedUri}`;
        console.log("🔧 Added mongodb:// prefix");
      }
    }

    console.log("✏️ Suggested fixed URI:");
    console.log(fixedUri);
    console.log("\nTrying to connect with the fixed URI...");

    try {
      await mongoose.connect(fixedUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log("✅ Connected successfully with the fixed URI!");
      console.log("👉 Update your environment variable with this fixed URI.");
      await mongoose.disconnect();
      process.exit(0);
    } catch (fixError) {
      console.error(
        "❌ Connection still failed with the fixed URI:",
        fixError.message
      );
      console.error(
        "Please check your MongoDB service and network connectivity."
      );
      process.exit(1);
    }

    return;
  }

  // Try to connect
  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ Connected successfully to MongoDB!");
    console.log(`📊 Connected to: ${connection.connection.host}`);
    console.log(`📂 Database name: ${connection.connection.name}`);

    // Get some basic stats
    const adminDb = connection.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();

    console.log("\n📈 Server Info:");
    console.log(`- MongoDB version: ${serverStatus.version}`);
    console.log(
      `- Uptime: ${Math.floor(serverStatus.uptime / 86400)} days, ${Math.floor(
        (serverStatus.uptime % 86400) / 3600
      )} hours`
    );
    console.log(
      `- Connections: ${serverStatus.connections.current} current / ${serverStatus.connections.available} available`
    );

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");

    console.log("\n✨ Your MongoDB connection is working correctly!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);

    if (error.name === "MongoParseError") {
      console.error(
        "\n👉 This error indicates an issue with the format of your connection string."
      );
      console.error(
        "Make sure it follows the format: mongodb+srv://username:password@host/database"
      );
    } else if (error.name === "MongoServerSelectionError") {
      console.error(
        "\n👉 This error indicates that the MongoDB server could not be reached."
      );
      console.error("Possible causes:");
      console.error("- Network connectivity issues");
      console.error("- MongoDB server is down");
      console.error("- IP address not whitelisted in MongoDB Atlas");
      console.error("- Wrong username/password in connection string");
    }

    process.exit(1);
  }
}

testMongoConnection().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
