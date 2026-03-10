// Store Routes - Multi-Store Management
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getStores,
  getStoreById,
  getStoreBySlug,
  createStore,
  updateStore,
  deleteStore,
  getStoreStats,
} from "../controllers/storeController.js";

const router = express.Router();

// GET /api/stores - Get all stores for a user
router.get("/", getStores);

// GET /api/stores/slug/:slug - Get store by slug (white-label)
router.get("/slug/:slug", getStoreBySlug);

// GET /api/stores/:storeId/stats - Get store statistics
router.get("/:storeId/stats", getStoreStats);

// GET /api/stores/:storeId - Get single store
router.get("/:storeId", getStoreById);

// POST /api/stores - Create new store
router.post("/", createStore);

// PATCH /api/stores/:storeId - Update store
router.patch("/:storeId", updateStore);

// DELETE /api/stores/:storeId - Delete store
router.delete("/:storeId", deleteStore);

export default router;
