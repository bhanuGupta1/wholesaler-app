// src/components/qr/QRCodeDisplay.jsx
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useTheme } from '../../context/ThemeContext';

// QR Code Generator Component
export const QRCodeGenerator = ({ 
  data, 
  size = 200, 
  errorCorrectionLevel = 'M',
  margin = 4,
  color = { dark: '#000000', light: '#FFFFFF' },
  className = '',
  showDownload = true 
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    generateQRCode();
  }, [data, size, errorCorrectionLevel, margin, color]);

  const generateQRCode = async () => {
    if (!data) return;
    
    setLoading(true);
    try {
      const options = {
        width: size,
        margin: margin,
        color: color,
        errorCorrectionLevel: errorCorrectionLevel
      };

      const dataUrl = await QRCode.toDataURL(data, options);
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('QR code copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback: copy the data as text
      try {
        await navigator.clipboard.writeText(data);
        alert('QR data copied to clipboard as text!');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {qrCodeDataUrl && (
        <>
          <img 
            src={qrCodeDataUrl} 
            alt="QR Code" 
            className={`mx-auto border-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg`}
            style={{ width: size, height: size }}
          />
          
          {showDownload && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={downloadQRCode}
                className={`px-3 py-1 text-sm rounded-md ${
                  darkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } transition-colors`}
              >
                📥 Download
              </button>
              <button
                onClick={copyToClipboard}
                className={`px-3 py-1 text-sm rounded-md ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                } transition-colors`}
              >
                📋 Copy
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Quick QR Button Component
export const QuickQRButton = ({ 
  item, 
  type = 'product', 
  size = 'sm', 
  variant = 'button',
  onGenerate = null 
}) => {
  const [showQR, setShowQR] = useState(false);
  const { darkMode } = useTheme();

  const generateQRData = () => {
    const baseUrl = window.location.origin;
    switch (type) {
      case 'product':
        return JSON.stringify({
          type: 'product',
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          url: `${baseUrl}/products/${item.id}`
        });
      case 'order':
        return JSON.stringify({
          type: 'order',
          id: item.id,
          customer: item.customerName,
          total: item.total,
          status: item.status,
          url: `${baseUrl}/orders/${item.id}`
        });
      case 'user':
        return JSON.stringify({
          type: 'user',
          id: item.id,
          email: item.email,
          name: item.displayName,
          url: `${baseUrl}/admin/users/${item.id}`
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
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const iconOnly = variant === 'icon';

  return (
    <>
      <button
        onClick={handleGenerate}
        className={`${buttonClasses[size]} rounded-lg ${
          darkMode 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        } transition-colors flex items-center space-x-1`}
        title="Generate QR Code"
      >
        <span>📱</span>
        {!iconOnly && <span>QR</span>}
      </button>

      {showQR && (
        <QRCodeModal
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

// QR Code Modal Component
export const QRCodeModal = ({ isOpen, onClose, type, item, qrData }) => {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'product': return `Product QR: ${item?.name || 'Unknown'}`;
      case 'order': return `Order QR: #${item?.id?.slice(0, 8) || 'Unknown'}`;
      case 'user': return `User QR: ${item?.email || 'Unknown'}`;
      default: return 'QR Code';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center">
          <QRCodeGenerator 
            data={qrData} 
            size={250}
            showDownload={true}
          />
          
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} break-all`}>
              Data: {qrData?.substring(0, 100)}{qrData?.length > 100 ? '...' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};