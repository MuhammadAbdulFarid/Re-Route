// Store Controller - Multi-Store Management
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

// Generate unique slug from store name
const generateSlug = (name) => {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36)
  );
};

// GET /api/stores - Get all stores for a user
export const getStores = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const stores = await prisma.store.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            orders: true,
            returnRequests: true,
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
};

// GET /api/stores/:storeId - Get single store
export const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orders: true,
            returnRequests: true,
            inventory: true,
            marketplaceConnections: true,
          },
        },
        marketplaceConnections: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

// GET /api/stores/slug/:slug - Get store by slug (for white-label)
export const getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Return minimal info for white-label (no sensitive data)
    res.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logo: store.logo,
        description: store.description,
        address: store.address,
        phone: store.phone,
        email: store.email,
        ownerName: store.user.name,
      },
    });
  } catch (error) {
    console.error("Error fetching store by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

// POST /api/stores - Create new store
export const createStore = async (req, res) => {
  try {
    const { name, description, address, phone, email, logo, userId } = req.body;

    // Validate required fields
    if (!name || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, userId",
      });
    }

    // Check user exists and is authorized, or create demo user if not found
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create a demo user for demo purposes
    if (!user) {
      console.log(`Creating demo user with ID: ${userId}`);
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `demo-${Date.now()}@reroute.id`,
          name: "Demo User",
          password: await bcrypt.hash("demo123", 10),
          role: "merchant",
        },
      });
      console.log(`✅ Demo user created: ${user.id}`);
    }

    // Check store limit based on subscription (simplified)
    const existingStores = await prisma.store.count({
      where: { userId },
    });

    if (existingStores >= 3) {
      return res.status(400).json({
        success: false,
        message: "Store limit reached. Please upgrade your plan.",
      });
    }

    // Generate unique slug
    const slug = generateSlug(name);

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        description,
        address,
        phone,
        email,
        logo,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });

    console.log(`🏪 New store created: ${store.name} - ${store.slug}`);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create store",
      error: error.message,
    });
  }
};

// PATCH /api/stores/:storeId - Update store
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, description, address, phone, email, logo, isActive } =
      req.body;

    // Check store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // If name is being changed, generate new slug
    let slug = existingStore.slug;
    if (name && name !== existingStore.name) {
      slug = generateSlug(name);
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: name || existingStore.name,
        slug,
        description,
        address,
        phone,
        email,
        logo,
        isActive: isActive !== undefined ? isActive : existingStore.isActive,
      },
    });

    res.json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });

    console.log(`🏪 Store updated: ${store.name}`);
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};

// DELETE /api/stores/:storeId - Delete store
export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check store exists
    const existingStore = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Check if store has data
    const orderCount = await prisma.order.count({
      where: { storeId },
    });

    if (orderCount > 0) {
      // Soft delete instead of hard delete
      await prisma.store.update({
        where: { id: storeId },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: "Store deactivated (has existing data)",
      });
    }

    // Hard delete if no data
    await prisma.store.delete({
      where: { id: storeId },
    });

    res.json({
      success: true,
      message: "Store deleted successfully",
    });

    console.log(`🏪 Store deleted: ${existingStore.name}`);
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: error.message,
    });
  }
};

// GET /api/stores/:storeId/stats - Get store statistics
export const getStoreStats = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Get various statistics
    const [
      totalOrders,
      totalReturns,
      pendingReturns,
      completedReturns,
      totalInventory,
      lowStockItems,
    ] = await Promise.all([
      prisma.order.count({ where: { storeId } }),
      prisma.returnRequest.count({ where: { storeId } }),
      prisma.returnRequest.count({ where: { storeId, status: "pending" } }),
      prisma.returnRequest.count({ where: { storeId, status: "received" } }),
      prisma.inventory.count({ where: { storeId } }),
      prisma.inventory.count({
        where: {
          storeId,
          quantity: { lt: prisma.inventory.fields.minStock },
        },
      }),
    ]);

    // Calculate return rate
    const returnRate = totalOrders > 0 ? (totalReturns / totalOrders) * 100 : 0;

    res.json({
      success: true,
      data: {
        storeId,
        storeName: store.name,
        orders: {
          total: totalOrders,
        },
        returns: {
          total: totalReturns,
          pending: pendingReturns,
          completed: completedReturns,
          rate: parseFloat(returnRate.toFixed(2)),
        },
        inventory: {
          total: totalInventory,
          lowStock: lowStockItems,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching store stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store statistics",
      error: error.message,
    });
  }
};
