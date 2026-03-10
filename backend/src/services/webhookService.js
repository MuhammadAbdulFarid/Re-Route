// Webhook Service - Handles Courier Status Updates & Auto Inventory
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Map courier status to internal status
const statusMap = {
  PICKED_UP: "shipped",
  IN_TRANSIT: "shipped",
  AT_WAREHOUSE: "shipped",
  DELIVERED: "received",
  RETURNED: "received",
};

// Process courier webhook and auto-update inventory
export const processCourierWebhook = async (data) => {
  const { waybillNumber, status, location, timestamp } = data;

  console.log(`🔄 [Webhook] Processing: ${waybillNumber} -> ${status}`);

  // Find return request by waybill number
  const returnRequest = await prisma.returnRequest.findFirst({
    where: { waybillNumber },
    include: { order: true },
  });

  if (!returnRequest) {
    console.log(`⚠️ [Webhook] Waybill not found: ${waybillNumber}`);
    return {
      success: false,
      message: "Waybill not found",
    };
  }

  // Map courier status to internal status
  const internalStatus = statusMap[status] || returnRequest.status;

  // Update return request status
  const updatedReturn = await prisma.returnRequest.update({
    where: { id: returnRequest.id },
    data: {
      status: internalStatus,
      updatedAt: new Date(),
    },
  });

  // 🚀 AUTOMATION: If package is DELIVERED/RECEIVED, auto-update inventory
  if (status === "DELIVERED" || status === "RETURNED") {
    await autoUpdateInventory(returnRequest);
  }

  console.log(
    `✅ [Webhook] Updated return ${returnRequest.returnNumber} to status: ${internalStatus}`,
  );

  return {
    success: true,
    returnId: returnRequest.id,
    returnNumber: returnRequest.returnNumber,
    previousStatus: returnRequest.status,
    newStatus: internalStatus,
    inventoryUpdated: status === "DELIVERED" || status === "RETURNED",
  };
};

// Auto-update inventory when return is received
const autoUpdateInventory = async (returnRequest) => {
  try {
    const { order } = returnRequest;
    const productSku =
      order.productSku ||
      `SKU-${order.productName.substring(0, 3).toUpperCase()}`;

    // Find inventory item
    let inventory = await prisma.inventory.findUnique({
      where: { productSku },
    });

    if (inventory) {
      // Update existing inventory (+1)
      const updatedInventory = await prisma.inventory.update({
        where: { productSku },
        data: {
          quantity: inventory.quantity + 1,
          lastRestocked: new Date(),
        },
      });

      console.log(
        `📦 [Inventory] Updated ${productSku}: ${inventory.quantity} -> ${updatedInventory.quantity}`,
      );
    } else {
      // Create new inventory entry
      await prisma.inventory.create({
        data: {
          productSku,
          productName: order.productName,
          quantity: 1,
          location: "GUDANG-UTAMA",
          userId: returnRequest.userId,
        },
      });

      console.log(`📦 [Inventory] Created new entry for ${productSku}: 1`);
    }

    // Update return request received timestamp
    await prisma.returnRequest.update({
      where: { id: returnRequest.id },
      data: { receivedAt: new Date() },
    });

    console.log(
      `🎉 [Automation] Return ${returnRequest.returnNumber} completed. Inventory auto-updated!`,
    );

    return { success: true };
  } catch (error) {
    console.error("❌ [Inventory] Auto-update failed:", error);
    return { success: false, error: error.message };
  }
};

// Generate webhook payload for testing
export const generateWebhookPayload = (waybillNumber, status) => {
  return {
    waybillNumber,
    status,
    location: "Surabaya Gudang",
    timestamp: new Date().toISOString(),
    courier: "JNE Express",
    description: getStatusDescription(status),
  };
};

const getStatusDescription = (status) => {
  const descriptions = {
    PICKED_UP: "Paket telah diambil oleh kurir",
    IN_TRANSIT: "Paket dalam perjalanan",
    AT_WAREHOUSE: "Paket arrived di gudang",
    DELIVERED: "Paket telah diterima",
    RETURNED: "Paket dikembalikan ke pengirim",
  };
  return descriptions[status] || "Status update";
};
