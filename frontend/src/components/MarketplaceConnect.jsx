// Marketplace Connect Component - Omnichannel Integration
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { marketplaceApi, storeApi } from "../services/api";

const DEMO_USER_ID = "demo-user-id";

// Marketplace configurations
const MARKETPLACES = [
  {
    id: "shopee",
    name: "Shopee",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee.svg/1200px-Shopee.svg.png",
    color: "#EE4D2D",
    description: "Sinkronkan pesanan dari Shopee",
  },
  {
    id: "tokopedia",
    name: "Tokopedia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Tokopedia.svg/1200px-Tokopedia.svg.png",
    color: "#00AA45",
    description: "Sinkronkan pesanan dari Tokopedia",
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Icon_huluscripta-02.svg/1200px-Icon_huluscripta-02.svg.png",
    color: "#000000",
    description: "Sinkronkan pesanan dari TikTok Shop",
  },
];

const MarketplaceConnect = ({ currentStore, onStoreChange }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null); // marketplace ID being connected
  const [syncing, setSyncing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState(null);

  // Demo store for connection
  const storeId = currentStore?.id || "demo-store-1";

  useEffect(() => {
    fetchConnections();
  }, [storeId]);

  const fetchConnections = async () => {
    try {
      const response = await marketplaceApi.getConnections({ storeId });
      setConnections(response.data.data || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (marketplace) => {
    setConnecting(marketplace.id);
    setSelectedMarketplace(marketplace);

    try {
      // Initiate OAuth connection
      const response = await marketplaceApi.connect({
        marketplace: marketplace.id,
        storeId,
      });

      // In production, this would redirect to OAuth URL
      // For demo, we simulate the callback
      const { authUrl } = response.data.data;

      // Show modal with OAuth simulation
      setShowModal(true);

      console.log("OAuth URL:", authUrl);
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setConnecting(null);
    }
  };

  const handleOAuthCallback = async () => {
    if (!selectedMarketplace) return;

    try {
      // Simulate OAuth callback
      await marketplaceApi.callback({
        marketplace: selectedMarketplace.id,
        code: "demo_auth_code",
        shopId: `shop_${selectedMarketplace.id}_123`,
        shopName: `${selectedMarketplace.name} Official Store`,
        connectionId: `conn_${Date.now()}`,
      });

      alert(`${selectedMarketplace.name} berhasil terhubung!`);
      setShowModal(false);
      fetchConnections();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDisconnect = async (connectionId, marketplaceName) => {
    if (
      !confirm(`Apakah Anda yakin ingin memutuskan koneksi ${marketplaceName}?`)
    ) {
      return;
    }

    try {
      await marketplaceApi.disconnect(connectionId);
      alert(`${marketplaceName} telah diputuskan`);
      fetchConnections();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSync = async (marketplaceId) => {
    setSyncing(marketplaceId);

    try {
      const response = await marketplaceApi.sync({
        storeId,
        marketplace: marketplaceId,
      });

      const { totalSynced } = response.data.data;
      alert(`Sinkronisasi selesai! ${totalSynced} pesanan baru diimpor.`);
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(null);
    }
  };

  const getConnectionStatus = (marketplaceId) => {
    return connections.find(
      (c) => c.marketplace === marketplaceId && c.isActive,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrasi Marketplace
          </h1>
          <p className="text-gray-600">
            Hubungkan toko Anda dengan berbagai platform marketplace
          </p>
        </div>

        {/* Marketplace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MARKETPLACES.map((marketplace) => {
            const connection = getConnectionStatus(marketplace.id);
            const isConnecting = connecting === marketplace.id;

            return (
              <div
                key={marketplace.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div
                  className="h-2"
                  style={{ backgroundColor: marketplace.color }}
                ></div>

                <div className="p-6">
                  {/* Logo */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 flex items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: marketplace.color }}
                      >
                        {marketplace.name.charAt(0)}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                    {marketplace.name}
                  </h3>

                  <p className="text-sm text-gray-500 text-center mb-4">
                    {marketplace.description}
                  </p>

                  {/* Status */}
                  {connection ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm font-medium text-green-600">
                          Terhubung
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 text-center">
                        {connection.shopName}
                      </p>

                      <p className="text-xs text-gray-400 text-center">
                        Terakhir sync:{" "}
                        {connection.lastSync
                          ? new Date(connection.lastSync).toLocaleDateString(
                              "id-ID",
                            )
                          : "Belum pernah"}
                      </p>

                      {/* Actions */}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleSync(marketplace.id)}
                          disabled={syncing === marketplace.id}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                          {syncing === marketplace.id
                            ? "Menyinkronkan..."
                            : "Sync Sekarang"}
                        </button>
                        <button
                          onClick={() =>
                            handleDisconnect(connection.id, marketplace.name)
                          }
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg transition-colors"
                        >
                          Putus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(marketplace)}
                      disabled={isConnecting}
                      className="w-full mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isConnecting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Menghubungkan...</span>
                        </>
                      ) : (
                        <span>Hubungkan</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                Cara Menghubungkan Marketplace
              </h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>
                  1. Klik tombol "Hubungkan" pada marketplace yang diinginkan
                </li>
                <li>2. Anda akan diarahkan ke halaman login marketplace</li>
                <li>3. Izinkan akses Re-Route untuk mengakses data pesanan</li>
                <li>
                  4. Setelah terhubung, pesanan akan otomatis tersinkronisasi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth Simulation Modal */}
      {showModal && selectedMarketplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4"
                style={{ backgroundColor: selectedMarketplace.color }}
              >
                {selectedMarketplace.name.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold">
                Hubungkan ke {selectedMarketplace.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Anda akan diarahkan ke halaman resmi {selectedMarketplace.name}{" "}
                untuk memberikan izin akses
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">
                Izin yang diperlukan:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Akses data pesanan</li>
                <li>✓ Akses data produk</li>
                <li>✓ Akses data pelanggan</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleOAuthCallback}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Lanjutkan (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceConnect;
