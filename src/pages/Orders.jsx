// src/pages/Orders.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, startAfter, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Orders = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const isGuest = !user;
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
  });

  // Initial fetch of orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create reference to orders collection
        const ordersRef = collection(db, 'orders');
        let queryConstraints = [];
        
        // Add status filter if not 'all'
        if (filters.status !== 'all') {
          queryConstraints.push(where('status', '==', filters.status));
        }
        
        // Add date range filter
        if (filters.dateRange !== 'all') {
          const now = new Date();
          let startDate = new Date();
          
          switch (filters.dateRange) {
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case '3months':
              startDate.setMonth(now.getMonth() - 3);
              break;
            default:
              // No date filtering
              break;
          }
          
          if (filters.dateRange !== 'all') {
            queryConstraints.push(where('createdAt', '>=', startDate));
          }
        }
        
        // Always sort by creation date (descending)
        queryConstraints.push(orderBy('createdAt', 'desc'));
        
        // Add pagination
        queryConstraints.push(limit(ordersPerPage));
        
        // Create and execute the query
        const ordersQuery = query(ordersRef, ...queryConstraints);
        const querySnapshot = await getDocs(ordersQuery);
        
        // Store the last visible document for pagination
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(querySnapshot.docs.length === ordersPerPage);
        
        // Extract the orders data and handle timestamps
        const ordersData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const orderData = docSnapshot.data();
          
          // Convert Firestore timestamps to JS Dates
          const createdAt = orderData.createdAt ? 
            (typeof orderData.createdAt.toDate === 'function' ? 
              orderData.createdAt.toDate() : new Date(orderData.createdAt)) : 
            new Date();

          // Fetch the order items from the subcollection
          const orderItemsRef = collection(db, 'orders', docSnapshot.id, 'orderItems');
          const orderItemsSnap = await getDocs(orderItemsRef);
          const items = orderItemsSnap.docs.map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }));
            
          return {
            id: docSnapshot.id,
            ...orderData,
            createdAt,
            items,
            // Make sure these fields exist
            customerName: orderData.customerName || 'Unknown Customer',
            status: orderData.status || 'pending',
            total: orderData.total || 0,
            itemCount: orderData.itemCount || items.length || 0
          };
        }));
        
        // Set the orders in state
        setOrders(ordersData);
        
        // Get total count of matching orders for pagination
        // In a real app, you might want to use a more efficient way to count documents
        let totalQuery = query(ordersRef);
        if (filters.status !== 'all') {
          totalQuery = query(totalQuery, where('status', '==', filters.status));
        }
        const totalSnapshot = await getDocs(totalQuery);
        setTotalOrders(totalSnapshot.size);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [filters, currentPage]);

  // Load more orders (pagination)
  const loadMoreOrders = async () => {
    if (!hasMore || !lastVisible) return;
    
    try {
      setLoading(true);
      
      // Create reference to orders collection
      const ordersRef = collection(db, 'orders');
      let queryConstraints = [];
      
      // Add status filter if not 'all'
      if (filters.status !== 'all') {
        queryConstraints.push(where('status', '==', filters.status));
      }
      
      // Always sort by creation date (descending)
      queryConstraints.push(orderBy('createdAt', 'desc'));
      
      // Start after the last document we fetched
      queryConstraints.push(startAfter(lastVisible));
      
      // Add pagination
      queryConstraints.push(limit(ordersPerPage));
      
      // Create and execute the query
      const ordersQuery = query(ordersRef, ...queryConstraints);
      const querySnapshot = await getDocs(ordersQuery);
      
      // Check if we have more results
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === ordersPerPage);
      
      // Extract the orders data and handle timestamps
      const ordersData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const orderData = docSnapshot.data();
        
        // Convert Firestore timestamps to JS Dates
        const createdAt = orderData.createdAt ? 
          (typeof orderData.createdAt.toDate === 'function' ? 
            orderData.createdAt.toDate() : new Date(orderData.createdAt)) : 
          new Date();

        // Fetch the order items from the subcollection
        const orderItemsRef = collection(db, 'orders', docSnapshot.id, 'orderItems');
        const orderItemsSnap = await getDocs(orderItemsRef);
        const items = orderItemsSnap.docs.map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }));
          
        return {
          id: docSnapshot.id,
          ...orderData,
          createdAt,
          items,
          // Make sure these fields exist
          customerName: orderData.customerName || 'Unknown Customer',
          status: orderData.status || 'pending',
          total: orderData.total || 0,
          itemCount: orderData.itemCount || items.length || 0
        };
      }));
      
      // Append the new orders to the existing ones
      setOrders(prev => [...prev, ...ordersData]);
      setCurrentPage(prev => prev + 1);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading more orders:', err);
      setError('Failed to load more orders. Please try again later.');
      setLoading(false);
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset pagination when filters change
    setCurrentPage(1);
    setLastVisible(null);
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  // Apply text search filter client-side (Firestore doesn't support LIKE queries)
  const filteredOrders = useMemo(() => {
    if (!filters.searchTerm) return orders;
    
    const searchTerm = filters.searchTerm.toLowerCase();
    return orders.filter(order => 
      order.customerName.toLowerCase().includes(searchTerm) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm)) ||
      order.id.toLowerCase().includes(searchTerm)
    );
  }, [orders, filters.searchTerm]);

  // Get appropriate status label style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return darkMode 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-green-100 text-green-800';
      case 'shipped':
        return darkMode 
          ? 'bg-blue-900/30 text-blue-400' 
          : 'bg-blue-100 text-blue-800';
      case 'processing':
        return darkMode 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return darkMode 
          ? 'bg-red-900/30 text-red-400' 
          : 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return darkMode 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 md:mb-0`}>Orders</h1>
        
        <div className="flex space-x-4">
          {!isGuest && (
            <Link 
              to="/create-order"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Order
            </Link>
          )}
        </div>
      </div>

      {/* Filters and search */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md p-6 mb-6 border`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="col-span-1">
            <label htmlFor="search" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Search Orders</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={filters.searchTerm}
                onChange={handleSearch}
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="Search by customer name or ID"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-span-1">
            <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Filter by Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="col-span-1">
            <label htmlFor="dateRange" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Date Range</label>
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
        </div>
      ) : error ? (
        <div className={`${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-400'} p-4 mb-6 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md p-8 text-center border`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No orders found</h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filters.status !== 'all' || filters.dateRange !== 'all' || filters.searchTerm ? 
              'Try adjusting your search or filters to find what you\'re looking for.' : 
              'Get started by creating your first order.'}
          </p>
          <div className="mt-6">
            {!isGuest && (
              <Link
                to="/create-order"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Order
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-lg overflow-hidden border`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
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
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        #{order.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'} flex items-center justify-center font-medium`}>
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{order.customerName}</div>
                          {order.customerEmail && (
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.customerEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{order.itemCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'} mr-4`}
                      >
                        View
                      </Link>
                      {!isGuest && (
                        <Link
                          to={`/generate-invoice/${order.id}`}
                          className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          Invoice
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6 flex items-center justify-between`}>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing {filteredOrders.length} of {totalOrders} results
            </div>
            {hasMore && (
              <div>
                <button
                  onClick={loadMoreOrders}
                  disabled={loading}
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                    darkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Guest Mode Banner (only shown to guests) */}
      {isGuest && (
        <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md border`}>
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sign in to manage orders</h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Create an account or sign in to create and manage orders for your wholesale business.
              </p>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              <Link
                to="/login"
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={`ml-3 inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} shadow-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm`}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;