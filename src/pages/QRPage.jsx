// src/pages/QRPage.jsx - FINAL VERSION: Complete QR integration with all features
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import QR components
import CompleteQRScanner from '../components/qr/CompleteQRScanner';
import QRCodeViewer from '../components/qr/QRCodeViewer';
import QRBulkActions from '../components/qr/QRBulkActions';
import { useQRLibraries } from '../hooks/useQRLibraries';
import { generateQRData, parseQRData, handleQRNavigation } from '../utils/qrUtils';

const QRPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qrLibraries = useQRLibraries();
  
  // Data state
  const [data, setData] = useState({
    products: [],
    orders: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // QR state
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedItems, setSelectedItems] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [showQuickScan, setShowQuickScan] = useState(false);
  const [qrStats, setQrStats] = useState({
    generated: parseInt(localStorage.getItem('qr-generated') || '0'),
    scanned: parseInt(localStorage.getItem('qr-scanned') || '0'),
    today: parseInt(localStorage.getItem('qr-today') || '0')
  });

  // Load data on mount
  useEffect(() => {
    fetchData();
    // Reset daily stats if it's a new day
    checkDailyReset();
  }, []);

  const checkDailyReset = () => {
    const lastDate = localStorage.getItem('qr-last-date');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      localStorage.setItem('qr-today', '0');
      localStorage.setItem('qr-last-date', today);
      setQrStats(prev => ({ ...prev, today: 0 }));
    }
  };

  const updateStats = (type) => {
    setQrStats(prev => {
      const newStats = {
        ...prev,
        [type]: prev[type] + 1,
        today: type === 'generated' || type === 'scanned' ? prev.today + 1 : prev.today
      };
      
      // Persist to localStorage
      localStorage.setItem(`qr-${type}`, newStats[type].toString());
      if (type === 'generated' || type === 'scanned') {
        localStorage.setItem('qr-today', newStats.today.toString());
      }
      
      return newStats;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedData = { products: [], orders: [], users: [] };

      // Fetch Products
      try {
        const productsRef = collection(db, 'products');
        const productsQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(50));
        const productsSnapshot = await getDocs(productsQuery);
        
        fetchedData.products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        console.error('Error fetching products:', err);
      }

      // Fetch Orders
      try {
        const ordersRef = collection(db, 'orders');
        let ordersQuery;
        
        if (user?.accountType === 'admin' || user?.accountType === 'manager') {
          ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
        } else if (user) {
          ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(20));
        }

        if (ordersQuery) {
          const ordersSnapshot = await getDocs(ordersQuery);
          fetchedData.orders = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              customerName: data.customerName || 'Unknown Customer',
              total: data.total || 0,
              status: data.status || 'pending',
              createdAt: data.createdAt,
              ...data
            };
          });
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }

      // Fetch Users (admin/manager only)
      try {
        if (user?.accountType === 'admin' || user?.accountType === 'manager') {
          const usersRef = collection(db, 'users');
          const usersQuery = query(usersRef, limit(30));
          const usersSnapshot = await getDocs(usersQuery);
          
          fetchedData.users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      setData(fetchedData);
    } catch (err) {
      console.error('Error fetching QR data:', err);
      setError('Failed to load data for QR generation');
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (result) => {
    const scanResult = {
      id: Date.now(),
      timestamp: new Date(),
      rawData: result,
      parsed: parseQRData(typeof result === 'string' ? result : JSON.stringify(result))
    };
    
    setScanResults(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans
    updateStats('scanned');
    
    // Auto-navigate if it's our format
    if (scanResult.parsed.isOurFormat) {
      const shouldNavigate = window.confirm(
        `QR code detected for ${scanResult.parsed.type}: ${scanResult.parsed.data.name || scanResult.parsed.data.customer || scanResult.parsed.data.email || scanResult.parsed.id}. 
        
Navigate to this item?`
      );
      
      if (shouldNavigate) {
        handleQRNavigation(scanResult.rawData, navigate);
      }
    }
  };

  const generateQRForItem = (item, type) => {
    const qrData = generateQRData(item, type);
    updateStats('generated');
    return qrData;
  };

  const clearScanHistory = () => {
    setScanResults([]);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading QR Tools...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4`}>
        <div className={`max-w-md w-full p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg text-center`}>
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            QR Tools Error
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={fetchData}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'scanner', name: 'Scanner', icon: '📷', description: 'Scan QR codes' },
    { id: 'generator', name: 'Generator', icon: '📱', description: 'Generate QR codes' },
    { id: 'history', name: 'History', icon: '📋', description: 'Scan history' },
    { id: 'bulk', name: 'Bulk Tools', icon: '⚡', description: 'Bulk operations' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            📱 QR Code Management Suite
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete QR code solution for products, orders, and users
          </p>
        </div>

        {/* Library Status and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Library Status */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">
                {qrLibraries.status.allAvailable ? '✅' : qrLibraries.status.someAvailable ? '⚠️' : '❌'}
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  QR Libraries
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {qrLibraries.status.available}/{qrLibraries.status.total}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📱</div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generated</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {qrStats.generated}
                </p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📷</div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Scanned</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {qrStats.scanned}
                </p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">🕒</div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {qrStats.today}
                </p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Items</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.products.length + data.orders.length + data.users.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Library Installation Alert */}
        {!qrLibraries.status.allAvailable && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-start">
              <div className="text-2xl mr-3">📦</div>
              <div className="flex-1">
                <h3 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-800'} mb-2`}>
                  Enhance QR Functionality
                </h3>
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'} mb-3`}>
                  Install QR libraries for full functionality. Current status: {qrLibraries.status.available}/{qrLibraries.status.total} libraries available.
                </p>
                <div className="flex items-center space-x-4">
                  <code className={`text-xs ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'} p-2 rounded font-mono`}>
                    npm install qrcode html5-qrcode @zxing/library
                  </code>
                  <button
                    onClick={qrLibraries.refresh}
                    className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{tab.icon}</div>
                <div className="text-sm font-medium">{tab.name}</div>
                <div className={`text-xs opacity-75`}>{tab.description}</div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Scanner Tab */}
            {activeTab === 'scanner' && (
              <div>
                <CompleteQRScanner
                  onScan={handleScanResult}
                  showPreview={true}
                  className="mb-6"
                />
                
                {/* Recent Scans */}
                {scanResults.length > 0 && (
                  <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Scans ({scanResults.length})
                      </h3>
                      <button
                        onClick={clearScanHistory}
                        className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {scanResults.map((scan) => (
                        <div key={scan.id} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {scan.parsed.isOurFormat 
                                  ? `${scan.parsed.type}: ${scan.parsed.data.name || scan.parsed.data.customer || scan.parsed.data.email || scan.parsed.id}`
                                  : 'External QR Code'
                                }
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {scan.timestamp.toLocaleString()}
                              </div>
                            </div>
                            {scan.parsed.isOurFormat && scan.parsed.url && (
                              <button
                                onClick={() => handleQRNavigation(scan.rawData, navigate)}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                              >
                                Open →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generator Tab */}
            {activeTab === 'generator' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Products */}
                  <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      📦 Products ({data.products.length})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {data.products.slice(0, 10).map((product) => (
                        <div key={product.id} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {product.name}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ${product.price} • Stock: {product.stock}
                              </div>
                            </div>
                            <QRCodeViewer
                              data={generateQRForItem(product, 'product')}
                              type="product"
                              item={product}
                              size={60}
                              showActions={false}
                            />
                          </div>
                        </div>
                      ))}
                      {data.products.length > 10 && (
                        <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{data.products.length - 10} more products
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Orders */}
                  <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      📋 Orders ({data.orders.length})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {data.orders.slice(0, 10).map((order) => (
                        <div key={order.id} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                #{order.id.slice(0, 8)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {order.customerName} • ${order.total}
                              </div>
                            </div>
                            <QRCodeViewer
                              data={generateQRForItem(order, 'order')}
                              type="order"
                              item={order}
                              size={60}
                              showActions={false}
                            />
                          </div>
                        </div>
                      ))}
                      {data.orders.length > 10 && (
                        <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{data.orders.length - 10} more orders
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Users */}
                  <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      👥 Users ({data.users.length})
                    </h3>
                    {data.users.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {data.users.slice(0, 10).map((userItem) => (
                          <div key={userItem.id} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {userItem.displayName || userItem.email}
                                </div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {userItem.accountType || 'user'}
                                </div>
                              </div>
                              <QRCodeViewer
                                data={generateQRForItem(userItem, 'user')}
                                type="user"
                                item={userItem}
                                size={60}
                                showActions={false}
                              />
                            </div>
                          </div>
                        ))}
                        {data.users.length > 10 && (
                          <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{data.users.length - 10} more users
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.accountType === 'admin' || user?.accountType === 'manager' 
                          ? 'No users found'
                          : 'Admin access required'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Scan History
                  </h3>
                  {scanResults.length > 0 && (
                    <button
                      onClick={clearScanHistory}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {scanResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scanResults.map((scan) => (
                      <div key={scan.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {scan.parsed.isOurFormat 
                                ? `${scan.parsed.type}: ${scan.parsed.data.name || scan.parsed.data.customer || scan.parsed.data.email || scan.parsed.id}`
                                : scan.parsed.type === 'text' ? 'Text QR' : 'External QR'
                              }
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {scan.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {scan.parsed.isOurFormat && (
                            <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                              Internal
                            </span>
                          )}
                        </div>
                        
                        <div className={`p-2 rounded text-xs ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-3`}>
                          <pre className="break-all whitespace-pre-wrap max-h-20 overflow-y-auto">
                            {typeof scan.rawData === 'object' 
                              ? JSON.stringify(scan.rawData, null, 2).substring(0, 200) + (JSON.stringify(scan.rawData).length > 200 ? '...' : '')
                              : scan.rawData.substring(0, 200) + (scan.rawData.length > 200 ? '...' : '')
                            }
                          </pre>
                        </div>
                        
                        {scan.parsed.isOurFormat && scan.parsed.url && (
                          <button
                            onClick={() => handleQRNavigation(scan.rawData, navigate)}
                            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                          >
                            Open Item
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                      No Scan History
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      Start scanning QR codes to see your history here
                    </p>
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Go to Scanner
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bulk Tools Tab */}
            {activeTab === 'bulk' && (
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Bulk QR Operations
                </h3>
                
                <div className="space-y-6">
                  {/* Products Bulk */}
                  <div>
                    <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      📦 Products Bulk Generation
                    </h4>
                    <QRBulkActions
                      selectedItems={data.products}
                      itemType="product"
                      onClearSelection={() => {}}
                    />
                  </div>

                  {/* Orders Bulk */}
                  <div>
                    <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                      📋 Orders Bulk Generation
                    </h4>
                    <QRBulkActions
                      selectedItems={data.orders}
                      itemType="order"
                      onClearSelection={() => {}}
                    />
                  </div>

                  {/* Users Bulk (Admin only) */}
                  {data.users.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        👥 Users Bulk Generation
                      </h4>
                      <QRBulkActions
                        selectedItems={data.users}
                        itemType="user"
                        onClearSelection={() => {}}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            📖 QR Code Help & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                📷 Scanner Features
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Camera & file scanning</li>
                <li>• Auto-navigation</li>
                <li>• History tracking</li>
                <li>• Multiple formats supported</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                📱 Generator Features
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Product QR codes</li>
                <li>• Order tracking</li>
                <li>• User profiles</li>
                <li>• Bulk generation</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                ⚡ Bulk Operations
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Generate multiple QR codes</li>
                <li>• Download as images</li>
                <li>• Progress tracking</li>
                <li>• Batch processing</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                🔧 Requirements
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• qrcode library</li>
                <li>• html5-qrcode library</li>
                <li>• @zxing/library</li>
                <li>• Camera permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPage;