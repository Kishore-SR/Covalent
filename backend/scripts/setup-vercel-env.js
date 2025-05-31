import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import { createInterface } from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Initialize
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const execAsync = promisify(exec);
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function setupVercelEnv() {
  console.log("🚀 Vercel Environment Setup Tool");
  console.log("================================");

  // Check if vercel CLI is installed
  try {
    await execAsync("vercel -v");
    console.log("✅ Vercel CLI is installed");
  } catch (error) {
    console.error("❌ Vercel CLI is not installed. Please install it first:");
    console.error("npm i -g vercel");
    process.exit(1);
  }

  console.log("\n1️⃣ Setting up MongoDB URI");
  console.log("------------------------");

  let mongoUri = process.env.MONGODB_URI || "";
  if (mongoUri) {
    console.log(
      `Current MONGODB_URI: ${mongoUri.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//[username]:[password]@"
      )}`
    );
    const useExisting = await question("Use this URI? (y/n): ");
    if (useExisting.toLowerCase() !== "y") {
      mongoUri = await question("Enter MongoDB URI (mongodb+srv://...): ");
    }
  } else {
    mongoUri = await question("Enter MongoDB URI (mongodb+srv://...): ");
  }

  // Validate and clean the MongoDB URI
  if (mongoUri) {
    mongoUri = mongoUri.trim();

    // Remove quotes if present
    if (
      (mongoUri.startsWith('"') && mongoUri.endsWith('"')) ||
      (mongoUri.startsWith("'") && mongoUri.endsWith("'"))
    ) {
      mongoUri = mongoUri.substring(1, mongoUri.length - 1);
      console.log("🔧 Removed quotes from MongoDB URI");
    }

    // Add protocol if missing
    if (
      !mongoUri.startsWith("mongodb://") &&
      !mongoUri.startsWith("mongodb+srv://")
    ) {
      if (mongoUri.includes("mongodb.net")) {
        mongoUri = `mongodb+srv://${mongoUri}`;
        console.log("🔧 Added mongodb+srv:// prefix to MongoDB URI");
      } else {
        mongoUri = `mongodb://${mongoUri}`;
        console.log("🔧 Added mongodb:// prefix to MongoDB URI");
      }
    }
  }

  console.log("\n2️⃣ Setting up JWT Secret Key");
  console.log("--------------------------");

  let jwtSecret = process.env.JWT_SECRET_KEY || "";
  if (jwtSecret) {
    console.log("Current JWT_SECRET_KEY: [EXISTS]");
    const useExisting = await question("Use this secret? (y/n): ");
    if (useExisting.toLowerCase() !== "y") {
      jwtSecret = await question("Enter JWT Secret Key: ");
    }
  } else {
    // Generate a random JWT secret if none exists
    const crypto = await import("crypto");
    const generatedSecret = crypto.randomBytes(32).toString("hex");
    console.log(
      `Generated random JWT secret: ${generatedSecret.substring(0, 10)}...`
    );
    const useGenerated = await question("Use this generated secret? (y/n): ");
    if (useGenerated.toLowerCase() === "y") {
      jwtSecret = generatedSecret;
    } else {
      jwtSecret = await question("Enter JWT Secret Key: ");
    }
  }

  console.log("\n3️⃣ Setting up GetStream API Keys");
  console.log("-------------------------------");

  let streamApiKey = process.env.STREAM_API_KEY || "";
  if (streamApiKey) {
    console.log("Current STREAM_API_KEY: [EXISTS]");
    const useExisting = await question("Use this API key? (y/n): ");
    if (useExisting.toLowerCase() !== "y") {
      streamApiKey = await question("Enter GetStream API Key: ");
    }
  } else {
    streamApiKey = await question("Enter GetStream API Key: ");
  }

  let streamApiSecret = process.env.STREAM_API_SECRET || "";
  if (streamApiSecret) {
    console.log("Current STREAM_API_SECRET: [EXISTS]");
    const useExisting = await question("Use this API secret? (y/n): ");
    if (useExisting.toLowerCase() !== "y") {
      streamApiSecret = await question("Enter GetStream API Secret: ");
    }
  } else {
    streamApiSecret = await question("Enter GetStream API Secret: ");
  }

  console.log("\n🔄 Setting up Vercel environment variables...");

  try {
    // Create a temporary file to store environment variables
    const envFile = path.join(__dirname, "temp-env-vars.txt");

    // Store variables in file to avoid command line escaping issues
    let envFileContent = "";

    if (mongoUri) {
      envFileContent += `MONGODB_URI=${mongoUri}\n`;
    }

    if (jwtSecret) {
      envFileContent += `JWT_SECRET_KEY=${jwtSecret}\n`;
    }

    if (streamApiKey) {
      envFileContent += `STREAM_API_KEY=${streamApiKey}\n`;
    }

    if (streamApiSecret) {
      envFileContent += `STREAM_API_SECRET=${streamApiSecret}\n`;
    }

    fs.writeFileSync(envFile, envFileContent);

    // Use vercel env import command
    console.log("Importing environment variables to Vercel...");
    const { stdout, stderr } = await execAsync(
      `vercel env import < ${envFile}`
    );
    console.log(stdout);

    if (stderr) {
      console.error("Errors from Vercel CLI:", stderr);
    }

    // Clean up temporary file
    fs.unlinkSync(envFile);

    console.log("\n✅ Environment variables set up successfully in Vercel!");
    console.log("🚀 You can now deploy your application with:");
    console.log("   vercel --prod");
  } catch (error) {
    console.error(
      "❌ Error setting up Vercel environment variables:",
      error.message
    );
    console.error(
      "Please try setting them manually with the vercel env add command"
    );
  }

  rl.close();
}

setupVercelEnv().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
