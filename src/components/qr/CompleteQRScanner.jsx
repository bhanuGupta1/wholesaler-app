// src/components/qr/CompleteQRScanner.jsx - Complete QR scanner with dynamic library loading
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

const CompleteQRScanner = ({
  onScan,
  onError = null,
  showPreview = true,
  className = "",
  scannerConfig = {},
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanMethod, setScanMethod] = useState("camera");
  const [librariesLoaded, setLibrariesLoaded] = useState({
    qrcode: false,
    html5qrcode: false,
    zxing: false,
  });
  const [loading, setLoading] = useState(true);

  const { darkMode } = useTheme();
  const scannerElementRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default scanner config
  const defaultConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false,
    ...scannerConfig,
  };

  // Dynamic library loading
  useEffect(() => {
    loadQRLibraries();
  }, []);

  const loadQRLibraries = async () => {
    setLoading(true);
    const loadedLibs = { qrcode: false, html5qrcode: false, zxing: false };

    // Try to load QRCode library
    try {
      await import("qrcode");
      loadedLibs.qrcode = true;
    } catch (err) {
      console.log("QRCode library not available");
    }

    // Try to load Html5-qrcode library
    try {
      const html5Lib = await import("html5-qrcode");
      if (html5Lib.Html5QrcodeScanner && html5Lib.Html5Qrcode) {
        loadedLibs.html5qrcode = true;
        window.Html5QrcodeScanner = html5Lib.Html5QrcodeScanner;
        window.Html5Qrcode = html5Lib.Html5Qrcode;
      }
    } catch (err) {
      console.log("Html5-qrcode library not available");
    }

    // Try to load ZXing library
    try {
      const zxingLib = await import("@zxing/library");
      if (zxingLib.BrowserQRCodeReader) {
        loadedLibs.zxing = true;
        window.BrowserQRCodeReader = zxingLib.BrowserQRCodeReader;
      }
    } catch (err) {
      console.log("ZXing library not available");
    }

    setLibrariesLoaded(loadedLibs);

    // Initialize cameras if Html5QrcodeScanner is available
    if (loadedLibs.html5qrcode) {
      await initializeCameras();
    } else {
      setScanMethod("file"); // Fallback to file upload
    }

    setLoading(false);
  };

  const initializeCameras = async () => {
    try {
      if (window.Html5Qrcode) {
        const devices = await window.Html5Qrcode.getCameras();
        setCameras(devices);

        if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
        } else {
          setError("No cameras found. Please use file upload method.");
          setScanMethod("file");
        }
      }
    } catch (err) {
      console.error("Error initializing cameras:", err);
      setError("Failed to initialize camera. Please use file upload method.");
      setScanMethod("file");
    }
  };

  const startScanning = async () => {
    if (!selectedCamera && scanMethod === "camera") {
      setError("Please select a camera first");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      if (scanMethod === "camera" && librariesLoaded.html5qrcode) {
        await startCameraScanning();
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Failed to start scanning: " + err.message);
      setIsScanning(false);
    }
  };

  const startCameraScanning = async () => {
    try {
      // Use Html5QrcodeScanner for automatic mode
      const scanner = new window.Html5QrcodeScanner(
        "qr-reader",
        defaultConfig,
        false,
      );

      scanner.render(handleScanSuccess, handleScanError);
      html5QrCodeRef.current = scanner;
    } catch (err) {
      throw new Error("Failed to initialize camera scanner: " + err.message);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    setScanResult(decodedText);
    setError(null);

    // Parse JSON if possible
    let parsedData;
    try {
      parsedData = JSON.parse(decodedText);
    } catch {
      parsedData = decodedText;
    }

    if (onScan) {
      onScan(parsedData, decodedResult);
    }

    // Auto-stop scanning after successful scan
    stopScanning();
  };

  const handleScanError = (error) => {
    // Only show meaningful errors, not parsing failures
    const meaningfulErrors = [
      "Camera not found",
      "Permission denied",
      "Camera is already in use",
    ];

    const isImportantError = meaningfulErrors.some((errText) =>
      error.toLowerCase().includes(errText.toLowerCase()),
    );

    if (isImportantError && onError) {
      onError(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setScanResult(null);

    try {
      if (librariesLoaded.zxing) {
        // Use ZXing for file scanning
        const codeReader = new window.BrowserQRCodeReader();
        const result = await codeReader.decodeFromInputVideoDevice(
          undefined,
          "qr-reader-file",
        );

        if (result) {
          handleScanSuccess(result.text, result);
        }
      } else if (librariesLoaded.html5qrcode) {
        // Fallback to Html5Qrcode
        const html5QrCode = new window.Html5Qrcode("qr-reader-file");
        const scanResult = await html5QrCode.scanFile(file, true);
        handleScanSuccess(scanResult, null);
      } else {
        // Use online service as last resort
        await scanFileOnline(file);
      }
    } catch (err) {
      console.error("Error scanning file:", err);
      setError(
        "Failed to scan QR code from file. Please try a different image or install the required libraries.",
      );
    }

    // Reset file input
    event.target.value = "";
  };

  const scanFileOnline = async (file) => {
    // This is a placeholder for online QR scanning service
    // In a real implementation, you might use a service like QR Server API
    setError(
      "File scanning requires QR libraries to be installed. Please install html5-qrcode and @zxing/library packages.",
    );
  };

  const getLibraryStatus = () => {
    const available = Object.values(librariesLoaded).filter(Boolean).length;
    const total = Object.keys(librariesLoaded).length;
    return {
      available,
      total,
      percentage: Math.round((available / total) * 100),
    };
  };

  const libraryStatus = getLibraryStatus();

  if (loading) {
    return (
      <div className={`${className} max-w-2xl mx-auto`}>
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg border p-8`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Loading QR Scanner...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} max-w-2xl mx-auto`}>
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-xl shadow-lg border overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              📷 QR Code Scanner
            </h3>

            {/* Library Status Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`px-2 py-1 rounded-full text-xs ${
                  libraryStatus.percentage === 100
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : libraryStatus.percentage > 50
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {libraryStatus.available}/{libraryStatus.total} Libraries
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => !isScanning && setScanMethod("camera")}
                  disabled={isScanning || !librariesLoaded.html5qrcode}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    scanMethod === "camera"
                      ? "bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow"
                      : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                  } ${isScanning || !librariesLoaded.html5qrcode ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  📹 Camera
                </button>
                <button
                  onClick={() => !isScanning && setScanMethod("file")}
                  disabled={isScanning}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    scanMethod === "file"
                      ? "bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow"
                      : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                  } ${isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  📁 File
                </button>
              </div>
            </div>
          </div>

          {/* Camera Selection */}
          {scanMethod === "camera" &&
            cameras.length > 1 &&
            librariesLoaded.html5qrcode && (
              <div className="mt-3">
                <label
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                >
                  Select Camera:
                </label>
                <select
                  value={selectedCamera || ""}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  disabled={isScanning}
                  className={`w-full px-3 py-1 text-sm rounded-md ${
                    darkMode
                      ? "bg-gray-600 border-gray-500 text-white"
                      : "bg-white border-gray-300"
                  } border focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {/* Library Status Warning */}
          {libraryStatus.percentage < 100 && (
            <div
              className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">⚠️</div>
                <div>
                  <h4
                    className={`font-medium ${darkMode ? "text-yellow-400" : "text-yellow-800"} mb-1`}
                  >
                    Limited QR Functionality
                  </h4>
                  <p
                    className={`text-sm ${darkMode ? "text-yellow-300" : "text-yellow-700"} mb-2`}
                  >
                    Some QR libraries are missing. Install them for full
                    functionality:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div
                      className={`flex items-center ${librariesLoaded.qrcode ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {librariesLoaded.qrcode ? "✅" : "❌"} qrcode
                    </div>
                    <div
                      className={`flex items-center ${librariesLoaded.html5qrcode ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {librariesLoaded.html5qrcode ? "✅" : "❌"} html5-qrcode
                    </div>
                    <div
                      className={`flex items-center ${librariesLoaded.zxing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {librariesLoaded.zxing ? "✅" : "❌"} @zxing/library
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                ✅ QR Code Scanned Successfully!
              </p>
              <div
                className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-white"}`}
              >
                <pre
                  className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"} break-all whitespace-pre-wrap max-h-32 overflow-y-auto`}
                >
                  {typeof scanResult === "object"
                    ? JSON.stringify(scanResult, null, 2)
                    : scanResult}
                </pre>
              </div>
            </div>
          )}

          {/* Scanner Interface */}
          {scanMethod === "camera" ? (
            <div className="text-center">
              {librariesLoaded.html5qrcode ? (
                <>
                  {/* Scanner Element */}
                  <div id="qr-reader" className="mx-auto mb-4"></div>

                  {/* Control Buttons */}
                  <div className="flex justify-center space-x-3">
                    {!isScanning ? (
                      <button
                        onClick={startScanning}
                        disabled={!selectedCamera}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                          selectedCamera
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        📹 Start Scanning
                      </button>
                    ) : (
                      <button
                        onClick={stopScanning}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ⏹️ Stop Scanning
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div
                  className={`p-8 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <div className="text-4xl mb-4">📱</div>
                  <h3
                    className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
                  >
                    Camera Scanning Unavailable
                  </h3>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
                  >
                    Install html5-qrcode library to enable camera scanning
                  </p>
                  <code
                    className={`text-xs ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"} p-2 rounded block`}
                  >
                    npm install html5-qrcode
                  </code>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              {/* File Upload */}
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  📷 Choose File
                </button>
              </div>

              {/* Hidden scanner element for file mode */}
              <div id="qr-reader-file" className="hidden"></div>
            </div>
          )}

          {/* Instructions */}
          {showPreview && (
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
                {scanMethod === "camera" ? (
                  <>
                    <li>• Allow camera access when prompted</li>
                    <li>• Point your camera at the QR code</li>
                    <li>• Keep the QR code within the scanning area</li>
                    <li>• Ensure good lighting for best results</li>
                  </>
                ) : (
                  <>
                    <li>• Upload a clear image of the QR code</li>
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Ensure the QR code is not blurry</li>
                    <li>• The entire QR code should be visible</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Installation Help */}
          {libraryStatus.percentage < 100 && (
            <div
              className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <h4
                className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}
              >
                🔧 Install Missing Libraries
              </h4>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}
              >
                Run this command to install all QR libraries:
              </p>
              <code
                className={`text-xs ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"} p-2 rounded block font-mono`}
              >
                npm install qrcode html5-qrcode @zxing/library
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteQRScanner;
