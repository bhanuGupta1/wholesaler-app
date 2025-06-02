// src/pages/QRPage.jsx - Initial setup with basic data fetching
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

  useEffect(() => {
    fetchData();
  }, []);

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
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(50));
      const productsSnapshot = await getDocs(productsQuery);
      fetchedData.products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch Orders
      const ordersRef = collection(db, 'orders');
      let ordersQuery;
      
      if (user?.accountType === 'admin' || user?.accountType === 'manager') {
        ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
      } else if (user) {
        ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(20));
      }

      if (ordersQuery) {
        const ordersSnapshot = await getDocs(ordersQuery);
        fetchedData.orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      // Fetch Users (admin/manager only)
      if (user?.accountType === 'admin' || user?.accountType === 'manager') {
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, limit(30));
        const usersSnapshot = await getDocs(usersQuery);
        fetchedData.users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      setData(fetchedData);
    } catch (err) {
      setError('Failed to load data for QR generation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <QRManagementDashboard
        products={data.products}
        orders={data.orders}
        users={data.users}
        onRefreshData={fetchData}
      />
    </div>
  );
};
// Add improved loading and error states to QRPage.jsx
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
// Add library availability check to QRPage.jsx
const [librariesAvailable, setLibrariesAvailable] = useState({
  qrcode: false,
  html5qrcode: false,
  zxing: false
});

useEffect(() => {
  checkLibraries();
  fetchData();
}, []);

const checkLibraries = () => {
  try {
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

// Add warning display in render
const missingLibraries = Object.entries(librariesAvailable)
  .filter(([_, available]) => !available)
  .map(([name]) => name);

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
      </div>
    </div>
  </div>
)}
// Add data summary cards to QRPage.jsx
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
// Create new components and refactor QRPage.jsx
import CompleteQRScanner from '../components/qr/CompleteQRScanner';
import QRCodeViewer from '../components/qr/QRCodeViewer';
import QRBulkActions from '../components/qr/QRBulkActions';

// Add tab state management
const [activeTab, setActiveTab] = useState('scanner');
const tabs = [
  { id: 'scanner', name: 'Scanner', icon: '📷', description: 'Scan QR codes' },
  { id: 'generator', name: 'Generator', icon: '📱', description: 'Generate QR codes' },
  { id: 'bulk', name: 'Bulk Tools', icon: '⚡', description: 'Bulk operations' }
];

// Add tab navigation UI
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

  <div className="p-6">
    {activeTab === 'scanner' && <CompleteQRScanner />}
    {activeTab === 'generator' && <QRCodeViewer items={data} />}
    {activeTab === 'bulk' && <QRBulkActions items={data} />}
  </div>
</div>
export default QRPage;