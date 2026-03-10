// Auth Routes - Login, Register, Logout
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  register,
  login,
  logout,
  me,
  changePassword,
  updateProfile,
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register - Register new user
router.post("/register", register);

// POST /api/auth/login - Login user
router.post("/login", login);

// POST /api/auth/logout - Logout user
router.post("/logout", logout);

// GET /api/auth/me - Get current user
router.get("/me", me);

// PATCH /api/auth/password - Change password
router.patch("/password", changePassword);

// PATCH /api/auth/profile - Update profile
router.patch("/profile", updateProfile);

export default router;
