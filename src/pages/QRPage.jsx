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

export default QRPage;