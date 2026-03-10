// Fraud Routes - Fraud Detection & Alerts
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getFraudDashboard,
  getAlerts,
  getAlertDetails,
  updateAlert,
  checkCustomerRisk,
  checkReturnFraudStatus,
  getStats,
} from "../controllers/fraudController.js";

const router = express.Router();

// GET /api/fraud/dashboard - Get fraud detection dashboard
router.get("/dashboard", getFraudDashboard);

// GET /api/fraud/stats - Get fraud statistics
router.get("/stats", getStats);

// GET /api/fraud/alerts - Get fraud alerts
router.get("/alerts", getAlerts);

// GET /api/fraud/alerts/:alertId - Get single alert details
router.get("/alerts/:alertId", getAlertDetails);

// PATCH /api/fraud/alerts/:alertId - Update alert status
router.patch("/alerts/:alertId", updateAlert);

// GET /api/fraud/check/:customerId - Check fraud risk for a customer
router.get("/check/:customerId", checkCustomerRisk);

// POST /api/fraud/check-return - Check fraud when return is submitted
router.post("/check-return", checkReturnFraudStatus);

export default router;
