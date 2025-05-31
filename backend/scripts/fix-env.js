// A utility script to validate and fix environment variables
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Initialize
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

console.log("🔍 Environment Variable Validator & Fixer");
console.log("=========================================");

// Function to validate MongoDB URI
function validateMongoDBURI(uri) {
  if (!uri) {
    console.log("❌ MONGODB_URI is not set");
    return false;
  }

  uri = uri.trim();
  console.log(`URI Length: ${uri.length} characters`);
  console.log(`First 10 chars: "${uri.substring(0, 10)}..."`);

  // Check if wrapped in quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    console.log("⚠️ MONGODB_URI has quotes that need to be removed");
    return false;
  }

  // Check for protocol
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    console.log(
      "⚠️ MONGODB_URI is missing protocol (mongodb:// or mongodb+srv://)"
    );
    return false;
  }

  // Basic format check
  if (!uri.includes("@")) {
    console.log(
      "⚠️ MONGODB_URI might be missing authentication info (no @ symbol found)"
    );
  }

  return true;
}

// Function to fix MongoDB URI
function fixMongoDBURI(uri) {
  if (!uri) return null;

  uri = uri.trim();

  // Remove quotes if present
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.substring(1, uri.length - 1);
    console.log("✅ Removed quotes from MONGODB_URI");
  }

  // Add protocol if missing
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    // If it has mongodb.net, it's likely Atlas
    if (uri.includes("mongodb.net")) {
      uri = `mongodb+srv://${uri}`;
      console.log("✅ Added mongodb+srv:// protocol to MONGODB_URI");
    } else {
      uri = `mongodb://${uri}`;
      console.log("✅ Added mongodb:// protocol to MONGODB_URI");
    }
  }

  return uri;
}

// Check JWT_SECRET_KEY
if (!process.env.JWT_SECRET_KEY) {
  console.log("❌ JWT_SECRET_KEY is not set");
} else {
  console.log("✅ JWT_SECRET_KEY is set");
}

// Check and fix MONGODB_URI
console.log("\n📊 Validating MONGODB_URI...");
const isMongoURIValid = validateMongoDBURI(process.env.MONGODB_URI);

if (!isMongoURIValid && process.env.MONGODB_URI) {
  const fixedURI = fixMongoDBURI(process.env.MONGODB_URI);
  console.log("\n🔧 Fixed MONGODB_URI:");
  console.log(fixedURI);

  console.log("\n📝 Use this fixed URI in your Vercel environment variables");
  console.log("Command to set in Vercel:");
  console.log(`vercel env add MONGODB_URI`);
  console.log("\nWhen prompted, enter the fixed URI above");
}

// Check other environment variables
console.log("\n📊 Other Environment Variables:");
if (!process.env.STREAM_API_KEY) {
  console.log("❌ STREAM_API_KEY is not set");
} else {
  console.log("✅ STREAM_API_KEY is set");
}

if (!process.env.STREAM_API_SECRET) {
  console.log("❌ STREAM_API_SECRET is not set");
} else {
  console.log("✅ STREAM_API_SECRET is set");
}

console.log("\n🔍 Environment Check Complete");
