import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import * as emailService from "../services/email.service";
import { validateEmail } from "../utils/validation.util";
import prisma from "../utils/prisma.util"; // Add this import
import crypto from "crypto"; // Add this import for token generation
import * as bcrypt from "bcrypt";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser({ name, email, password });

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      user.verificationToken!
    );

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }

    res.status(500).json({ message: "Failed to register user" });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    await authService.verifyUserEmail(token);

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(400).json({ message: "Invalid or expired verification token" });
  }
};
export const demoForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiryTime,
      },
    });

    // Return token for demo purposes
    res.json({
      message: "DEMO MODE: Password reset requested",
      demoInfo: {
        resetToken: token,
        resetUrl: `https://backend-microblog-production.up.railway.app/api/auth/reset-password/${token}`,
        note: "This direct token access is for demonstration purposes only",
      },
    });
  } catch (error) {
    console.error("Error in demo forgot password:", error);
    res.status(500).json({ message: "Error processing password reset" });
  }
};

// Demo method that returns verification token for a newly registered user
export const demoGetVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.verificationToken) {
      return res
        .status(404)
        .json({ message: "No verification token found for this user" });
    }

    res.json({
      message: "DEMO MODE: Verification token retrieved",
      demoInfo: {
        verificationUrl: `https://backend-microblog-production.up.railway.app/api/auth/verify/${user.verificationToken}`,
        note: "This direct token access is for demonstration purposes only",
      },
    });
  } catch (error) {
    console.error("Error in demo get verification:", error);
    res.status(500).json({ message: "Error retrieving verification token" });
  }
};
// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json(result);
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.message === "Please verify your email before logging in") {
      return res.status(403).json({ message: error.message });
    }

    res.status(401).json({ message: "Invalid email or password" });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await authService.requestPasswordReset(email);

    // Send reset email
    await emailService.sendPasswordResetEmail(email, user.resetToken!);

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return 200 for security reasons (don't reveal if email exists)
    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    await authService.resetPassword(token, password);

    res.json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
};

// Get current user (requires authentication)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user information" });
  }
};
