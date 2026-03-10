// White-Label Return Portal Component
// Re-Route - Reverse Logistics SaaS Platform (Branded for Store)

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { storeApi, returnApi } from "../services/api";

const RETURN_REASONS = [
  { value: "barang_rusak", label: "Barang Rusak" },
  { value: "salah_size", label: "Salah Size/Ukuran" },
  { value: "salah_kirim", label: "Salah Kirim" },
  { value: "tidak_sesuai", label: "Tidak Sesuai Pesanan" },
  { value: "lainnya", label: "Lainnya" },
];

const WhiteLabelPortal = () => {
  const { storeSlug } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    orderNumber: "",
    reason: "",
    description: "",
    userId: "",
  });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchStore();
  }, [storeSlug]);

  const fetchStore = async () => {
    try {
      const response = await storeApi.getBySlug(storeSlug);
      setStore(response.data.data);

      // Create or get customer user ID based on localStorage or session
      const savedCustomer = localStorage.getItem("customer");
      if (savedCustomer) {
        setFormData((prev) => ({ ...prev, userId: savedCustomer }));
      } else {
        // Generate a temporary customer ID
        const tempId = `cust-${Date.now()}`;
        localStorage.setItem("customer", tempId);
        setFormData((prev) => ({ ...prev, userId: tempId }));
      }
    } catch (err) {
      setError("Toko tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran foto maksimal 5MB");
        return;
      }
      setPhoto(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("orderNumber", formData.orderNumber);
      submitData.append("reason", formData.reason);
      submitData.append("description", formData.description);
      submitData.append("userId", formData.userId);
      submitData.append("storeId", store.id);
      if (photo) {
        submitData.append("photo", photo);
      }

      const response = await returnApi.submit(submitData);
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      reason: "",
      description: "",
      userId: formData.userId,
    });
    setPhoto(null);
    setResult(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Toko Tidak Ditemukan
          </h1>
          <p className="text-gray-500">
            Halaman yang Anda cari tidak tersedia.
          </p>
        </div>
      </div>
    );
  }

  // Custom colors based on store branding
  const brandColor = store?.brandColor || "#3B82F6";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* White-Label Header - Store Branding */}
        <div className="text-center mb-8">
          {/* Store Logo */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden">
            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-700">
                {store?.name?.charAt(0) || "T"}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {store?.name || "Portal Pengembalian"}
          </h1>
          <p className="text-gray-600">
            Kembalikan barang dengan mudah melalui halaman resmi kami
          </p>

          {store?.address && (
            <p className="text-sm text-gray-500 mt-2">{store.address}</p>
          )}
        </div>

        {/* Success Result */}
        {result && (
          <div className="card mb-6 bg-green-50 border-green-200 animate-fadeIn">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Pengajuan Retur Berhasil!
              </h3>
              <p className="text-green-700 mb-4">
                Nomor Retur:{" "}
                <span className="font-bold">{result.data?.returnNumber}</span>
              </p>
              <p className="text-sm text-green-600 mb-4">{result.message}</p>
              <button onClick={resetForm} className="btn-primary">
                Kembalikan Barang Lain
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Return Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="card animate-fadeIn">
            {/* Order Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Pesanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                placeholder="Contoh: ORD-2024-001"
                className="input-field"
                required
              />
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Pengembalian <span className="text-red-500">*</span>
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Pilih alasan...</option>
                {RETURN_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan Tambahan
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Jelaskan detail masalah barang..."
                rows="3"
                className="input-field resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Bukti <span className="text-gray-400">(Opsional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {photo ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-10 h-10 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 mb-2">
                      Klik untuk upload foto bukti
                    </p>
                    <p className="text-xs text-gray-400">
                      Format: JPG, PNG (Maks. 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-lg font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: brandColor }}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mengirim...
                </span>
              ) : (
                "Ajukan Pengembalian"
              )}
            </button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Dengan mengajukan retur, Anda setuju dengan kebijakan pengembalian
              barang kami.
            </p>
          </form>
        )}

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {store?.phone && <p>Hubungi kami: {store.phone}</p>}
          {store?.email && <p>Email: {store.email}</p>}
        </div>

        {/* Footer - Powered by Re-Route (subtle) */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-medium">Re-Route</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelPortal;
