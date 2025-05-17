import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";


const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "*", // or "*" for open
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    connectDB();
});