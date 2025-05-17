import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5001;

app.get("/api/auth/signup", (req, res) => {
    res.send("Hello World");
})
app.get("/api/auth/login", (req, res) => {
    res.send("Hello World");
})
app.get("/api/auth/logout", (req, res) => {
    res.send("Hello World");
})


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});