// AI Analysis Component - AI-powered Return Analysis
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { returnApi } from "../services/api";
import AIChatModal from "./AIChatModal";

const DEMO_USER_ID = "demo-user-id";

// Export function to convert data to CSV
const exportToCSV = (data, filename) => {
  // Summary data
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Re-Route AI Analysis Report\n";
  csvContent += `Export Date: ${new Date().toLocaleDateString("id-ID")}\n\n`;

  // Summary
  csvContent += "SUMMARY\n";
  csvContent += `Total Returns,${data.summary.totalReturns}\n`;
  csvContent += `Total Orders,${data.summary.totalOrders}\n`;
  csvContent += `Return Rate,${data.summary.returnRate}%\n`;
  csvContent += `Avg Processing Days,${data.summary.avgProcessingDays}\n`;
  csvContent += `Top Issue,${data.summary.topIssue}\n\n`;

  // Reasons
  csvContent += "RETURN REASONS ANALYSIS\n";
  csvContent += "Reason,Count,Percentage,Trend,Products\n";
  data.reasons.forEach((item) => {
    csvContent += `"${item.reason}",${item.count},${item.percentage}%,${item.trend},"${item.products.join(", ")}"\n`;
  });
  csvContent += "\n";

  // Products
  csvContent += "PRODUCT INSIGHTS\n";
  csvContent +=
    "Product Name,SKU,Return Count,Main Reason,Severity,Recommendation\n";
  data.productInsights.forEach((item) => {
    csvContent += `"${item.name}","${item.sku}",${item.returnCount},"${item.mainReason}",${item.severity},"${item.recommendation}"\n`;
  });
  csvContent += "\n";

  // Monthly Trend
  csvContent += "MONTHLY TREND\n";
  csvContent += "Month,Returns\n";
  data.monthlyTrend.forEach((item) => {
    csvContent += `${item.month},${item.returns}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AIAnalysis = ({ currentStore }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedPeriod]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // Simulated AI analysis data - in production this would come from an AI API
      const data = {
        summary: {
          totalReturns: 156,
          totalOrders: 1240,
          returnRate: 12.6,
          avgProcessingDays: 2.3,
          topIssue: "Ukuran Tidak Sesuai",
        },
        reasons: [
          {
            reason: "Ukuran Tidak Sesuai",
            count: 45,
            percentage: 28.8,
            trend: "up",
            products: ["Sepatu Sneakers Premium", "Jaket Winter", "Kaos Polos"],
            aiInsight:
              "Berdasarkan analisis, pelanggan sering salah memilih ukuran karena guide ukuran yang tidak jelas di website. Rekomendasi: tambahkan size chart visual dengan pengukuran aktual.",
            recommendation:
              "Perbarui size chart dengan measurements aktual produk",
          },
          {
            reason: "Barang Rusak",
            count: 38,
            percentage: 24.4,
            trend: "down",
            products: ["Elektronik", "Kaca & Keramik", "Mainan"],
            aiInsight:
              "Kerusakan terjadi terutama pada proses pengiriman. Produk kaca/elektronik perlu packing khusus. Rekomendasi: gunakan bubble wrap extra dan padding tambahan.",
            recommendation:
              "Implementasi packing protocol untuk produk fragile",
          },
          {
            reason: "Tidak Sesuai Pesanan",
            count: 32,
            percentage: 20.5,
            trend: "stable",
            products: ["Baju", "Tas", "Aksesoris"],
            aiInsight:
              "Kesalahan pengiriman terjadi karena相似 product names di sistem. Rekomendasi: tambahkan unique SKU verification sebelum shipping.",
            recommendation:
              "Tambahkan QC checklist dengan foto sebelum pengiriman",
          },
          {
            reason: "Warna Tidak Sesuai",
            count: 24,
            percentage: 15.4,
            trend: "up",
            products: ["Baju", "Sepatu", "Tas"],
            aiInsight:
              "Perbedaan warna signifikan karena lighting saat foto produk. Rekomendasi: gunakan standardized photography dengan color correction.",
            recommendation: "Perbaiki lighting dan tambahkan disclaimer warna",
          },
          {
            reason: "Lainnya",
            count: 17,
            percentage: 10.9,
            trend: "down",
            products: ["Mixed"],
            aiInsight:
              "Berbagai alasan termasuk cancel order dan change of mind.",
            recommendation: "Tambahkan opsi resi terpisah untuk partial return",
          },
        ],
        productInsights: [
          {
            name: "Sepatu Sneakers Premium",
            sku: "SEP-001",
            returnCount: 28,
            mainReason: "Ukuran Tidak Sesuai",
            recommendation:
              "Tambahkan detailed size guide dengan foot length measurement",
            severity: "high",
          },
          {
            name: "Tas Ransel Canvas",
            sku: "TAS-003",
            returnCount: 18,
            mainReason: "Warna Tidak Sesuai",
            recommendation:
              "Update product photos dengan lighting yang konsisten",
            severity: "medium",
          },
          {
            name: "Jam Tangan Analog",
            sku: "JAM-005",
            returnCount: 12,
            mainReason: "Barang Rusak",
            recommendation: "Gunakan packaging reinforced untuk produk fragil",
            severity: "high",
          },
        ],
        monthlyTrend: [
          { month: "Jan", returns: 42 },
          { month: "Feb", returns: 38 },
          { month: "Mar", returns: 52 },
          { month: "Apr", returns: 45 },
          { month: "May", returns: 61 },
          { month: "Jun", returns: 58 },
        ],
      };

      setTimeout(() => {
        setAnalysisData(data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") {
      return (
        <svg
          className="w-4 h-4 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }
    if (trend === "down") {
      return (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14"
        />
      </svg>
    );
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "bg-red-100 text-red-800";
    if (severity === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Return Analysis
                </h1>
                <p className="text-gray-500 text-sm">
                  Analytics berbasis AI untuk memahami pola retur
                </p>
              </div>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Menganalisis data...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* AI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {analysisData.summary.totalReturns}
              </p>
              <p className="text-sm text-gray-500">Total Pengembalian</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Return Rate</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {analysisData.summary.returnRate}%
              </p>
              <p className="text-sm text-gray-500">Tingkat Pengembalian</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Avg. Processing</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {analysisData.summary.avgProcessingDays} hari
              </p>
              <p className="text-sm text-gray-500">Rata-rata Waktu Proses</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Top Issue</span>
              </div>
              <p className="text-lg font-bold text-gray-900 truncate">
                {analysisData.summary.topIssue}
              </p>
              <p className="text-sm text-gray-500">Masalah Utama</p>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Return Reasons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Analisis Alasan Retur
                </h2>
              </div>

              <div className="space-y-4">
                {analysisData.reasons.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {item.reason}
                        </span>
                        {getTrendIcon(item.trend)}
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.products.slice(0, 3).map((product, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600"
                        >
                          {product}
                        </span>
                      ))}
                    </div>

                    {/* AI Insight */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                      <div className="flex items-center space-x-1 mb-1">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-purple-700">
                          AI Insight
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{item.aiInsight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Insights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Produk dengan Retur Tinggi
                </h2>
              </div>

              <div className="space-y-4">
                {analysisData.productInsights.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(product.severity)}`}
                      >
                        {product.severity === "high"
                          ? "Tinggi"
                          : product.severity === "medium"
                            ? "Sedang"
                            : "Rendah"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Jumlah Retur</p>
                        <p className="font-bold text-red-600">
                          {product.returnCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Alasan Utama</p>
                        <p className="font-medium text-gray-700">
                          {product.mainReason}
                        </p>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
                      <div className="flex items-center space-x-1 mb-1">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs font-semibold text-green-700">
                          Rekomendasi AI
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        {product.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Tren Pengembalian Bulanan
              </h2>
            </div>

            <div className="flex items-end justify-between h-48">
              {analysisData.monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex items-end justify-center h-36">
                    <div
                      className="w-12 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all hover:from-cyan-400 hover:to-blue-400"
                      style={{ height: `${(item.returns / 70) * 100}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                        {item.returns}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() =>
                analysisData && exportToCSV(analysisData, "re-route-report")
              }
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export Laporan</span>
            </button>
            <button
              onClick={() => setShowChatModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center space-x-2"
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Konsultasi AI</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        storeId={currentStore?.id}
      />
    </div>
  );
};

export default AIAnalysis;
