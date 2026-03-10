// API Service - Communication with Backend
// Re-Route - Reverse Logistics SaaS Platform

import axios from "axios";

// Use relative path for local development (via Vite proxy)
// Or use environment variable for production
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for handling auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Orders API
export const orderApi = {
  create: (data) => api.post("/orders", data),
  getAll: (params) => api.get("/orders", { params }),
  getByNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  updateStatus: (orderId, status) =>
    api.patch(`/orders/${orderId}`, { status }),
};

// Returns API
export const returnApi = {
  submit: (formData) =>
    api.post("/returns/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: (params) => api.get("/returns", { params }),
  getById: (returnId) => api.get(`/returns/${returnId}`),
  approve: (returnId, courierName) =>
    api.patch(`/returns/approve/${returnId}`, { courierName }),
  reject: (returnId, reason) =>
    api.patch(`/returns/reject/${returnId}`, { reason }),
  webhook: (data) => api.post("/returns/webhook/courier", data),
};

// Store API
export const storeApi = {
  getAll: (params) => api.get("/stores", { params }),
  getById: (storeId) => api.get(`/stores/${storeId}`),
  getBySlug: (slug) => api.get(`/stores/slug/${slug}`),
  create: (data) => api.post("/stores", data),
  update: (storeId, data) => api.patch(`/stores/${storeId}`, data),
  delete: (storeId) => api.delete(`/stores/${storeId}`),
  getStats: (storeId) => api.get(`/stores/${storeId}/stats`),
};

// Marketplace API
export const marketplaceApi = {
  getConnections: (params) => api.get("/marketplace/connections", { params }),
  connect: (data) => api.post("/marketplace/connect", data),
  disconnect: (connectionId) =>
    api.delete(`/marketplace/connections/${connectionId}`),
  sync: (data) => api.post("/marketplace/sync", data),
  callback: (data) => api.post("/marketplace/callback", data),
};

// Bulk Upload API
export const bulkApi = {
  upload: (formData) =>
    api.post("/bulk/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getTemplate: () => api.get("/bulk/template"),
  getStatus: (jobId) => api.get(`/bulk/status/${jobId}`),
};

// Label API
export const labelApi = {
  generate: (returnId) => api.post("/labels/generate", { returnId }),
  getByReturn: (returnId) => api.get(`/labels/return/${returnId}`),
  download: (returnId) =>
    api.get(`/labels/download/${returnId}`, { responseType: "blob" }),
};

// Disposition API
export const dispositionApi = {
  analyze: (returnId) => api.post("/disposition/analyze", { returnId }),
  getByReturn: (returnId) => api.get(`/disposition/return/${returnId}`),
  getStats: (params) => api.get("/disposition/stats", { params }),
};

// Chat/Resolution Center API
export const chatApi = {
  getConversations: (params) => api.get("/chat/conversations", { params }),
  getMessages: (conversationId) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data),
  createConversation: (data) => api.post("/chat/conversations", data),
  markAsRead: (conversationId) =>
    api.patch(`/chat/conversations/${conversationId}/read`),

  // Chat with Admin - Client Side
  requestAdminChat: (conversationId, userId) =>
    api.post("/chat/request-admin", { conversationId, userId }),

  // Chat with Admin - Admin Side
  getAdminConversations: (params) =>
    api.get("/chat/admin/conversations", { params }),
  acceptChat: (conversationId, merchantId) =>
    api.post("/chat/accept-chat", { conversationId, merchantId }),
};

// Revenue API (Owner Dashboard)
export const revenueApi = {
  getDashboard: (params) => api.get("/revenue/dashboard", { params }),
  getTransactions: (params) => api.get("/revenue/transactions", { params }),
  getMerchants: (params) => api.get("/revenue/merchants", { params }),
  exportReport: (params) => api.get("/revenue/export", { params }),
  recordTransaction: (data) => api.post("/revenue/record", data),
};

// Fraud API (Owner Dashboard)
export const fraudApi = {
  getDashboard: (params) => api.get("/fraud/dashboard", { params }),
  getAlerts: (params) => api.get("/fraud/alerts", { params }),
  getAlertDetails: (alertId) => api.get(`/fraud/alerts/${alertId}`),
  updateAlert: (alertId, data) => api.patch(`/fraud/alerts/${alertId}`, data),
  checkCustomer: (customerId) => api.get(`/fraud/check/${customerId}`),
  checkReturn: (returnId) => api.post("/fraud/check-return", { returnId }),
  getStats: (params) => api.get("/fraud/stats", { params }),
};

// Inventory API
export const inventoryApi = {
  getAll: (params) => api.get("/inventory", { params }),
  getBySku: (productSku) => api.get(`/inventory/${productSku}`),
  create: (data) => api.post("/inventory", data),
  update: (productSku, data) => api.patch(`/inventory/${productSku}`, data),
  delete: (productSku) => api.delete(`/inventory/${productSku}`),
  getLowStock: (params) => api.get("/inventory/low-stock", { params }),
};

// Auth API
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  changePassword: (data) => api.patch("/auth/password", data),
  updateProfile: (data) => api.patch("/auth/profile", data),
};

// AI Consultation API
export const aiApi = {
  consult: (data) => api.post("/ai/consult", data),
  getInsights: (storeId) => api.get(`/ai/insights/${storeId}`),
  getHistory: (params) => api.get("/ai/history", { params }),
};

// Health check
export const healthCheck = () => api.get("/health");

export default api;
