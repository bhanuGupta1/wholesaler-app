// src/components/UserSpecificOrders.jsx - Fixed version with simplified logic
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const UserSpecificOrders = () => {
  const { darkMode } = useTheme();
  const { user, userRole } = useAuth(); // Use userRole from auth context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Determine if user can see all orders (admin/manager) or just their own
  const canViewAllOrders = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        console.log("User not logged in");
        setError("Please log in to view orders");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching orders for user:", user.uid, "Role:", userRole);
        
        const ordersRef = collection(db, 'orders');
        let ordersQuery;

        if (canViewAllOrders) {
          console.log("Admin/Manager: Fetching all orders");
          // Admin and Manager can see all orders
          ordersQuery = query(ordersRef);
        } else {
          console.log("Regular user: Fetching user-specific orders");
          // Regular users can only see their own orders
          // Use simple query without orderBy to avoid index requirements
          ordersQuery = query(
            ordersRef,
            where('userId', '==', user.uid)
          );
        }

        const querySnapshot = await getDocs(ordersQuery);
        console.log("Raw query results:", querySnapshot.size, "documents");

        const fetchedOrders = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Processing order:", doc.id, data);
          
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
            userEmail: data.userEmail || user.email,
            userId: data.userId || user.uid,
            total: data.total || data.totalAmount || 0,
            status: data.status || 'pending',
            items: data.items || [],
            itemCount: data.itemCount || data.items?.length || 0,
            createdAt: createdAt,
            // Include original data for debugging
            _originalData: data
          };

          // For regular users, double-check that this order belongs to them
          if (!canViewAllOrders && data.userId !== user.uid) {
            console.log("Skipping order that doesn't belong to user:", doc.id);
            return;
          }

          fetchedOrders.push(order);
        });

        console.log("Processed orders:", fetchedOrders.length);
        
        // Sort orders by date (newest first) if not already sorted
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
        
        {/* Role indicator */}
        <div className="mt-2 flex items-center">
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
          {!canViewAllOrders && (
            <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You can only see your own orders
            </span>
          )}
        </div>
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

      {/* Orders Display */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Orders ({filteredOrders.length})
          </h2>
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

      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border`}>
          <h3 className="text-sm font-medium mb-2">Debug Info:</h3>
          <div className="text-xs space-y-1">
            <div>User ID: {user?.uid}</div>
            <div>User Role: {userRole}</div>
            <div>Can View All Orders: {canViewAllOrders.toString()}</div>
            <div>Total Orders: {orders.length}</div>
            <div>Filtered Orders: {filteredOrders.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSpecificOrders;