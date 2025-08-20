import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { SmartQRGenerator } from "./QRFallbackComponents";
import {
  parseQRData,
  handleQRNavigation,
  downloadQRCode,
} from "../../utils/qrUtils";

const QRCodeViewer = ({
  data,
  type,
  item,
  size = 200,
  showActions = true,
  className = "",
}) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState("");

  const qrString = typeof data === "string" ? data : JSON.stringify(data);
  const parsed = parseQRData(qrString);

  const handleNavigate = () => {
    handleQRNavigation(qrString, navigate);
  };

  const handleDownload = async () => {
    if (qrUrl) {
      const filename = `qr-${type}-${item?.id || "code"}-${Date.now()}.png`;
      await downloadQRCode(qrUrl, filename);
    }
  };

  const handleShare = async () => {
    if (navigator.share && parsed.isOurFormat) {
      try {
        await navigator.share({
          title: `${type} QR Code`,
          text: `QR code for ${parsed.data.name || parsed.data.customer || parsed.data.email}`,
          url: parsed.data.url,
        });
      } catch (err) {
        // Fallback to copying URL
        if (navigator.clipboard && parsed.data.url) {
          await navigator.clipboard.writeText(parsed.data.url);
          alert("URL copied to clipboard!");
        }
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(qrString);
      alert("QR data copied to clipboard!");
    }
  };

  return (
    <div className={`${className} text-center`}>
      <SmartQRGenerator
        data={qrString}
        size={size}
        showDownload={false}
        onGenerated={setQrUrl}
      />

      {showActions && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleDownload}
            className={`px-3 py-1 text-sm rounded-md ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            } transition-colors`}
          >
            📥 Download
          </button>

          <button
            onClick={handleShare}
            className={`px-3 py-1 text-sm rounded-md ${
              darkMode
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } transition-colors`}
          >
            🔗 Share
          </button>

          {parsed.isOurFormat && (
            <button
              onClick={handleNavigate}
              className={`px-3 py-1 text-sm rounded-md ${
                darkMode
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              } transition-colors`}
            >
              🔗 Open
            </button>
          )}
        </div>
      )}

      {/* QR Data Preview */}
      <div
        className={`mt-3 p-2 rounded text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
      >
        <details>
          <summary className="cursor-pointer">
            {parsed.isOurFormat
              ? `${parsed.type}: ${parsed.data.name || parsed.data.customer || parsed.data.email || parsed.id}`
              : "QR Data"}
          </summary>
          <pre className="mt-2 text-left break-all whitespace-pre-wrap max-h-20 overflow-y-auto">
            {qrString.length > 200
              ? qrString.substring(0, 200) + "..."
              : qrString}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default QRCodeViewer;
