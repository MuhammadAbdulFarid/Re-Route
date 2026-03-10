// Re-Route Backend - Express Server
// Reverse Logistics SaaS Platform

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Import routes
import orderRoutes from "./routes/orders.js";
import returnRoutes from "./routes/returns.js";
import inventoryRoutes from "./routes/inventory.js";
import storeRoutes from "./routes/stores.js";
import marketplaceRoutes from "./routes/marketplace.js";
import bulkRoutes from "./routes/bulk.js";
import labelRoutes from "./routes/labels.js";
import dispositionRoutes from "./routes/disposition.js";
import chatRoutes from "./routes/chat.js";
import revenueRoutes from "./routes/revenue.js";
import fraudRoutes from "./routes/fraud.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import aiRoutes from "./routes/ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(join(__dirname, "../uploads")));

// API Routes
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/disposition", dispositionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Re-Route API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Re-Route Backend Server Running                      ║
║                                                           ║
║   📍 Server: http://localhost:${PORT}                       ║
║   📚 API Docs: http://localhost:${PORT}/api/health         ║
║                                                           ║
║   📦 Core Endpoints:                                     ║
║   • POST /api/orders          - Create order             ║
║   • POST /api/returns/submit  - Submit return request    ║
║   • PATCH /api/returns/approve - Approve return           ║
║   • POST /api/webhook/courier - Courier webhook          ║
║   • GET  /api/returns         - List returns             ║
║   • GET  /api/inventory       - Get inventory            ║
║                                                           ║
║   🏪 Multi-Store & Marketplace:                           ║
║   • GET  /api/stores          - List stores              ║
║   • POST /api/stores          - Create store             ║
║   • POST /api/marketplace/connect - Connect marketplace  ║
║   • POST /api/marketplace/sync - Sync orders             ║
║                                                           ║
║   📊 Bulk & Label:                                         ║
║   • POST /api/bulk/upload     - Bulk upload CSV          ║
║   • GET  /api/bulk/template   - Get CSV template         ║
║   • POST /api/labels/generate - Generate return label    ║
║                                                           ║
║   🤖 AI & Chat:                                            ║
║   • POST /api/disposition/analyze - AI disposition       ║
║   • GET  /api/chat/conversations - Chat conversations    ║
║   • POST /api/chat/messages    - Send chat message        ║
║                                                           ║
║   💰 Revenue & Fraud:                                       ║
║   • GET  /api/revenue/dashboard - Revenue dashboard       ║
║   • GET  /api/fraud/dashboard  - Fraud detection          ║
║   • GET  /api/fraud/alerts     - Fraud alerts             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
