// src/components/qr/QRManagementDashboard.jsx
import { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { QRCodeGenerator, QuickQRButton, QRCodeModal } from './QRCodeDisplay';
import QRCodeScanner from './QRCodeScanner';
import QRCode from 'qrcode';

const QRManagementDashboard = ({ 
  products = [], 
  orders = [], 
  users = [], 
  onRefreshData = null 
}) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('products');
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkQRData, setBulkQRData] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qrStats, setQrStats] = useState({
    generated: 0,
    scanned: 0,
    today: 0
  });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const data = {
      products: products || [],
      orders: orders || [],
      users: users || []
    };

    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();
    return {
      products: data.products.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.sku?.toLowerCase().includes(term)
      ),
      orders: data.orders.filter(o => 
        o.customerName?.toLowerCase().includes(term) || 
        o.id?.toLowerCase().includes(term)
      ),
      users: data.users.filter(u => 
        u.email?.toLowerCase().includes(term) || 
        u.displayName?.toLowerCase().includes(term)
      )
    };
  }, [products, orders, users, searchTerm]);

  const currentData = filteredData[activeTab] || [];

  // Generate QR data for different item types
  const generateQRData = (item, type) => {
    const baseUrl = window.location.origin;
    
    switch (type) {
      case 'products':
        return {
          type: 'product',
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          stock: item.stock,
          url: `${baseUrl}/products/${item.id}`,
          timestamp: new Date().toISOString()
        };
      case 'orders':
        return {
          type: 'order',
          id: item.id,
          customer: item.customerName,
          total: item.total,
          status: item.status,
          url: `${baseUrl}/orders/${item.id}`,
          timestamp: new Date().toISOString()
        };
      case 'users':
        return {
          type: 'user',
          id: item.id,
          email: item.email,
          name: item.displayName,
          role: item.role || item.accountType,
          url: `${baseUrl}/admin/users/${item.id}`,
          timestamp: new Date().toISOString()
        };
      default:
        return item;
    }
  };

  // Handle item selection for bulk operations
  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === currentData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentData.map(item => item.id));
    }
  };

  // Generate bulk QR codes
  const generateBulkQR = async () => {
    const selectedData = currentData.filter(item => selectedItems.includes(item.id));
    const qrDataArray = [];

    for (const item of selectedData) {
      const qrData = generateQRData(item, activeTab);
      const qrString = JSON.stringify(qrData);
      
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });

        qrDataArray.push({
          item,
          qrData,
          qrString,
          qrCodeDataUrl,
          filename: `qr-${activeTab}-${item.id}-${Date.now()}.png`
        });
      } catch (error) {
        console.error('Error generating QR for item:', item.id, error);
      }
    }

    setBulkQRData(qrDataArray);
    setShowBulkModal(true);
  };

  // Download all bulk QR codes
  const downloadAllQR = () => {
    bulkQRData.forEach(({ qrCodeDataUrl, filename }) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = qrCodeDataUrl;
      link.click();
    });
    
    // Update stats
    setQrStats(prev => ({
      ...prev,
      generated: prev.generated + bulkQRData.length,
      today: prev.today + bulkQRData.length
    }));
  };

  // Handle scan results
  const handleScanResult = (result) => {
    setScanResult(result);
    setQrStats(prev => ({
      ...prev,
      scanned: prev.scanned + 1
    }));
  };

  // Tab configuration
  const tabs = [
    { id: 'products', name: 'Products', icon: '📦', count: products.length },
    { id: 'orders', name: 'Orders', icon: '📋', count: orders.length },
    { id: 'users', name: 'Users', icon: '👥', count: users.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-3">📱</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                QR Generated
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {qrStats.generated}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-3">📷</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                QR Scanned
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {qrStats.scanned}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-3">🕒</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Today
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {qrStats.today}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center">
            <div className="text-3xl mr-3">📊</div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Items
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {products.length + orders.length + users.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border p-6`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowScanModal(true)}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📷</div>
            <h3 className="font-medium">Scan QR Code</h3>
            <p className="text-sm opacity-90">Use camera or upload image</p>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-medium">Product QR Codes</h3>
            <p className="text-sm opacity-90">Generate for inventory items</p>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-medium">Order QR Codes</h3>
            <p className="text-sm opacity-90">Track order status</p>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border overflow-hidden`}>
        {/* Tab Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                      : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {onRefreshData && (
                <button
                  onClick={onRefreshData}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-colors`}
                >
                  🔄
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedItems.length} items selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={generateBulkQR}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                >
                  📱 Generate QR Codes
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className={`px-3 py-1 text-sm rounded-md ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } transition-colors`}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="p-6">
          {currentData.length > 0 ? (
            <>
              {/* Select All */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentData.length && currentData.length > 0}
                    onChange={selectAllItems}
                    className="mr-2"
                  />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select all {currentData.length} items
                  </span>
                </label>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    type={activeTab}
                    isSelected={selectedItems.includes(item.id)}
                    onSelect={() => handleItemSelection(item.id)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                No {activeTab} found
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'Try adjusting your search terms' : `No ${activeTab} available for QR generation`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk QR Modal */}
      <BulkQRModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        qrData={bulkQRData}
        onDownloadAll={downloadAllQR}
        darkMode={darkMode}
      />

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScanResult}
        scanResult={scanResult}
        darkMode={darkMode}
      />
    </div>
  );
};

