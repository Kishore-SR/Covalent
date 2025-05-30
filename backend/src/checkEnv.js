// Simple script to check environment variables
console.log("Checking environment variables...");
console.log(
  "JWT_SECRET_KEY:",
  process.env.JWT_SECRET_KEY ? "EXISTS" : "MISSING"
);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "EXISTS" : "MISSING");
console.log(
  "STREAM_API_KEY:",
  process.env.STREAM_API_KEY ? "EXISTS" : "MISSING"
);
console.log(
  "STREAM_API_SECRET:",
  process.env.STREAM_API_SECRET ? "EXISTS" : "MISSING"
);
