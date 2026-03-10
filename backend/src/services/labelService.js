// Label Generation Service - Generate Return Shipping Labels with Barcode
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";
import path from "path";
import fs from "fs";

// Generate unique barcode value
const generateBarcodeValue = (waybillNumber) => {
  // Convert to numeric barcode representation
  // In production, use proper barcode generation library
  return waybillNumber
    .replace(/[^0-9]/g, "")
    .substring(0, 12)
    .padStart(12, "0");
};

// Generate label data for return shipment
export const generateLabelData = async (returnId) => {
  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: true,
      user: true,
      store: true,
    },
  });

  if (!returnRequest) {
    throw new Error("Return request not found");
  }

  if (!returnRequest.waybillNumber) {
    throw new Error("Waybill number not generated yet");
  }

  const labelData = {
    // Waybill Information
    waybillNumber: returnRequest.waybillNumber,
    barcodeValue: generateBarcodeValue(returnRequest.waybillNumber),

    // Sender Information (Customer)
    sender: {
      name: returnRequest.order.customerName,
      phone: returnRequest.order.customerPhone,
      address: "Alamat Pelanggan (lihat catatan)",
    },

    // Recipient Information (Warehouse)
    recipient: {
      name: "Re-Route Warehouse",
      phone: "+62812345678",
      address: "Jl. Gudang Logistik No. 45, Surabaya, Jawa Timur 60111",
    },

    // Package Information
    package: {
      description: `Retur: ${returnRequest.order.productName}`,
      weight: 1, // kg
      dimensions: "20x15x10 cm",
    },

    // Return Information
    returnInfo: {
      returnNumber: returnRequest.returnNumber,
      reason: returnRequest.reason,
      orderNumber: returnRequest.order.orderNumber,
    },

    // Store Information (for white-label)
    store: returnRequest.store
      ? {
          name: returnRequest.store.name,
          logo: returnRequest.store.logo,
        }
      : null,

    // Service Type
    service: {
      courier: returnRequest.courierName,
      serviceType: "REGULAR",
    },

    // Timestamp
    generatedAt: new Date().toISOString(),
  };

  return labelData;
};

// Generate HTML label template
export const generateLabelHTML = async (returnId) => {
  const labelData = await generateLabelData(returnId);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Return Label - ${labelData.waybillNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    .label-container {
      width: 400px;
      padding: 15px;
      border: 2px dashed #333;
      margin: 20px auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .courier-name {
      font-size: 24px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .waybill {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 10px 0;
    }
    .barcode {
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      background: #f5f5f5;
    }
    .barcode img {
      max-width: 100%;
      height: 60px;
    }
    .barcode-text {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      letter-spacing: 3px;
      margin-top: 5px;
    }
    .addresses {
      display: flex;
      gap: 20px;
      margin: 15px 0;
    }
    .address-box {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
    }
    .address-label {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      color: #666;
      margin-bottom: 5px;
    }
    .address-name {
      font-weight: bold;
      font-size: 14px;
    }
    .package-info {
      margin: 15px 0;
      padding: 10px;
      background: #f9f9f9;
    }
    .return-info {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #333;
    }
    .return-info-title {
      font-weight: bold;
      text-align: center;
      background: #333;
      color: white;
      padding: 5px;
      margin: -10px -10px 10px -10px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #666;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
    }
    @media print {
      body { margin: 0; }
      .label-container { border: none; margin: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="label-container">
    <div class="header">
      <div class="courier-name">${labelData.service.courier}</div>
      <div class="waybill">${labelData.waybillNumber}</div>
    </div>

    <div class="barcode">
      <div class="barcode-text">${labelData.barcodeValue}</div>
    </div>

    <div class="addresses">
      <div class="address-box">
        <div class="address-label">PENGIRIM (SENDER)</div>
        <div class="address-name">${labelData.sender.name}</div>
        <div>${labelData.sender.phone}</div>
        <div>${labelData.sender.address}</div>
      </div>
      <div class="address-box">
        <div class="address-label">PENERIMA (RECEIVER)</div>
        <div class="address-name">${labelData.recipient.name}</div>
        <div>${labelData.recipient.phone}</div>
        <div>${labelData.recipient.address}</div>
      </div>
    </div>

    <div class="package-info">
      <strong>Deskripsi:</strong> ${labelData.package.description}<br>
      <strong>Berat:</strong> ${labelData.package.weight} kg
    </div>

    <div class="return-info">
      <div class="return-info-title">INFORMASI RETUR</div>
      <div><strong>No. Retur:</strong> ${labelData.returnInfo.returnNumber}</div>
      <div><strong>Alasan:</strong> ${labelData.returnInfo.reason}</div>
      <div><strong>No. Pesanan:</strong> ${labelData.returnInfo.orderNumber}</div>
    </div>

    ${
      labelData.store
        ? `
    <div style="text-align: center; margin-top: 10px;">
      <small>Dikembalikan ke: ${labelData.store.name}</small>
    </div>
    `
        : ""
    }

    <div class="footer">
      Generated by Re-Route Platform | ${labelData.generatedAt}
    </div>
  </div>
</body>
</html>
  `;

  return html;
};

// Save label to file
export const saveLabelToFile = async (returnId, html) => {
  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnId },
  });

  if (!returnRequest || !returnRequest.waybillNumber) {
    throw new Error("Return request not found");
  }

  // In production, save to cloud storage (S3, Cloudinary, etc.)
  // For now, save locally
  const filename = `label-${returnRequest.waybillNumber}.html`;
  const filepath = path.join(process.cwd(), "uploads", "labels", filename);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, html);

  // Update return request with label URL
  const labelUrl = `/uploads/labels/${filename}`;

  await prisma.returnRequest.update({
    where: { id: returnId },
    data: {
      waybillLabelUrl: labelUrl,
    },
  });

  return labelUrl;
};

// Main function to generate and save label
export const generateReturnLabel = async (returnId) => {
  try {
    // Generate label data
    const labelData = await generateLabelData(returnId);

    // Generate HTML
    const html = await generateLabelHTML(returnId);

    // Save to file
    const labelUrl = await saveLabelToFile(returnId, html);

    return {
      success: true,
      waybillNumber: labelData.waybillNumber,
      barcodeValue: labelData.barcodeValue,
      labelUrl,
    };
  } catch (error) {
    console.error("Error generating label:", error);
    throw error;
  }
};

export default {
  generateLabelData,
  generateLabelHTML,
  saveLabelToFile,
  generateReturnLabel,
};
