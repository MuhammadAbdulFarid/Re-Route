// Label Download Component - Generate & Download Return Labels
// Re-Route - Reverse Logistics SaaS Platform

import { useState } from "react";
import { labelApi, returnApi } from "../services/api";

// Generate barcode as SVG
const generateBarcodeSVG = (value) => {
  // Simple Code 128-like barcode representation
  const bars = [];
  const width = value.length * 10;

  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const isBar = (charCode + i) % 2 === 0;
    if (isBar) {
      bars.push(
        <rect key={i} x={i * 10} y={0} width={6} height={60} fill="black" />,
      );
    }
  }

  return (
    <svg width={width} height={70} className="barcode-svg">
      {bars}
      <text
        x={width / 2}
        y={75}
        textAnchor="middle"
        fontSize="12"
        fontFamily="monospace"
      >
        {value}
      </text>
    </svg>
  );
};

const LabelDownload = ({ returnData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [labelData, setLabelData] = useState(null);

  const handleGenerateLabel = async () => {
    setLoading(true);
    try {
      const response = await labelApi.generate(returnData.id);
      setLabelData(response.data.data);
    } catch (error) {
      console.error("Error generating label:", error);
      alert("Gagal generate label");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHTML = async () => {
    try {
      // Open label HTML in new window for printing
      const response = await labelApi.getByReturn(returnData.id);
      const label = response.data.data;

      if (label.labelUrl) {
        // Open the saved label
        window.open(label.labelUrl, "_blank");
      } else {
        // Generate and open
        await handleGenerateLabel();
        window.open(`/api/labels/${returnData.id}/html`, "_blank");
      }
    } catch (error) {
      console.error("Error downloading label:", error);
      alert("Gagal download label");
    }
  };

  if (!returnData.waybillNumber) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-yellow-600"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Label Belum Tersedia
        </h3>
        <p className="text-gray-500 mb-4">
          Retur harus disetujui terlebih dahulu untuk generate waybill
        </p>
        <button onClick={onClose} className="btn-secondary">
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Label Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg uppercase">
            {returnData.courierName}
          </h3>
          <p className="font-mono text-xl font-bold tracking-wider mt-2">
            {returnData.waybillNumber}
          </p>
        </div>

        {/* Barcode */}
        <div className="flex justify-center my-4 bg-gray-50 py-4">
          {generateBarcodeSVG(returnData.waybillNumber)}
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="border p-2 rounded">
            <p className="font-bold text-gray-500 text-xs uppercase">
              Pengirim
            </p>
            <p className="font-medium">{returnData.order?.customerName}</p>
            <p className="text-gray-600">{returnData.order?.customerPhone}</p>
          </div>
          <div className="border p-2 rounded">
            <p className="font-bold text-gray-500 text-xs uppercase">
              Penerima
            </p>
            <p className="font-medium">Re-Route Warehouse</p>
            <p className="text-gray-600 text-xs">
              Jl. Gudang Logistik No. 45, Surabaya
            </p>
          </div>
        </div>

        {/* Return Info */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>
            <strong>No. Retur:</strong> {returnData.returnNumber}
          </p>
          <p>
            <strong>Pesanan:</strong> {returnData.order?.orderNumber}
          </p>
          <p>
            <strong>Produk:</strong> {returnData.order?.productName}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleGenerateLabel}
          disabled={loading || labelData}
          className="flex-1 btn-secondary disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : labelData
              ? "✓ Generated"
              : "Generate Label"}
        </button>
        <button
          onClick={handleDownloadHTML}
          disabled={!returnData.waybillNumber}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          Download / Print
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Cetak label dan tempel pada paket return
      </p>
    </div>
  );
};

export default LabelDownload;
