// src/components/qr/QRFallbackComponents.jsx - Fallback QR components without external dependencies
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

// Simple QR Code Generator using external service as fallback
export const FallbackQRGenerator = ({
  data,
  size = 200,
  className = "",
  showDownload = true,
}) => {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = async () => {
    if (!data) return;

    setLoading(true);
    try {
      // Use a free QR code service as fallback
      const encodedData = encodeURIComponent(
        typeof data === "object" ? JSON.stringify(data) : data,
      );
      const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
      setQrUrl(qrServiceUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.png`;
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {qrUrl && (
        <>
          <img
            src={qrUrl}
            alt="QR Code"
            className={`mx-auto border-2 ${darkMode ? "border-gray-600" : "border-gray-200"} rounded-lg`}
            style={{ width: size, height: size }}
            onError={() => console.error("Failed to load QR code image")}
          />

          {showDownload && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={downloadQRCode}
                className={`px-3 py-1 text-sm rounded-md ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                } transition-colors`}
              >
                📥 Download
              </button>
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(qrUrl);
                    alert("QR code URL copied to clipboard!");
                  }
                }}
                className={`px-3 py-1 text-sm rounded-md ${
                  darkMode
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                } transition-colors`}
              >
                📋 Copy URL
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Simple QR Scanner using file upload only (camera requires external libs)
export const FallbackQRScanner = ({
  onScan,
  onError = null,
  className = "",
}) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { darkMode } = useTheme();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setScanResult(null);
    setProcessing(true);

    try {
      // Simple QR detection using online service for fallback
      const formData = new FormData();
      formData.append("file", file);

      // Note: This is a simplified approach. In a real app, you'd want to
      // implement proper QR detection or use a library

      // For now, let's simulate QR scanning by extracting image data
      // and showing instructions
      setError(
        "QR scanning requires camera libraries. Please install html5-qrcode for full functionality.",
      );

      // You could also use an online QR detection service here
      // But for security reasons, it's better to use local libraries
    } catch (err) {
      console.error("Error scanning file:", err);
      setError(
        "Failed to scan QR code from file. Please try a different image.",
      );
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  };

  return (
    <div className={`${className} max-w-2xl mx-auto`}>
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg border overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            📷 QR Code Scanner (Fallback Mode)
          </h3>
          <p
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
          >
            File upload only - install html5-qrcode for camera support
          </p>
        </div>

        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div
              className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border`}
            >
              <p
                className={`text-sm ${darkMode ? "text-red-400" : "text-red-700"}`}
              >
                ❌ {error}
              </p>
            </div>
          )}

          {/* Success Display */}
          {scanResult && (
            <div
              className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"} border`}
            >
              <p
                className={`text-sm font-medium ${darkMode ? "text-green-400" : "text-green-700"} mb-2`}
              >
                ✅ QR Code Detected!
              </p>
              <div
                className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
              >
                <pre
                  className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"} break-all whitespace-pre-wrap`}
                >
                  {typeof scanResult === "object"
                    ? JSON.stringify(scanResult, null, 2)
                    : scanResult}
                </pre>
              </div>
            </div>
          )}

          {/* File Upload Interface */}
          <div className="text-center">
            <div
              className={`border-2 border-dashed rounded-lg p-8 ${
                darkMode
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              } transition-colors`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                disabled={processing}
              />
              <div className="text-4xl mb-4">📁</div>
              <p
                className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
              >
                Upload QR Code Image
              </p>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}
              >
                Select an image file containing a QR code
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  processing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white`}
              >
                {processing ? (
                  <>
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  </>
                ) : (
                  "📷 Choose File"
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div
            className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border`}
          >
            <h4
              className={`font-medium ${darkMode ? "text-blue-300" : "text-blue-800"} mb-2`}
            >
              📖 Instructions
            </h4>
            <ul
              className={`text-sm space-y-1 ${darkMode ? "text-blue-200" : "text-blue-700"}`}
            >
              <li>• Upload a clear image of the QR code</li>
              <li>• Supported formats: JPG, PNG, GIF</li>
              <li>• Ensure the QR code is not blurry</li>
              <li>• The entire QR code should be visible</li>
              <li>• For camera scanning, install html5-qrcode library</li>
            </ul>
          </div>

          {/* Library Installation Help */}
          <div
            className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
          >
            <h4
              className={`font-medium ${darkMode ? "text-yellow-300" : "text-yellow-800"} mb-2`}
            >
              🔧 Enable Full QR Functionality
            </h4>
            <p
              className={`text-sm ${darkMode ? "text-yellow-200" : "text-yellow-700"} mb-2`}
            >
              To enable camera scanning and advanced features, install the
              required libraries:
            </p>
            <code
              className={`text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-white text-gray-800"} p-2 rounded block`}
            >
              npm install qrcode html5-qrcode @zxing/library
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart QR Components that use real libraries if available, fallback otherwise
export const SmartQRGenerator = (props) => {
  const [useAdvanced, setUseAdvanced] = useState(false);

  useEffect(() => {
    // Check if QRCode library is available
    const checkLibrary = async () => {
      try {
        // Try to dynamically import the library
        const QRCode = await import("qrcode");
        if (QRCode) {
          setUseAdvanced(true);
        }
      } catch (err) {
        console.log("QRCode library not available, using fallback");
        setUseAdvanced(false);
      }
    };

    checkLibrary();
  }, []);

  if (useAdvanced) {
    // Use the real QRCodeGenerator if library is available
    try {
      const { QRCodeGenerator } = require("./QRCodeDisplay");
      return <QRCodeGenerator {...props} />;
    } catch (err) {
      return <FallbackQRGenerator {...props} />;
    }
  }

  return <FallbackQRGenerator {...props} />;
};

