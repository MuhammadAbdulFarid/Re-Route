// AI Consultation Service - Smart AI Assistant for Returns Management
// Re-Route - Reverse Logistics SaaS Platform

import prisma from "../prisma.js";

// Professional AI consultation responses based on context
const getAIResponse = (userMessage, context) => {
  const message = userMessage.toLowerCase();

  // Context-aware responses
  const responses = {
    // Return related
    return: {
      keywords: ["retur", "return", "pengembalian", "uang", "refund"],
      response: `Untuk pengembalian barang, pelanggan dapat:
1. Mengakses portal retur di website toko Anda
2. Masukkan nomor pesanan dan email
3. Pilih alasan retur dan upload foto barang
4. Sistem akan generate label pengiriman
5. Setelah barang diterima, refund akan diproses dalam 3-5 hari kerja

Tips: Pastikan kebijakan retur Anda jelas dan mudah dipahami untuk mengurangi tingkat retur.`,
    },

    // Disposition related
    disposition: {
      keywords: ["disposisi", "processing", "olah", "kelola"],
      response: `Sistem Disposisi AI membantu mengelola barang retur:
- **Restock**: Barang layak jual kembali
- **Repair**: Perlu perbaikan sebelum dijual
- **Write-off**: Tidak dapat diperbaiki/hanya buang

AI akan menganalisis foto dan alasan retur untuk memberikan rekomendasi yang akurat.`,
    },

    // Marketplace related
    marketplace: {
      keywords: ["marketplace", "shopee", "tokopedia", "tiktok", "lazada"],
      response: `Integrasi marketplace mendukung:
- **Shopee**: Sinkronisasi pesanan otomatis
- **Tokopedia**: Pesanan dan retur terintegrasi
- **TikTok Shop**:直播 dan pesanan

Anda dapat menghubungkan toko marketplace melalui menu Integrasi Marketplace.`,
    },

    // Inventory related
    inventory: {
      keywords: ["stok", "inventory", "gudang", "produk"],
      response: `Manajemen inventaris yang efektif:
- Pantau stok real-time
- Notifikasi stok rendah
- Lacak kondisi barang (new/refurbished/damaged)
- Integrasi dengan pesanan masuk

Gunakan dashboard inventory untuk melihat ringkasan stok.`,
    },

    // Fraud detection
    fraud: {
      keywords: ["fraud", "penipuan", "curang", "pola mencurigakan"],
      response: `Sistem Deteksi Fraud otomatis memantau:
- Pola retur yang mencurigakan
- Foto yang tidak valid
- Multiple returns dari pelanggan sama
- Konsistensi alasan retur

Dashboard fraud menunjukkan alert dan analisis risiko.`,
    },

    // Report/Export
    report: {
      keywords: ["laporan", "export", "download", "spreadsheet", "excel"],
      response: `Fitur Export Laporan:
- Export ke CSV/Excel
- Laporan retur per periode
- Analisis AI komprehensif
- statistik marketplace

Gunakan tombol "Export Laporan" di dashboard yang diinginkan.`,
    },

    // General help
    help: {
      keywords: ["bantuan", "help", "tolong", "cara", "how"],
      response: `Selamat datang di Re-Route! Saya AI Assistant yang siap membantu:

**Menu Utama:**
- 📊 Dashboard Admin: Kelola pesanan & retur
- 🛒 Marketplace: Hubungkan toko marketplace
- 🤖 AI Analysis: Analisis pola retur
- 💬 Resolution Center: Chat dengan pelanggan
- 📈 Revenue: Lihat pendapatan

Ketik pertanyaan spesifik untuk info lebih detail!`,
    },

    // Greeting
    greeting: {
      keywords: ["halo", "hello", "hi", " pagi", "siang", "sore"],
      response: `Halo! 👋 

Saya adalah AI Assistant Re-Route. Saya bisa membantu Anda mengenai:
- Sistem retur dan refund
- Integrasi marketplace
- Analisis AI untuk bisnis
- Manajemen inventaris
- Deteksi fraud

Silakan tanya apa saja!`,
    },
  };

  // Check for keyword matches
  for (const [key, data] of Object.entries(responses)) {
    if (data.keywords.some((keyword) => message.includes(keyword))) {
      return data.response;
    }
  }

  // Default response for unrecognized queries
  return `Terima kasih atas pertanyaan Anda! 

Saya memahami bahwa Anda bertanya tentang: "${userMessage}"

Untuk informasi lebih detail, saya sarankan:
1. Mengakses menu AI Analysis untuk analisis lengkap
2. Menghubungi admin melalui Resolution Center
3. Melihat dokumentasi di menu bantuan

Apakah ada topik spesifik yang ingin Anda ketahui lebih lanjut?`;
};

// Process AI consultation message
export const processConsultation = async (
  userId,
  storeId,
  message,
  context = {},
) => {
  try {
    // Get user and store info for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, businessName: true },
    });

    // Get recent returns for context
    const recentReturns = await prisma.returnRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, reason: true, status: true },
    });

    // Build context for AI
    const consultationContext = {
      userName: user?.name,
      businessName: user?.businessName,
      storeId,
      recentReturns,
      ...context,
    };

    // Get AI response
    const aiResponse = getAIResponse(message, consultationContext);

    return {
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Cara mengelola retur",
        "Integrasi marketplace",
        "Export laporan",
      ],
    };
  } catch (error) {
    console.error("Error in AI consultation:", error);
    return {
      success: false,
      response:
        "Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi admin.",
      error: error.message,
    };
  }
};

// Get consultation history
export const getConsultationHistory = async (userId, limit = 20) => {
  // In production, this would store and retrieve from database
  // For now, return empty array (sessions are not persisted)
  return [];
};

// Get AI insights for dashboard
export const getAIInsights = async (storeId) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        returnRequests: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!store) {
      return null;
    }

    // Calculate insights
    const returns = store.returnRequests;
    const totalReturns = returns.length;
    const pendingReturns = returns.filter((r) => r.status === "pending").length;
    const completedReturns = returns.filter(
      (r) => r.status === "received",
    ).length;

    // Reason analysis
    const reasonCounts = {};
    returns.forEach((r) => {
      reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
    });

    const topReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    return {
      storeId,
      storeName: store.name,
      summary: {
        totalReturns,
        pendingReturns,
        completedReturns,
        completionRate:
          totalReturns > 0
            ? Math.round((completedReturns / totalReturns) * 100)
            : 0,
      },
      topReasons,
      insights: [
        totalReturns > 0
          ? `${pendingReturns} retur menunggu keputusan`
          : "Belum ada retur",
        topReasons.length > 0
          ? `Alasan utama: ${topReasons[0].reason}`
          : "Data belum cukup",
      ],
    };
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return null;
  }
};

export default {
  processConsultation,
  getConsultationHistory,
  getAIInsights,
};
