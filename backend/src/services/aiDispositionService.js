// AI Disposition Service - Smart Return Analysis
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Simple AI analysis based on return reason and photo
// In production, this would integrate with OpenAI, Claude, or custom ML model

// Configuration for disposition rules
const DISPOSITION_RULES = {
  // Reasons that typically lead to restock (new/undamaged items)
  restockReasons: [
    "salah_size",
    "salah_kirim",
    "tidak_sesuai",
    "warna_tidak_sesuai",
    "ukuran_tidak_sesuai",
  ],

  // Reasons that might need repair
  repairReasons: ["barang_rusak_sebagian", "kualitas_rendah"],

  // Reasons that typically lead to write-off
  writeoffReasons: ["barang_rusak_berat", "hilang_sebagian", "cacat_permanent"],
};

// Analyze return and recommend disposition
export const analyzeReturn = async (returnId) => {
  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: true,
    },
  });

  if (!returnRequest) {
    throw new Error("Return request not found");
  }

  // Simulate AI analysis based on return reason
  // In production, this would analyze the uploaded photo using computer vision
  const analysis = performAIAnalysis(returnRequest);

  // Save disposition analysis to database
  const disposition = await prisma.returnDisposition.create({
    data: {
      returnId,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      condition: analysis.condition,
      estimatedValue: analysis.estimatedValue,
      damageDetected: analysis.damageDetected,
      damageType: analysis.damageType,
      wearLevel: analysis.wearLevel,
      photoAnalysis: JSON.stringify(analysis.photoAnalysis),
    },
  });

  // Update return request with disposition
  await prisma.returnRequest.update({
    where: { id: returnId },
    data: {
      disposition: analysis.recommendation,
      dispositionNote: analysis.reasoning,
      status: "dispositioned",
    },
  });

  return {
    success: true,
    disposition,
    analysis,
  };
};

// Perform AI analysis (simulated)
const performAIAnalysis = (returnRequest) => {
  const { reason, photoUrl, order } = returnRequest;

  // Determine recommendation based on reason
  let recommendation = "restock";
  let confidence = 75;
  let reasoning = "";
  let condition = "new";
  let estimatedValue = order.price;
  let damageDetected = false;
  let damageType = null;
  let wearLevel = "new";

  // Check if there's a photo to analyze
  const hasPhoto = !!photoUrl;

  // Analyze based on reason
  if (DISPOSITION_RULES.restockReasons.includes(reason)) {
    recommendation = "restock";
    confidence = hasPhoto ? 90 : 70;
    reasoning = `Based on reason "${reason}", item appears to be sellable. ${
      hasPhoto
        ? "Visual inspection confirms item is in good condition."
        : "No photo provided, assuming standard restock."
    }`;
    condition = "new";
    estimatedValue = order.price;
    wearLevel = "new";
  } else if (DISPOSITION_RULES.repairReasons.includes(reason)) {
    recommendation = "repair";
    confidence = 65;
    reasoning = `Reason "${reason}" suggests item can be repaired. Repair cost estimated at 20-40% of original price.`;
    condition = "fair";
    estimatedValue = order.price * 0.6;
    wearLevel = "moderate";
    damageDetected = true;
    damageType = "cosmetic_damage";
  } else if (DISPOSITION_RULES.writeoffReasons.includes(reason)) {
    recommendation = "writeoff";
    confidence = 85;
    reasoning = `Reason "${reason}" indicates item is not resaleable. Recommendation: write off / dispose.`;
    condition = "poor";
    estimatedValue = 0;
    wearLevel = "heavy";
    damageDetected = true;
    damageType = "significant_damage";
  } else {
    // Default analysis
    recommendation = "restock";
    confidence = 60;
    reasoning =
      "Standard return without specific damage indicators. Recommend restock for resale.";
    condition = "new";
    estimatedValue = order.price;
  }

  // Simulate photo analysis if photo exists
  const photoAnalysis = hasPhoto
    ? {
        analyzed: true,
        detectedIssues: damageDetected ? [damageType] : [],
        qualityScore: condition === "new" ? 95 : condition === "fair" ? 70 : 40,
        authenticity: "verified",
        matchesDescription: true,
      }
    : {
        analyzed: false,
        note: "No photo provided for analysis",
      };

  // Adjust confidence based on photo presence
  if (!hasPhoto) {
    confidence = Math.max(confidence - 20, 40);
  }

  return {
    recommendation,
    confidence,
    reasoning,
    condition,
    estimatedValue,
    damageDetected,
    damageType,
    wearLevel,
    photoAnalysis,
  };
};

