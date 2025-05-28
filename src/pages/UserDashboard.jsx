// src/pages/UserDashboard.jsx - Simple dashboard for regular users
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
      if (!user?.email) return;
      
      try {
        setLoading(true);
        
        // Fetch only user's orders - this is key for user privacy
        const ordersRef = collection(db, 'orders');
        
        // In real app, you'd filter by user ID or email
        // For demo purposes, we'll get all orders but in production you'd use:
        // const userOrdersQuery = query(ordersRef, where('userEmail', '==', user.email), orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersRef);
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            total: data.total || 0,
            status: data.status || 'pending',
            items: data.items || [],
            itemCount: data.itemCount || 0,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            userEmail: data.userEmail || 'demo@user.com' // In real app, this would be properly set
          };
        });

        // Filter orders to show only user's orders (simulate user-specific data)
        // In production, this filtering would happen in the database query
        const userOrders = allOrders.filter(order => 
          order.customerName.toLowerCase().includes(user.email?.split('@')[0].toLowerCase() || 'user')
        ).slice(0, 10); // Limit to 10 orders for demo

        

        // Calculate user statistics
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
        setError('Failed to load your data');
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
              <Link 
                to="/orders" 
                className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                View All →
              </Link>
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
                                : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
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
                    Start shopping to see your orders here
                  </p>
                  <Link 
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Products
                  </Link>
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
                      {user?.displayName || 'User'}
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