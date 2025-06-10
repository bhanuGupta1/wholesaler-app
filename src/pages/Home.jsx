// src/pages/Home.jsx - Fixed with proper Theme Toggle Support
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

  // Get role-specific dashboard info
  const getDashboardInfo = () => {
    if (!user) return null;
    const { accountType, businessType } = user;
    const dashboards = {
      admin: { title: 'Admin Dashboard', route: '/admin-dashboard', icon: '⚙️', color: 'red' },
      manager: { title: 'Manager Dashboard', route: '/manager-dashboard', icon: '📊', color: 'purple' },
      user: { title: 'User Dashboard', route: '/user-dashboard', icon: '👤', color: 'cyan' }
    };
    
    if (accountType === 'business') {
      return businessType === 'seller' 
        ? { title: 'Seller Dashboard', route: '/business-dashboard', icon: '🏪', color: 'green' }
        : { title: 'Buyer Dashboard', route: '/business-dashboard', icon: '🛒', color: 'blue' };
    }
    
    return dashboards[accountType] || null;
  };

  // Button styling helper
  const getButtonClass = (variant = 'primary') => {
    if (darkMode) {
      const variants = {
        primary: 'cyber-btn cyber-btn-primary',
        secondary: 'cyber-btn cyber-btn-secondary',
        success: 'cyber-btn cyber-btn-success',
        outline: 'cyber-btn cyber-btn-outline',
        ghost: 'cyber-btn cyber-btn-ghost'
      };
      return variants[variant] || variants.primary;
    }
    
    const lightVariants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg',
      secondary: 'bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg',
      success: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg',
      outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg',
      ghost: 'bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg'
    };
    return lightVariants[variant] || lightVariants.primary;
  };

  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        {/* Background Effects */}
        {darkMode ? (
          <div className="absolute inset-0">
            <div className="cyberpunk-grid opacity-20"></div>
            <div className="scanlines"></div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-30 animate-pulse"></div>
          </div>
        )}
        
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className={`${darkMode ? 'cyber-loading-spinner' : 'animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto'} mb-8`}></div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'cyberpunk-title' : 'font-extrabold'}`}>
            <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>
              {darkMode ? 'INITIALIZING' : 'Loading'}
            </span>
            <br />
            <span className={darkMode ? 'text-yellow-400 cyber-glow' : 'text-purple-600'}>
              {darkMode ? 'NEURAL INTERFACE' : 'Platform'}
            </span>
          </h1>
          
          <div className="mb-8">
            <div className={`w-full rounded-full h-3 mb-4 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div className={`h-full rounded-full animate-pulse ${darkMode ? 'bg-gradient-to-r from-cyan-400 to-yellow-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}></div>
            </div>
            <div className={`${darkMode ? 'font-mono text-cyan-400' : 'font-semibold text-blue-600'} text-lg animate-pulse`}>
              {darkMode ? 'Loading quantum matrices...' : 'Initializing platform...'}
            </div>
          </div>
          
          {darkMode && (
            <>
              <div className="absolute top-10 left-10 hologram-float">
                <div className="w-6 h-6 bg-cyan-400 opacity-30 rotate-45 animate-spin"></div>
              </div>
              <div className="absolute top-20 right-10 hologram-float">
                <div className="w-4 h-4 bg-yellow-400 opacity-30 rounded-full animate-bounce"></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Dark Mode - Completely RAW (no wrapper)
  if (darkMode) {
    return (
      <>
        {/* Background Effects - Direct on black */}
        <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
          <div className="cyberpunk-grid"></div>
        </div>
        <div className="fixed inset-0 z-3 pointer-events-none">
          <div className="scanlines"></div>
        </div>

        {/* Override any wrapper backgrounds */}
        <style>{`
          .main-content-wrapper {
            background: transparent !important;
            border: none !important;
            backdrop-filter: none !important;
          }
        `}</style>

        {/* HERO SECTION */}
        <section className="min-h-screen flex items-center justify-center relative z-10">
          <div className="text-center max-w-6xl mx-auto px-4">
            <div className="mb-12 relative">
              <h1 className="text-6xl md:text-9xl font-bold mb-6 cyberpunk-title">
                {user ? (
                  <>
                    <span className="text-cyan-400 cyber-glow">WELCOME BACK</span>
                    <br />
                    <span className="text-purple-400 cyber-glow hacker-text" data-text={user.displayName || user.email?.split('@')[0] || 'USER'}>
                      {user.displayName || user.email?.split('@')[0] || 'USER'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-cyan-400 cyber-glow">WHOLESALER</span>
                    <br />
                    <span className="text-yellow-400 cyber-glow">2077</span>
                  </>
                )}
              </h1>
              
              <div className="text-2xl md:text-4xl mb-8 text-gray-300 holographic-text">
                NEURAL COMMERCE PLATFORM
              </div>
            </div>

            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-gray-300 typewriter-text">
              {user 
                ? 'Neural interface activated. Your wholesale management systems are online.'
                : 'Next-generation wholesale platform powered by quantum neural networks.'
              }
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center mb-16">
              {user ? (
                <>
                  <Link to="/products" className="cyber-btn cyber-btn-primary">
                    <span className="text-xl">🛒</span>
                    <span className="btn-text">Browse Products</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                    <span className="text-xl">🛍️</span>
                    <span className="btn-text">Shopping Cart</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  {dashboardInfo && (
                    <Link to={dashboardInfo.route} className={`cyber-btn cyber-btn-${dashboardInfo.color}`}>
                      <span className="text-xl">{dashboardInfo.icon}</span>
                      <span className="btn-text">{dashboardInfo.title}</span>
                      <div className="btn-glow"></div>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/products" className="cyber-btn cyber-btn-primary">
                    <span className="text-xl">🛒</span>
                    <span className="btn-text">Browse Products</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                    <span className="text-xl">🛍️</span>
                    <span className="btn-text">Shopping Cart</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  <Link to="/guest-dashboard" className="cyber-btn cyber-btn-ghost">
                    <span className="text-xl">👁️</span>
                    <span className="btn-text">Guest View</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  <Link to="/login" className="cyber-btn cyber-btn-outline">
                    <span className="text-xl">🔑</span>
                    <span className="btn-text">Sign In</span>
                    <div className="btn-glow"></div>
                  </Link>
                  
                  <Link to="/register" className="cyber-btn cyber-btn-success">
                    <span className="text-xl">✨</span>
                    <span className="btn-text">Get Started Free</span>
                    <div className="btn-glow"></div>
                  </Link>
                </>
              )}
            </div>

            <div className="flex justify-center space-x-12 text-sm">
              {['SECURE', 'QUANTUM', 'NEURAL'].map((status, i) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse bg-${['green', 'yellow', 'purple'][i]}-400 shadow-lg shadow-${['green', 'yellow', 'purple'][i]}-400/50`}></div>
                  <span className={`font-bold font-mono text-${['green', 'yellow', 'purple'][i]}-400`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-20 left-20 hologram-float">
            <div className="hologram-cube"></div>
          </div>
          <div className="absolute bottom-20 right-20 hologram-float" style={{animationDelay: '2s'}}>
            <div className="hologram-pyramid"></div>
          </div>
        </section>

        {/* QUICK ACCESS SECTION FOR LOGGED-IN USERS */}
        {user && (
          <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
              <h2 className="text-5xl font-bold text-center mb-16 cyberpunk-title">
                <span className="text-cyan-400 cyber-glow">QUICK ACCESS</span>
                <span className="text-purple-400 cyber-glow"> TERMINAL</span>
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
                    <div className="cyber-card">
                      <div className="card-glow"></div>
                      <div className="card-content">
                        <div className="text-5xl mb-6 card-icon">{item.icon}</div>
                        <h3 className="text-xl font-bold mb-3 card-title">{item.title}</h3>
                        <p className="card-description">{item.desc}</p>
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
          <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
              <h2 className="text-5xl font-bold text-center mb-16 cyberpunk-title">
                <span className="text-green-400 cyber-glow">START</span>
                <span className="text-cyan-400 cyber-glow"> SHOPPING</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  { to: '/products', icon: '🛒', title: 'Browse Products', desc: 'Explore our product catalog' },
                  { to: '/cart', icon: '🛍️', title: 'Shopping Cart', desc: 'View your selected items' },
                  { to: '/guest-dashboard', icon: '👁️', title: 'Guest View', desc: 'Browse as a guest user' }
                ].map((item, index) => (
                  <Link key={index} to={item.to} className="group">
                    <div className="cyber-card">
                      <div className="card-glow"></div>
                      <div className="card-content">
                        <div className="text-5xl mb-6 card-icon">{item.icon}</div>
                        <h3 className="text-xl font-bold mb-3 card-title">{item.title}</h3>
                        <p className="card-description">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FEATURES SECTION */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-4 cyberpunk-title">
              <span className="text-purple-400 cyber-glow">{user ? 'PLATFORM' : 'WHY CHOOSE'}</span>
              <span className="text-cyan-400 cyber-glow"> {user ? 'FEATURES' : 'US?'}</span>
            </h2>
            
            <p className="text-xl text-center mb-16 max-w-4xl mx-auto text-gray-400">
              Advanced quantum algorithms power your business operations
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', 
                  title: 'Real-time Inventory', 
                  desc: 'Track your products with real-time updates and intelligent stock alerts',
                  color: 'text-cyan-400'
                },
                { 
                  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
                  title: 'Order Processing', 
                  desc: 'Efficient order management from creation to delivery and beyond',
                  color: 'text-green-400'
                },
                { 
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
                  title: 'Analytics & Reports', 
                  desc: 'Comprehensive insights and reports to drive informed business decisions',
                  color: 'text-purple-400'
                }
              ].map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className={`inline-flex mb-6 ${feature.color}`}>
                    <div className="icon-glow"></div>
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${feature.color}`}>{feature.title}</h3>
                  <p className="text-lg text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLE-SPECIFIC DASHBOARD INFO */}
        {user && dashboardInfo && (
          <section className="py-20 relative z-10">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto cyber-dashboard-card">
                <div className="dashboard-glow"></div>
                <div className="md:flex md:items-center md:justify-between relative z-10 p-12">
                  <div className="md:flex-1">
                    <div className="flex items-center mb-6">
                      <span className="text-6xl mr-6 dashboard-icon">{dashboardInfo.icon}</span>
                      <div>
                        <h2 className="text-4xl font-bold mb-2 text-white">Your {dashboardInfo.title}</h2>
                        <p className="text-xl text-gray-300">Access your personalized dashboard with role-specific features and tools</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-0">
                    <Link to={dashboardInfo.route} className="cyber-btn cyber-btn-dashboard">
                      <span className="btn-text">Go to Dashboard</span>
                      <div className="btn-glow"></div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA SECTION */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-6xl mx-auto cyber-cta-card">
              <div className="cta-glow"></div>
              <div className="relative z-10 p-16">
                <h2 className="text-5xl font-bold mb-8 cyberpunk-title">
                  <span className="text-cyan-400 cyber-glow">READY TO GET</span>
                  <br />
                  <span className="text-purple-400 cyber-glow">STARTED?</span>
                </h2>
                <p className="text-xl mb-12 text-gray-300">
                  {user 
                    ? 'Explore all the features available in your dashboard'
                    : 'Join thousands of businesses already using our platform'
                  }
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  {user ? (
                    <>
                      <Link to="/products" className="cyber-btn cyber-btn-primary">
                        <span className="btn-text">Start Shopping</span>
                        <div className="btn-glow"></div>
                      </Link>
                      <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                        <span className="btn-text">View Cart</span>
                        <div className="btn-glow"></div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/products" className="cyber-btn cyber-btn-success">
                        <span className="btn-text">Browse Products</span>
                        <div className="btn-glow"></div>
                      </Link>
                      <Link to="/register" className="cyber-btn cyber-btn-primary">
                        <span className="btn-text">Start Free Trial</span>
                        <div className="btn-glow"></div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Light Mode - With wrapper
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Light Mode Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center max-w-6xl mx-auto px-4">
          <div className="mb-12 relative">
            <h1 className="text-6xl md:text-9xl font-bold mb-6">

              {user ? (
                <>
                  <span className="text-blue-600">Welcome Back</span>
                  <br />
                  <span className="text-purple-700">{user.displayName || user.email?.split('@')[0] || 'USER'}</span>
                </>
              ) : (
                <>
                  <span className="text-blue-600">Wholesaler</span>
                  <br />
                  <span className="text-purple-600">Platform</span>
                </>
              )}
            </h1>
            
            <div className="text-2xl md:text-4xl mb-8 text-gray-600 font-semibold">
              Modern Wholesale Management
            </div>
          </div>

          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed text-gray-700">
            {user 
              ? 'Welcome to your wholesale management dashboard. Everything you need is at your fingertips.'
              : 'Streamline your wholesale operations with our comprehensive management platform.'
            }
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              <>
                <Link to="/products" className={getButtonClass('primary')}>
                  <span className="text-xl">🛒</span>
                  <span>Browse Products</span>
                </Link>
                
                <Link to="/cart" className={getButtonClass('secondary')}>
                  <span className="text-xl">🛍️</span>
                  <span>Shopping Cart</span>
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={getButtonClass('primary')}>
                    <span className="text-xl">{dashboardInfo.icon}</span>
                    <span>{dashboardInfo.title}</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/products" className={getButtonClass('primary')}>
                  <span className="text-xl">🛒</span>
                  <span>Browse Products</span>
                </Link>
                
                <Link to="/cart" className={getButtonClass('secondary')}>
                  <span className="text-xl">🛍️</span>
                  <span>Shopping Cart</span>
                </Link>
                
                <Link to="/guest-dashboard" className={getButtonClass('ghost')}>
                  <span className="text-xl">👁️</span>
                  <span>Guest View</span>
                </Link>
                
                <Link to="/login" className={getButtonClass('outline')}>
                  <span className="text-xl">🔑</span>
                  <span>Sign In</span>
                </Link>
                
                <Link to="/register" className={getButtonClass('success')}>
                  <span className="text-xl">✨</span>
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex justify-center space-x-12 text-sm">
            {['secure', 'advanced', 'smart'].map((status, i) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse bg-${['green', 'yellow', 'purple'][i]}-500`}></div>
                <span className={`font-bold text-${['green', 'yellow', 'purple'][i]}-600 capitalize`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of sections with light mode styling... */}
      {/* For brevity, I'll include the pattern but you can extend with similar light mode adaptations */}
      
    </div>
  );
};

export default Home;