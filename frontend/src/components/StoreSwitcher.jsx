// Store Switcher Component - Multi-Store Management
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { storeApi, authApi } from "../services/api";
import AddStoreModal from "./AddStoreModal";

// Use seeded admin user for demo
const DEMO_USER_EMAIL = "unismuh.store@reroute.id";

// Helper to get store type badge
const getStoreTypeBadge = (type, isPreOrder) => {
  if (type === "marketplace") {
    return {
      label: "Marketplace",
      color: "bg-blue-100 text-blue-700",
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    };
  }
  if (type === "preorder" || isPreOrder) {
    return {
      label: "Pre-Order",
      color: "bg-purple-100 text-purple-700",
      icon: (
        <svg
          className="w-3 h-3"
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
      ),
    };
  }
  return {
    label: "Offline",
    color: "bg-green-100 text-green-700",
    icon: (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  };
};

const StoreSwitcher = ({ currentStore, onStoreChange }) => {
  const [stores, setStores] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      // First, get the user by email to find the userId
      const userResponse = await authApi.login({
        email: DEMO_USER_EMAIL,
        password: "password123",
      });

      const foundUserId = userResponse.data.data?.user?.id;

      if (foundUserId) {
        const response = await storeApi.getAll({ userId: foundUserId });
        setStores(response.data.data || []);

        // If no current store but stores exist, select first one
        if (!currentStore && response.data.data?.length > 0) {
          onStoreChange(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      // Add demo store if none exists
      setStores([
        {
          id: "demo-store-1",
          name: "Toko Demo Utama",
          slug: "toko-demo-utama",
          logo: null,
          description: "Toko utama untuk demo",
          type: "standalone",
          isPreOrder: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    onStoreChange(store);
    setIsOpen(false);
  };

  const handleStoreCreated = (newStore) => {
    setStores((prev) => [newStore, ...prev]);
    onStoreChange(newStore);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        {/* Store Logo */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {currentStore?.logo ? (
            <img
              src={currentStore.logo}
              alt={currentStore.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {currentStore?.name?.charAt(0) || "T"}
            </span>
          )}
        </div>

        {/* Store Name */}
        <div className="text-left">
          <p className="text-xs text-gray-500">Toko Aktif</p>
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900 truncate max-w-[120px]">
              {currentStore?.name || "Pilih Toko"}
            </p>
            {currentStore && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStoreTypeBadge(currentStore?.type, currentStore?.isPreOrder).color}`}
              >
                {
                  getStoreTypeBadge(
                    currentStore?.type,
                    currentStore?.isPreOrder,
                  ).icon
                }
                <span className="ml-1">
                  {
                    getStoreTypeBadge(
                      currentStore?.type,
                      currentStore?.isPreOrder,
                    ).label
                  }
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pilih Toko
            </p>
          </div>

          {/* Store List */}
          <div className="max-h-64 overflow-y-auto">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentStore?.id === store.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {store.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {store.name}
                    </p>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStoreTypeBadge(store.type, store.isPreOrder).color}`}
                    >
                      {getStoreTypeBadge(store.type, store.isPreOrder).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {store._count?.orders || 0} pesanan •{" "}
                    {store._count?.returnRequests || 0} retur
                  </p>
                </div>

                {currentStore?.id === store.id && (
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Add New Store Button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowAddModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="font-medium">Tambah Toko Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onStoreCreated={handleStoreCreated}
      />
    </div>
  );
};

export default StoreSwitcher;
