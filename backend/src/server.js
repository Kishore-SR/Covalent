import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});