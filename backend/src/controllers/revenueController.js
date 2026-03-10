// Revenue Controller - Platform Owner Dashboard
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// GET /api/revenue/dashboard - Get revenue dashboard data
export const getRevenueDashboard = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all transactions in period
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      // Note: Transaction does not have store relation in schema
    });

    // Calculate metrics
    const metrics = calculateMetrics(transactions, daysAgo);

    // Get subscription stats
    const subscriptionStats = await getSubscriptionStats();

    // Get logistics kickback data
    const kickbackStats = await getKickbackStats(startDate);

    // Get merchant count
    const merchantCount = await prisma.user.count({
      where: { role: "merchant" },
    });

    // Get active stores
    const activeStores = await prisma.store.count({
      where: { isActive: true },
    });

    // Get transaction trends (daily)
    const trends = await getTransactionTrends(startDate);

    res.json({
      success: true,
      data: {
        period: `${daysAgo} days`,
        metrics,
        subscriptionStats,
        kickbackStats,
        merchantCount,
        activeStores,
        trends,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue dashboard",
      error: error.message,
    });
  }
};

// Calculate revenue metrics
const calculateMetrics = (transactions, daysAgo) => {
  const now = new Date();
  const previousPeriodStart = new Date();
  previousPeriodStart.setDate(previousPeriodStart.getDate() - daysAgo * 2);
  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(currentPeriodStart.getDate() - daysAgo);

  // Separate current and previous period
  const currentPeriod = transactions.filter(
    (t) => new Date(t.createdAt) >= currentPeriodStart,
  );
  const previousPeriod = transactions.filter(
    (t) =>
      new Date(t.createdAt) >= previousPeriodStart &&
      new Date(t.createdAt) < currentPeriodStart,
  );

  // Calculate totals
  const calculateTotal = (txns, type) =>
    txns
      .filter((t) => t.type === type && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

  const currentTotal = {
    subscription: calculateTotal(currentPeriod, "subscription_fee"),
    service: calculateTotal(currentPeriod, "service_fee"),
    kickback: calculateTotal(currentPeriod, "logistics_kickback"),
  };

  const previousTotal = {
    subscription: calculateTotal(previousPeriod, "subscription_fee"),
    service: calculateTotal(previousPeriod, "service_fee"),
    kickback: calculateTotal(previousPeriod, "logistics_kickback"),
  };

  // Calculate growth
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    totalRevenue: {
      current: Object.values(currentTotal).reduce((a, b) => a + b, 0),
      previous: Object.values(previousTotal).reduce((a, b) => a + b, 0),
      growth: calculateGrowth(
        Object.values(currentTotal).reduce((a, b) => a + b, 0),
        Object.values(previousTotal).reduce((a, b) => a + b, 0),
      ),
    },
    subscriptionFee: {
      current: currentTotal.subscription,
      previous: previousTotal.subscription,
      growth: calculateGrowth(
        currentTotal.subscription,
        previousTotal.subscription,
      ),
    },
    serviceFee: {
      current: currentTotal.service,
      previous: previousTotal.service,
      growth: calculateGrowth(currentTotal.service, previousTotal.service),
    },
    logisticsKickback: {
      current: currentTotal.kickback,
      previous: previousTotal.kickback,
      growth: calculateGrowth(currentTotal.kickback, previousTotal.kickback),
    },
    transactionCount: {
      completed: transactions.filter((t) => t.status === "completed").length,
      pending: transactions.filter((t) => t.status === "pending").length,
      failed: transactions.filter((t) => t.status === "failed").length,
    },
  };
};

// Get subscription statistics
const getSubscriptionStats = async () => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "active",
    },
  });

  const planCounts = {};
  let totalMRR = 0;

  subscriptions.forEach((sub) => {
    planCounts[sub.plan] = (planCounts[sub.plan] || 0) + 1;
    totalMRR += sub.monthlyPrice;
  });

  return {
    totalSubscriptions: subscriptions.length,
    byPlan: planCounts,
    monthlyRecurringRevenue: totalMRR,
    estimatedARR: totalMRR * 12,
  };
};

