// Fraud Controller - Fraud Detection & Alerts
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  analyzeCustomerFraudRisk,
  checkReturnFraud,
  getFraudAlerts,
  resolveFraudAlert,
  getFraudStats,
} from "../services/fraudDetectionService.js";

// GET /api/fraud/dashboard - Get fraud detection dashboard
export const getFraudDashboard = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get fraud statistics
    const platformOwner = await prisma.platformOwner.findFirst();

    if (!platformOwner) {
      return res.json({
        success: true,
        data: {
          stats: {
            total: 0,
            open: 0,
            critical: 0,
            high: 0,
          },
          recentAlerts: [],
          riskDistribution: {},
        },
      });
    }

    const stats = await getFraudStats(platformOwner.id, {
      startDate,
      endDate: new Date(),
    });

    // Get recent high severity alerts
    const recentAlerts = await prisma.fraudAlert.findMany({
      where: {
        platformOwnerId: platformOwner.id,
        severity: { in: ["critical", "high"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get customers with high risk
    const merchants = await prisma.user.findMany({
      where: { role: "merchant" },
      select: { id: true },
    });

    const customerRisks = [];
    for (const merchant of merchants.slice(0, 5)) {
      const risk = await analyzeCustomerFraudRisk(merchant.id);
      if (risk.riskLevel !== "low") {
        customerRisks.push(risk);
      }
    }

    res.json({
      success: true,
      data: {
        stats,
        recentAlerts,
        highRiskCustomers: customerRisks,
      },
    });
  } catch (error) {
    console.error("Error fetching fraud dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fraud dashboard",
      error: error.message,
    });
  }
};

// GET /api/fraud/alerts - Get fraud alerts
export const getAlerts = async (req, res) => {
  try {
    const { status, severity, limit = 50 } = req.query;

    const platformOwner = await prisma.platformOwner.findFirst();

    if (!platformOwner) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const alerts = await getFraudAlerts(platformOwner.id, {
      status,
      severity,
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching fraud alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fraud alerts",
      error: error.message,
    });
  }
};

// GET /api/fraud/alerts/:alertId - Get single alert details
export const getAlertDetails = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await prisma.fraudAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Get related return if exists
    let relatedReturn = null;
    if (alert.returnId) {
      relatedReturn = await prisma.returnRequest.findUnique({
        where: { id: alert.returnId },
        include: { order: true },
      });
    }

    res.json({
      success: true,
      data: {
        ...alert,
        evidence: alert.evidence ? JSON.parse(alert.evidence) : null,
        relatedReturn,
      },
    });
  } catch (error) {
    console.error("Error fetching alert details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alert details",
      error: error.message,
    });
  }
};

// PATCH /api/fraud/alerts/:alertId - Update alert status
export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const validStatuses = ["open", "investigating", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    let result;
    if (status === "resolved" || status === "dismissed") {
      result = await resolveFraudAlert(
        alertId,
        resolution || `Alert ${status}`,
      );
    } else {
      result = await prisma.fraudAlert.update({
        where: { id: alertId },
        data: { status },
      });
    }

    res.json({
      success: true,
      message: `Alert ${status} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update alert",
      error: error.message,
    });
  }
};

// GET /api/fraud/check/:customerId - Check fraud risk for a customer
export const checkCustomerRisk = async (req, res) => {
  try {
    const { customerId } = req.params;

    const riskAnalysis = await analyzeCustomerFraudRisk(customerId);

    res.json({
      success: true,
      data: riskAnalysis,
    });
  } catch (error) {
    console.error("Error checking customer risk:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check customer risk",
      error: error.message,
    });
  }
};

// POST /api/fraud/check-return - Check fraud when return is submitted
export const checkReturnFraudStatus = async (req, res) => {
  try {
    const { returnId } = req.body;

    if (!returnId) {
      return res.status(400).json({
        success: false,
        message: "returnId is required",
      });
    }

    const riskAnalysis = await checkReturnFraud(returnId);

    res.json({
      success: true,
      data: riskAnalysis,
    });
  } catch (error) {
    console.error("Error checking return fraud:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check return fraud",
      error: error.message,
    });
  }
};

// GET /api/fraud/stats - Get fraud statistics
export const getStats = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const platformOwner = await prisma.platformOwner.findFirst();

    if (!platformOwner) {
      return res.json({
        success: true,
        data: {
          total: 0,
          open: 0,
          resolved: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        },
      });
    }

    const stats = await getFraudStats(platformOwner.id, {
      startDate,
      endDate: new Date(),
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching fraud stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fraud statistics",
      error: error.message,
    });
  }
};
