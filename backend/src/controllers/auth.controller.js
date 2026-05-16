import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";


// ========================= SIGNUP =========================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const savedUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate JWT token + cookie
    generateToken(savedUser._id, res);

    // Send welcome email (optional)
    try {
      await sendWelcomeEmail(
        savedUser.email,
        savedUser.fullName,
        ENV.CLIENT_URL
      );
    } catch (emailError) {
      console.log("Welcome email failed:", emailError.message);
    }

    // Response
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
      },
    });
  } catch (error) {
    console.log("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================= LOGIN =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    generateToken(user._id, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================= LOGOUT =========================
export const logout = async (_, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: ENV.NODE_ENV !== "development",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================= UPDATE PROFILE =========================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }

    const userId = req.user._id;

    // Upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      profilePic
    );

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      {
        new: true,
      }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};