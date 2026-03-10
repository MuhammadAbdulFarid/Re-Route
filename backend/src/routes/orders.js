// Order Routes
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  createOrder,
  getOrders,
  getOrderByNumber,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// POST /api/orders - Create new order
router.post("/", createOrder);

// GET /api/orders - Get all orders (with optional filters)
router.get("/", getOrders);

// GET /api/orders/:orderNumber - Get order by number
router.get("/:orderNumber", getOrderByNumber);

// PATCH /api/orders/:orderId - Update order status
router.patch("/:orderId", updateOrderStatus);

export default router;
