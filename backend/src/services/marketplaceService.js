// Marketplace Service - Integration with Shopee, Tokopedia, TikTok
// Re-Route - Reverse Logistics SaaS Platform

// Base API configurations for each marketplace
const MARKETPLACE_APIS = {
  shopee: {
    baseUrl: "https://partner.shopee.com",
    apiVersion: "v1",
    authType: "shopee_token",
  },
  tokopedia: {
    baseUrl: "https://tokopedia.com",
    apiVersion: "v1",
    authType: "tokopedia_oauth",
  },
  tiktok: {
    partnerId: process.env.TIKTOK_PARTNER_ID || "your_partner_id",
    apiUrl: "https://open.tiktokapis.com",
    authType: "tiktok_oauth",
  },
};

// Simulated marketplace API integrations
// In production, these would use actual API SDKs or REST calls

export class MarketplaceService {
  constructor(marketplace, credentials) {
    this.marketplace = marketplace;
    this.credentials = credentials;
    this.config = MARKETPLACE_APIS[marketplace];
  }

  // OAuth flow initiation
  async getAuthUrl() {
    const authUrls = {
      shopee: `https://partner.shopee.com/auth/v1/authorize?partner_id=${process.env.SHOPEE_PARTNER_ID}&redirect_uri=${encodeURIComponent(process.env.SHOPEE_REDIRECT_URI)}&state=`,
      tokopedia: `https://accounts.tokopedia.com/v1/auth/authorize?client_id=${process.env.TOKOPEDIA_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.TOKOPEDIA_REDIRECT_URI)}&scope=`,
      tiktok: `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(process.env.TIKTOK_REDIRECT_URI)}&scope=user.info.basic`,
    };

    return {
      url: authUrls[this.marketplace],
      state: this.generateState(),
    };
  }

  // Exchange code for access token
  async exchangeCodeForToken(code) {
    // Simulated token exchange
    // In production, this would make actual API call
    console.log(`🔗 Exchanging code for token: ${this.marketplace}`);

    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresIn: 3600 * 24 * 30, // 30 days
    };
  }

  // Refresh access token
  async refreshToken() {
    console.log(`🔄 Refreshing token: ${this.marketplace}`);

    return {
      accessToken: `refreshed_token_${Date.now()}`,
      refreshToken: `refreshed_refresh_token_${Date.now()}`,
      expiresIn: 3600 * 24 * 30,
    };
  }

  // Fetch orders from marketplace
  async fetchOrders(params = {}) {
    console.log(`📦 Fetching orders from ${this.marketplace}`, params);

    // Simulated order data - In production, this would call actual marketplace API
    const mockOrders = [
      {
        orderId: `ORD-${this.marketplace.toUpperCase()}-001`,
        orderNumber: `ORD-${Date.now()}-001`,
        customerName: "Budi Santoso",
        customerPhone: "+62812345678",
        customerEmail: "budi@example.com",
        productName: "Sepatu Sneakers Premium",
        productSku: "SEP-001-BLK-42",
        quantity: 1,
        price: 299000,
        status: "shipped",
        createdAt: new Date().toISOString(),
      },
      {
        orderId: `ORD-${this.marketplace.toUpperCase()}-002`,
        orderNumber: `ORD-${Date.now()}-002`,
        customerName: "Siti Rahayu",
        customerPhone: "+62898765432",
        customerEmail: "siti@example.com",
        productName: "Tas Ransel Canvas",
        productSku: "TAS-003-NVY",
        quantity: 2,
        price: 175000,
        status: "delivered",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return {
      success: true,
      orders: mockOrders,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: mockOrders.length,
      },
    };
  }

  // Sync single order to Re-Route system
  async syncOrder(orderData, userId, storeId) {
    // Transform order data to Re-Route format
    const formattedOrder = {
      orderNumber: orderData.orderNumber,
      source: this.marketplace,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      productName: orderData.productName,
      productSku: orderData.productSku,
      quantity: orderData.quantity,
      price: orderData.price,
      status: this.mapOrderStatus(orderData.status),
      userId,
      storeId,
    };

    return formattedOrder;
  }

  // Get return/refund data from marketplace
  async fetchReturns(params = {}) {
    console.log(`📤 Fetching returns from ${this.marketplace}`);

    // Simulated return data
    const mockReturns = [
      {
        returnId: `RET-${this.marketplace.toUpperCase()}-001`,
        orderId: `ORD-${this.marketplace.toUpperCase()}-001`,
        reason: "Barang Rusak",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ];

    return {
      success: true,
      returns: mockReturns,
    };
  }

  // Map marketplace status to Re-Route status
  mapOrderStatus(marketplaceStatus) {
    const statusMap = {
      // Shopee
      ORDER_PAID: "pending",
      ORDER_SHIPPED: "shipped",
      ORDER_DELIVERED: "delivered",
      ORDER_CANCELLED: "cancelled",

      // Tokopedia
      UNPAID: "pending",
      PAID: "pending",
      PROCESSED: "shipped",
      SHIPPED: "shipped",
      DELIVERED: "delivered",
      CLOSED: "cancelled",

      // TikTok
      PENDING: "pending",
      CONFIRMED: "pending",
      IN_TRANSIT: "shipped",
      DELIVERED: "delivered",
      COMPLETED: "delivered",
      CANCELLED: "cancelled",
    };

    return statusMap[marketplaceStatus] || "pending";
  }

  // Generate OAuth state
  generateState() {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Factory function to create marketplace service
export const createMarketplaceService = (marketplace, credentials) => {
  if (!MARKETPLACE_APIS[marketplace]) {
    throw new Error(`Unsupported marketplace: ${marketplace}`);
  }
  return new MarketplaceService(marketplace, credentials);
};

// Sync all connected marketplace orders
export const syncAllMarketplaceOrders = async (prisma, storeId) => {
  const connections = await prisma.marketplaceConnection.findMany({
    where: {
      storeId,
      isActive: true,
    },
  });

  const results = {
    success: [],
    failed: [],
    totalOrders: 0,
  };

  for (const connection of connections) {
    try {
      const service = createMarketplaceService(connection.marketplace, {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
      });

      const orders = await service.fetchOrders();
      results.success.push(connection.marketplace);
      results.totalOrders += orders.orders.length;

      // Update last sync time
      await prisma.marketplaceConnection.update({
        where: { id: connection.id },
        data: { lastSync: new Date() },
      });
    } catch (error) {
      console.error(`❌ Failed to sync ${connection.marketplace}:`, error);
      results.failed.push(connection.marketplace);
    }
  }

  return results;
};

export default {
  MarketplaceService,
  createMarketplaceService,
  syncAllMarketplaceOrders,
};
