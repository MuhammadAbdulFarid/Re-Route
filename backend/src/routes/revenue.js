// Revenue Routes - Platform Owner Dashboard
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getRevenueDashboard,
  getTransactions,
  recordTransaction,
  getMerchantRevenue,
  exportRevenueReport,
} from "../controllers/revenueController.js";

const router = express.Router();

// GET /api/revenue/dashboard - Get revenue dashboard data
router.get("/dashboard", getRevenueDashboard);

// GET /api/revenue/transactions - Get transaction list
router.get("/transactions", getTransactions);

// POST /api/revenue/record - Record a new transaction
router.post("/record", recordTransaction);

// GET /api/revenue/merchants - Get merchant revenue breakdown
router.get("/merchants", getMerchantRevenue);

// GET /api/revenue/export - Export revenue report
router.get("/export", exportRevenueReport);

export default router;
