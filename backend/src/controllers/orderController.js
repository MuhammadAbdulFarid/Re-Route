// Order Controller
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Create new order (simulating order from e-commerce)
export const createOrder = async (req, res) => {
  try {
    const {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      productName,
      productSku,
      quantity,
      price,
      userId,
    } = req.body;

    // Validate required fields
    if (
      !orderNumber ||
      !customerName ||
      !customerPhone ||
      !productName ||
      !price ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: orderNumber, customerName, customerPhone, productName, price, userId",
      });
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order with this number already exists",
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        productName,
        productSku,
        quantity: quantity || 1,
        price: parseFloat(price),
        status: "pending",
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get orders for a user (admin)
export const getOrders = async (req, res) => {
  try {
    const { userId, status } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        returnRequests: true,
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get single order by order number
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        returnRequests: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "shipped",
      "delivered",
      "returned",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message,
    });
  }
};
