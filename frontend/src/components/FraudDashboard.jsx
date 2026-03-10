// Fraud Detection Dashboard Component
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { fraudApi } from "../services/api";

const FraudDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fraudApi.getDashboard({ period });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching fraud dashboard:", error);
      // Demo data fallback
      setData({
        stats: {
          total: 12,
          open: 4,
          critical: 2,
          high: 3,
          medium: 4,
          low: 3,
        },
        recentAlerts: [
          {
            id: "alert-1",
            type: "suspicious_return_pattern",
            severity: "critical",
            status: "open",
            description: "Pelanggan dengan 5+ retur dalam 30 hari",
            customerId: "cust-001",
            createdAt: new Date().toISOString(),
          },
          {
            id: "alert-2",
            type: "fake_photo",
            severity: "high",
            status: "investigating",
            description: "Foto bukti retur terlihat manipulatif",
            customerId: "cust-002",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "alert-3",
            type: "multiple_returns",
            severity: "high",
            status: "open",
            description: "3 pengembalian untuk produk sama dalam minggu ini",
            customerId: "cust-003",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        highRiskCustomers: [
          {
            customerId: "cust-001",
            customerName: "Ahmad Fauzi",
            totalReturns: 7,
            totalOrders: 8,
            returnRate: 87.5,
            riskLevel: "critical",
          },
          {
            customerId: "cust-002",
            customerName: "Siti Rahayu",
            totalReturns: 5,
            totalOrders: 10,
            returnRate: 50,
            riskLevel: "high",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlert = async (alertId, status) => {
    try {
      await fraudApi.updateAlert(alertId, { status });
      fetchDashboard();
    } catch (error) {
      console.error("Error updating alert:", error);
      // Demo fallback
      setData((prev) => ({
        ...prev,
        recentAlerts: prev.recentAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, status } : alert,
        ),
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[severity] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-red-100 text-red-700",
      investigating: "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
      dismissed: "bg-gray-100 text-gray-700",
    };
    return colors[status] || colors.open;
  };

  const getTypeLabel = (type) => {
    const labels = {
      suspicious_return_pattern: "Pola Retur Mencurigakan",
      fake_photo: "Foto Palsu",
      multiple_returns: "Retur Berlebihan",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentAlerts, highRiskCustomers } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fraud Detection
            </h1>
            <p className="text-gray-500">Deteksi aktivitas mencurigakan</p>
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
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.open || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">
                  {stats?.open || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.critical || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">
                  {stats?.critical || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats?.high || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">
                  {stats?.high || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentAlerts?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>Tidak ada alerts</p>
                </div>
              ) : (
                recentAlerts?.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}
                          >
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {getTypeLabel(alert.type)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {alert.status === "open" && (
                          <button
                            onClick={() =>
                              handleUpdateAlert(alert.id, "investigating")
                            }
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Investigasi
                          </button>
                        )}
                        {alert.status === "investigating" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateAlert(alert.id, "resolved")
                              }
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateAlert(alert.id, "dismissed")
                              }
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* High Risk Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                High Risk Customers
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {highRiskCustomers?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Tidak ada pelanggan risiko tinggi</p>
                </div>
              ) : (
                highRiskCustomers?.map((customer) => (
                  <div
                    key={customer.customerId}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {customer.customerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.customerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.totalOrders} pesanan •{" "}
                            {customer.totalReturns} retur
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            customer.riskLevel === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {customer.riskLevel === "critical"
                            ? "Critical"
                            : "High"}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {customer.returnRate}% return rate
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudDashboard;
