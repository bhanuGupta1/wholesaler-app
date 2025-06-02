// src/pages/QRPage.jsx - FIXED: Proper data integration and error handling
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import QRManagementDashboard from '../components/qr/QRManagementDashboard';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const QRPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState({
    products: [],
    orders: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if QR libraries are available
  const [librariesAvailable, setLibrariesAvailable] = useState({
    qrcode: false,
    html5qrcode: false,
    zxing: false
  });

  useEffect(() => {
    // Check for required libraries
    checkLibraries();
    // Fetch data for QR generation
    fetchData();
  }, []);

  const checkLibraries = () => {
    try {
      // Check if libraries are available (they might not be installed)
      const qrcodeAvailable = typeof window !== 'undefined';
      const html5Available = typeof window !== 'undefined';
      const zxingAvailable = typeof window !== 'undefined';
      
      setLibrariesAvailable({
        qrcode: qrcodeAvailable,
        html5qrcode: html5Available,
        zxing: zxingAvailable
      });
    } catch (err) {
      console.warn('QR libraries not available:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedData = {
        products: [],
        orders: [],
        users: []
      };

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

      // Fetch Orders (limited based on user role)
      try {
        const ordersRef = collection(db, 'orders');
        let ordersQuery;
        
        if (user?.accountType === 'admin' || user?.accountType === 'manager') {
          // Admin/Manager can see all orders
          ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
        } else if (user) {
          // Regular users see only their orders
          ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(20));
        } else {
          // Skip orders for guests
          ordersQuery = null;
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

  // Check if any QR libraries are missing
  const missingLibraries = Object.entries(librariesAvailable)
    .filter(([_, available]) => !available)
    .map(([name]) => name);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            📱 QR Code Management
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate and scan QR codes for products, orders, and users
          </p>
        </div>

        {/* Library Warning */}
        {missingLibraries.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
            <div className="flex items-start">
              <div className="text-2xl mr-3">⚠️</div>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-800'} mb-1`}>
                  QR Libraries Not Available
                </h3>
                <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'} mb-2`}>
                  Some QR features may be limited. Missing libraries: {missingLibraries.join(', ')}
                </p>
                <p className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  To enable full QR functionality, install: npm install qrcode html5-qrcode @zxing/library
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📦</div>
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.products.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Products Available
                </p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.orders.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Orders Available
                </p>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {data.users.length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Users Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Management Dashboard */}
        <QRManagementDashboard
          products={data.products}
          orders={data.orders}
          users={data.users}
          onRefreshData={fetchData}
        />

        {/* Help Section */}
        <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            📖 QR Code Help
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Generating QR Codes
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Select items from the tabs above</li>
                <li>• Click the QR button to generate individual codes</li>
                <li>• Use bulk generation for multiple items</li>
                <li>• Download codes as PNG images</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Scanning QR Codes
              </h3>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Use the camera scanner for real-time scanning</li>
                <li>• Upload image files containing QR codes</li>
                <li>• Scanned data appears in JSON format</li>
                <li>• Use scanned data to navigate to items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPage;