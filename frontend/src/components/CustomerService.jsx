// Customer Service Component - Chat with Admin Logic
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect, useRef } from "react";
import { chatApi } from "../services/api";

// Demo user ID - in production this would come from auth
const getDemoUserId = () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      return user.id;
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }
  return "demo-user-id";
};

// Demo conversation ID - in production this would be created/retrieved from backend
const DEMO_CONVERSATION_ID = "demo-conv-1";

const CustomerService = ({ userRole = "client", userId, storeId }) => {
  // Chat status: "bot" | "waiting_admin" | "active" | "resolved"
  const [chatStatus, setChatStatus] = useState("bot");

  // Messages state with initial dummy data
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Halo! Ada yang bisa kami bantu hari ini?",
      senderType: "ai",
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 2,
      content: "Saya ingin menanyakan tentang retur pesanan saya",
      senderType: "customer",
      createdAt: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: 3,
      content: "Baik, kami akan memproses permintaan Anda.",
      senderType: "ai",
      createdAt: new Date(Date.now() - 10000).toISOString(),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const messagesEndRef = useRef(null);

  // Get user ID
  const currentUserId = userId || getDemoUserId();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================
  // CLIENT: Request to chat with Admin
  // Changes status from "bot" to "waiting_admin"
  // ============================================
  const handleRequestAdmin = async () => {
    if (chatStatus !== "bot") return;

    setLoadingAdmin(true);
    try {
      // In production, use the actual API call:
      // const response = await chatApi.requestAdminChat(conversationId, currentUserId);

      // Demo: Simulate the API call
      console.log("Requesting admin chat...");

      // Simulate success
      setChatStatus("waiting_admin");

      // Add system message
      const systemMessage = {
        id: Date.now(),
        content:
          "Permintaan untuk berbicara dengan Admin telah dikirim. Mohon tunggu sebentar...",
        senderType: "system",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error requesting admin:", error);
      alert("Gagal mengirim permintaan. Silakan coba lagi.");
    } finally {
      setLoadingAdmin(false);
    }
  };

  // handleSend: adds user message to array
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message to messages array
    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      senderType: "customer",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // After 1 second, trigger AI or Admin response based on status
    setTimeout(() => {
      let response = "";
      let senderType = "ai";

      if (chatStatus === "waiting_admin" || chatStatus === "active") {
        // Admin is handling this conversation
        senderType = "merchant";
        response =
          "Terima kasih atas pesan Anda. Tim admin akan segera merespons.";
      } else {
        // Bot is responding - More intelligent AI responses
        const lowerContent = userMessage.content.toLowerCase();

        // Return related questions
        if (
          lowerContent.includes("retur") ||
          lowerContent.includes("return") ||
          lowerContent.includes("pengembalian")
        ) {
          response =
            "Untuk pengembalian barang, Anda dapat:\n\n1. Klik menu 'Portal Retur' di website\n2. Masukkan nomor pesanan dan email\n3. Pilih alasan retur dan upload foto barang\n4. Kami akan generate label pengiriman\n5. Setelah barang diterima, refund diproses 3-5 hari kerja\n\nApakah ada yang perlu ditanyakan lebih lanjut?";
        }
        // Status order
        else if (
          lowerContent.includes("status") ||
          lowerContent.includes("pesanan") ||
          lowerContent.includes("order")
        ) {
          response =
            "Untuk melihat status pesanan, Anda dapat:\n\n• Login ke akun Anda\n• Buka menu 'Pesanan Saya'\n• Pilih pesanan yang ingin dicek\n\nStatus pesanan meliputi: Pending, Diproses, Dikirim, Delivered, atau Retur";
        }
        // Refund questions
        else if (
          lowerContent.includes("refund") ||
          lowerContent.includes("uang") ||
          lowerContent.includes("komplain")
        ) {
          response =
            "Tentang refund:\n\n• Refund diproses 3-5 hari kerja setelah barang diterima\n• Metode refund sesuai pembayaran (transfer bank/e-wallet)\n• Status refund dapat dilihat di menu 'Riwayat Transaksi'\n\nButuh bantuan lain?";
        }
        // Product/inventory
        else if (
          lowerContent.includes("stok") ||
          lowerContent.includes("produk") ||
          lowerContent.includes("barang")
        ) {
          response =
            "Untuk informasi produk/stok:\n\n• Stok dapat dilihat di halaman produk\n• Untuk grosir/quantity, silakan hubungi admin\n• Kami juga menerima custom order untuk kebutuhan khusus\n\nAda yang bisa dibantu?";
        }
        // Shipping/delivery
        else if (
          lowerContent.includes("kirim") ||
          lowerContent.includes("ongkir") ||
          lowerContent.includes("kurir") ||
          lowerContent.includes("delivery")
        ) {
          response =
            "Informasi pengiriman:\n\n• Kami pengiriman via JNE, J&T, POS, dll\n• Ongkir gratis untuk pembelian di atas Rp 500.000\n• Estimasi pengiriman: 2-5 hari kerja (sesuai wilayah)\n\nApakah ada yang ingin ditanyakan?";
        }
        // Contact admin
        else if (
          lowerContent.includes("admin") ||
          lowerContent.includes("manusia") ||
          lowerContent.includes("cs") ||
          lowerContent.includes("customer service")
        ) {
          response =
            "Jika Anda ingin berbicara langsung dengan Admin, klik tombol 'Hubungi Admin' di bawah. Kami siap membantu Anda dari Senin-Jumat, 09.00-17.00 WIB.\n\nAtau Anda bisa致电 ke: 021-XXXX-XXXX";
        }
        // Greeting
        else if (
          lowerContent.includes("halo") ||
          lowerContent.includes("hello") ||
          lowerContent.includes("hi") ||
          lowerContent.includes("selamat")
        ) {
          response =
            "Halo! 👋 Selamat datang di Re-Route!\n\nSaya AI Assistant yang siap membantu Anda dengan:\n• Informasi retur dan refund\n• Status pesanan\n• Produk dan stok\n• Pengiriman\n• Pertanyaan umum\n\nSilakan ketik pertanyaan Anda!";
        }
        // Thank you
        else if (
          lowerContent.includes("terima kasih") ||
          lowerContent.includes("thanks") ||
          lowerContent.includes("tq")
        ) {
          response =
            "Sama-sama! 😊 Senang bisa membantu.\n\nJika ada pertanyaan lain, jangan ragu untuk bertanya. Have a great day!";
        }
        // Bye
        else if (
          lowerContent.includes("bye") ||
          lowerContent.includes("selamat tinggal") ||
          lowerContent.includes("dadah")
        ) {
          response =
            "Terima kasih telah menghubungi kami! 👋\n\nJangan lupa untuk selalu memeriksa status retur pesanan Anda di portal kami. Sampai jumpa lagi!";
        }
        // Default response
        else {
          response =
            "Terima kasih atas pesan Anda! 💬\n\nSaya telah menerima pertanyaan Anda dan akan coba membantu.\n\nUntuk informasi lebih lengkap, Anda bisa:\n• Mengakses menu AI Analysis untuk analisis retur\n• Menghubungi Admin jika butuh bantuan lebih\n\nAda yang bisa saya bantu lagi?";
        }
      }

      const responseMessage = {
        id: Date.now() + 1,
        content: response,
        senderType: senderType,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (chatStatus) {
      case "bot":
        return { label: "AI Bot", color: "text-green-600", bg: "bg-green-100" };
      case "waiting_admin":
        return {
          label: "Menunggu Admin...",
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        };
      case "active":
        return {
          label: "Admin Aktif",
          color: "text-blue-600",
          bg: "bg-blue-100",
        };
      case "resolved":
        return { label: "Selesai", color: "text-gray-600", bg: "bg-gray-100" };
      default:
        return { label: "Unknown", color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Chat Area Only - Simplified */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Customer Service</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${statusInfo.bg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Belum ada pesan</p>
              <p className="text-sm">Kirim pesan untuk memulai percakapan</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderType === "customer";
              const isAI = msg.senderType === "ai";
              const isMerchant = msg.senderType === "merchant";
              const isSystem = msg.senderType === "system";

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-blue-500 text-white rounded-br-none"
                        : isSystem
                          ? "bg-gray-200 text-gray-700 text-center text-sm italic"
                          : isMerchant
                            ? "bg-purple-100 text-gray-900 rounded-bl-none border border-purple-200"
                            : "bg-green-100 text-gray-900 rounded-bl-none border border-green-200"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 flex items-center gap-1 ${
                        isOwn
                          ? "text-blue-100"
                          : isSystem
                            ? "text-gray-500"
                            : isMerchant
                              ? "text-purple-600"
                              : "text-green-600"
                      }`}
                    >
                      {isAI && <span className="font-medium">🤖 AI</span>}
                      {isMerchant && (
                        <span className="font-medium">👤 Admin</span>
                      )}
                      {(isAI || isMerchant || isSystem) && "•"}
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {/* Hubungi Admin Button - Only show when status is "bot" */}
            {chatStatus === "bot" && (
              <button
                type="button"
                onClick={handleRequestAdmin}
                disabled={loadingAdmin}
                className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {loadingAdmin ? "Mengirim..." : "Hubungi Admin"}
              </button>
            )}

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                chatStatus === "waiting_admin"
                  ? "Menunggu Admin..."
                  : "Tulis pesan..."
              }
              disabled={chatStatus === "waiting_admin"}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || chatStatus === "waiting_admin"}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerService;
