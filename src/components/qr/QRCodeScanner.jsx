// src/components/qr/QRCodeScanner.jsx
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { BrowserQRCodeReader } from '@zxing/library';
import { useTheme } from '../../context/ThemeContext';

// Main QR Scanner Component
export const QRCodeScanner = ({ 
  onScan, 
  onError = null,
  showPreview = true,
  className = '',
  scannerConfig = {}
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'file'
  const [manualMode, setManualMode] = useState(false);

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
    ...scannerConfig
  };

  // Initialize scanner on mount
  useEffect(() => {
    initializeScanner();
    return () => {
      cleanupScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      
      if (devices.length > 0) {
        setSelectedCamera(devices[0].id);
      } else {
        setError('No cameras found. Please use file upload method.');
        setScanMethod('file');
      }
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setError('Failed to initialize camera. Please use file upload method.');
      setScanMethod('file');
    }
  };

  const startScanning = async () => {
    if (!selectedCamera && scanMethod === 'camera') {
      setError('Please select a camera first');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      if (scanMethod === 'camera') {
        await startCameraScanning();
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start scanning: ' + err.message);
      setIsScanning(false);
    }
  };

  const startCameraScanning = async () => {
    if (manualMode) {
      // Manual mode using Html5Qrcode directly
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      await html5QrCodeRef.current.start(
        selectedCamera,
        defaultConfig,
        handleScanSuccess,
        handleScanError
      );
    } else {
      // Auto mode using Html5QrcodeScanner
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        defaultConfig,
        false
      );
      
      scanner.render(handleScanSuccess, handleScanError);
      html5QrCodeRef.current = scanner;
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (manualMode) {
          await html5QrCodeRef.current.stop();
        } else {
          html5QrCodeRef.current.clear();
        }
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
    setIsScanning(false);
  };

  const cleanupScanner = async () => {
    if (isScanning) {
      await stopScanning();
    }
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
    // Only log errors, don't display them (they're frequent during scanning)
    if (onError && error !== 'QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.') {
      onError(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setScanResult(null);

    try {
      // Use ZXing library for file scanning
      const codeReader = new BrowserQRCodeReader();
      const result = await codeReader.decodeFromInputVideoDevice(undefined, 'qr-reader');
      
      if (result) {
        handleScanSuccess(result.text, result);
      }
    } catch (err) {
      try {
        // Fallback: try with Html5Qrcode
        const html5QrCode = new Html5Qrcode("qr-reader-file");
        const scanResult = await html5QrCode.scanFile(file, true);
        handleScanSuccess(scanResult, null);
      } catch (fileErr) {
        console.error('Error scanning file:', fileErr);
        setError('Failed to scan QR code from file. Please try a different image.');
      }
    }

    // Reset file input
    event.target.value = '';
  };

  const toggleScanMethod = () => {
    if (isScanning) {
      stopScanning();
    }
    setScanMethod(scanMethod === 'camera' ? 'file' : 'camera');
    setError(null);
    setScanResult(null);
  };

  return (
    <div className={`${className} max-w-2xl mx-auto`}>
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📷 QR Code Scanner
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Scan Method Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => !isScanning && setScanMethod('camera')}
                  disabled={isScanning}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    scanMethod === 'camera'
                      ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  📹 Camera
                </button>
                <button
                  onClick={() => !isScanning && setScanMethod('file')}
                  disabled={isScanning}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    scanMethod === 'file'
                      ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  📁 File
                </button>
              </div>

              {/* Manual/Auto Mode Toggle for Camera */}
              {scanMethod === 'camera' && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={manualMode}
                    onChange={(e) => setManualMode(e.target.checked)}
                    disabled={isScanning}
                    className="mr-2"
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Manual
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Camera Selection */}
          {scanMethod === 'camera' && cameras.length > 1 && (
            <div className="mt-3">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Select Camera:
              </label>
              <select
                value={selectedCamera || ''}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isScanning}
                className={`w-full px-3 py-1 text-sm rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
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
          {/* Error Display */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                ❌ {error}
              </p>
            </div>
          )}

          {/* Success Display */}
          {scanResult && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
                ✅ QR Code Scanned Successfully!
              </p>
              <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <pre className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} break-all whitespace-pre-wrap`}>
                  {typeof scanResult === 'object' ? JSON.stringify(scanResult, null, 2) : scanResult}
                </pre>
              </div>
            </div>
          )}

          {/* Scanner Interface */}
          {scanMethod === 'camera' ? (
            <div className="text-center">
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
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-400 cursor-not-allowed'
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
            </div>
          ) : (
            <div className="text-center">
              {/* File Upload */}
              <div className={`border-2 border-dashed rounded-lg p-8 ${
                darkMode 
                  ? 'border-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              } transition-colors`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div className="text-4xl mb-4">📁</div>
                <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Upload QR Code Image
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
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
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h4 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
                📖 Instructions
              </h4>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {scanMethod === 'camera' ? (
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
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;