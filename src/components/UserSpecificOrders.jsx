// src/components/UserSpecificOrders.jsx - Updated to remove demo data
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';

// Helper function to determine user role
const getUserRole = (user) => {
  if (!user) return null;
  
  if (user.email?.includes('admin')) return 'admin';
  else if (user.email?.includes('manager')) return 'manager';
  else if (user.email?.includes('business')) return 'business';
  else return 'user';
};

const UserSpecificOrders = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const role = getUserRole(currentUser);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !userRole) return;

      try {
        setLoading(true);
        setError(null);

        const ordersRef = collection(db, 'orders');
        let ordersQuery;

        // Different data access based on user role
        switch (userRole) {
          case 'admin':
          case 'manager':
            // Admin and Manager can see ALL orders
            ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
            break;
          
          case 'business':
            // Business users see all orders but with limited details (for analytics)
            ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
            break;
          
          case 'user':
          default:
            // Regular users see ONLY their own orders
            ordersQuery = query(
              ordersRef, 
              where('userId', '==', user.uid),
              orderBy('createdAt', 'desc')
            );
            break;
        }

        const ordersSnapshot = await getDocs(ordersQuery);
        let fetchedOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            userEmail: data.userEmail || user.email,
            userId: data.userId || user.uid,
            total: data.total || 0,
            status: data.status || 'pending',
            items: data.items || [],
            itemCount: data.itemCount || 0,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });

        // Filter orders based on user role
        if (userRole === 'business') {
          // Business users see aggregated data without personal details
          fetchedOrders = fetchedOrders.map(order => ({
            ...order,
            customerName: 'Customer', // Hide personal info
            userEmail: 'private@company.com' // Hide personal info
          }));
        }

        setOrders(fetchedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, userRole]);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm.trim() === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header with role-appropriate title */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {userRole === 'user' ? 'My Orders' : 
           userRole === 'business' ? 'Order Analytics' :
           'All Orders Management'}
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {userRole === 'user' ? 'View and track your personal orders' :
           userRole === 'business' ? 'Business order insights and trends' :
           'Manage and process all customer orders'}
        </p>
        
        {/* Role indicator */}
        <div className="mt-2 flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            userRole === 'admin' 
              ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
              : userRole === 'manager'
                ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                : userRole === 'business'
                  ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                  : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
          }`}>
            {userRole === 'user' ? 'Personal View' : 
             userRole === 'business' ? 'Business View' :
             userRole === 'manager' ? 'Manager View' : 'Admin View'}
          </span>
          {userRole === 'user' && (
            <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You can only see your own orders
            </span>
          )}
        </div>
      </div>

      {/* Search and Filter - only for admin/manager */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by customer or order ID..."
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
          {userRole !== 'user' && (
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
                    {userRole === 'user' ? 'Date' : 'Customer'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    {userRole === 'user' ? 'Items' : 'Date'}
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
                      {userRole === 'user' ? (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt.toLocaleDateString()}
                        </span>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {order.customerName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {userRole === 'user' ? (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.itemCount} items
                        </span>
                      ) : (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt.toLocaleDateString()}
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
                        {(userRole === 'admin' || userRole === 'manager') && (
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
              {userRole === 'user' ? 'No orders found' : 'No orders match your filters'}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {userRole === 'user' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : "Try adjusting your search criteria or check back later."
              }
            </p>
            {userRole === 'user' && (
              <Link 
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Start Shopping
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Privacy Notice for Users */}
      {userRole === 'user' && (
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Privacy Protection
              </h3>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} mt-1`}>
                For your privacy and security, you can only view your own orders. Other customers' orders are not visible to you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSpecificOrders;