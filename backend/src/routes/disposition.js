// Disposition Routes - AI Smart Disposition
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  analyzeReturnDisposition,
  getDisposition,
  batchAnalyze,
  getStats,
  overrideDisposition,
} from "../controllers/dispositionController.js";

const router = express.Router();

// GET /api/disposition/stats - Get disposition statistics
router.get("/stats", getStats);

// POST /api/disposition/analyze - Run AI analysis on a return
router.post("/analyze", analyzeReturnDisposition);

// POST /api/disposition/batch - Run AI analysis on multiple returns
router.post("/batch", batchAnalyze);

// GET /api/disposition/:returnId - Get disposition summary
router.get("/:returnId", getDisposition);

// PATCH /api/disposition/:returnId/override - Override AI recommendation
router.patch("/:returnId/override", overrideDisposition);

export default router;
