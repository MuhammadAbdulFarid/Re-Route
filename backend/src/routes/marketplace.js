// Marketplace Routes - Connect & Manage Marketplace Accounts
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getConnections,
  initiateConnection,
  handleCallback,
  syncOrders,
  disconnectMarketplace,
} from "../controllers/marketplaceController.js";

const router = express.Router();

// GET /api/marketplace/connections - Get all marketplace connections
router.get("/connections", getConnections);

// POST /api/marketplace/connect - Initiate OAuth connection
router.post("/connect", initiateConnection);

// POST /api/marketplace/callback - OAuth callback handler
router.post("/callback", handleCallback);

// POST /api/marketplace/sync - Sync orders from marketplace
router.post("/sync", syncOrders);

// DELETE /api/marketplace/connections/:connectionId - Disconnect marketplace
router.delete("/connections/:connectionId", disconnectMarketplace);

export default router;
