// Bulk Upload Routes - Manual Order Entry & CSV Import
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import multer from "multer";
import {
  uploadBulkOrders,
  getTemplate,
  validateBulkData,
  getUploadHistory,
  createBulkOrders,
} from "../controllers/bulkUploadController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "bulk-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv|xlsx|xls/;
    const extname = allowedTypes.test(/\.([^.]+)$/i);
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only CSV and Excel files are allowed"));
  },
});

// GET /api/bulk/template - Get sample CSV template
router.get("/template", getTemplate);

// POST /api/bulk/validate - Validate CSV without importing
router.post("/validate", validateBulkData);

// GET /api/bulk/history - Get upload history
router.get("/history", getUploadHistory);

// POST /api/bulk/upload - Upload CSV/Excel file
router.post("/upload", upload.single("file"), uploadBulkOrders);

// POST /api/bulk/orders - Create orders from JSON array
router.post("/orders", createBulkOrders);

export default router;
