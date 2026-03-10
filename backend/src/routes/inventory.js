// Inventory Routes
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getInventory,
  getInventoryBySku,
  createInventory,
  updateInventory,
  deleteInventory,
  getLowStockItems,
} from "../controllers/inventoryController.js";

const router = express.Router();

// GET /api/inventory - Get all inventory items
router.get("/", getInventory);

// GET /api/inventory/low-stock - Get low stock items
router.get("/low-stock", getLowStockItems);

// GET /api/inventory/:productSku - Get inventory by SKU
router.get("/:productSku", getInventoryBySku);

// POST /api/inventory - Create inventory item
router.post("/", createInventory);

// PATCH /api/inventory/:productSku - Update inventory
router.patch("/:productSku", updateInventory);

// DELETE /api/inventory/:productSku - Delete inventory item
router.delete("/:productSku", deleteInventory);

export default router;
