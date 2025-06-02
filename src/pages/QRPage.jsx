// src/pages/QRPage.jsx
import React, { useState } from 'react';
import QRCodeDisplay from '../components/qr/QRCodeDisplay';
import QRCodeScanner from '../components/qr/QRCodeScanner';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const QRPage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const [scannedResult, setScannedResult] = useState(null);

  const handleScan = (result) => {
    if (result) {
      setScannedResult(result);
    }
  };

  return (
    <div className={`p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6">QR Tools</h1>

      {/* QR Code Generator */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Your QR Code</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This QR represents your user ID or can be shared for quick data access.
        </p>
        <QRCodeDisplay value={user?.uid || 'guest-user'} />
      </div>

      {/* QR Code Scanner */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
        <QRCodeScanner onScan={handleScan} />
        {scannedResult && (
          <div className="mt-4 p-4 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <strong>Scanned Result:</strong> {scannedResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPage;