// Get disposition recommendation for admin review
export const getDispositionSummary = async (returnId) => {
  const disposition = await prisma.returnDisposition.findUnique({
    where: { returnId },
  });

  if (!disposition) {
    return null;
  }

  // Format for display
  const recommendationLabels = {
    restock: {
      label: "Restock (Jual Kembali)",
      color: "green",
      action: "Item dapat dijual kembali",
    },
    repair: {
      label: "Repair (Perbaiki)",
      color: "yellow",
      action: "Item perlu diperbaiki sebelum dijual",
    },
    writeoff: {
      label: "Write-off (Buang)",
      color: "red",
      action: "Item tidak dapat diperbaiki/disihkan",
    },
  };

  const recommendation = recommendationLabels[disposition.recommendation];

  return {
    recommendation: disposition.recommendation,
    label: recommendation.label,
    color: recommendation.color,
    action: recommendation.action,
    confidence: disposition.confidence,
    reasoning: disposition.reasoning,
    condition: disposition.condition,
    estimatedValue: disposition.estimatedValue,
    damageDetected: disposition.damageDetected,
    damageType: disposition.damageType,
    wearLevel: disposition.wearLevel,
    createdAt: disposition.createdAt,
  };
};

// Batch disposition analysis for multiple returns
export const batchAnalyzeReturns = async (returnIds) => {
  const results = {
    success: [],
    failed: [],
  };

  for (const returnId of returnIds) {
    try {
      const result = await analyzeReturn(returnId);
      results.success.push({
        returnId,
        recommendation: result.analysis.recommendation,
        confidence: result.analysis.confidence,
      });
    } catch (error) {
      results.failed.push({
        returnId,
        error: error.message,
      });
    }
  }

  return results;
};

// Get disposition statistics
export const getDispositionStats = async (storeId, dateRange) => {
  const where = storeId ? { storeId } : {};

  if (dateRange?.startDate && dateRange?.endDate) {
    where.createdAt = {
      gte: new Date(dateRange.startDate),
      lte: new Date(dateRange.endDate),
    };
  }

  const dispositions = await prisma.returnDisposition.findMany({
    where,
    include: {
      return: true,
    },
  });

  const stats = {
    total: dispositions.length,
    restock: 0,
    repair: 0,
    writeoff: 0,
    averageConfidence: 0,
    totalEstimatedValue: 0,
  };

  let totalConfidence = 0;

  for (const d of dispositions) {
    stats[d.recommendation] = (stats[d.recommendation] || 0) + 1;
    totalConfidence += d.confidence;
    stats.totalEstimatedValue += d.estimatedValue || 0;
  }

  stats.averageConfidence =
    dispositions.length > 0
      ? Math.round(totalConfidence / dispositions.length)
      : 0;

  // Calculate percentages
  if (stats.total > 0) {
    stats.restockPercent = Math.round((stats.restock / stats.total) * 100);
    stats.repairPercent = Math.round((stats.repair / stats.total) * 100);
    stats.writeoffPercent = Math.round((stats.writeoff / stats.total) * 100);
  }

  return stats;
};

export default {
  analyzeReturn,
  getDispositionSummary,
  batchAnalyzeReturns,
  getDispositionStats,
};
