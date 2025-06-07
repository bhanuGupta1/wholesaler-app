import { useState, useEffect } from 'react';

export const useQRLibraries = () => {
  const [libraries, setLibraries] = useState({
    qrcode: false,
    html5qrcode: false,
    zxing: false,
    loading: true
  });

  useEffect(() => {
    checkLibraries();
  }, []);

  const checkLibraries = async () => {
    const result = {
      qrcode: false,
      html5qrcode: false,
      zxing: false,
      loading: false
    };

    // Check QRCode
    try {
      await import('qrcode');
      result.qrcode = true;
    } catch (err) {
      console.log('QRCode library not available');
    }

    // Check Html5-qrcode
    try {
      const html5Lib = await import('html5-qrcode');
      if (html5Lib.Html5QrcodeScanner) {
        result.html5qrcode = true;
      }
    } catch (err) {
      console.log('Html5-qrcode library not available');
    }

    // Check ZXing
    try {
      const zxingLib = await import('@zxing/library');
      if (zxingLib.BrowserQRCodeReader) {
        result.zxing = true;
      }
    } catch (err) {
      console.log('ZXing library not available');
    }

    setLibraries(result);
  };

  const getStatus = () => {
    const available = Object.entries(libraries)
      .filter(([key, value]) => key !== 'loading' && value)
      .length;
    const total = Object.keys(libraries).length - 1; // Exclude 'loading'
    
    return {
      available,
      total,
      percentage: Math.round((available / total) * 100),
      allAvailable: available === total,
      someAvailable: available > 0,
      noneAvailable: available === 0
    };
  };

  const canUseCamera = () => libraries.html5qrcode;
  const canGenerateQR = () => libraries.qrcode;
  const canScanFiles = () => libraries.zxing || libraries.html5qrcode;

  return {
    libraries,
    status: getStatus(),
    canUseCamera,
    canGenerateQR,
    canScanFiles,
    refresh: checkLibraries
  };
};
