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
 const [exporting, setExporting] = useState(false);

  // CSV Export functionality
  const exportOrders = async () => {
    try {
      setExporting(true);
      
      // Create comprehensive CSV headers
      const headers = [
        'Order ID',
        'Customer Name', 
        'Customer Email',
        'Order Date',
        'Status',
        'Payment Status',
        'Items Count',
        'Total Amount',
        'Shipping Address',
        'Payment Method'
      ];
      
      // Generate CSV content from filtered orders
      const csvContent = [
        headers.join(','),
        ...filteredAndSortedOrders.map(order => [
          order.orderId,
          `"${order.customerName}"`, // Quoted to handle commas in names
          order.customerEmail,
          order.createdAt.toLocaleDateString('en-US'),
          order.status,
          order.paymentStatus,
          order.itemCount,
          order.total.toFixed(2),
          `"${order.shippingAddress?.address || 'N/A'}"`,
          order.paymentInfo?.paymentMethod || 'N/A'
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp and filter info
      const timestamp = new Date().toISOString().split('T')[0];
      const filterSuffix = Object.values(filters).some(f => f) ? '-filtered' : '';
      link.download = `orders-${timestamp}${filterSuffix}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success notification
      setNotification({ 
        message: `Successfully exported ${filteredAndSortedOrders.length} orders to CSV`, 
        type: 'success' 
      });
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error exporting orders:', error);
      setNotification({ 
        message: 'Failed to export orders. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Utility function to format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Status color utility function
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'processing':
        return darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'pending':
        return darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default:
        return darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800';
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

           return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Previous components (header, stats, search, filters, bulk actions) remain the same */}
        {/* ... */}

        {/* Orders Table */}
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
        ) : filteredAndSortedOrders.length === 0 ? (
          // Empty State
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-12 text-center`}>
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No orders found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || Object.values(filters).some(f => f)
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : canViewAll 
                  ? 'No orders have been placed yet.'
                  : 'You haven\'t placed any orders yet.'
              }
            </p>
            {!canViewAll && !searchTerm && !Object.values(filters).some(f => f) && (
              <Link
                to="/create-order"
                className="inline-flex items-center mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Place Your First Order
              </Link>
            )}
          </div>
        ) : (
          // Orders Table
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {canDelete && (
                      <th scope="col" className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                    )}
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Order ID
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Customer
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Items
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Total
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Payment
                    </th>
                    <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                  {paginatedOrders.map(order => (
                    <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                      {canDelete && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {order.orderId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'} flex items-center justify-center font-medium text-sm flex-shrink-0`}>
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} truncate max-w-32`}>
                              {order.customerName}
                            </div>
                            {order.customerEmail && (
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate max-w-32`}>
                                {order.customerEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1 text-gray-400" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'paid' 
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'failed'
                            ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                            : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className={`inline-flex items-center p-2 border border-transparent rounded-md ${
                              darkMode 
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            } transition-colors`}
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className={`inline-flex items-center p-2 border border-transparent rounded-md ${
                                darkMode 
                                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                  : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                              } transition-colors`}
                              title="Delete Order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            className={`inline-flex items-center p-2 border border-transparent rounded-md ${
                              darkMode 
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            } transition-colors`}
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <p>Table view implemented with {paginatedOrders.length} orders displayed.</p>
          <p className="text-sm text-gray-500 mt-2">
            Next: Card view and pagination implementation
          </p>
        </div>
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

         <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Previous notification, header, statistics, and search components remain the same */}
        {/* ... */}

        {/* Bulk Actions Bar - Only show if user has delete permissions and orders are selected */}
        {selectedOrders.size > 0 && canDelete && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4 mb-6 border border-indigo-200`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedOrders(new Set())}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permission Debug (for development - can be removed in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`mb-4 p-3 rounded border ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
            <p className="text-xs">
              <strong>Permission Debug:</strong> canDelete: {canDelete ? '✅' : '❌'} | 
              canViewAll: {canViewAll ? '✅' : '❌'} | 
              userRole: {userRole} | 
              selectedOrders: {selectedOrders.size}
            </p>
          </div>
        )}

        {/* Export functionality */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              // Export functionality (to be implemented in next commit)
              console.log('Export orders:', filteredAndSortedOrders);
            }}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </button>
        </div>

        <div>
          <p>Bulk actions implemented with permission control.</p>
          <p className="text-sm text-gray-500 mt-2">
            Bulk operations available for: {canDelete ? 'Admin/Manager users' : 'No permission'}
          </p>
          <p className="text-sm text-gray-500">
            Orders ready for display: {paginatedOrders.length} of {filteredAndSortedOrders.length}
          </p>
        </div>
      </div>
    </div>
     <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
              : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Enhanced Header with Export */}
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
                disabled={loading}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={exportOrders}
                disabled={exporting || filteredAndSortedOrders.length === 0}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  exporting || filteredAndSortedOrders.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          {/* Statistics Cards - Previous implementation remains */}
          {/* ... statistics cards code ... */}
        </div>

        {/* Previous search, filters, and bulk actions remain the same */}
        {/* ... */}

        <div>
          <p>Export functionality implemented.</p>
          <p className="text-sm text-gray-500 mt-2">
            Ready to export: {filteredAndSortedOrders.length} orders
          </p>
          <p className="text-sm text-gray-500">
            Next: Table view implementation
          </p>
        </div>
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
