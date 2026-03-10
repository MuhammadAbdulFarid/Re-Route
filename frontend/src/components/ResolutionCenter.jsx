// Resolution Center Component - Internal Chat System
// Re-Route - Reverse Logistics SaaS Platform
// Includes Chat with Admin - Admin Side (onSnapshot-like polling)

import { useState, useEffect, useRef } from "react";
import { chatApi, returnApi } from "../services/api";

const DEMO_USER_ID = "demo-user-id";
const DEMO_STORE_ID = "demo-store-1";
const POLLING_INTERVAL = 3000; // Poll every 3 seconds for real-time updates

const ResolutionCenter = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "waiting_admin", "active"
  const pollingRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch admin conversations with polling
  useEffect(() => {
    fetchAdminConversations();

    // Set up polling for real-time updates (onSnapshot-like behavior)
    pollingRef.current = setInterval(() => {
      fetchAdminConversations(false);
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ============================================
  // ADMIN: Fetch conversations - only waiting_admin and active
  // This mimics onSnapshot behavior
  // ============================================
  const fetchAdminConversations = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      // In production, use the actual API:
      // const response = await chatApi.getAdminConversations({ storeId: DEMO_STORE_ID });

      // For demo, simulate the API response
      const demoConversations = [
        {
          id: "conv-1",
          type: "return",
          status: "open",
          chatStatus: "waiting_admin",
          user: {
            id: "user-1",
            name: "Ahmad Fauzi",
            phone: "081234567890",
            email: "ahmad@email.com",
          },
          returnRequest: { returnNumber: "RTR-001", status: "pending" },
          lastMessage: { content: "Saya ingin menanyakan status retur saya" },
          unreadCount: 2,
          updatedAt: new Date().toISOString(),
        },
        {
          id: "conv-2",
          type: "return",
          status: "open",
          chatStatus: "active",
          user: {
            id: "user-2",
            name: "Siti Rahayu",
            phone: "089876543210",
            email: "siti@email.com",
          },
          returnRequest: { returnNumber: "RTR-002", status: "approved" },
          lastMessage: { content: "Terima kasih atas bantuannya" },
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "conv-3",
          type: "general",
          status: "open",
          chatStatus: "waiting_admin",
          user: {
            id: "user-3",
            name: "Budi Santoso",
            phone: "08111222333",
            email: "budi@email.com",
          },
          returnRequest: null,
          lastMessage: { content: "Ada pertanyaan tentang produk" },
          unreadCount: 1,
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      // Apply filter
      let filtered = demoConversations;
      if (filter !== "all") {
        filtered = demoConversations.filter((c) => c.chatStatus === filter);
      }

      setConversations(filtered);
    } catch (error) {
      console.error("Error fetching admin conversations:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // In production: const response = await chatApi.getMessages(conversationId);

      // Demo messages
      const demoMessages = [
        {
          id: "msg-1",
          content: "Halo, saya ingin menanyakan status retur pesanan saya",
          senderType: "customer",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "msg-2",
          content: "Halo! Maaf sedang kami cek. Boleh tahu nomor retur Anda?",
          senderType: "merchant",
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: "msg-3",
          content: "Nomor returnya RTR-001",
          senderType: "customer",
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        },
      ];

      setMessages(demoMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // ============================================
  // ADMIN: Accept chat (waiting_admin -> active)
  // ============================================
  const handleAcceptChat = async (conversationId) => {
    try {
      // In production: await chatApi.acceptChat(conversationId, DEMO_USER_ID);
      console.log("Accepting chat:", conversationId);

      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, chatStatus: "active" } : c,
        ),
      );

      alert("Percakapan telah diterima!");
    } catch (error) {
      console.error("Error accepting chat:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);

    try {
      // In production: await chatApi.sendMessage(selectedConversation.id, { ... });

      // Demo: Add message locally
      const newMsg = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        senderType: "merchant",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Baru";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000)
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getConversationPreview = (conv) => {
    if (conv.returnRequest) {
      return `Retur: ${conv.returnRequest.returnNumber}`;
    }
    return conv.lastMessage?.content || "Belum ada pesan";
  };

  // Get status badge
  const getStatusBadge = (chatStatus) => {
    switch (chatStatus) {
      case "waiting_admin":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            Menunggu
          </span>
        );
      case "active":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Aktif
          </span>
        );
      case "bot":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
            Bot
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Resolution Center</h2>
          <p className="text-sm text-gray-500">Chat dengan pelanggan</p>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setFilter("all");
                fetchAdminConversations();
              }}
              className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setFilter("waiting_admin");
                fetchAdminConversations();
              }}
              className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                filter === "waiting_admin"
                  ? "bg-white shadow text-yellow-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📩 Menunggu
            </button>
            <button
              onClick={() => {
                setFilter("active");
                fetchAdminConversations();
              }}
              className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                filter === "active"
                  ? "bg-white shadow text-green-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💬 Aktif
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <svg
                className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Memuat...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">Belum ada percakapan</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedConversation?.id === conv.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {conv.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {conv.user.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(conv.chatStatus)}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {getConversationPreview(conv)}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs text-white bg-blue-500 rounded-full mt-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedConversation.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedConversation.user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.user.phone} •{" "}
                    {selectedConversation.user.email}
                  </p>
                </div>
                {selectedConversation.returnRequest && (
                  <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {selectedConversation.returnRequest.returnNumber}
                  </span>
                )}
                {getStatusBadge(selectedConversation.chatStatus)}
              </div>

              {/* Accept Button - Only show for waiting_admin */}
              {selectedConversation.chatStatus === "waiting_admin" && (
                <button
                  onClick={() => handleAcceptChat(selectedConversation.id)}
                  className="mt-3 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Terima Percakapan
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderType === "merchant"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.senderType === "merchant"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : message.senderType === "system"
                          ? "bg-gray-200 text-gray-700 text-center italic"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderType === "merchant"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.senderType === "merchant" && "👤 "}
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p>Pilih percakapan untuk memulai chat</p>
              <p className="text-sm text-gray-400 mt-1">
                Percakapan akan diperbarui secara real-time
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolutionCenter;
