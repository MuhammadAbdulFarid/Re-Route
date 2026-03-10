// Return Routes
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import multer from "multer";
import {
  submitReturn,
  approveReturn,
  courierWebhook,
  getReturns,
  getReturnById,
  rejectReturn,
} from "../controllers/returnController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "return-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(/\.([^.]+)$/i);
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// POST /api/returns/submit - Submit return request (with photo upload)
router.post("/submit", upload.single("photo"), submitReturn);

// PATCH /api/returns/approve/:returnId - Approve return & generate waybill
router.patch("/approve/:returnId", approveReturn);

// POST /api/webhook/courier - Courier webhook endpoint
router.post("/webhook/courier", courierWebhook);

// GET /api/returns - Get all return requests (for admin)
router.get("/", getReturns);

// GET /api/returns/:returnId - Get single return request
router.get("/:returnId", getReturnById);

// PATCH /api/returns/reject/:returnId - Reject return request
router.patch("/reject/:returnId", rejectReturn);

export default router;
