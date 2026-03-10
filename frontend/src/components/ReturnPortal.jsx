// Return Portal Component - Consumer Return Submission
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useEffect } from "react";
import { returnApi } from "../services/api";

// Demo user ID - in production this would come from auth
// For demo, we'll fetch from localStorage or use a placeholder that works with seeded data
const getDemoUserId = () => {
  // Try to get from localStorage after login
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      return user.id;
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }
  // Return a placeholder - backend should handle this for demo purposes
  return "demo-user-id";
};

const RETURN_REASONS = [
  { value: "barang_rusak", label: "Barang Rusak" },
  { value: "salah_size", label: "Salah Size/Ukuran" },
  { value: "salah_kirim", label: "Salah Kirim" },
  { value: "tidak_sesuai", label: "Tidak Sesuai Pesanan" },
  { value: "lainnya", label: "Lainnya" },
];

const ReturnPortal = () => {
  const [formData, setFormData] = useState({
    orderNumber: "",
    reason: "",
    description: "",
    userId: getDemoUserId(),
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Update userId when localStorage changes (after login)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, userId: getDemoUserId() }));
  }, []);

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
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("orderNumber", formData.orderNumber);
      submitData.append("reason", formData.reason);
      submitData.append("description", formData.description);
      submitData.append("userId", formData.userId);
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
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      reason: "",
      description: "",
      userId: getDemoUserId(),
    });
    setPhoto(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-reRoute-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Pengembalian Barang
          </h1>
          <p className="text-gray-600">
            Kembalikan barang dengan mudah. Masukkan nomor pesanan danupload
            foto bukti.
          </p>
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
              <p className="text-sm text-green-600">{result.message}</p>
              <button onClick={resetForm} className="mt-4 btn-primary">
                Kembalikan Barang Lain
              </button>
            </div>
          </div>
        )}

        {/* Return Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="card animate-fadeIn">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

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
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nomor pesanan Anda dari faktur atau email konfirmasi.
              </p>
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-reRoute-blue transition-colors">
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
                      Klik untuk upload foto bukti kerusakan
                    </p>
                    <p className="text-xs text-gray-400">
                      Format: JPG, PNG, GIF (Maks. 5MB)
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
              disabled={loading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Nomor Pesanan Demo:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• ORD-2024-001 - Sepatu Sneakers Premium</li>
            <li>• ORD-2024-002 - Tas Ransel Canvas</li>
            <li>• ORD-2024-003 - Jam Tangan Analog</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReturnPortal;
