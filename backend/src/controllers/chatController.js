// Chat Controller - Internal Resolution Center
// Re-Route - Reverse Logistics SaaS Platform
// Includes Chat with Admin functionality: bot -> waiting_admin -> active

import prisma from "../prisma.js";

// ============================================
// CLIENT SIDE: Change status from "bot" to "waiting_admin"
// Called when client clicks "Hubungi Admin" button
// ============================================
export const requestAdminChat = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        message: "conversationId and userId are required",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this conversation",
      });
    }

    if (conversation.chatStatus !== "bot") {
      return res.status(400).json({
        success: false,
        message: `Cannot request admin. Current status: ${conversation.chatStatus}`,
      });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        chatStatus: "waiting_admin",
        updatedAt: new Date(),
      },
    });

    await prisma.message.create({
      data: {
        content: "Pelanggan meminta untuk berbicara dengan Admin.",
        senderType: "system",
        senderId: "system",
        conversationId,
        userId: conversation.userId,
      },
    });

    res.json({
      success: true,
      message: "Request sent to admin. Please wait.",
      data: {
        id: updated.id,
        chatStatus: updated.chatStatus,
      },
    });

    console.log(
      `📩 Client ${userId} requested admin chat for conversation ${conversationId}`,
    );
  } catch (error) {
    console.error("Error requesting admin chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request admin chat",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN SIDE: Get conversations filtered by chatStatus
// Only shows conversations with status "waiting_admin" or "active"
// ============================================
export const getAdminConversations = async (req, res) => {
  try {
    const { storeId, chatStatus } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    const where = { storeId };

    if (chatStatus) {
      where.chatStatus = chatStatus;
    } else {
      where.chatStatus = {
        in: ["waiting_admin", "active"],
      };
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        return: {
          select: {
            id: true,
            returnNumber: true,
            status: true,
            reason: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderType: { not: "merchant" },
            isRead: false,
          },
        });

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null,
        };
      }),
    );

    res.json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN SIDE: Accept chat (waiting_admin -> active)
// ============================================
export const acceptChat = async (req, res) => {
  try {
    const { conversationId, merchantId } = req.body;

    if (!conversationId || !merchantId) {
      return res.status(400).json({
        success: false,
        message: "conversationId and merchantId are required",
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (conversation.chatStatus !== "waiting_admin") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept chat. Current status: ${conversation.chatStatus}`,
      });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        chatStatus: "active",
        updatedAt: new Date(),
      },
    });

    await prisma.message.create({
      data: {
        content: "Admin telah menerima percakapan. Silakan tanya kami apapun.",
        senderType: "system",
        senderId: "system",
        conversationId,
        userId: conversation.userId,
      },
    });

    res.json({
      success: true,
      message: "Chat accepted successfully",
      data: {
        id: updated.id,
        chatStatus: updated.chatStatus,
      },
    });

    console.log(
      `✅ Admin ${merchantId} accepted conversation ${conversationId}`,
    );
  } catch (error) {
    console.error("Error accepting chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept chat",
      error: error.message,
    });
  }
};

// ============================================
// SEND MESSAGE - Auto-update status when merchant replies
// ============================================
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, senderType, senderId } = req.body;

    if (!conversationId || !content || !senderType || !senderId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: conversationId, content, senderType, senderId",
      });
    }

    const validSenderTypes = ["customer", "merchant", "system"];
    if (!validSenderTypes.includes(senderType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid senderType. Must be one of: ${validSenderTypes.join(", ")}`,
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderType,
        senderId,
        conversationId,
        userId: senderId,
        isRead: senderType === "merchant",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Auto-update chatStatus to "active" if merchant sends message
    const updateData = { updatedAt: new Date() };
    if (
      senderType === "merchant" &&
      ["bot", "waiting_admin"].includes(conversation.chatStatus)
    ) {
      updateData.chatStatus = "active";
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    if (senderType === "customer" && conversation.chatStatus === "active") {
      console.log(
        `🔔 New message from customer in active conversation ${conversationId}`,
      );
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// GET /api/chat/conversations - Get all conversations for a store
export const getConversations = async (req, res) => {
  try {
    const { storeId, userId, status } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    const where = { storeId };
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        return: {
          select: {
            id: true,
            returnNumber: true,
            status: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderType: { not: "merchant" },
            isRead: false,
          },
        });

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null,
        };
      }),
    );

    res.json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// GET /api/chat/conversations/:conversationId - Get single conversation with messages
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        return: true,
        store: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderType: { not: "merchant" },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

// POST /api/chat/conversations - Create new conversation
export const createConversation = async (req, res) => {
  try {
    const { storeId, userId, returnId, type } = req.body;

    if (!storeId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: storeId, userId",
      });
    }

    if (returnId) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          returnId,
          storeId,
          userId,
        },
      });

      if (existingConversation) {
        return res.json({
          success: true,
          message: "Conversation already exists",
          data: existingConversation,
        });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        storeId,
        userId,
        returnId: returnId || null,
        type: type || "return",
        status: "open",
        chatStatus: "bot", // Default to bot
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.message.create({
      data: {
        content: "Percakapan dimulai. Tim kami akan segera membantu Anda.",
        senderType: "system",
        senderId: "system",
        conversationId: conversation.id,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation,
    });

    console.log(`💬 New conversation: ${conversation.id}`);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

// PATCH /api/chat/conversations/:conversationId - Update conversation status
export const updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
      updateData.chatStatus = "resolved";
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    const statusMessages = {
      resolved: "Percakapan ditandai sebagai resolved.",
      closed: "Percakapan ditutup.",
    };

    await prisma.message.create({
      data: {
        content: statusMessages[status],
        senderType: "system",
        senderId: "system",
        conversationId,
        userId: conversation.userId,
      },
    });

    res.json({
      success: true,
      message: "Conversation status updated",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update conversation",
      error: error.message,
    });
  }
};

// GET /api/chat/unread - Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const { storeId, userId } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required",
      });
    }

    const conversations = await prisma.conversation.findMany({
      where: { storeId },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length === 0) {
      return res.json({
        success: true,
        data: { unreadCount: 0, conversations: [] },
      });
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderType: { not: "merchant" },
        isRead: false,
      },
    });

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        senderType: { not: "merchant" },
        isRead: false,
      },
      include: {
        conversation: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        unreadCount,
        unreadByConversation: unreadMessages.map((m) => ({
          conversationId: m.conversationId,
          customerName: m.conversation.user.name,
          lastMessage: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};
