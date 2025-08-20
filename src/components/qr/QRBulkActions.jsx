import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useQRLibraries } from "../../hooks/useQRLibraries";
import { generateQRData, downloadQRCode } from "../../utils/qrUtils";

const QRBulkActions = ({
  selectedItems,
  itemType,
  onClearSelection,
  className = "",
}) => {
  const { darkMode } = useTheme();
  const { canGenerateQR } = useQRLibraries();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateBulkQR = async () => {
    if (!selectedItems.length) return;

    setGenerating(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        const qrData = generateQRData(item, itemType);
        const qrString = JSON.stringify(qrData);

        // Generate QR using external service
        const encodedData = encodeURIComponent(qrString);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;

        // Download QR code
        const filename = `qr-${itemType}-${item.id}-${Date.now()}.png`;
        await downloadQRCode(qrUrl, filename);

        // Update progress
        setProgress(Math.round(((i + 1) / selectedItems.length) * 100));

        // Small delay to prevent overwhelming the browser
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      alert(`Successfully generated ${selectedItems.length} QR codes!`);
      onClearSelection();
    } catch (error) {
      console.error("Bulk QR generation failed:", error);
      alert("Some QR codes failed to generate. Please try again.");
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  if (!selectedItems.length) return null;

  return (
    <div
      className={`${className} p-4 rounded-lg ${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3
            className={`font-medium ${darkMode ? "text-blue-300" : "text-blue-800"}`}
          >
            Bulk QR Generation
          </h3>
          <p
            className={`text-sm ${darkMode ? "text-blue-200" : "text-blue-700"}`}
          >
            {selectedItems.length} {itemType} selected
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {generating && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-20 h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              >
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span
                className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}
              >
                {progress}%
              </span>
            </div>
          )}

          <button
            onClick={generateBulkQR}
            disabled={generating || !canGenerateQR()}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              generating || !canGenerateQR()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {generating ? "📱 Generating..." : "📱 Generate QR Codes"}
          </button>

          <button
            onClick={onClearSelection}
            disabled={generating}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              generating
                ? "opacity-50 cursor-not-allowed"
                : darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {!canGenerateQR() && (
        <div
          className={`mt-2 text-xs ${darkMode ? "text-yellow-400" : "text-yellow-700"}`}
        >
          ⚠️ Install 'qrcode' library for better QR generation
        </div>
      )}
    </div>
  );
};

export default QRBulkActions;
