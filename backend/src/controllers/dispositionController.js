// Disposition Controller - AI Smart Disposition
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  analyzeReturn,
  getDispositionSummary,
  batchAnalyzeReturns,
  getDispositionStats,
} from "../services/aiDispositionService.js";

// POST /api/disposition/analyze - Run AI analysis on a return
export const analyzeReturnDisposition = async (req, res) => {
  try {
    const { returnId } = req.body;

    if (!returnId) {
      return res.status(400).json({
        success: false,
        message: "returnId is required",
      });
    }

    // Check return exists
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Check if return has photo for analysis
    if (!returnRequest.photoUrl) {
      return res.status(400).json({
        success: false,
        message:
          "No photo available for AI analysis. Please upload a photo first.",
      });
    }

    // Run AI analysis
    const result = await analyzeReturn(returnId);

    res.json({
      success: true,
      message: "AI analysis completed",
      data: result,
    });

    console.log(
      `🤖 AI disposition for return ${returnRequest.returnNumber}: ${result.analysis.recommendation}`,
    );
  } catch (error) {
    console.error("Error analyzing disposition:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze disposition",
      error: error.message,
    });
  }
};

// GET /api/disposition/:returnId - Get disposition summary for a return
export const getDisposition = async (req, res) => {
  try {
    const { returnId } = req.params;

    const summary = await getDispositionSummary(returnId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "No disposition analysis found for this return",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting disposition:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get disposition",
      error: error.message,
    });
  }
};

// POST /api/disposition/batch - Run AI analysis on multiple returns
export const batchAnalyze = async (req, res) => {
  try {
    const { returnIds } = req.body;

    if (!returnIds || !Array.isArray(returnIds)) {
      return res.status(400).json({
        success: false,
        message: "returnIds array is required",
      });
    }

    const results = await batchAnalyzeReturns(returnIds);

    res.json({
      success: true,
      message: `Analyzed ${results.success.length} returns, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Error batch analyzing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to batch analyze",
      error: error.message,
    });
  }
};

// GET /api/disposition/stats - Get disposition statistics
export const getStats = async (req, res) => {
  try {
    const { storeId, startDate, endDate } = req.query;

    const stats = await getDispositionStats(
      storeId,
      startDate && endDate ? { startDate, endDate } : null,
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting disposition stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get disposition statistics",
      error: error.message,
    });
  }
};

// PATCH /api/disposition/:returnId/override - Override AI recommendation
export const overrideDisposition = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { recommendation, note } = req.body;

    if (!recommendation) {
      return res.status(400).json({
        success: false,
        message: "recommendation is required",
      });
    }

    const validRecommendations = ["restock", "repair", "writeoff"];
    if (!validRecommendations.includes(recommendation)) {
      return res.status(400).json({
        success: false,
        message: `Invalid recommendation. Must be one of: ${validRecommendations.join(", ")}`,
      });
    }

    // Update return request with manual disposition
    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        disposition: recommendation,
        dispositionNote: note || "Manually overridden by admin",
      },
    });

    // Update disposition record if exists
    await prisma.returnDisposition.updateMany({
      where: { returnId },
      data: {
        recommendation,
        reasoning: note || "Manually overridden by admin",
        confidence: 100, // Manual override = 100% confidence
      },
    });

    res.json({
      success: true,
      message: "Disposition overridden successfully",
      data: updated,
    });

    console.log(
      `✏️ Disposition overridden for return ${returnId}: ${recommendation}`,
    );
  } catch (error) {
    console.error("Error overriding disposition:", error);
    res.status(500).json({
      success: false,
      message: "Failed to override disposition",
      error: error.message,
    });
  }
};
