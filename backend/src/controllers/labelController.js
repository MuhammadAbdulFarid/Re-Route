// Label Controller - Generate Return Shipping Labels
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import {
  generateReturnLabel,
  generateLabelHTML,
} from "../services/labelService.js";

// POST /api/labels/generate - Generate label for a return
export const generateLabel = async (req, res) => {
  try {
    const { returnId } = req.body;

    if (!returnId) {
      return res.status(400).json({
        success: false,
        message: "returnId is required",
      });
    }

    // Check return exists and has waybill
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (!returnRequest.waybillNumber) {
      return res.status(400).json({
        success: false,
        message: "Return must be approved with waybill generated first",
      });
    }

    // Generate the label
    const result = await generateReturnLabel(returnId);

    res.json({
      success: true,
      message: "Label generated successfully",
      data: result,
    });

    console.log(`📦 Label generated for return: ${returnRequest.returnNumber}`);
  } catch (error) {
    console.error("Error generating label:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate label",
      error: error.message,
    });
  }
};

// GET /api/labels/:returnId - Get label data
export const getLabel = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: true,
        user: true,
        store: true,
      },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (!returnRequest.waybillNumber) {
      return res.status(400).json({
        success: false,
        message: "No waybill generated for this return",
      });
    }

    // Get label data
    const labelData = {
      waybillNumber: returnRequest.waybillNumber,
      barcodeValue: returnRequest.waybillNumber
        .replace(/[^0-9]/g, "")
        .substring(0, 12),
      courierName: returnRequest.courierName,
      sender: {
        name: returnRequest.order.customerName,
        phone: returnRequest.order.customerPhone,
      },
      recipient: {
        name: "Re-Route Warehouse",
        phone: "+62812345678",
        address: "Jl. Gudang Logistik No. 45, Surabaya",
      },
      package: {
        description: returnRequest.order.productName,
        weight: 1,
      },
      returnInfo: {
        returnNumber: returnRequest.returnNumber,
        reason: returnRequest.reason,
        orderNumber: returnRequest.order.orderNumber,
      },
      labelUrl: returnRequest.waybillLabelUrl,
      generatedAt: returnRequest.updatedAt,
    };

    res.json({
      success: true,
      data: labelData,
    });
  } catch (error) {
    console.error("Error getting label:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get label",
      error: error.message,
    });
  }
};

// GET /api/labels/:returnId/html - Get label as HTML for printing
export const getLabelHTML = async (req, res) => {
  try {
    const { returnId } = req.params;

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    if (!returnRequest.waybillNumber) {
      return res.status(400).json({
        success: false,
        message: "No waybill generated for this return",
      });
    }

    // Generate HTML
    const html = await generateLabelHTML(returnId);

    // Return as HTML
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("Error generating label HTML:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate label HTML",
      error: error.message,
    });
  }
};

// POST /api/labels/batch - Generate labels for multiple returns
export const batchGenerateLabels = async (req, res) => {
  try {
    const { returnIds } = req.body;

    if (!returnIds || !Array.isArray(returnIds)) {
      return res.status(400).json({
        success: false,
        message: "returnIds array is required",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    for (const returnId of returnIds) {
      try {
        const returnRequest = await prisma.returnRequest.findUnique({
          where: { id: returnId },
        });

        if (!returnRequest) {
          results.failed.push({ returnId, error: "Return not found" });
          continue;
        }

        if (!returnRequest.waybillNumber) {
          results.failed.push({ returnId, error: "No waybill generated" });
          continue;
        }

        const result = await generateReturnLabel(returnId);
        results.success.push({
          returnId,
          waybillNumber: result.waybillNumber,
          labelUrl: result.labelUrl,
        });
      } catch (error) {
        results.failed.push({ returnId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.success.length} labels, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Error batch generating labels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to batch generate labels",
      error: error.message,
    });
  }
};
