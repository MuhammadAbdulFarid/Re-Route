// Marketplace Controller - Connect & Manage Marketplace Accounts
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  MarketplaceService,
  syncAllMarketplaceOrders,
} from "../services/marketplaceService.js";

// GET /api/marketplace/connections - Get all marketplace connections
export const getConnections = async (req, res) => {
  try {
    const { storeId } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    const connections = await prisma.marketplaceConnection.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    // Remove sensitive tokens from response
    const safeConnections = connections.map((conn) => ({
      ...conn,
      accessToken: conn.accessToken ? "***" : null,
      refreshToken: conn.refreshToken ? "***" : null,
    }));

    res.json({
      success: true,
      data: safeConnections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace connections",
      error: error.message,
    });
  }
};

// POST /api/marketplace/connect - Initiate OAuth connection
export const initiateConnection = async (req, res) => {
  try {
    const { marketplace, storeId } = req.body;

    if (!marketplace || !storeId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: marketplace, storeId",
      });
    }

    // Validate marketplace
    const validMarketplaces = ["shopee", "tokopedia", "tiktok"];
    if (!validMarketplaces.includes(marketplace)) {
      return res.status(400).json({
        success: false,
        message: `Invalid marketplace. Must be one of: ${validMarketplaces.join(", ")}`,
      });
    }

    // Check store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Check if already connected
    const existingConnection = await prisma.marketplaceConnection.findFirst({
      where: {
        storeId,
        marketplace,
        isActive: true,
      },
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: `${marketplace} is already connected to this store`,
      });
    }

    // Create service and get auth URL
    const service = new MarketplaceService(marketplace, {});
    const authData = await service.getAuthUrl();

    // Create pending connection record
    const connection = await prisma.marketplaceConnection.create({
      data: {
        marketplace,
        storeId,
        shopName: "Pending Authorization",
        shopId: "pending",
        isActive: false, // Will be activated after OAuth
      },
    });

    res.json({
      success: true,
      message: "OAuth initiated. Redirect user to auth URL.",
      data: {
        connectionId: connection.id,
        authUrl: authData.url,
        state: authData.state,
        marketplace,
      },
    });

    console.log(`🔗 Initiating ${marketplace} connection for store ${storeId}`);
  } catch (error) {
    console.error("Error initiating connection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate marketplace connection",
      error: error.message,
    });
  }
};

// POST /api/marketplace/callback - OAuth callback handler
export const handleCallback = async (req, res) => {
  try {
    const { marketplace, code, shopId, shopName, connectionId } = req.body;

    if (!connectionId || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: connectionId, code",
      });
    }

    // Get existing connection
    const connection = await prisma.marketplaceConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    // Exchange code for token
    const service = new MarketplaceService(marketplace, {});
    const tokenData = await service.exchangeCodeForToken(code);

    // Update connection with tokens
    const updatedConnection = await prisma.marketplaceConnection.update({
      where: { id: connectionId },
      data: {
        shopId: shopId || connection.shopId,
        shopName: shopName || connection.shopName,
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        tokenExpiry: new Date(Date.now() + tokenData.expiresIn * 1000),
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `${marketplace} connected successfully`,
      data: {
        connectionId: updatedConnection.id,
        shopName: updatedConnection.shopName,
        isActive: updatedConnection.isActive,
      },
    });

    console.log(`✅ ${marketplace} connected: ${updatedConnection.shopName}`);
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete OAuth flow",
      error: error.message,
    });
  }
};

// POST /api/marketplace/sync - Sync orders from marketplace
export const syncOrders = async (req, res) => {
  try {
    const { storeId, marketplace } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    // Get connections
    const where = { storeId, isActive: true };
    if (marketplace) {
      where.marketplace = marketplace;
    }

    const connections = await prisma.marketplaceConnection.findMany({
      where,
    });

    if (connections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active marketplace connections found",
      });
    }

    const results = [];

    for (const connection of connections) {
      try {
        const service = new MarketplaceService(connection.marketplace, {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        // Fetch orders from marketplace
        const orderData = await service.fetchOrders();

        // Save orders to database
        let syncedCount = 0;
        for (const order of orderData.orders) {
          const formattedOrder = await service.syncOrder(
            order,
            connection.storeId,
            connection.storeId,
          );

          // Check if order already exists
          const existingOrder = await prisma.order.findUnique({
            where: { orderNumber: formattedOrder.orderNumber },
          });

          if (!existingOrder) {
            await prisma.order.create({
              data: formattedOrder,
            });
            syncedCount++;
          }
        }

        // Update last sync time
        await prisma.marketplaceConnection.update({
          where: { id: connection.id },
          data: { lastSync: new Date() },
        });

        results.push({
          marketplace: connection.marketplace,
          shopName: connection.shopName,
          synced: syncedCount,
          status: "success",
        });
      } catch (error) {
        console.error(`Error syncing ${connection.marketplace}:`, error);
        results.push({
          marketplace: connection.marketplace,
          shopName: connection.shopName,
          status: "failed",
          error: error.message,
        });
      }
    }

    const totalSynced = results.reduce((sum, r) => sum + (r.synced || 0), 0);

    res.json({
      success: true,
      message: `Sync completed. ${totalSynced} new orders synced.`,
      data: {
        results,
        totalSynced,
      },
    });
  } catch (error) {
    console.error("Error syncing orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync orders",
      error: error.message,
    });
  }
};

// DELETE /api/marketplace/connections/:connectionId - Disconnect marketplace
export const disconnectMarketplace = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await prisma.marketplaceConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    await prisma.marketplaceConnection.update({
      where: { id: connectionId },
      data: {
        isActive: false,
        accessToken: null,
        refreshToken: null,
      },
    });

    res.json({
      success: true,
      message: `${connection.marketplace} disconnected successfully`,
    });

    console.log(`🔌 Disconnected ${connection.marketplace}`);
  } catch (error) {
    console.error("Error disconnecting marketplace:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disconnect marketplace",
      error: error.message,
    });
  }
};
