// Return Controller - Core Logic for Reverse Logistics
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  generateWaybill,
  getCourierTracking,
} from "../services/courierService.js";
import { processCourierWebhook } from "../services/webhookService.js";

// Generate return request number
const generateReturnNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RTR-${timestamp}-${random}`;
};

// POST /submit-return - Submit return request
// Validates order number and stores return request
export const submitReturn = async (req, res) => {
  try {
    const { orderNumber, reason, description, userId } = req.body;

    // Handle photo upload if present
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!orderNumber || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderNumber, reason",
      });
    }

    // For demo purposes, if userId is missing or is the demo placeholder,
    // find or create a demo user
    let validUserId = userId;
    if (!userId || userId === "demo-user-id") {
      const demoUser = await prisma.user.findFirst({
        where: { email: "admin@reroute.id" },
      });
      if (demoUser) {
        validUserId = demoUser.id;
      } else {
        // Create a demo user if not exists
        const newUser = await prisma.user.create({
          data: {
            email: "demo@reroute.id",
            name: "Demo User",
            businessName: "Demo Store",
          },
        });
        validUserId = newUser.id;
      }
    }

    // Validate order exists
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: validUserId,
      },
    });

    // If not found with userId, try to find any order with that orderNumber
    const orderByNumber = await prisma.order.findFirst({
      where: { orderNumber },
    });

    // Use the found order if exists
    const finalOrder = order || orderByNumber;

    if (!finalOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your order number.",
      });
    }

    // Check if order is eligible for return (not already returned)
    if (finalOrder.status === "returned") {
      return res.status(400).json({
        success: false,
        message: "This order has already been returned.",
      });
    }

    // Check if there's already a pending return request
    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId: finalOrder.id,
        status: { in: ["pending", "approved", "shipped"] },
      },
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: "A return request already exists for this order.",
      });
    }

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        returnNumber: generateReturnNumber(),
        reason,
        description,
        photoUrl,
        status: "pending",
        orderId: finalOrder.id,
        userId: validUserId,
      },
    });

    // Update order status to indicate return in progress
    await prisma.order.update({
      where: { id: finalOrder.id },
      data: { status: "returned" },
    });

    res.status(201).json({
      success: true,
      message:
        "Return request submitted successfully. Please wait for admin approval.",
      data: {
        returnNumber: returnRequest.returnNumber,
        status: returnRequest.status,
        orderNumber: finalOrder.orderNumber,
      },
    });

    console.log(
      `📝 New return request: ${returnRequest.returnNumber} for order ${orderNumber}`,
    );
  } catch (error) {
    console.error("Error submitting return:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit return request",
      error: error.message,
    });
  }
};

// PATCH /approve-return - Approve return & generate waybill
// Simulates courier API integration
export const approveReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { courierName } = req.body;

    // Validate required fields
    if (!courierName) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: courierName",
      });
    }

    // Find return request
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: true },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Check current status
    if (returnRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve return with status: ${returnRequest.status}`,
      });
    }

    // 🚀 AUTOMATION: Call Courier API to generate waybill
    const courierResult = await generateWaybill({
      sender: {
        name: returnRequest.order.customerName,
        phone: returnRequest.order.customerPhone,
        address: "Jl. Konsumen No. 123, Kota Surabaya",
      },
      recipient: {
        name: "Re-Route Warehouse",
        phone: "+62812345678",
        address: "Jl. Gudang Logistik No. 45, Kota Surabaya",
      },
      package: {
        weight: 1, // kg
        description: `Return: ${returnRequest.order.productName}`,
      },
    });

    // Update return request with courier info
    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "approved",
        courierName,
        waybillNumber: courierResult.waybillNumber,
        waybillLabelUrl: courierResult.labelUrl,
        shippingCost: courierResult.shippingCost,
        processedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Return approved. Waybill generated successfully.",
      data: {
        returnNumber: updatedReturn.returnNumber,
        status: updatedReturn.status,
        courierName: updatedReturn.courierName,
        waybillNumber: updatedReturn.waybillNumber,
        waybillLabelUrl: updatedReturn.waybillLabelUrl,
        shippingCost: updatedReturn.shippingCost,
      },
    });

    console.log(`✅ Return approved: ${updatedReturn.returnNumber}`);
    console.log(`📦 Waybill generated: ${courierResult.waybillNumber}`);
  } catch (error) {
    console.error("Error approving return:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve return",
      error: error.message,
    });
  }
};

// POST /webhook-courier - Receive courier status updates
export const courierWebhook = async (req, res) => {
  try {
    const { waybillNumber, status, location, timestamp } = req.body;

    console.log(
      `📡 Webhook received: Waybill ${waybillNumber} - Status: ${status}`,
    );

    // Process the webhook
    const result = await processCourierWebhook({
      waybillNumber,
      status,
      location,
      timestamp,
    });

    res.json({
      success: true,
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process webhook",
      error: error.message,
    });
  }
};

// GET / - Get all return requests (for admin)
export const getReturns = async (req, res) => {
  try {
    const { userId, status } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const returns = await prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            name: true,
            businessName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: returns,
    });
  } catch (error) {
    console.error("Error fetching returns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch return requests",
      error: error.message,
    });
  }
};

// GET /:returnId - Get single return request
export const getReturnById = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: true,
      },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    res.json({
      success: true,
      data: returnRequest,
    });
  } catch (error) {
    console.error("Error fetching return:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch return request",
      error: error.message,
    });
  }
};

// PATCH /reject-return - Reject return request
export const rejectReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { reason } = req.body;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Update return status
    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "rejected",
        description: reason
          ? `${returnRequest.description}\n\nRejected: ${reason}`
          : returnRequest.description,
      },
    });

    // Restore order status
    await prisma.order.update({
      where: { id: returnRequest.orderId },
      data: { status: "delivered" },
    });

    res.json({
      success: true,
      message: "Return request rejected",
      data: updated,
    });
  } catch (error) {
    console.error("Error rejecting return:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject return",
      error: error.message,
    });
  }
};
