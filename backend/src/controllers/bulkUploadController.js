// Bulk Upload Controller - Manual Order Entry & CSV Import
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  processBulkUpload,
  getSampleCSVTemplate,
} from "../services/bulkUploadService.js";

// POST /api/bulk/upload - Handle bulk order upload
export const uploadBulkOrders = async (req, res) => {
  try {
    const { userId, storeId, source } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Handle file upload
    let fileData = null;

    if (req.file) {
      // Multer has already saved the file
      const fs = await import("fs");
      const content = fs.readFileSync(req.file.path, "utf-8");
      fileData = {
        filename: req.file.originalname,
        content,
      };
    } else if (req.body.csvContent) {
      // Raw CSV content in body
      fileData = {
        filename: "upload.csv",
        content: req.body.csvContent,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or CSV content provided",
      });
    }

    // Process the bulk upload
    const results = await processBulkUpload(
      fileData,
      userId,
      storeId,
      source || "manual",
    );

    // Clean up uploaded file
    if (req.file) {
      const fs = await import("fs");
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Could not delete uploaded file:", e.message);
      }
    }

    res.json({
      success: true,
      message: `Bulk upload completed. ${results.success.length} orders imported, ${results.duplicates.length} duplicates skipped, ${results.failed.length} failed.`,
      data: results,
    });

    console.log(
      `📊 Bulk upload completed: ${results.success.length} orders imported`,
    );
  } catch (error) {
    console.error("Error uploading bulk orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
};

// GET /api/bulk/template - Get sample CSV template
export const getTemplate = async (req, res) => {
  try {
    const template = getSampleCSVTemplate();

    // Return as JSON for frontend to handle download
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate template",
      error: error.message,
    });
  }
};

// POST /api/bulk/validate - Validate CSV without importing
export const validateBulkData = async (req, res) => {
  try {
    const { csvContent, filename } = req.body;

    if (!csvContent) {
      return res.status(400).json({
        success: false,
        message: "csvContent is required",
      });
    }

    const fileData = {
      filename: filename || "validation.csv",
      content: csvContent,
    };

    // Parse the data without importing
    const { parseCSV, validateOrder } =
      await import("../services/bulkUploadService.js");

    const orders = await parseCSV(csvContent);

    // Validate each order
    const validationResults = {
      valid: [],
      invalid: [],
      total: orders.length,
    };

    for (const order of orders) {
      const validation = validateOrder(order);
      if (validation.isValid) {
        validationResults.valid.push(order);
      } else {
        validationResults.invalid.push({
          order,
          errors: validation.errors,
        });
      }
    }

    res.json({
      success: true,
      data: validationResults,
    });
  } catch (error) {
    console.error("Error validating bulk data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate data",
      error: error.message,
    });
  }
};

// GET /api/bulk/history - Get upload history
export const getUploadHistory = async (req, res) => {
  try {
    const { userId, storeId, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Get orders created recently (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const where = {
      userId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    // Get recent orders grouped by source
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        source: true,
        customerName: true,
        productName: true,
        price: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    // Count by source
    const sourceCounts = await prisma.order.groupBy({
      by: ["source"],
      where,
      _count: {
        id: true,
      },
    });

    res.json({
      success: true,
      data: {
        recentOrders: orders,
        sourceCounts: sourceCounts.reduce(
          (acc, item) => ({
            ...acc,
            [item.source]: item._count.id,
          }),
          {},
        ),
      },
    });
  } catch (error) {
    console.error("Error getting upload history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upload history",
      error: error.message,
    });
  }
};

// POST /api/orders/bulk - Alternative endpoint for bulk order creation
export const createBulkOrders = async (req, res) => {
  try {
    const { orders, userId, storeId, source } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orders array is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const results = {
      success: [],
      failed: [],
      duplicates: [],
    };

    for (const order of orders) {
      // Check for duplicate
      const existing = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
      });

      if (existing) {
        results.duplicates.push({
          orderNumber: order.orderNumber,
          existingId: existing.id,
        });
        continue;
      }

      try {
        const newOrder = await prisma.order.create({
          data: {
            orderNumber: order.orderNumber,
            source: source || "manual",
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail || null,
            productName: order.productName,
            productSku: order.productSku || null,
            quantity: order.quantity || 1,
            price: parseFloat(order.price),
            status: "pending",
            userId,
            storeId: storeId || null,
          },
        });

        results.success.push({
          orderNumber: order.orderNumber,
          id: newOrder.id,
        });
      } catch (error) {
        results.failed.push({
          orderNumber: order.orderNumber,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Created ${results.success.length} orders. ${results.duplicates.length} duplicates skipped. ${results.failed.length} failed.`,
      data: results,
    });
  } catch (error) {
    console.error("Error creating bulk orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bulk orders",
      error: error.message,
    });
  }
};
