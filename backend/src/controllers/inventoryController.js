// Inventory Controller
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Get all inventory items for a user
export const getInventory = async (req, res) => {
  try {
    const { userId } = req.query;

    const where = {};
    if (userId) where.userId = userId;

    const inventory = await prisma.inventory.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// Get single inventory item by SKU
export const getInventoryBySku = async (req, res) => {
  try {
    const { productSku } = req.params;

    const item = await prisma.inventory.findUnique({
      where: { productSku },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in inventory",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
};

// Create inventory item
export const createInventory = async (req, res) => {
  try {
    const {
      productSku,
      productName,
      quantity,
      location,
      minStock,
      maxStock,
      userId,
    } = req.body;

    // Validate required fields
    if (!productSku || !productName || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productSku, productName, userId",
      });
    }

    // Check if SKU already exists
    const existing = await prisma.inventory.findUnique({
      where: { productSku },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists in inventory",
      });
    }

    const item = await prisma.inventory.create({
      data: {
        productSku,
        productName,
        quantity: quantity || 0,
        location: location || "GUDANG-UTAMA",
        minStock: minStock || 0,
        maxStock: maxStock || 1000,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created",
      data: item,
    });
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
};

// Update inventory quantity
export const updateInventory = async (req, res) => {
  try {
    const { productSku } = req.params;
    const { quantity, operation } = req.body; // operation: 'set', 'add', 'subtract'

    const item = await prisma.inventory.findUnique({
      where: { productSku },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in inventory",
      });
    }

    let newQuantity = item.quantity;

    switch (operation) {
      case "add":
        newQuantity = item.quantity + (quantity || 1);
        break;
      case "subtract":
        newQuantity = Math.max(0, item.quantity - (quantity || 1));
        break;
      case "set":
      default:
        newQuantity = quantity || item.quantity;
    }

    const updated = await prisma.inventory.update({
      where: { productSku },
      data: {
        quantity: newQuantity,
        lastRestocked: operation === "add" ? new Date() : item.lastRestocked,
      },
    });

    res.json({
      success: true,
      message: "Inventory updated",
      data: {
        productSku: updated.productSku,
        previousQuantity: item.quantity,
        currentQuantity: updated.quantity,
        change: updated.quantity - item.quantity,
      },
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory",
      error: error.message,
    });
  }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const { productSku } = req.params;

    await prisma.inventory.delete({
      where: { productSku },
    });

    res.json({
      success: true,
      message: "Inventory item deleted",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      error: error.message,
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const { userId } = req.query;

    const where = {};
    if (userId) where.userId = userId;

    const items = await prisma.inventory.findMany({
      where: {
        ...where,
        quantity: { lt: 10 }, // Less than 10 items
      },
      orderBy: { quantity: "asc" },
    });

    res.json({
      success: true,
      data: items,
      summary: {
        totalLowStock: items.length,
        critical: items.filter((i) => i.quantity === 0).length,
        warning: items.filter((i) => i.quantity > 0 && i.quantity < 5).length,
      },
    });
  } catch (error) {
    console.error("Error fetching low stock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
      error: error.message,
    });
  }
};