export const SmartQRScanner = (props) => {
  const [useAdvanced, setUseAdvanced] = useState(false);

  useEffect(() => {
    // Check if scanning libraries are available
    const checkLibraries = async () => {
      try {
        // Try to dynamically import the libraries
        const html5qrcode = await import("html5-qrcode");
        const zxing = await import("@zxing/library");
        if (html5qrcode && zxing) {
          setUseAdvanced(true);
        }
      } catch (err) {
        console.log("QR scanning libraries not available, using fallback");
        setUseAdvanced(false);
      }
    };

    checkLibraries();
  }, []);

  if (useAdvanced) {
    // Use the real QRCodeScanner if libraries are available
    try {
      const QRCodeScanner = require("./QRCodeScanner").default;
      return <QRCodeScanner {...props} />;
    } catch (err) {
      return <FallbackQRScanner {...props} />;
    }
  }

  return <FallbackQRScanner {...props} />;
};

// Quick QR Button with fallbacks
export const SmartQuickQRButton = ({
  item,
  type = "product",
  size = "sm",
  variant = "button",
  onGenerate = null,
}) => {
  const [showQR, setShowQR] = useState(false);
  const { darkMode } = useTheme();

  const generateQRData = () => {
    const baseUrl = window.location.origin;
    switch (type) {
      case "product":
        return JSON.stringify({
          type: "product",
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          url: `${baseUrl}/products/${item.id}`,
        });
      case "order":
        return JSON.stringify({
          type: "order",
          id: item.id,
          customer: item.customerName,
          total: item.total,
          status: item.status,
          url: `${baseUrl}/orders/${item.id}`,
        });
      case "user":
        return JSON.stringify({
          type: "user",
          id: item.id,
          email: item.email,
          name: item.displayName,
          url: `${baseUrl}/admin/users/${item.id}`,
        });
      default:
        return JSON.stringify(item);
    }
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(item, type);
    } else {
      setShowQR(true);
    }
  };

  const buttonClasses = {
    sm: "p-1 text-xs",
    md: "p-2 text-sm",
    lg: "p-3 text-base",
  };

  const iconOnly = variant === "icon";

  return (
    <>
      <button
        onClick={handleGenerate}
        className={`${buttonClasses[size]} rounded-lg ${
          darkMode
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        } transition-colors flex items-center space-x-1`}
        title="Generate QR Code"
      >
        <span>📱</span>
        {!iconOnly && <span>QR</span>}
      </button>

      {showQR && (
        <SmartQRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          type={type}
          item={item}
          qrData={generateQRData()}
        />
      )}
    </>
  );
};

// QR Modal that uses smart components
export const SmartQRModal = ({ isOpen, onClose, type, item, qrData }) => {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "product":
        return `Product QR: ${item?.name || "Unknown"}`;
      case "order":
        return `Order QR: #${item?.id?.slice(0, 8) || "Unknown"}`;
      case "user":
        return `User QR: ${item?.email || "Unknown"}`;
      default:
        return "QR Code";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-xl max-w-md w-full p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className={`${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-500"}`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <div className="text-center">
          <SmartQRGenerator data={qrData} size={250} showDownload={true} />

          <div
            className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <p
              className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"} break-all`}
            >
              Data: {qrData?.substring(0, 100)}
              {qrData?.length > 100 ? "..." : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  FallbackQRGenerator,
  FallbackQRScanner,
  SmartQRGenerator,
  SmartQRScanner,
  SmartQuickQRButton,
  SmartQRModal,
};
