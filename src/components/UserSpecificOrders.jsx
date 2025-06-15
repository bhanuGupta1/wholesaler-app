import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { canViewAllOrders } from '../utils/accessControl';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const UserSpecificOrders = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  const userRole = user?.accountType || 'user';
  const canViewAll = canViewAllOrders(user);
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    minAmount: '',
    maxAmount: '',
    paymentStatus: '',
    customDateFrom: '',
    customDateTo: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [user, canViewAll]);

  const fetchOrders = async () => {
    if (!user) {
      setError("Please log in to view orders");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const ordersRef = collection(db, 'orders');
      let ordersQuery = canViewAll
        ? query(ordersRef, orderBy('createdAt', 'desc'))
        : query(ordersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(ordersQuery);
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId || `#ORD-${doc.id.substring(0, 8).toUpperCase()}`,
          customerName: data.customerName || 'Unknown Customer',
          total: data.total || 0,
          status: data.status || 'pending',
          paymentStatus: data.paymentStatus || 'pending',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        };
      });

      setOrders(fetchedOrders);
    } catch (err) {
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const calculateStats = () => {
    const stats = orders.reduce((acc, order) => {
      acc.total += 1;
      acc.totalValue += order.total;
      
      switch (order.status) {
        case 'pending':
          acc.pending += 1;
          break;
        case 'completed':
          acc.completed += 1;
          break;
        case 'cancelled':
          acc.cancelled += 1;
          break;
      }
      return acc;
    }, { total: 0, pending: 0, completed: 0, cancelled: 0, totalValue: 0 });

    setOrderStats(stats);
  };

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {canViewAll ? 'All Orders' : 'My Orders'}
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {canViewAll ? 'Manage and process all customer orders' : 'View and track your personal orders'}
        </p>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            showFilters
              ? 'bg-indigo-600 text-white border-indigo-600'
              : darkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h2 className="text-xl font-bold mb-2">Error Loading Orders</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchOrders} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>Orders loaded: {orders.length}. Filtering and UI refinements coming next...</div>
      )}
    </div>
  );
};

export default UserSpecificOrders;
