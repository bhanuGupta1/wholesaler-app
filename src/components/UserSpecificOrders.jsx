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

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Multi-field search functionality
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.productName?.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status filter
      if (filters.status && order.status !== filters.status) return false;

      // Payment status filter
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;

      // Amount range filter
      if (filters.minAmount && order.total < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && order.total > parseFloat(filters.maxAmount)) return false;

      // Smart date range filtering
      if (filters.dateRange) {
        const now = new Date();
        let startDate;
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate && order.createdAt < startDate) return false;
      }

      // Custom date range filtering
      if (filters.customDateFrom) {
        const fromDate = new Date(filters.customDateFrom);
        if (order.createdAt < fromDate) return false;
      }
      if (filters.customDateTo) {
        const toDate = new Date(filters.customDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (order.createdAt > toDate) return false;
      }

      return true;
    });

    // Advanced sorting logic
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'customerName':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'orderId':
          aValue = a.orderId.toLowerCase();
          bValue = b.orderId.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, searchTerm, filters, sortBy, sortOrder]);

  // Pagination logic with memoized performance
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  // Filter management functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateRange: '',
      minAmount: '',
      maxAmount: '',
      paymentStatus: '',
      customDateFrom: '',
      customDateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

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

  const handleSelectOrder = (orderId) => {
    if (!canDelete) return; // Permission check
    
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (!canDelete) return; // Permission check
    
    if (selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map(order => order.id)));
    }
  };

  // Delete single order with permission control
  const handleDeleteOrder = async (orderId) => {
    if (!canDelete) return; // Permission check
    
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setNotification({ message: 'Order deleted successfully', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
      setNotification({ message: 'Failed to delete order', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Bulk delete with permission control
  const handleBulkDelete = async () => {
    if (!canDelete || selectedOrders.size === 0) return; // Permission check
    
    if (!confirm(`Are you sure you want to delete ${selectedOrders.size} selected order(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedOrders).map(orderId => 
        deleteDoc(doc(db, 'orders', orderId))
      );
      
      await Promise.all(deletePromises);
      
      setOrders(prev => prev.filter(order => !selectedOrders.has(order.id)));
      setSelectedOrders(new Set());
      setNotification({ message: `${selectedOrders.size} order(s) deleted successfully`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting orders:', error);
      setNotification({ message: 'Failed to delete some orders', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
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
       <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {canViewAll ? 'All Orders' : 'My Orders'}
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {canViewAll 
            ? 'Manage and process all customer orders' 
            : 'View and track your personal orders'
          }
        </p>
        
        {/* Debug info for filtering */}
        <div className="mt-2 text-xs text-gray-500">
          Total: {orders.length} | Filtered: {filteredAndSortedOrders.length} | Page: {paginatedOrders.length}
        </div>
      </div>
      
      <div>Filtering logic implemented. UI components coming next...</div>
    </div>

      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Notification area (for future use) */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
              : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {canViewAll ? 'All Orders' : 'My Orders'}
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {canViewAll 
                  ? 'Manage and view all customer orders' 
                  : 'View and track your personal orders'
                }
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchOrders}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Statistics Cards Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { 
                label: 'Total Orders', 
                value: orderStats.total, 
                icon: Package, 
                color: 'blue',
                description: 'All orders'
              },
              { 
                label: 'Pending', 
                value: orderStats.pending, 
                icon: Clock, 
                color: 'yellow',
                description: 'Awaiting processing'
              },
              { 
                label: 'Completed', 
                value: orderStats.completed, 
                icon: CheckSquare, 
                color: 'green',
                description: 'Successfully completed'
              },
              { 
                label: 'Total Value', 
                value: `$${orderStats.totalValue.toFixed(2)}`, 
                icon: DollarSign, 
                color: 'purple',
                description: 'Total revenue'
              }
            ].map((stat, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'blue' ? darkMode ? 'bg-blue-900/30' : 'bg-blue-100' :
                    stat.color === 'yellow' ? darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100' :
                    stat.color === 'green' ? darkMode ? 'bg-green-900/30' : 'bg-green-100' :
                    darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.color === 'blue' ? darkMode ? 'text-blue-400' : 'text-blue-600' :
                      stat.color === 'yellow' ? darkMode ? 'text-yellow-400' : 'text-yellow-600' :
                      stat.color === 'green' ? darkMode ? 'text-green-400' : 'text-green-600' :
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading and Error States */}
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
          <div>
            <p>Statistics dashboard implemented. Search and filter UI coming next...</p>
            <p className="text-sm text-gray-500 mt-2">
              Debug: {orders.length} total orders loaded, {filteredAndSortedOrders.length} after filtering
            </p>
          </div>
        )}
      </div>
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