// Individual Item Card Component
const ItemCard = ({ item, type, isSelected, onSelect, darkMode }) => {
  const [showQR, setShowQR] = useState(false);

  const getItemTitle = () => {
    switch (type) {
      case 'products': return item.name;
      case 'orders': return `Order #${item.id.slice(0, 8)}`;
      case 'users': return item.displayName || item.email;
      default: return 'Item';
    }
  };

  const getItemSubtitle = () => {
    switch (type) {
      case 'products': return `SKU: ${item.sku} • $${item.price}`;
      case 'orders': return `${item.customerName} • $${item.total}`;
      case 'users': return item.email;
      default: return '';
    }
  };

  const getItemIcon = () => {
    switch (type) {
      case 'products': return '📦';
      case 'orders': return '📋';
      case 'users': return '👤';
      default: return '📄';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${
      isSelected 
        ? darkMode ? 'border-indigo-500 bg-indigo-900/10' : 'border-indigo-500 bg-indigo-50'
        : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
    } transition-colors cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1"
          />
          
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{getItemIcon()}</span>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getItemTitle()}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getItemSubtitle()}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            {type === 'products' && (
              <div className="flex items-center space-x-4 text-xs">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stock: {item.stock}
                </span>
                <span className={`px-2 py-1 rounded-full ${
                  item.stock > 10 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {item.stock > 10 ? 'In Stock' : 'Low Stock'}
                </span>
              </div>
            )}

            {type === 'orders' && (
              <div className="flex items-center space-x-4 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  item.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : item.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {item.status}
                </span>
              </div>
            )}

            {type === 'users' && (
              <div className="flex items-center space-x-4 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.role || item.accountType || 'user'}
                </span>
              </div>
            )}
          </div>
        </div>

        <QuickQRButton 
          item={item} 
          type={type.slice(0, -1)} // Remove 's' from plural
          size="sm"
          variant="icon"
        />
      </div>
    </div>
  );
};

// Bulk QR Modal Component
const BulkQRModal = ({ isOpen, onClose, qrData, onDownloadAll, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📱 Bulk QR Codes ({qrData.length})
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={onDownloadAll}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📥 Download All
            </button>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrData.map(({ item, qrCodeDataUrl, filename }, index) => (
              <div key={index} className={`border rounded-lg p-4 text-center ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <img 
                  src={qrCodeDataUrl} 
                  alt={`QR Code for ${item.name || item.id}`}
                  className="mx-auto mb-3 border rounded"
                  style={{ width: 150, height: 150 }}
                />
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {item.name || item.customerName || item.email || `Item ${item.id.slice(0, 8)}`}
                </h4>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = qrCodeDataUrl;
                    link.click();
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  📥 Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Scanner Modal Component
const ScannerModal = ({ isOpen, onClose, onScan, scanResult, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📷 QR Code Scanner
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
        
        <div className="p-6">
          <QRCodeScanner 
            onScan={onScan}
            showPreview={true}
            className="w-full"
          />
          
          {scanResult && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <h4 className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
                ✅ Scan Result:
              </h4>
              <pre className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} break-all whitespace-pre-wrap`}>
                {typeof scanResult === 'object' ? JSON.stringify(scanResult, null, 2) : scanResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRManagementDashboard;