// Chat Routes - Internal Resolution Center
// Re-Route - Reverse Logistics SaaS Platform

import express from "express";
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  updateConversationStatus,
  getUnreadCount,
  requestAdminChat,
  getAdminConversations,
  acceptChat,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/unread - Get unread message count
router.get("/unread", getUnreadCount);

// GET /api/chat/conversations - Get all conversations
router.get("/conversations", getConversations);

// POST /api/chat/conversations - Create new conversation
router.post("/conversations", createConversation);

// GET /api/chat/conversations/:conversationId - Get single conversation
router.get("/conversations/:conversationId", getConversation);

// PATCH /api/chat/conversations/:conversationId - Update conversation status
router.patch("/conversations/:conversationId", updateConversationStatus);

// POST /api/chat/messages - Send a message
router.post("/messages", sendMessage);

// ============================================
// NEW: Chat with Admin Routes
// ============================================

// POST /api/chat/request-admin - Client requests to chat with admin
router.post("/request-admin", requestAdminChat);

// GET /api/chat/admin/conversations - Admin gets waiting_admin or active conversations
router.get("/admin/conversations", getAdminConversations);

// POST /api/chat/accept-chat - Admin accepts a waiting_admin conversation
router.post("/accept-chat", acceptChat);

export default router;
