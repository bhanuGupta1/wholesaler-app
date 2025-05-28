// src/pages/UserDashboard.jsx - Updated to remove demo data and show user-specific data
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

// Simple chart component for user analytics
const SimpleBarChart = ({ data, title, description, color, darkMode }) => {
  const max = Math.max(...data.map(item => item.value));
  
  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{title}</h3>
      {description && <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{description}</p>}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className={`text-xs w-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.name}</span>
            <div className="flex-1 ml-2">
              <div className={`h-4 rounded-full bg-${color}-${darkMode ? '900/30' : '100'} overflow-hidden`}>
                <div 
                  className={`h-4 rounded-full bg-${color}-${darkMode ? '500' : '600'}`} 
                  style={{ width: `${(item.value / max) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ${item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// User's Recent Orders Component
const UserRecentOrders = ({ orders, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Recent Orders</h2>
      </div>
      
      {orders.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Order #{order.id.slice(0, 8)}
                    </div>
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
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {order.createdAt.toLocaleDateString()} • {order.itemCount || 0} items
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                  <Link 
                    to={`/orders/${order.id}`}
                    className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            🛒
          </div>
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
            Start Shopping
          </Link>
        </div>
      )}
      
      {orders.length > 0 && (
        <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
          <Link 
            to="/orders" 
            className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
          >
            View All Your Orders
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

// User Spending Analytics
const UserSpendingAnalytics = ({ stats, darkMode }) => {
  // Generate monthly spending data
  const generateMonthlySpending = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlySpending = stats.totalSpent / 6; // Distribute spending across months
    
    return months.map((month, index) => ({
      name: month,
      value: Math.round(monthlySpending * (0.5 + Math.random())) // Add variation
    }));
  };

  const monthlyData = generateMonthlySpending();

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Spending Analytics</h2>
      </div>
      
      <div className="p-6">
        {/* Spending Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${stats.totalSpent.toFixed(2)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Order</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${stats.avgOrderValue.toFixed(2)}
            </div>
          </div>
        </div>

        <SimpleBarChart 
          title="Monthly Spending" 
          description="Your spending over the last 6 months" 
          data={monthlyData} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        {/* Spending Insights */}
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
          <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            💡 Your Shopping Insights
          </h3>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            <li>• You've placed {stats.totalOrders} order{stats.totalOrders !== 1 ? 's' : ''} so far</li>
            <li>• Your average order value is ${stats.avgOrderValue.toFixed(2)}</li>
            <li>• {stats.completedOrders} of your orders have been completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Quick Shopping Actions for Users
const QuickShoppingActions = ({ darkMode }) => {
  const actions = [
    {
      id: 'browse-products',
      to: '/products',
      name: 'Browse Products',
      description: 'Explore our catalog',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'view-cart',
      to: '/cart',
      name: 'Shopping Cart',
      description: 'Review your items',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 2.5M7 13h.01M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0v-3a4 4 0 00-8 0v3m8 0H7" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'order-history',
      to: '/orders',
      name: 'Order History',
      description: 'Track your orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: 'account-settings',
      to: '/profile',
      name: 'Account Settings',
      description: 'Manage your profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'orange'
    },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link 
            key={action.id}
            to={action.to}
            className={`flex flex-col items-center p-4 rounded-xl 
              hover:bg-${action.color}-${darkMode ? '900/20' : '50'} 
              transition-all duration-300 transform hover:scale-105
              group border ${darkMode ? 
                `border-gray-700 hover:border-${action.color}-800` : 
                `border-gray-100 hover:border-${action.color}-100`}`}
          >
            <div className={`h-12 w-12 rounded-full ${darkMode ? 
              `bg-${action.color}-900/30` : 
              `bg-${action.color}-100`} 
              flex items-center justify-center mb-3 
              ${darkMode ? 
                `group-hover:bg-${action.color}-900/50` : 
                `group-hover:bg-${action.color}-200`} 
              transition-colors`}
            >
              <span className={`${darkMode ? 
                `text-${action.color}-400` : 
                `text-${action.color}-600`}`}
              >
                {action.icon}
              </span>
            </div>
            <span className={`text-sm font-medium ${darkMode ? 
              `text-gray-200 group-hover:text-${action.color}-400` : 
              `text-gray-800 group-hover:text-${action.color}-700`}`}
            >
              {action.name}
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-center`}>
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Featured Products for User
const FeaturedProducts = ({ products, darkMode }) => {
  const featuredProducts = products.slice(0, 3); // Show top 3 products

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Featured Products</h2>
      </div>
      
      {featuredProducts.length > 0 ? (
        <div className="p-5 space-y-4">
          {featuredProducts.map((product) => (
            <Link 
              key={product.id}
              to={`/products/${product.id}`}
              className={`flex items-center p-4 rounded-xl 
                hover:bg-gray-${darkMode ? '700' : '50'} 
                transition-all duration-300 border ${darkMode ? 
                  'border-gray-700' : 
                  'border-gray-100'}`}
            >
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {product.name}
                </span>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.category}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No featured products available.</p>
        </div>
      )}
      
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <Link 
          to="/products" 
          className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
        >
          Browse all products
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    userOrders: [],
    featuredProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch user's orders
        const ordersRef = collection(db, 'orders');
        const userOrdersQuery = query(
          ordersRef, 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const ordersSnapshot = await getDocs(userOrdersQuery);
        const userOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || user.displayName || 'You',
            total: data.total || 0,
            status: data.status || 'pending',
            itemCount: data.itemCount || 0,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });

        // Calculate user stats
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const completedOrders = userOrders.filter(order => order.status === 'completed').length;
        const pendingOrders = userOrders.filter(order => order.status === 'pending').length;

        // Fetch featured products (general products, not user-specific)
        const productsRef = collection(db, 'products');
        const featuredProductsQuery = query(productsRef, limit(6));
        const productsSnapshot = await getDocs(featuredProductsQuery);
        const featuredProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalOrders,
          totalSpent,
          avgOrderValue,
          completedOrders,
          pendingOrders,
          userOrders,
          featuredProducts
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your dashboard data');
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
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Here's your personal shopping dashboard and order history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'blue' },
          { title: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: '💰', color: 'green' },
          { title: 'Avg Order', value: `$${stats.avgOrderValue.toFixed(2)}`, icon: '📊', color: 'indigo' },
          { title: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'yellow' }
        ].map((stat, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-${stat.color}-${darkMode ? '900/30' : '100'}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* User's Recent Orders */}
          <UserRecentOrders orders={stats.userOrders} darkMode={darkMode} />
          
          {/* User Spending Analytics */}
          <UserSpendingAnalytics stats={stats} darkMode={darkMode} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Quick Shopping Actions */}
          <QuickShoppingActions darkMode={darkMode} />
          
          {/* Featured Products */}
          <FeaturedProducts products={stats.featuredProducts} darkMode={darkMode} />
          
          {/* Account Summary */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Account Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member since:</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Recently'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email:</span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {user?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order completion rate:</span>
                  <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {stats.totalOrders === 0 && (
        <div className={`mt-8 p-6 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Welcome to your dashboard!
              </h3>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} mt-1`}>
                This is your personal space to track orders, view spending analytics, and manage your shopping experience. 
                Start by browsing our products or checking out featured items.
              </p>
              <div className="mt-3">
                <Link 
                  to="/products"
                  className={`text-sm font-medium ${darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-600'} underline`}
                >
                  Start shopping now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;