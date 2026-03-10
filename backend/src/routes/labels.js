// Label Routes - Generate Return Shipping Labels
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  generateLabel,
  getLabel,
  getLabelHTML,
  batchGenerateLabels,
} from "../controllers/labelController.js";

const router = express.Router();

// POST /api/labels/generate - Generate label for a return
router.post("/generate", generateLabel);

// GET /api/labels/:returnId - Get label data
router.get("/:returnId", getLabel);

// GET /api/labels/:returnId/html - Get label as HTML for printing
router.get("/:returnId/html", getLabelHTML);

// POST /api/labels/batch - Generate labels for multiple returns
router.post("/batch", batchGenerateLabels);

export default router;
