// AI Consultation Controller
// Re-Route - Reverse Logistics SaaS Platform

import {
  processConsultation,
  getConsultationHistory,
  getAIInsights,
} from "../services/aiConsultationService.js";

// POST /api/ai/consult - Process AI consultation message
export const consultAI = async (req, res) => {
  try {
    const { userId, storeId, message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await processConsultation(
      userId,
      storeId || null,
      message,
      context || {},
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.response,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in AI consultation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process consultation",
      error: error.message,
    });
  }
};

// GET /api/ai/insights/:storeId - Get AI insights for a store
export const getInsights = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    const insights = await getAIInsights(storeId);

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: "Store not found or no data available",
      });
    }

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Error getting AI insights:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI insights",
      error: error.message,
    });
  }
};

// GET /api/ai/history - Get consultation history
export const getHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const history = await getConsultationHistory(userId, parseInt(limit));

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error getting consultation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get consultation history",
      error: error.message,
    });
  }
};
