// Admin Dashboard Component - Complete Admin Features
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { returnApi, inventoryApi, orderApi, chatApi } from "../services/api";
import StoreSwitcher from "./StoreSwitcher";
import CustomerService from "./CustomerService";

const COURIERS = [
  { id: "jne", name: "JNE Express" },
  { id: "sicepat", name: "SiCepat" },
  { id: "jnt", name: "J&T Express" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("returns");
  const [returns, setReturns] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState("jne");
  const [actionLoading, setActionLoading] = useState(false);

  // Store management state
  const [currentStore, setCurrentStore] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchReturns();
    fetchInventory();
    fetchOrders();
    fetchConversations();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await returnApi.getAll({ userId: user?.id });
      setReturns(response.data.data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryApi.getAll({ userId: user?.id });
      setInventory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAll({ userId: user?.id });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getConversations({ userId: user?.id });
      setConversations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleApprove = async () => {
    if (!selectedReturn) return;
    setActionLoading(true);

    try {
      const response = await returnApi.approve(
        selectedReturn.id,
        selectedCourier,
      );
      alert(
        `Return approved!\n\nWaybill: ${response.data.data.waybillNumber}\nCourier: ${response.data.data.courierName}`,
      );
      setShowApproveModal(false);
      setSelectedReturn(null);
      fetchReturns();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (returnId) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;

    try {
      await returnApi.reject(returnId, reason);
      alert("Return request rejected");
      fetchReturns();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleWebhookTest = async () => {
    if (!selectedReturn?.waybillNumber) {
      alert("No waybill number available");
      return;
    }

    try {
      const response = await returnApi.webhook({
        waybillNumber: selectedReturn.waybillNumber,
        status: "DELIVERED",
        location: "Surabaya Gudang",
      });

      alert(
        `Webhook processed!\n\nStatus: ${response.data.data.newStatus}\nInventory Updated: ${response.data.data.inventoryUpdated}`,
      );
      setShowWebhookModal(false);
      setSelectedReturn(null);
      fetchReturns();
      fetchInventory();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "status-pending",
      approved: "status-approved",
      shipped: "status-shipped",
      received: "status-received",
      rejected: "status-rejected",
    };
    const labels = {
      pending: "Menunggu",
      approved: "Disetujui",
      shipped: "Dikirim",
      received: "Diterima",
      rejected: "Ditolak",
    };
    return (
      <span
        className={`status-badge ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getOrderStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "Menunggu",
      shipped: "Dikirim",
      delivered: "Diterima",
      cancelled: "Dibatalkan",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getReturnStats = () => {
    return {
      total: returns.length,
      pending: returns.filter((r) => r.status === "pending").length,
      approved: returns.filter((r) => r.status === "approved").length,
      shipped: returns.filter((r) => r.status === "shipped").length,
      received: returns.filter((r) => r.status === "received").length,
    };
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  };

  const returnStats = getReturnStats();
  const orderStats = getOrderStats();

  // Tab configuration
  const tabs = [
    {
      id: "returns",
      label: "Pengembalian",
      icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
    },
    {
      id: "orders",
      label: "Pesanan",
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    },
    {
      id: "inventory",
      label: "Inventori",
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      id: "customerservice",
      label: "Customer Service",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Store Identity */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Store Switcher */}
            <div className="flex items-center space-x-4">
              <StoreSwitcher
                currentStore={currentStore}
                onStoreChange={setCurrentStore}
              />

              {/* Divider */}
              <div className="h-10 w-px bg-gray-200"></div>

              {/* Page Title */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dashboard Admin
                </h1>
                <p className="text-sm text-gray-500">
                  Kelola pengembalian, pesanan, dan inventori
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 mr-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {returnStats.pending}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {returnStats.received}
                  </p>
                  <p className="text-xs text-gray-500">Selesai</p>
                </div>
              </div>

              <Link
                to="/admin/ai-analysis"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all"
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>AI Analysis</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900">
              {returnStats.total}
            </p>
            <p className="text-sm text-gray-600">Total Retur</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {returnStats.pending}
            </p>
            <p className="text-sm text-gray-600">Menunggu</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">
              {returnStats.approved}
            </p>
            <p className="text-sm text-gray-600">Disetujui</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-purple-600">
              {returnStats.shipped}
            </p>
            <p className="text-sm text-gray-600">Dikirim</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">
              {returnStats.received}
            </p>
            <p className="text-sm text-gray-600">Diterima</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-reRoute-blue text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
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
                  d={tab.icon}
                />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Returns Tab */}
        {activeTab === "returns" && (
          <div className="card animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">
              Daftar Pengajuan Retur
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Memuat...</p>
              </div>
            ) : returns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                <p>Belum ada pengajuan retur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        No. Retur
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        No. Pesanan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Produk
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Alasan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret) => (
                      <tr
                        key={ret.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {ret.returnNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {ret.order?.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {ret.order?.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {ret.reason}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(ret.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {ret.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedReturn(ret);
                                    setShowApproveModal(true);
                                  }}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                  Setuju
                                </button>
                                <button
                                  onClick={() => handleReject(ret.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            {(ret.status === "approved" ||
                              ret.status === "shipped") &&
                              ret.waybillNumber && (
                                <button
                                  onClick={() => {
                                    setSelectedReturn(ret);
                                    setShowWebhookModal(true);
                                  }}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                >
                                  Test Webhook
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="card animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Daftar Pesanan</h2>
              <Link
                to="/admin/orders/manual"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Tambah Pesanan
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p>Belum ada pesanan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        No. Pesanan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Produk
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Pelanggan
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Sumber
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.customerName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          Rp {order.price?.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4">
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">
                          {order.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="card animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inventori Gudang</h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                + Tambah Stok
              </button>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                <p>Inventori kosong</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Produk
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">
                        Stok
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Lokasi
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Kondisi
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Terakhir Update
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {item.productSku}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.productName}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-bold ${item.quantity < 5 ? "text-red-600" : item.quantity < 10 ? "text-yellow-600" : "text-green-600"}`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.location}
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">
                          {item.condition}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Customer Service Tab */}
        {activeTab === "customerservice" && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Customer Service</h2>
            <CustomerService userRole="admin" userId={user?.id} />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="card animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Analytics & Laporan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Total Pesanan</h3>
                <p className="text-4xl font-bold">{orderStats.total}</p>
                <p className="text-blue-100 text-sm mt-2">Semua waktu</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Pesanan Selesai</h3>
                <p className="text-4xl font-bold">{orderStats.delivered}</p>
                <p className="text-green-100 text-sm mt-2">Semua waktu</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Total Retur</h3>
                <p className="text-4xl font-bold">{returnStats.total}</p>
                <p className="text-purple-100 text-sm mt-2">Semua waktu</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Retur Berhasil Diproses</h3>
                <p className="text-4xl font-bold">{returnStats.received}</p>
                <p className="text-orange-100 text-sm mt-2">Semua waktu</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="card animate-fadeIn">
            <h2 className="text-lg font-semibold mb-4">Pengaturan</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Informasi Toko
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      defaultValue={currentStore?.name || "Toko Saya"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Alamat
                    </label>
                    <input
                      type="text"
                      defaultValue={currentStore?.address || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Pengaturan Notifikasi
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className="text-gray-700">
                      Terima notifikasi email untuk retur baru
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className="text-gray-700">
                      Terima notifikasi email untuk pesanan baru
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-700">Terima notifikasi SMS</span>
                  </label>
                </div>
              </div>
              <div>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">
              Setuju & Generate Waybill
            </h3>
            <p className="text-gray-600 mb-4">
              Pilih kurir untuk menghasilkan label pengiriman:
            </p>

            <div className="space-y-2 mb-6">
              {COURIERS.map((courier) => (
                <label
                  key={courier.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="courier"
                    value={courier.id}
                    checked={selectedCourier === courier.id}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="mr-3"
                  />
                  <span>{courier.name}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 btn-secondary"
                disabled={actionLoading}
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 btn-primary"
                disabled={actionLoading}
              >
                {actionLoading ? "Memproses..." : "Generate Waybill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Test Modal */}
      {showWebhookModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">
              Simulasi Paket Diterima
            </h3>
            <p className="text-gray-600 mb-4">
              Klik tombol di bawah untuk mensimulasikan bahwa paket telah sampai
              di gudang. Sistem akan otomatis mengupdate status dan menambah
              stok inventori (+1).
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Waybill:</p>
              <p className="font-mono font-bold">
                {selectedReturn.waybillNumber}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="flex-1 btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleWebhookTest}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Paket Diterima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
