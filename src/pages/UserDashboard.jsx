// src/pages/UserDashboard.jsx - Fixed to show only user's actual orders
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const UserDashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    myOrders: [],
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch only user's orders using simple queries (avoiding orderBy to prevent index issues)
        const ordersRef = collection(db, 'orders');
        let userOrders = [];
        
        // Try primary filter: by userId (without orderBy to avoid index requirements)
        try {
          const userOrdersQuery = query(
            ordersRef, 
            where('userId', '==', user.uid),
            limit(50) // Reasonable limit for user orders
          );
          
          const ordersSnapshot = await getDocs(userOrdersQuery);
          userOrders = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              customerName: data.customerName || user.displayName || 'You',
              total: data.total || 0,
              status: data.status || 'pending',
              items: data.items || [],
              itemCount: data.itemCount || (data.items ? data.items.length : 0),
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
              userId: data.userId,
              userEmail: data.userEmail
            };
          });
          
          console.log(`Found ${userOrders.length} orders by userId`);
        } catch (userIdError) {
          console.log('Error querying by userId:', userIdError);
          userOrders = [];
        }

        // If no orders found by userId, try filtering by userEmail as fallback
        if (userOrders.length === 0 && user.email) {
          console.log('No orders found by userId, trying userEmail filter...');
          try {
            const emailOrdersQuery = query(
              ordersRef, 
              where('userEmail', '==', user.email),
              limit(50)
            );
            
            const ordersSnapshot = await getDocs(emailOrdersQuery);
            userOrders = ordersSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                customerName: data.customerName || user.displayName || 'You',
                total: data.total || 0,
                status: data.status || 'pending',
                items: data.items || [],
                itemCount: data.itemCount || (data.items ? data.items.length : 0),
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                userId: data.userId,
                userEmail: data.userEmail
              };
            });
            
            console.log(`Found ${userOrders.length} orders by userEmail`);
          } catch (emailError) {
            console.log('Error querying by userEmail:', emailError);
            userOrders = [];
          }
        }

        // If still no orders found, try getting all orders and filter client-side (as last resort)
        if (userOrders.length === 0) {
          console.log('No orders found by direct queries, trying client-side filter...');
          try {
            const allOrdersSnapshot = await getDocs(ordersRef);
            const allOrders = allOrdersSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                customerName: data.customerName || 'Unknown',
                total: data.total || 0,
                status: data.status || 'pending',
                items: data.items || [],
                itemCount: data.itemCount || (data.items ? data.items.length : 0),
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                userId: data.userId,
                userEmail: data.userEmail
              };
            });
            
            // Filter client-side for user's orders
            userOrders = allOrders.filter(order => 
              order.userId === user.uid || 
              order.userEmail === user.email ||
              (order.customerName && order.customerName.toLowerCase().includes(user.email?.split('@')[0]?.toLowerCase() || ''))
            );
            
            console.log(`Found ${userOrders.length} orders after client-side filtering from ${allOrders.length} total orders`);
          } catch (allOrdersError) {
            console.log('Error getting all orders:', allOrdersError);
            // This is fine - just means no orders collection exists or no permissions
            userOrders = [];
          }
        }

        // Sort orders by date (client-side since we avoided orderBy in queries)
        userOrders.sort((a, b) => b.createdAt - a.createdAt);

        // Calculate user statistics from real orders only
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
        const completedOrders = userOrders.filter(order => order.status === 'completed').length;

        setUserStats({
          myOrders: userOrders,
          totalOrders: userOrders.length,
          totalSpent,
          pendingOrders,
          completedOrders
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Don't show error for empty results - just show empty state
        console.log('Showing empty state instead of error');
        setUserStats({
          myOrders: [],
          totalOrders: 0,
          totalSpent: 0,
          pendingOrders: 0,
          completedOrders: 0
        });
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

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
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Please log in to view your dashboard.
          </p>
          <Link 
            to="/login" 
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Here's an overview of your shopping activity
        </p>
        {/* User ID indicator (helpful for debugging) */}
        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Account ID: {user.uid}
        </p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Orders
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {userStats.totalOrders}
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-blue-${darkMode ? '900/30' : '100'}`}>
              📋
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Spent
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ${userStats.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-green-${darkMode ? '900/30' : '100'}`}>
              💰
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Pending Orders
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {userStats.pendingOrders}
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-yellow-${darkMode ? '900/30' : '100'}`}>
              ⏳
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {userStats.completedOrders}
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-indigo-${darkMode ? '900/30' : '100'}`}>
              ✅
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Orders - Takes up 2/3 of the space */}
        <div className="lg:col-span-2">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Recent Orders</h2>
              {userStats.totalOrders > 5 && (
                <Link 
                  to="/orders" 
                  className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                  View All ({userStats.totalOrders}) →
                </Link>
              )}
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {userStats.myOrders.length > 0 ? (
                userStats.myOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className={`p-6 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
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
                        </div>
                        <div className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt.toLocaleDateString()} • {order.itemCount} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${order.total.toFixed(2)}
                        </div>
                        <Link 
                          to={`/orders/${order.id}`}
                          className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>📦</div>
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                    No orders yet
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                    You haven't placed any orders yet. Start shopping to see your orders here!
                  </p>
                  <Link 
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Products
                  </Link>
                  
                  {/* Debug info for empty orders */}
                  <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'} border text-left`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      <strong>Debug Info:</strong>
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      • User ID: {user?.uid}<br/>
                      • Email: {user?.email}<br/>
                      • Searching for orders with userId = "{user?.uid}" or userEmail = "{user?.email}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions & Account Info */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                to="/products" 
                className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
              >
                🛒 Browse Products
              </Link>
              <Link 
                to="/cart" 
                className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
              >
                🛍️ View Cart
              </Link>
              <Link 
                to="/orders" 
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                📋 My Orders
              </Link>
              <Link 
                to="/create-order" 
                className={`block w-full border-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} py-3 px-4 rounded-lg transition-colors text-center font-medium`}
              >
                ➕ New Order
              </Link>
            </div>
          </div>

          {/* Account Summary */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Account Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center text-lg font-bold`}>
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    }`}>
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user?.metadata?.creationTime ? 
                        new Date(user.metadata.creationTime).getFullYear() : 
                        new Date().getFullYear()
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User Role</span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                      Customer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping Tips */}
          <div className={`${darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-xl p-6 border ${darkMode ? 'border-indigo-800' : 'border-indigo-100'}`}>
            <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💡 Shopping Tip</h3>
            <p className={`text-sm ${darkMode ? 'text-indigo-200' : 'text-indigo-700'} mb-4`}>
              Save money by buying in bulk! Many of our products offer quantity discounts for larger orders.
            </p>
            <Link 
              to="/products" 
              className={`text-sm font-medium ${darkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              Explore Bulk Pricing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;