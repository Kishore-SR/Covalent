import express from "express";
import {
  signup,
  login,
  logout,
  onboard,
  checkUsername,
} from "../controllers/auth.controllers.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

// Add route to check if username exists
router.get("/check-username/:username", checkUsername);

//* To check if the user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
