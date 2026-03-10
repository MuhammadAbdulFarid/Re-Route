// Fraud Detection Service - Detect Suspicious Return Patterns
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Fraud detection thresholds
const FRAUD_THRESHOLDS = {
  // Maximum returns per customer in last 30 days before flagging
  MAX_RETURNS_30_DAYS: 5,

  // Minimum order value to consider for fraud (IDR)
  MIN_ORDER_VALUE: 50000,

  // Maximum return rate percentage before flagging
  MAX_RETURN_RATE: 50,

  // Days to look back for pattern analysis
  LOOKBACK_DAYS: 30,

  // Suspicious time window (hours between returns)
  SUSPICIOUS_TIME_WINDOW: 24,
};

// Check if a customer has suspicious return patterns
export const analyzeCustomerFraudRisk = async (customerId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all returns for this customer in last 30 days
  const recentReturns = await prisma.returnRequest.findMany({
    where: {
      userId: customerId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      order: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Get total orders for this customer
  const totalOrders = await prisma.order.count({
    where: { userId: customerId },
  });

  // Get completed returns
  const completedReturns = await prisma.returnRequest.count({
    where: {
      userId: customerId,
      status: "received",
    },
  });

  // Calculate return rate
  const returnRate =
    totalOrders > 0 ? (completedReturns / totalOrders) * 100 : 0;

  // Risk factors
  const riskFactors = [];
  let riskScore = 0;

  // Check 1: Too many returns
  if (recentReturns.length >= FRAUD_THRESHOLDS.MAX_RETURNS_30_DAYS) {
    riskFactors.push({
      type: "excessive_returns",
      severity: "high",
      message: `Customer has ${recentReturns.length} returns in last 30 days`,
      points: 40,
    });
    riskScore += 40;
  } else if (recentReturns.length >= 3) {
    riskFactors.push({
      type: "frequent_returns",
      severity: "medium",
      message: `Customer has ${recentReturns.length} returns in last 30 days`,
      points: 20,
    });
    riskScore += 20;
  }

  // Check 2: High return rate
  if (returnRate >= FRAUD_THRESHOLDS.MAX_RETURN_RATE) {
    riskFactors.push({
      type: "high_return_rate",
      severity: "high",
      message: `Customer return rate is ${returnRate.toFixed(1)}%`,
      points: 30,
    });
    riskScore += 30;
  } else if (returnRate >= 30) {
    riskFactors.push({
      type: "elevated_return_rate",
      severity: "medium",
      message: `Customer return rate is ${returnRate.toFixed(1)}%`,
      points: 15,
    });
    riskScore += 15;
  }

  // Check 3: Same reason pattern
  const reasonCounts = {};
  recentReturns.forEach((r) => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  });

  const maxReasonCount = Math.max(...Object.values(reasonCounts));
  if (maxReasonCount >= 3) {
    const suspiciousReason = Object.keys(reasonCounts).find(
      (r) => reasonCounts[r] === maxReasonCount,
    );
    riskFactors.push({
      type: "same_reason_pattern",
      severity: "medium",
      message: `Customer returned ${maxReasonCount} items with same reason: ${suspiciousReason}`,
      points: 20,
    });
    riskScore += 20;
  }

  // Check 4: Quick succession returns
  for (let i = 1; i < recentReturns.length; i++) {
    const timeDiff =
      new Date(recentReturns[i].createdAt) -
      new Date(recentReturns[i - 1].createdAt);
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < FRAUD_THRESHOLDS.SUSPICIOUS_TIME_WINDOW) {
      riskFactors.push({
        type: "quick_succession",
        severity: "high",
        message: `Customer submitted returns within ${hoursDiff.toFixed(1)} hours`,
        points: 25,
      });
      riskScore += 25;
      break;
    }
  }

  // Check 5: Low value orders with high return rate
  const lowValueReturns = recentReturns.filter(
    (r) => r.order && r.order.price < FRAUD_THRESHOLDS.MIN_ORDER_VALUE,
  );
  if (lowValueReturns.length >= 3) {
    riskFactors.push({
      type: "low_value_returns",
      severity: "low",
      message: `${lowValueReturns.length} returns are from low-value orders`,
      points: 10,
    });
    riskScore += 10;
  }

  // Determine risk level
  let riskLevel = "low";
  if (riskScore >= 70) {
    riskLevel = "critical";
  } else if (riskScore >= 50) {
    riskLevel = "high";
  } else if (riskScore >= 25) {
    riskLevel = "medium";
  }

  return {
    customerId,
    riskLevel,
    riskScore,
    riskFactors,
    statistics: {
      totalOrders,
      totalReturns: recentReturns.length,
      completedReturns,
      returnRate: parseFloat(returnRate.toFixed(2)),
      analyzedPeriod: "30 days",
    },
    recentReturns: recentReturns.slice(0, 5).map((r) => ({
      returnNumber: r.returnNumber,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
};

// Create fraud alert for suspicious activity
export const createFraudAlert = async (data) => {
  const {
    customerId,
    returnId,
    type,
    severity,
    description,
    evidence,
    platformOwnerId,
  } = data;

  const alert = await prisma.fraudAlert.create({
    data: {
      type,
      severity,
      description,
      evidence: evidence ? JSON.stringify(evidence) : null,
      customerId,
      returnId: returnId || null,
      platformOwnerId,
      status: "open",
    },
  });

  console.log(`🚨 Fraud alert created: ${type} - ${severity} severity`);

  return alert;
};

// Run fraud detection check on a return
export const checkReturnFraud = async (returnId) => {
  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: true,
    },
  });

  if (!returnRequest) {
    throw new Error("Return request not found");
  }

  // Get customer's overall risk analysis
  const riskAnalysis = await analyzeCustomerFraudRisk(returnRequest.userId);

  // Check if we should create an alert
  if (
    riskAnalysis.riskLevel === "high" ||
    riskAnalysis.riskLevel === "critical"
  ) {
    // Check if alert already exists for this return
    const existingAlert = await prisma.fraudAlert.findFirst({
      where: {
        returnId,
        status: { in: ["open", "investigating"] },
      },
    });

    if (!existingAlert) {
      // Find platform owner (assuming first owner)
      const platformOwner = await prisma.platformOwner.findFirst();

      if (platformOwner) {
        await createFraudAlert({
          customerId: returnRequest.userId,
          returnId,
          type: "suspicious_return_pattern",
          severity: riskAnalysis.riskLevel,
          description: `Customer has ${riskAnalysis.statistics.totalReturns} returns with ${riskAnalysis.riskLevel} risk level. Return #${returnRequest.returnNumber} flagged.`,
          evidence: riskAnalysis,
          platformOwnerId: platformOwner.id,
        });
      }
    }
  }

  return riskAnalysis;
};

// Get fraud alerts for platform owner
export const getFraudAlerts = async (platformOwnerId, filters = {}) => {
  const where = { platformOwnerId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  const alerts = await prisma.fraudAlert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters.limit || 50,
  });

  return alerts;
};

// Resolve fraud alert
export const resolveFraudAlert = async (alertId, resolution, resolvedBy) => {
  const alert = await prisma.fraudAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error("Alert not found");
  }

  const updated = await prisma.fraudAlert.update({
    where: { id: alertId },
    data: {
      status: "resolved",
      resolution,
      resolvedAt: new Date(),
    },
  });

  console.log(`✅ Fraud alert resolved: ${alertId}`);

  return updated;
};

// Get fraud statistics
export const getFraudStats = async (platformOwnerId, dateRange) => {
  const where = { platformOwnerId };

  if (dateRange?.startDate && dateRange?.endDate) {
    where.createdAt = {
      gte: new Date(dateRange.startDate),
      lte: new Date(dateRange.endDate),
    };
  }

  const alerts = await prisma.fraudAlert.findMany({ where });

  const stats = {
    total: alerts.length,
    open: alerts.filter((a) => a.status === "open").length,
    investigating: alerts.filter((a) => a.status === "investigating").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    dismissed: alerts.filter((a) => a.status === "dismissed").length,
    bySeverity: {
      critical: alerts.filter((a) => a.severity === "critical").length,
      high: alerts.filter((a) => a.severity === "high").length,
      medium: alerts.filter((a) => a.severity === "medium").length,
      low: alerts.filter((a) => a.severity === "low").length,
    },
    byType: {},
  };

  // Count by type
  alerts.forEach((a) => {
    stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
  });

  return stats;
};

export default {
  analyzeCustomerFraudRisk,
  createFraudAlert,
  checkReturnFraud,
  getFraudAlerts,
  resolveFraudAlert,
  getFraudStats,
};
