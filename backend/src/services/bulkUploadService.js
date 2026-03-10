// Bulk Upload Service - Parse CSV/Excel for Order Import
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// CSV Parser (simple implementation)
// In production, use 'csv-parser' or 'xlsx' library
export const parseCSV = async (csvContent) => {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  // Map common header variations
  const headerMap = {
    ordernumber: "orderNumber",
    order_number: "orderNumber",
    "no. pesanan": "orderNumber",
    customername: "customerName",
    customer_name: "customerName",
    nama_pelanggan: "customerName",
    customerphone: "customerPhone",
    customer_phone: "customerPhone",
    no_hp: "customerPhone",
    customeremail: "customerEmail",
    customer_email: "customerEmail",
    email: "customerEmail",
    productname: "productName",
    product_name: "productName",
    nama_produk: "productName",
    productsku: "productSku",
    product_sku: "productSku",
    sku: "productSku",
    quantity: "quantity",
    qty: "quantity",
    price: "price",
    harga: "price",
    amount: "price",
  };

  // Parse data rows
  const orders = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length !== headers.length) {
      console.warn(
        `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`,
      );
      continue;
    }

    const order = {};
    headers.forEach((header, index) => {
      const mappedKey = headerMap[header];
      if (mappedKey) {
        order[mappedKey] = values[index];
      }
    });

    // Validate required fields
    if (
      order.orderNumber &&
      order.customerName &&
      order.productName &&
      order.price
    ) {
      orders.push({
        ...order,
        quantity: parseInt(order.quantity) || 1,
        price: parseFloat(order.price) || 0,
      });
    }
  }

  return orders;
};

// Parse Excel (mock - in production use 'xlsx' library)
// This is a placeholder for Excel parsing
export const parseExcel = async (buffer) => {
  // In production, use: import * as XLSX from 'xlsx';
  // const workbook = XLSX.read(buffer, { type: 'buffer' });
  // const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // return XLSX.utils.sheet_to_json(sheet);

  throw new Error("Excel parsing not implemented. Please use CSV format.");
};

// Validate order data
export const validateOrder = (order) => {
  const errors = [];

  if (!order.orderNumber) {
    errors.push("Order number is required");
  }

  if (!order.customerName) {
    errors.push("Customer name is required");
  }

  if (!order.customerPhone) {
    errors.push("Customer phone is required");
  } else {
    // Basic phone validation (Indonesian format)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(order.customerPhone.replace(/\s/g, ""))) {
      errors.push("Invalid phone number format");
    }
  }

  if (!order.productName) {
    errors.push("Product name is required");
  }

  if (!order.price || order.price <= 0) {
    errors.push("Invalid price");
  }

  if (order.quantity && order.quantity <= 0) {
    errors.push("Invalid quantity");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Process bulk upload
export const processBulkUpload = async (
  fileData,
  userId,
  storeId,
  source = "manual",
) => {
  const { filename, content } = fileData;

  // Determine file type
  const extension = filename.split(".").pop().toLowerCase();

  let orders;
  if (extension === "csv") {
    orders = await parseCSV(content);
  } else if (extension === "xlsx" || extension === "xls") {
    orders = await parseExcel(content);
  } else {
    throw new Error("Unsupported file format. Please use CSV or Excel.");
  }

  if (orders.length === 0) {
    throw new Error("No valid orders found in file");
  }

  // Validate and process each order
  const results = {
    success: [],
    failed: [],
    duplicates: [],
    totalProcessed: 0,
  };

  for (const order of orders) {
    // Validate order
    const validation = validateOrder(order);
    if (!validation.isValid) {
      results.failed.push({
        orderNumber: order.orderNumber,
        errors: validation.errors,
      });
      continue;
    }

    // Check for duplicate
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: order.orderNumber },
    });

    if (existingOrder) {
      results.duplicates.push({
        orderNumber: order.orderNumber,
        existingId: existingOrder.id,
      });
      continue;
    }

    // Create order
    try {
      const newOrder = await prisma.order.create({
        data: {
          orderNumber: order.orderNumber,
          source,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail || null,
          productName: order.productName,
          productSku: order.productSku || null,
          quantity: order.quantity,
          price: order.price,
          status: "pending",
          userId,
          storeId: storeId || null,
        },
      });

      results.success.push({
        orderNumber: order.orderNumber,
        id: newOrder.id,
      });
    } catch (error) {
      results.failed.push({
        orderNumber: order.orderNumber,
        errors: [error.message],
      });
    }
  }

  results.totalProcessed = results.success.length;

  return results;
};

// Download sample CSV template
export const getSampleCSVTemplate = () => {
  const headers = [
    "orderNumber",
    "customerName",
    "customerPhone",
    "customerEmail",
    "productName",
    "productSku",
    "quantity",
    "price",
  ];

  const exampleRow = [
    "ORD-2024-001",
    "Budi Santoso",
    "+62812345678",
    "budi@example.com",
    "Sepatu Sneakers Premium",
    "SEP-001",
    "1",
    "299000",
  ];

  return {
    headers: headers.join(","),
    example: exampleRow.join(","),
    full: [
      headers.join(","),
      exampleRow.join(","),
      "ORD-2024-002,Siti Rahayu,+62898765432,siti@example.com,Tas Ransel Canvas,TAS-003,2,175000",
    ].join("\n"),
  };
};

export default {
  parseCSV,
  parseExcel,
  validateOrder,
  processBulkUpload,
  getSampleCSVTemplate,
};
