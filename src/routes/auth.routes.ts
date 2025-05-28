import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validation.middleware";

const router = Router();

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/verify/:token", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Demo routes for testing - would never exist in production
router.post("/demo-forgot-password", authController.demoForgotPassword);
router.get("/demo-get-verification/:email", authController.demoGetVerification);

// Protected routes
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
