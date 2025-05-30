// src/pages/Home.jsx - Updated with role-based dashboard content
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const Home = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get role-specific dashboard info
  const getDashboardInfo = () => {
    if (!user) return null;
    
    const { accountType, businessType } = user;

    switch (accountType) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage users, system settings, and monitor platform health',
          route: '/admin-dashboard',
          icon: '⚙️',
          color: 'bg-red-600 hover:bg-red-700'
        };
      case 'manager':
        return {
          title: 'Manager Dashboard',
          description: 'Oversee team performance and business metrics',
          route: '/manager-dashboard',
          icon: '📊',
          color: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'business':
        if (businessType === 'seller') {
          return {
            title: 'Seller Dashboard',
            description: 'Manage products, inventory, and track sales performance',
            route: '/business-dashboard',
            icon: '🏪',
            color: 'bg-green-600 hover:bg-green-700'
          };
        } else {
          return {
            title: 'Buyer Dashboard',
            description: 'Browse products, manage orders, and track purchases',
            route: '/business-dashboard',
            icon: '🛒',
            color: 'bg-blue-600 hover:bg-blue-700'
          };
        }
      case 'user':
        return {
          title: 'User Dashboard',
          description: 'Manage your orders and view your activity',
          route: '/user-dashboard',
          icon: '👤',
          color: 'bg-indigo-600 hover:bg-indigo-700'
        };
      default:
        return null;
    }
  };

  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            {user ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}!` : 'Welcome to Wholesaler'}
          </h1>
          <p className="text-xl mb-8">
            {user 
              ? 'Ready to manage your wholesale business with powerful tools and insights'
              : 'Your one-stop solution for wholesale inventory management'
            }
          </p>
          
          {/* Dynamic Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              // Authenticated User Buttons
              <>
                <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center">
                  🛒 Browse Products
                </Link>
                <Link to="/cart" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center">
                  🛍️ Shopping Cart
                </Link>
                {dashboardInfo && (
                  <Link 
                    to={dashboardInfo.route} 
                    className={`text-white px-8 py-3 rounded-lg flex items-center ${dashboardInfo.color}`}
                  >
                    {dashboardInfo.icon} {dashboardInfo.title}
                  </Link>
                )}
              </>
            ) : (
              // Guest User Buttons
              <>
                <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center">
                  🛒 Browse Products
                </Link>
                <Link to="/cart" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center">
                  🛍️ Shopping Cart
                </Link>
                <Link to="/guest-dashboard" className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 flex items-center">
                  👁️ Guest View
                </Link>
                <Link to="/login" className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center">
                  🔑 Sign In
                </Link>
                <Link to="/register" className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 flex items-center">
                  ✨ Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Quick Access Section for Logged-in Users */}
      {user && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} py-16`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/orders" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-lg font-semibold mb-2">My Orders</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>View and manage your orders</p>
                </div>
              </Link>
              
              {user.accountType === 'business' && user.businessType === 'seller' ? (
                <Link to="/inventory" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <h3 className="text-lg font-semibold mb-2">My Inventory</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your products</p>
                  </div>
                </Link>
              ) : (
                <Link to="/create-order" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">➕</div>
                    <h3 className="text-lg font-semibold mb-2">New Order</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create a new order quickly</p>
                  </div>
                </Link>
              )}
              
              <Link to="/products" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🛒</div>
                  <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Explore our catalog</p>
                </div>
              </Link>
              
              <Link to="/cart" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🛍️</div>
                  <h3 className="text-lg font-semibold mb-2">Shopping Cart</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Review your cart items</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Section for Non-Authenticated Users */}
      {!user && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} py-16`}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Start Shopping</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link to="/products" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🛒</div>
                  <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Explore our product catalog</p>
                </div>
              </Link>
              
              <Link to="/cart" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🛍️</div>
                  <h3 className="text-lg font-semibold mb-2">Shopping Cart</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>View your selected items</p>
                </div>
              </Link>
              
              <Link to="/guest-dashboard" className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} p-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">👁️</div>
                  <h3 className="text-lg font-semibold mb-2">Guest View</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Browse as a guest user</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} py-16 ${user ? '' : 'mt-0'}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {user ? 'Platform Features' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Inventory</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Track your products with real-time updates and low stock alerts
              </p>
            </div>
            
            <div className="text-center">
              <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Order Processing</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Streamlined order management from creation to fulfillment
              </p>
            </div>
            
            <div className="text-center">
              <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Detailed insights to help you make informed business decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard Info Section for Logged-in Users */}
      {user && dashboardInfo && (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-16`}>
          <div className="container mx-auto px-4">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-8 border`}>
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:flex-1">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{dashboardInfo.icon}</span>
                    <div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Your {dashboardInfo.title}
                      </h2>
                      <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {dashboardInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                  <Link 
                    to={dashboardInfo.route}
                    className={`inline-block px-6 py-3 rounded-lg font-medium text-white text-center ${dashboardInfo.color}`}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        {user ? (
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
            <p className="text-lg mb-8">Explore all the features available in your dashboard</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700">
                Start Shopping
              </Link>
              <Link to="/cart" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700">
                View Cart
              </Link>
              {dashboardInfo && (
                <Link to={dashboardInfo.route} className={`text-white px-8 py-3 rounded-lg ${dashboardInfo.color}`}>
                  Go to {dashboardInfo.title}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8">Join thousands of businesses already using our platform</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700">
                Browse Products
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;