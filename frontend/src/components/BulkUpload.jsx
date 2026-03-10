// Bulk Upload Component - CSV/Excel Order Import
// Re-Route - Reverse Logistics SaaS Platform

import { useState, useRef } from "react";
import { bulkApi } from "../services/api";

const DEMO_USER_ID = "demo-user-id";

// CSV Template
const CSV_TEMPLATE = `orderNumber,customerName,customerPhone,customerEmail,productName,productSku,quantity,price
ORD-001,Ahmad Fauzi,081234567890,ahmad@example.com,Sepatu Sneakers,SEP-001,1,299000
ORD-002,Siti Rahayu,089876543210,siti@example.com,Tas Ransel,TAS-002,2,175000
ORD-003,Budi Santoso,085678901234,budi@example.com,Jam Tangan,JM-003,1,450000`;

const BulkUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    // Also accept .csv and .xlsx extensions
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const extension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(extension)) {
      setError("Format file tidak valid. Gunakan CSV atau Excel (.xlsx)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);

    // Parse CSV for preview
    try {
      const text = await selectedFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate required headers
      const requiredHeaders = [
        "orderNumber",
        "customerName",
        "customerPhone",
        "productName",
        "price",
      ];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingHeaders.length > 0) {
        setError(`Kolom wajib tidak lengkap: ${missingHeaders.join(", ")}`);
        return;
      }

      // Parse preview rows (max 5)
      const previewRows = lines.slice(1, 6).map((line) => {
        const values = line.split(",");
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });
        return row;
      });

      setPreview(previewRows);
    } catch (err) {
      setError("Gagal membaca file. Pastikan format CSV benar.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", DEMO_USER_ID);

      const response = await bulkApi.upload(formData);

      setSuccess({
        message: `Berhasil mengimpor ${response.data.data.successful} pesanan`,
        failed: response.data.data.failed,
      });

      if (onSuccess) {
        onSuccess(response.data.data);
      }

      // Reset
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengupload file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_pesanan.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Massal Pesanan
          </h2>
          <p className="text-sm text-gray-500">
            Import pesanan dari file CSV atau Excel
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="m-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
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
              <div>
                <p className="font-medium text-green-800">{success.message}</p>
                {success.failed > 0 && (
                  <p className="text-sm text-green-600">
                    {success.failed} pesanan gagal diimport
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Download Template */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download Template CSV</span>
            </button>
          </div>

          {/* Drop Zone */}
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
              />

              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Klik atau drag file ke sini
                  </p>
                  <p className="text-sm text-gray-500">
                    Mendukung file CSV, XLSX, XLS
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 text-gray-400 hover:text-red-500"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Preview Table */}
              {preview.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Preview ({preview.length} baris pertama)
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            No. Pesanan
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Pelanggan
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            No. HP
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">
                            Produk
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Jumlah
                          </th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">
                            Harga
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, index) => (
                          <tr key={index} className="border-t border-gray-100">
                            <td className="px-4 py-2">{row.ordernumber}</td>
                            <td className="px-4 py-2">{row.customername}</td>
                            <td className="px-4 py-2">{row.customerphone}</td>
                            <td className="px-4 py-2">{row.productname}</td>
                            <td className="px-4 py-2 text-right">
                              {row.quantity}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {parseInt(row.price || 0).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpload}
                  disabled={loading || preview.length === 0}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                      <span>Mengimport...</span>
                    </>
                  ) : (
                    <span>Import Pesanan</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
