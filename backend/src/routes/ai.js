// AI Consultation Routes
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  consultAI,
  getInsights,
  getHistory,
} from "../controllers/aiConsultationController.js";

const router = express.Router();

// POST /api/ai/consult - Process AI consultation
router.post("/consult", consultAI);

// GET /api/ai/insights/:storeId - Get AI insights
router.get("/insights/:storeId", getInsights);

// GET /api/ai/history - Get consultation history
router.get("/history", getHistory);

export default router;
