import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, username } = req.body;

  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
        error: "ENV_VAR_MISSING",
      });
    }

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use different mail" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Username already taken, please try another one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatrar = `https://avatar.iran.liara.run/public/${idx}.png`;
    const newUser = await User.create({
      email,
      password,
      username,
      profilePic: randomAvatrar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: username,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for "@${newUser.username}"`);
    } catch (error) {
      console.error("Error creating/updating Stream user:", error);
    }
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "12d",
      }
    );

    // Send cookie with proper settings for cross-domain
    res.cookie("jwt", token, {
      maxAge: 12 * 24 * 60 * 60 * 1000, // 12 days
      httpOnly: true,
      secure: true, // Always use secure for Vercel deployment
      sameSite: "none", // Required for cross-domain cookies
      path: "/",
    });

    // Also send token in response for client-side storage if needed
    res.status(201).json({ success: true, user: newUser, token });
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
        error: "ENV_VAR_MISSING",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    } // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "12d",
    });

    // Send cookie with proper settings for cross-domain
    res.cookie("jwt", token, {
      maxAge: 12 * 24 * 60 * 60 * 1000, // 12 days
      httpOnly: true,
      secure: true, // Always use secure for Vercel deployment
      sameSite: "none", // Required for cross-domain cookies
      path: "/",
    });

    // Also send token in response for client-side storage if needed
    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.log("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, // Always use secure for Vercel deployment
    sameSite: "none", // Required for cross-domain cookies
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.username,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated for "@${updatedUser.username}"`);
    } catch (error) {
      console.error("Error creating/updating Stream user:", error.message);
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Onboarding error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add this new function to check if a username exists
export async function checkUsername(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // Return 409 Conflict if username exists
      return res.status(409).json({
        message: "Username already exists",
        exists: true,
      });
    }

    // Return 200 OK if username is available
    return res.status(200).json({
      message: "Username is available",
      exists: false,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
