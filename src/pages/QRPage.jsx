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

export default QRPage;