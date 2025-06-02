// src/components/UserSpecificOrders.jsx - Debug version for permissions
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';

const UserSpecificOrders = () => {
  const { darkMode } = useTheme();
  const { user, userRole } = useAuth();
  const accessControl = useAccessControl(); // Get full access control object for debugging
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPermissionDebug, setShowPermissionDebug] = useState(false);
  
  // Delete functionality state
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

  // Debug: Extract canDeleteOrders from access control
  const { canDeleteOrders } = accessControl;

  // Determine if user can see all orders (admin/manager) or just their own
  const canViewAllOrders = userRole === 'admin' || userRole === 'manager';

  // Debug: Log permission information
  useEffect(() => {
    console.log("🔐 Permission Debug Info:");
    console.log("User object:", user);
    console.log("User role from auth:", userRole);
    console.log("Access control object:", accessControl);
    console.log("Can delete orders:", canDeleteOrders);
    console.log("Can view all orders:", canViewAllOrders);
    
    // Check the specific logic from accessControl.js
    if (user) {
      const isAdmin = user.accountType === 'admin';
      const isManager = user.accountType === 'manager';
      console.log("Manual permission check:");
      console.log("- user.accountType:", user.accountType);
      console.log("- isAdmin:", isAdmin);
      console.log("- isManager:", isManager);
      console.log("- should allow delete:", isAdmin || isManager);
    }
  }, [user, userRole, accessControl, canDeleteOrders]);

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle individual order deletion
  const handleDeleteOrder = async (orderId) => {
    if (!canDeleteOrders) {
      showNotification('You do not have permission to delete orders', 'error');
      return;
    }

    setDeletingOrder(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      
      // Remove from local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      
      showNotification('Order deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification('Failed to delete order. Please try again.', 'error');
    } finally {
      setDeletingOrder(null);
      setShowDeleteConfirm(null);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (!canDeleteOrders || selectedOrders.size === 0) {
      showNotification('You do not have permission to delete orders', 'error');
      return;
    }

    try {
      const batch = writeBatch(db);
      
      selectedOrders.forEach(orderId => {
        const orderRef = doc(db, 'orders', orderId);
        batch.delete(orderRef);
      });
      
      await batch.commit();
      
      // Remove from local state
      setOrders(prev => prev.filter(order => !selectedOrders.has(order.id)));
      setSelectedOrders(new Set());
      
      showNotification(`${selectedOrders.size} orders deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting orders:', error);
      showNotification('Failed to delete some orders. Please try again.', 'error');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  // Handle order selection for bulk operations
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    }
  };

  useEffect(() => {
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
        let ordersQuery;

        if (canViewAllOrders) {
          ordersQuery = query(ordersRef);
        } else {
          ordersQuery = query(
            ordersRef,
            where('userId', '==', user.uid)
          );
        }

        const querySnapshot = await getDocs(ordersQuery);
        const fetchedOrders = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Handle different date field names and formats
          let createdAt = new Date();
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (typeof data.createdAt === 'string') {
              createdAt = new Date(data.createdAt);
            }
          } else if (data.dateCreated) {
            if (typeof data.dateCreated.toDate === 'function') {
              createdAt = data.dateCreated.toDate();
            } else if (data.dateCreated instanceof Date) {
              createdAt = data.dateCreated;
            } else if (typeof data.dateCreated === 'string') {
              createdAt = new Date(data.dateCreated);
            }
          }

          const order = {
            id: doc.id,
            customerName: data.customerName || data.customer?.name || 'Unknown Customer',
            userEmail: data.userEmail || data.email || user.email,
            userId: data.userId || user.uid,
            total: data.total || data.totalAmount || 0,
            status: data.status || 'pending',
            items: data.items || [],
            itemCount: data.itemCount || data.items?.length || 0,
            createdAt: createdAt,
            _originalData: data
          };

          // For regular users, double-check that this order belongs to them
          if (!canViewAllOrders && data.userId !== user.uid) {
            return;
          }

          fetchedOrders.push(order);
        });
        
        // Sort orders by date (newest first)
        fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(`Failed to load orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, userRole, canViewAllOrders]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm.trim() === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <h2 className="text-xl font-bold mb-2">Error Loading Orders</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
            : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
        } border`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {canViewAllOrders ? 'All Orders' : 'My Orders'}
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {canViewAllOrders 
            ? 'Manage and process all customer orders' 
            : 'View and track your personal orders'
          }
        </p>
        
        {/* Role indicator with permission debug */}
        <div className="mt-2 flex items-center flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            userRole === 'admin' 
              ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
              : userRole === 'manager'
                ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
          }`}>
            {userRole === 'admin' ? 'Admin View' : 
             userRole === 'manager' ? 'Manager View' : 'Personal View'}
          </span>
          
          {/* Permission Debug Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            canDeleteOrders 
              ? darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-800'
              : darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800'
          }`}>
            Delete: {canDeleteOrders ? '✅ Allowed' : '❌ Denied'}
          </span>
          
          {/* Debug toggle button */}
          <button
            onClick={() => setShowPermissionDebug(!showPermissionDebug)}
            className={`px-2 py-1 rounded text-xs ${
              darkMode ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            🔍 Debug Permissions
          </button>
        </div>

        {/* Permission Debug Panel */}
        {showPermissionDebug && (
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border`}>
            <h3 className="text-sm font-bold mb-2">🔐 Permission Debug Information:</h3>
            <div className="text-xs space-y-1 font-mono">
              <div><strong>User UID:</strong> {user?.uid}</div>
              <div><strong>User Email:</strong> {user?.email}</div>
              <div><strong>User Role (from auth):</strong> {userRole}</div>
              <div><strong>User AccountType:</strong> {user?.accountType || 'undefined'}</div>
              <div><strong>Can Delete Orders:</strong> {canDeleteOrders ? '✅ true' : '❌ false'}</div>
              <div><strong>Can View All Orders:</strong> {canViewAllOrders ? '✅ true' : '❌ false'}</div>
              <div><strong>Access Control Keys:</strong> {Object.keys(accessControl).join(', ')}</div>
              
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <strong>Manual Permission Check:</strong>
                <div>user.accountType === 'admin': {user?.accountType === 'admin' ? '✅' : '❌'}</div>
                <div>user.accountType === 'manager': {user?.accountType === 'manager' ? '✅' : '❌'}</div>
              </div>
              
              {!canDeleteOrders && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400">
                  <strong>❌ Why delete is denied:</strong>
                  {!user ? ' - No user logged in' : 
                   user.accountType !== 'admin' && user.accountType !== 'manager' ? 
                   ` - AccountType "${user.accountType}" is not admin or manager` : 
                   ' - Unknown reason'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter - only for admin/manager */}
      {canViewAllOrders && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by customer, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions - only shown if user has delete permissions and orders are selected */}
      {canDeleteOrders && selectedOrders.size > 0 && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
              {selectedOrders.size} order(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedOrders(new Set())}
                className={`border px-3 py-1 rounded text-sm ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Display */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
          <div className="flex items-center">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mr-4`}>
              Orders ({filteredOrders.length})
            </h2>
            {canDeleteOrders && filteredOrders.length > 0 && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select All
                </span>
              </label>
            )}
          </div>
          {canViewAllOrders && (
            <Link 
              to="/create-order"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Create Order
            </Link>
          )}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
                  {canDeleteOrders && (
                    <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Select
                    </th>
                  )}
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Order ID
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    {canViewAllOrders ? 'Customer' : 'Date'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    {canViewAllOrders ? 'Date' : 'Items'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Total
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    {canDeleteOrders && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {canViewAllOrders ? (
                        <div>
                          <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {order.customerName}
                          </span>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {order.userEmail}
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt.toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {canViewAllOrders ? (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt.toLocaleDateString()}
                        </span>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.itemCount} items
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                          : order.status === 'pending' 
                            ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            : order.status === 'processing'
                              ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                              : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={`/orders/${order.id}`}
                          className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                        >
                          View
                        </Link>
                        {canViewAllOrders && (
                          <button 
                            className={`text-sm ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'} font-medium`}
                          >
                            Edit
                          </button>
                        )}
                        {/* This is where the delete button should appear */}
                        {canDeleteOrders && (
                          <button 
                            onClick={() => setShowDeleteConfirm(order.id)}
                            disabled={deletingOrder === order.id}
                            className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} font-medium disabled:opacity-50`}
                          >
                            {deletingOrder === order.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                        {/* Debug: Show why delete button might not appear */}
                        {!canDeleteOrders && canViewAllOrders && (
                          <span className="text-xs text-red-500">
                            No Delete Perm
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              📋
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No orders found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {canViewAllOrders
                ? searchTerm || statusFilter !== 'all'
                  ? "No orders match your search criteria."
                  : "No orders have been placed yet."
                : "You haven't placed any orders yet. Start shopping to see your orders here!"
              }
            </p>
            {!canViewAllOrders && (
              <Link 
                to="/catalog"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Shopping
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Individual Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
              Confirm Deletion
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to delete order #{showDeleteConfirm.slice(0, 8)}? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteOrder(showDeleteConfirm)}
                disabled={deletingOrder === showDeleteConfirm}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deletingOrder === showDeleteConfirm ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingOrder === showDeleteConfirm}
                className={`flex-1 py-2 rounded border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
              Confirm Bulk Deletion
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to delete {selectedOrders.size} selected order(s)? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleBulkDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className={`flex-1 py-2 rounded border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSpecificOrders;