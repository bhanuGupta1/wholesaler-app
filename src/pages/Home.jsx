// src/pages/Home.jsx - Fixed with proper Theme Toggle Support
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const Home = () => {
  const { darkMode } = useTheme(); // Added theme support
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get role-specific dashboard info with theme-adaptive colors
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
          color: darkMode ? 'cyber-btn-red' : 'bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg'
        };
      case 'manager':
        return {
          title: 'Manager Dashboard',
          description: 'Oversee team performance and business metrics',
          route: '/manager-dashboard',
          icon: '📊',
          color: darkMode ? 'cyber-btn-purple' : 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg'
        };
      case 'business':
        if (businessType === 'seller') {
          return {
            title: 'Seller Dashboard',
            description: 'Manage products, inventory, and track sales performance',
            route: '/business-dashboard',
            icon: '🏪',
            color: darkMode ? 'cyber-btn-green' : 'bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg'
          };
        } else {
          return {
            title: 'Buyer Dashboard',
            description: 'Browse products, manage orders, and track purchases',
            route: '/business-dashboard',
            icon: '🛒',
            color: darkMode ? 'cyber-btn-blue' : 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg'
          };
        }
      case 'user':
        return {
          title: 'User Dashboard',
          description: 'Manage your orders and view your activity',
          route: '/user-dashboard',
          icon: '👤',
          color: darkMode ? 'cyber-btn-cyan' : 'bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg'
        };
      default:
        return null;
    }
  };

  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
        {/* Loading Background Effects - Only show in dark mode */}
        {darkMode && (
          <div className="absolute inset-0">
            <div className="cyberpunk-grid opacity-20"></div>
            <div className="scanlines"></div>
          </div>
        )}
        
        {/* Loading Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          {/* Main Loading Spinner */}
          <div className={`${darkMode ? 'cyber-loading-spinner' : 'animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto'} mb-8`}></div>
          
          {/* Loading Title */}
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'cyberpunk-title' : 'font-bold'}`}>
            <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>INITIALIZING</span>
            <br />
            <span className={darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-600'}>NEURAL INTERFACE</span>
          </h1>
          
          {/* Loading Progress */}
          <div className="mb-8">
            <div className={`w-full rounded-full h-2 mb-4 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-300'}`}>
              <div className={`h-full rounded-full animate-pulse ${darkMode ? 'bg-gradient-to-r from-cyan-400 to-yellow-400' : 'bg-gradient-to-r from-blue-500 to-yellow-500'}`}></div>
            </div>
            <div className={`font-mono text-lg animate-pulse ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
              Loading quantum matrices...
            </div>
          </div>
          
          {/* Loading Messages */}
          <div className={`space-y-2 font-mono text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="typewriter-loading">Connecting to neural network...</div>
            <div className="typewriter-loading" style={{animationDelay: '1s'}}>Synchronizing data streams...</div>
            <div className="typewriter-loading" style={{animationDelay: '2s'}}>Activating cyberpunk protocols...</div>
          </div>
          
          {/* Floating Loading Elements - Only show in dark mode */}
          {darkMode && (
            <>
              <div className="absolute top-10 left-10 hologram-float">
                <div className="w-6 h-6 bg-cyan-400 opacity-30 rotate-45 animate-spin"></div>
              </div>
              <div className="absolute top-20 right-10 hologram-float" style={{animationDelay: '1s'}}>
                <div className="w-4 h-4 bg-yellow-400 opacity-30 rounded-full animate-bounce"></div>
              </div>
              <div className="absolute bottom-20 left-20 hologram-float" style={{animationDelay: '2s'}}>
                <div className="w-5 h-5 bg-purple-400 opacity-30 triangle animate-pulse"></div>
              </div>
            </>
          )}
        </div>
        
        {/* Loading Page Styles */}
        <style jsx>{`
          .typewriter-loading {
            overflow: hidden;
            border-right: 2px solid ${darkMode ? '#00FFFF' : '#0066CC'};
            white-space: nowrap;
            margin: 0 auto;
            animation: typing 2s steps(40, end), blink-caret 1s step-end infinite;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          
          .triangle {
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 17px solid currentColor;
            background: none;
          }
          
          @keyframes typing {
            from { 
              width: 0;
              opacity: 1;
            }
            to { 
              width: 100%;
              opacity: 1;
            }
          }
          
          @keyframes blink-caret {
            from, to { border-color: transparent; }
            50% { border-color: ${darkMode ? '#00FFFF' : '#0066CC'}; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Override any wrapper backgrounds */}
      <style>{`
        .main-content-wrapper {
          background: transparent !important;
          border: none !important;
          backdrop-filter: none !important;
        }
      `}</style>
      
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="text-center max-w-6xl mx-auto px-4">
          {/* Title with theme-adaptive styling */}
          <div className="mb-12 relative">
            <h1 className={`text-6xl md:text-9xl font-bold mb-6 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
              {user ? (
                <>
                  <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>WELCOME BACK</span>
                  <br />
                  <span className={`${darkMode ? 'text-purple-400 cyber-glow hacker-text' : 'text-purple-700'}`} data-text={user.displayName || user.email?.split('@')[0] || 'USER'}>
                    {user.displayName || user.email?.split('@')[0] || 'USER'}
                  </span>
                </>
              ) : (
                <>
                  <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>WHOLESALER</span>
                  <br />
                  <span className={darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-600'}>2077</span>
                </>
              )}
            </h1>
            
            {/* Subtitle */}
            <div className={`text-2xl md:text-4xl mb-8 ${darkMode ? 'text-gray-300 holographic-text' : 'text-gray-600'}`}>
              NEURAL COMMERCE PLATFORM
            </div>
          </div>

          {/* Description */}
          <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${darkMode ? 'text-gray-300 typewriter-text' : 'text-gray-700'}`}>
            {user 
              ? 'Neural interface activated. Your wholesale management systems are online.'
              : 'Next-generation wholesale platform powered by quantum neural networks.'
            }
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              // Authenticated User Buttons
              <>
                <Link to="/products" className={darkMode ? "cyber-btn cyber-btn-primary" : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">🛒</span>
                  <span>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={darkMode ? "cyber-btn cyber-btn-secondary" : "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">🛍️</span>
                  <span>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={darkMode ? `cyber-btn ${dashboardInfo.color}` : `${dashboardInfo.color} font-semibold transition-colors inline-flex items-center gap-2`}>
                    <span className="text-xl">{dashboardInfo.icon}</span>
                    <span>{dashboardInfo.title}</span>
                    {darkMode && <div className="btn-glow"></div>}
                  </Link>
                )}
              </>
            ) : (
              // Guest User Buttons
              <>
                <Link to="/products" className={darkMode ? "cyber-btn cyber-btn-primary" : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">🛒</span>
                  <span>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={darkMode ? "cyber-btn cyber-btn-secondary" : "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">🛍️</span>
                  <span>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/guest-dashboard" className={darkMode ? "cyber-btn cyber-btn-ghost" : "bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">👁️</span>
                  <span>Guest View</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/login" className={darkMode ? "cyber-btn cyber-btn-outline" : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">🔑</span>
                  <span>Sign In</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/register" className={darkMode ? "cyber-btn cyber-btn-success" : "bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"}>
                  <span className="text-xl">✨</span>
                  <span>Get Started Free</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
              </>
            )}
          </div>

          {/* System Status */}
          <div className="flex justify-center space-x-12 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-green-400 shadow-glow' : 'bg-green-500'} animate-pulse`}></div>
              <span className={`font-mono font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>SECURE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-yellow-400 shadow-glow' : 'bg-yellow-500'} animate-pulse`}></div>
              <span className={`font-mono font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>QUANTUM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-purple-400 shadow-glow' : 'bg-purple-500'} animate-pulse`}></div>
              <span className={`font-mono font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>NEURAL</span>
            </div>
          </div>
        </div>

        {/* Floating Holograms - Only show in dark mode */}
        {darkMode && (
          <>
            <div className="absolute top-20 left-20 hologram-float">
              <div className="hologram-cube"></div>
            </div>
            <div className="absolute bottom-20 right-20 hologram-float" style={{animationDelay: '2s'}}>
              <div className="hologram-pyramid"></div>
            </div>
          </>
        )}
      </section>

      {/* QUICK ACCESS SECTION FOR LOGGED-IN USERS */}
      {user && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <h2 className={`text-5xl font-bold text-center mb-16 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
              <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>QUICK ACCESS</span>
              <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-purple-600'}> TERMINAL</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { to: '/orders', icon: '📋', title: 'My Orders', desc: 'View and manage your orders' },
                { 
                  to: user.accountType === 'business' && user.businessType === 'seller' ? '/inventory' : '/create-order', 
                  icon: user.accountType === 'business' && user.businessType === 'seller' ? '📦' : '➕', 
                  title: user.accountType === 'business' && user.businessType === 'seller' ? 'My Inventory' : 'New Order', 
                  desc: user.accountType === 'business' && user.businessType === 'seller' ? 'Manage your products' : 'Create a new order quickly' 
                },
                { to: '/products', icon: '🛒', title: 'Browse Products', desc: 'Explore our catalog' },
                { to: '/cart', icon: '🛍️', title: 'Shopping Cart', desc: 'Review your cart items' }
              ].map((item, index) => (
                <Link key={index} to={item.to} className="group">
                  <div className={`p-6 rounded-lg transition-all duration-300 group-hover:scale-105 ${
                    darkMode 
                      ? 'cyber-card' 
                      : 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700'
                  }`}>
                    {darkMode && <div className="card-glow"></div>}
                    <div className={darkMode ? 'card-content' : 'text-center'}>
                      <div className={`text-4xl mb-4 ${darkMode ? 'card-icon' : 'filter drop-shadow-lg'}`}>{item.icon}</div>
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'card-title' : 'text-gray-900 dark:text-white'}`}>{item.title}</h3>
                      <p className={darkMode ? 'card-description' : 'text-gray-600 dark:text-gray-400'}>{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SHOPPING SECTION FOR GUESTS */}
      {!user && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <h2 className={`text-5xl font-bold text-center mb-16 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
              <span className={darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'}>START</span>
              <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}> SHOPPING</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { to: '/products', icon: '🛒', title: 'Browse Products', desc: 'Explore our product catalog' },
                { to: '/cart', icon: '🛍️', title: 'Shopping Cart', desc: 'View your selected items' },
                { to: '/guest-dashboard', icon: '👁️', title: 'Guest View', desc: 'Browse as a guest user' }
              ].map((item, index) => (
                <Link key={index} to={item.to} className="group">
                  <div className={`p-6 rounded-lg transition-all duration-300 group-hover:scale-105 ${
                    darkMode 
                      ? 'cyber-card' 
                      : 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700'
                  }`}>
                    {darkMode && <div className="card-glow"></div>}
                    <div className={darkMode ? 'card-content' : 'text-center'}>
                      <div className={`text-4xl mb-4 ${darkMode ? 'card-icon' : 'filter drop-shadow-lg'}`}>{item.icon}</div>
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'card-title' : 'text-gray-900 dark:text-white'}`}>{item.title}</h3>
                      <p className={darkMode ? 'card-description' : 'text-gray-600 dark:text-gray-400'}>{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className={`text-5xl font-bold text-center mb-4 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
            <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-purple-600'}>{user ? 'PLATFORM' : 'WHY CHOOSE'}</span>
            <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}> {user ? 'FEATURES' : 'US?'}</span>
          </h2>
          
          <p className={`text-xl text-center mb-16 max-w-4xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Advanced quantum algorithms power your business operations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', 
                title: 'Real-time Inventory', 
                desc: 'Track your products with real-time updates and low stock alerts',
                color: darkMode ? 'text-cyan-400' : 'text-blue-600'
              },
              { 
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
                title: 'Order Processing', 
                desc: 'Streamlined order management from creation to fulfillment',
                color: darkMode ? 'text-green-400' : 'text-green-600'
              },
              { 
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
                title: 'Analytics & Reports', 
                desc: 'Detailed insights to help you make informed business decisions',
                color: darkMode ? 'text-purple-400' : 'text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className={`text-center p-8 transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'feature-card' 
                  : 'bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`inline-flex mb-6 ${feature.color}`}>
                  {darkMode && <div className="icon-glow"></div>}
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${feature.color}`}>{feature.title}</h3>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE-SPECIFIC DASHBOARD INFO */}
      {user && dashboardInfo && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto rounded-lg p-12 ${
              darkMode 
                ? 'cyber-dashboard-card' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-xl'
            }`}>
              {darkMode && <div className="dashboard-glow"></div>}
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:flex-1">
                  <div className="flex items-center mb-6">
                    <span className={`text-6xl mr-6 ${darkMode ? 'dashboard-icon' : 'filter drop-shadow-lg'}`}>{dashboardInfo.icon}</span>
                    <div>
                      <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        Your {dashboardInfo.title}
                      </h2>
                      <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        {dashboardInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Link to={dashboardInfo.route} className={
                    darkMode 
                      ? "cyber-btn cyber-btn-dashboard" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  }>
                    <span>Go to Dashboard</span>
                    {darkMode && <div className="btn-glow"></div>}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <div className={`max-w-6xl mx-auto rounded-lg p-16 ${
            darkMode 
              ? 'cyber-cta-card' 
              : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 shadow-2xl'
          }`}>
            {darkMode && <div className="cta-glow"></div>}
            <div className="relative z-10">
              {user ? (
                <div>
                  <h2 className={`text-5xl font-bold mb-8 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
                    <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>READY TO BOOST</span>
                    <br />
                    <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-purple-700'}>YOUR PRODUCTIVITY?</span>
                  </h2>
                  <p className={`text-xl mb-12 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    Explore all the features available in your dashboard
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center">
                    <Link to="/products" className={darkMode ? "cyber-btn cyber-btn-primary" : "bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"}>
                      <span>Start Shopping</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                    <Link to="/cart" className={darkMode ? "cyber-btn cyber-btn-secondary" : "bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"}>
                      <span>View Cart</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                    {dashboardInfo && (
                      <Link to={dashboardInfo.route} className={
                        darkMode 
                          ? `cyber-btn ${dashboardInfo.color}` 
                          : `${dashboardInfo.color} font-bold text-lg transition-all duration-300`
                      }>
                        <span>Go to {dashboardInfo.title}</span>
                        {darkMode && <div className="btn-glow"></div>}
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className={`text-5xl font-bold mb-8 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
                    <span className={darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'}>READY TO GET</span>
                    <br />
                    <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>STARTED?</span>
                  </h2>
                  <p className={`text-xl mb-12 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    Join thousands of businesses already using our platform
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center">
                    <Link to="/products" className={darkMode ? "cyber-btn cyber-btn-success" : "bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"}>
                      <span>Browse Products</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                    <Link to="/register" className={darkMode ? "cyber-btn cyber-btn-primary" : "bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"}>
                      <span>Start Free Trial</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;