// Get logistics kickback statistics
const getKickbackStats = async (startDate) => {
  const returns = await prisma.returnRequest.findMany({
    where: {
      status: "received",
      receivedAt: {
        gte: startDate,
      },
    },
    select: {
      courierName: true,
      shippingCost: true,
    },
  });

  // Estimate kickback (typically 5-15% of shipping cost)
  const KICKBACK_RATE = 0.1; // 10%

  const byCourier = {};
  let totalKickback = 0;

  returns.forEach((r) => {
    const courier = r.courierName || "unknown";
    if (!byCourier[courier]) {
      byCourier[courier] = { count: 0, shippingCost: 0, kickback: 0 };
    }
    byCourier[courier].count++;
    byCourier[courier].shippingCost += r.shippingCost || 0;
    byCourier[courier].kickback += (r.shippingCost || 0) * KICKBACK_RATE;
    totalKickback += (r.shippingCost || 0) * KICKBACK_RATE;
  });

  return {
    totalReturns: returns.length,
    estimatedTotalKickback: totalKickback,
    byCourier,
    assumedKickbackRate: `${KICKBACK_RATE * 100}%`,
  };
};

// Get transaction trends (daily)
const getTransactionTrends = async (startDate) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
      status: "completed",
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyData = {};
  transactions.forEach((t) => {
    const date = new Date(t.createdAt).toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        subscription: 0,
        service: 0,
        kickback: 0,
        total: 0,
      };
    }
    dailyData[date][
      t.type === "subscription_fee"
        ? "subscription"
        : t.type === "service_fee"
          ? "service"
          : "kickback"
    ] += t.amount;
    dailyData[date].total += t.amount;
  });

  return Object.values(dailyData);
};

// GET /api/revenue/transactions - Get transaction list
export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate,
    } = req.query;

    const where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        // Note: Transaction does not have store relation in schema
        orderBy: { createdAt: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// POST /api/revenue/record - Record a new transaction
export const recordTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      currency,
      description,
      metadata,
      storeId,
      returnId,
      platformOwnerId,
    } = req.body;

    if (!type || !amount || !platformOwnerId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: type, amount, platformOwnerId",
      });
    }

    const validTypes = [
      "subscription_fee",
      "service_fee",
      "logistics_kickback",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        currency: currency || "IDR",
        status: "completed", // Auto-complete for now
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        storeId: storeId || null,
        returnId: returnId || null,
        platformOwnerId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Transaction recorded successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error recording transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record transaction",
      error: error.message,
    });
  }
};

// GET /api/revenue/merchants - Get merchant revenue breakdown
export const getMerchantRevenue = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all stores with their transaction totals
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          where: {
            createdAt: { gte: startDate },
            status: "completed",
          },
        },
        _count: {
          select: {
            returnRequests: true,
            orders: true,
          },
        },
      },
    });

    // Calculate revenue per store
    const merchantRevenue = stores
      .map((store) => {
        const revenue = store.transactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );
        return {
          storeId: store.id,
          storeName: store.name,
          merchantName: store.user.name,
          merchantEmail: store.user.email,
          totalRevenue: revenue,
          orderCount: store._count.orders,
          returnCount: store._count.returnRequests,
          returnRate:
            store._count.orders > 0
              ? (
                  (store._count.returnRequests / store._count.orders) *
                  100
                ).toFixed(2)
              : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      success: true,
      data: {
        period: `${daysAgo} days`,
        merchants: merchantRevenue,
        totalMerchants: merchantRevenue.length,
        totalRevenue: merchantRevenue.reduce(
          (sum, m) => sum + m.totalRevenue,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching merchant revenue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch merchant revenue",
      error: error.message,
    });
  }
};

// GET /api/revenue/export - Export revenue report
export const exportRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      // Note: Transaction does not have store relation in schema
      orderBy: { createdAt: "asc" },
    });

    // Calculate summary
    const summary = {
      totalRevenue: transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length,
      byType: {},
      byStatus: {},
    };

    transactions.forEach((t) => {
      summary.byType[t.type] = (summary.byType[t.type] || 0) + t.amount;
      summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        period: { startDate, endDate },
        summary,
        transactions,
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error exporting revenue report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export revenue report",
      error: error.message,
    });
  }
};
