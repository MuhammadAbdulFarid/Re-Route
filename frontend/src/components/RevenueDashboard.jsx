// Revenue Dashboard Component - Platform Owner View
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { revenueApi } from "../services/api";

const RevenueDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await revenueApi.getDashboard({ period });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching revenue dashboard:", error);
      // Demo data fallback
      setData({
        period: `${period} days`,
        metrics: {
          totalRevenue: {
            current: 15750000,
            previous: 12300000,
            growth: 28.05,
          },
          subscriptionFee: {
            current: 8500000,
            previous: 7000000,
            growth: 21.43,
          },
          serviceFee: {
            current: 4250000,
            previous: 3300000,
            growth: 28.79,
          },
          logisticsKickback: {
            current: 3000000,
            previous: 2000000,
            growth: 50.0,
          },
          transactionCount: {
            completed: 145,
            pending: 12,
            failed: 3,
          },
        },
        subscriptionStats: {
          totalSubscriptions: 48,
          byPlan: { starter: 25, professional: 15, enterprise: 8 },
          monthlyRecurringRevenue: 8500000,
          estimatedARR: 102000000,
        },
        kickbackStats: {
          totalReturns: 89,
          estimatedTotalKickback: 3000000,
          byCourier: {
            jne: { count: 35, shippingCost: 8750000, kickback: 875000 },
            sicepat: { count: 30, shippingCost: 7500000, kickback: 750000 },
            jnt: { count: 24, shippingCost: 6000000, kickback: 600000 },
          },
          assumedKickbackRate: "10%",
        },
        merchantCount: 52,
        activeStores: 67,
        trends: [
          {
            date: "2024-01-01",
            subscription: 250000,
            service: 120000,
            kickback: 80000,
            total: 450000,
          },
          {
            date: "2024-01-02",
            subscription: 280000,
            service: 140000,
            kickback: 90000,
            total: 510000,
          },
          {
            date: "2024-01-03",
            subscription: 270000,
            service: 130000,
            kickback: 85000,
            total: 485000,
          },
          {
            date: "2024-01-04",
            subscription: 300000,
            service: 150000,
            kickback: 100000,
            total: 550000,
          },
          {
            date: "2024-01-05",
            subscription: 320000,
            service: 160000,
            kickback: 110000,
            total: 590000,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    metrics,
    subscriptionStats,
    kickbackStats,
    merchantCount,
    activeStores,
  } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Revenue Dashboard
            </h1>
            <p className="text-gray-500">Pantau pendapatan platform Re-Route</p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Periode:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 Hari</option>
              <option value="30">30 Hari</option>
              <option value="90">90 Hari</option>
              <option value="365">1 Tahun</option>
            </select>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Total Revenue
              </span>
              <span
                className={`text-xs font-medium ${metrics?.totalRevenue?.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {metrics?.totalRevenue?.growth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(metrics?.totalRevenue?.growth || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics?.totalRevenue?.current || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              vs {formatCurrency(metrics?.totalRevenue?.previous || 0)} periode
              sebelumnya
            </p>
          </div>

          {/* Subscription Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Subscription Fee
              </span>
              <span
                className={`text-xs font-medium ${metrics?.subscriptionFee?.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {metrics?.subscriptionFee?.growth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(metrics?.subscriptionFee?.growth || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics?.subscriptionFee?.current || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              MRR:{" "}
              {formatCurrency(subscriptionStats?.monthlyRecurringRevenue || 0)}
            </p>
          </div>

          {/* Service Fee */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Service Fee
              </span>
              <span
                className={`text-xs font-medium ${metrics?.serviceFee?.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {metrics?.serviceFee?.growth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(metrics?.serviceFee?.growth || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics?.serviceFee?.current || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Per transaksi retur sukses
            </p>
          </div>

          {/* Logistics Kickback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Logistics Kickback
              </span>
              <span
                className={`text-xs font-medium ${metrics?.logisticsKickback?.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {metrics?.logisticsKickback?.growth >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(metrics?.logisticsKickback?.growth || 0).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics?.logisticsKickback?.current || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Estimasi dari kurir partner
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Detail Langganan
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Merchant</span>
                <span className="font-medium">
                  {formatNumber(merchantCount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Toko Aktif</span>
                <span className="font-medium">
                  {formatNumber(activeStores || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Total Langganan Aktif
                </span>
                <span className="font-medium">
                  {formatNumber(subscriptionStats?.totalSubscriptions || 0)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Est. ARR</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(subscriptionStats?.estimatedARR || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Kickback Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Kickback per Kurir
            </h3>
            <div className="space-y-4">
              {Object.entries(kickbackStats?.byCourier || {}).map(
                ([courier, data]) => (
                  <div key={courier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">
                        {courier}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(data.kickback)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(data.kickback / kickbackStats.estimatedTotalKickback) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.count} retur • {formatCurrency(data.shippingCost)}{" "}
                      ongkos kirim
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Ringkasan Transaksi
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <span className="text-sm text-gray-700">Sukses</span>
                </div>
                <span className="font-bold text-green-700">
                  {formatNumber(metrics?.transactionCount?.completed || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
                <span className="font-bold text-yellow-700">
                  {formatNumber(metrics?.transactionCount?.pending || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Gagal</span>
                </div>
                <span className="font-bold text-red-700">
                  {formatNumber(metrics?.transactionCount?.failed || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
