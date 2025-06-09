// src/pages/Home.jsx - No content wrappers, direct on black background like original
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

  // Get role-specific dashboard info with cyberpunk colors
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
          color: 'cyber-btn-red'
        };
      case 'manager':
        return {
          title: 'Manager Dashboard',
          description: 'Oversee team performance and business metrics',
          route: '/manager-dashboard',
          icon: '📊',
          color: 'cyber-btn-purple'
        };
      case 'business':
        if (businessType === 'seller') {
          return {
            title: 'Seller Dashboard',
            description: 'Manage products, inventory, and track sales performance',
            route: '/business-dashboard',
            icon: '🏪',
            color: 'cyber-btn-green'
          };
        } else {
          return {
            title: 'Buyer Dashboard',
            description: 'Browse products, manage orders, and track purchases',
            route: '/business-dashboard',
            icon: '🛒',
            color: 'cyber-btn-blue'
          };
        }
      case 'user':
        return {
          title: 'User Dashboard',
          description: 'Manage your orders and view your activity',
          route: '/user-dashboard',
          icon: '👤',
          color: 'cyber-btn-cyan'
        };
      default:
        return null;
    }
  };

  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        {/* Loading Background Effects */}
        <div className="absolute inset-0">
          <div className="cyberpunk-grid opacity-20"></div>
          <div className="scanlines"></div>
        </div>
        
        {/* Loading Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          {/* Main Loading Spinner */}
          <div className="cyber-loading-spinner mb-8 mx-auto"></div>
          
          {/* Loading Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 cyberpunk-title">
            <span className="text-cyan-400 cyber-glow">INITIALIZING</span>
            <br />
            <span className="text-yellow-400 cyber-glow">NEURAL INTERFACE</span>
          </h1>
          
          {/* Loading Progress */}
          <div className="mb-8">
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-cyan-400 font-mono text-lg animate-pulse">
              Loading quantum matrices...
            </div>
          </div>
          
          {/* Loading Messages */}
          <div className="space-y-2 text-gray-400 font-mono text-sm">
            <div className="typewriter-loading">Connecting to neural network...</div>
            <div className="typewriter-loading" style={{animationDelay: '1s'}}>Synchronizing data streams...</div>
            <div className="typewriter-loading" style={{animationDelay: '2s'}}>Activating cyberpunk protocols...</div>
          </div>
          
          {/* Floating Loading Elements */}
          <div className="absolute top-10 left-10 hologram-float">
            <div className="w-6 h-6 bg-cyan-400 opacity-30 rotate-45 animate-spin"></div>
          </div>
          <div className="absolute top-20 right-10 hologram-float" style={{animationDelay: '1s'}}>
            <div className="w-4 h-4 bg-yellow-400 opacity-30 rounded-full animate-bounce"></div>
          </div>
          <div className="absolute bottom-20 left-20 hologram-float" style={{animationDelay: '2s'}}>
            <div className="w-5 h-5 bg-pink-400 opacity-30 triangle animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading Page Styles */}
        <style jsx>{`
          .typewriter-loading {
            overflow: hidden;
            border-right: 2px solid #00FFFF;
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
            50% { border-color: #00FFFF; }
          }
        `}</style>
      </div>
    );
  }

  return (
    // COMPLETELY RAW - NO BACKGROUND WRAPPERS AT ALL
    <>
      {/* Override any wrapper backgrounds with this style */}
      <style>{`
        .main-content-wrapper {
          background: transparent !important;
          border: none !important;
          backdrop-filter: none !important;
        }
      `}</style>
      
      {/* HERO SECTION - DIRECT ON BLACK BACKGROUND */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="text-center max-w-6xl mx-auto px-4">
          {/* Holographic Title Effect */}
          <div className="mb-12 relative">
            <h1 className="cyberpunk-title text-6xl md:text-9xl font-bold mb-6">
              {user ? (
                <>
                  <span className="text-cyan-400 cyber-glow">WELCOME BACK</span>
                  <br />
                  <span className="text-pink-400 cyber-glow hacker-text" data-text={user.displayName || user.email?.split('@')[0] || 'USER'}>
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
            
            {/* Holographic subtitle */}
            <div className="text-2xl md:text-4xl text-gray-300 mb-8 holographic-text">
              NEURAL COMMERCE PLATFORM
            </div>
          </div>

          {/* Enhanced subtitle with typewriter effect */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed typewriter-text">
            {user 
              ? 'Neural interface activated. Your wholesale management systems are online.'
              : 'Next-generation wholesale platform powered by quantum neural networks.'
            }
          </p>
          
          {/* CYBERPUNK BUTTONS */}
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              // Authenticated User Buttons
              <>
                <Link to="/products" className="cyber-btn cyber-btn-primary">
                  <span className="btn-icon">🛒</span>
                  <span className="btn-text">Browse Products</span>
                  <div className="btn-glow"></div>
                </Link>
                
                <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                  <span className="btn-icon">🛍️</span>
                  <span className="btn-text">Shopping Cart</span>
                  <div className="btn-glow"></div>
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={`cyber-btn ${dashboardInfo.color}`}>
                    <span className="btn-icon">{dashboardInfo.icon}</span>
                    <span className="btn-text">{dashboardInfo.title}</span>
                    <div className="btn-glow"></div>
                  </Link>
                )}
              </>
            ) : (
              // Guest User Buttons
              <>
                <Link to="/products" className="cyber-btn cyber-btn-primary">
                  <span className="btn-icon">🛒</span>
                  <span className="btn-text">Browse Products</span>
                  <div className="btn-glow"></div>
                </Link>
                
                <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                  <span className="btn-icon">🛍️</span>
                  <span className="btn-text">Shopping Cart</span>
                  <div className="btn-glow"></div>
                </Link>
                
                <Link to="/guest-dashboard" className="cyber-btn cyber-btn-ghost">
                  <span className="btn-icon">👁️</span>
                  <span className="btn-text">Guest View</span>
                  <div className="btn-glow"></div>
                </Link>
                
                <Link to="/login" className="cyber-btn cyber-btn-outline">
                  <span className="btn-icon">🔑</span>
                  <span className="btn-text">Sign In</span>
                  <div className="btn-glow"></div>
                </Link>
                
                <Link to="/register" className="cyber-btn cyber-btn-success">
                  <span className="btn-icon">✨</span>
                  <span className="btn-text">Get Started Free</span>
                  <div className="btn-glow"></div>
                </Link>
              </>
            )}
          </div>

          {/* Futuristic System Status */}
          <div className="flex justify-center space-x-12 text-sm">
            <div className="status-indicator">
              <div className="status-dot status-online"></div>
              <span className="status-text">SECURE</span>
            </div>
            <div className="status-indicator">
              <div className="status-dot status-quantum"></div>
              <span className="status-text">QUANTUM</span>
            </div>
            <div className="status-indicator">
              <div className="status-dot status-neural"></div>
              <span className="status-text">NEURAL</span>
            </div>
          </div>
        </div>

        {/* Floating Holograms */}
        <div className="absolute top-20 left-20 hologram-float">
          <div className="hologram-cube"></div>
        </div>
        <div className="absolute bottom-20 right-20 hologram-float" style={{animationDelay: '2s'}}>
          <div className="hologram-pyramid"></div>
        </div>
      </section>

      {/* QUICK ACCESS SECTION FOR LOGGED-IN USERS - TRANSPARENT */}
      {user && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-16 cyberpunk-title">
              <span className="text-cyan-400 cyber-glow">QUICK ACCESS</span>
              <span className="text-pink-400 cyber-glow"> TERMINAL</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link to="/orders" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">📋</div>
                    <h3 className="card-title">My Orders</h3>
                    <p className="card-description">View and manage your orders</p>
                  </div>
                </div>
              </Link>
              
              {user.accountType === 'business' && user.businessType === 'seller' ? (
                <Link to="/inventory" className="cyber-card-link group">
                  <div className="cyber-card">
                    <div className="card-glow"></div>
                    <div className="card-content">
                      <div className="card-icon">📦</div>
                      <h3 className="card-title">My Inventory</h3>
                      <p className="card-description">Manage your products</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link to="/create-order" className="cyber-card-link group">
                  <div className="cyber-card">
                    <div className="card-glow"></div>
                    <div className="card-content">
                      <div className="card-icon">➕</div>
                      <h3 className="card-title">New Order</h3>
                      <p className="card-description">Create a new order quickly</p>
                    </div>
                  </div>
                </Link>
              )}
              
              <Link to="/products" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🛒</div>
                    <h3 className="card-title">Browse Products</h3>
                    <p className="card-description">Explore our catalog</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/cart" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🛍️</div>
                    <h3 className="card-title">Shopping Cart</h3>
                    <p className="card-description">Review your cart items</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SHOPPING SECTION FOR GUESTS - TRANSPARENT */}
      {!user && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-16 cyberpunk-title">
              <span className="text-green-400 cyber-glow">START</span>
              <span className="text-cyan-400 cyber-glow"> SHOPPING</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Link to="/products" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🛒</div>
                    <h3 className="card-title">Browse Products</h3>
                    <p className="card-description">Explore our product catalog</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/cart" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🛍️</div>
                    <h3 className="card-title">Shopping Cart</h3>
                    <p className="card-description">View your selected items</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/guest-dashboard" className="cyber-card-link group">
                <div className="cyber-card">
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">👁️</div>
                    <h3 className="card-title">Guest View</h3>
                    <p className="card-description">Browse as a guest user</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION - TRANSPARENT */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-4 cyberpunk-title">
            <span className="text-purple-400 cyber-glow">{user ? 'PLATFORM' : 'WHY CHOOSE'}</span>
            <span className="text-cyan-400 cyber-glow"> {user ? 'FEATURES' : 'US?'}</span>
          </h2>
          
          <p className="text-xl text-gray-400 text-center mb-16 max-w-4xl mx-auto">
            Advanced quantum algorithms power your business operations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-glow"></div>
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-cyan-400">Real-time Inventory</h3>
              <p className="text-gray-400 text-lg">
                Track your products with real-time updates and low stock alerts
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-glow"></div>
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-400">Order Processing</h3>
              <p className="text-gray-400 text-lg">
                Streamlined order management from creation to fulfillment
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-glow"></div>
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">Analytics & Reports</h3>
              <p className="text-gray-400 text-lg">
                Detailed insights to help you make informed business decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE-SPECIFIC DASHBOARD INFO */}
      {user && dashboardInfo && (
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="cyber-dashboard-card max-w-6xl mx-auto">
              <div className="dashboard-glow"></div>
              <div className="md:flex md:items-center md:justify-between p-12">
                <div className="md:flex-1">
                  <div className="flex items-center mb-6">
                    <span className="text-6xl mr-6 dashboard-icon">{dashboardInfo.icon}</span>
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">
                        Your {dashboardInfo.title}
                      </h2>
                      <p className="text-xl text-gray-300">
                        {dashboardInfo.description}
                      </p>
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
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="cyber-cta-card max-w-6xl mx-auto">
            <div className="cta-glow"></div>
            <div className="p-16">
              {user ? (
                <div>
                  <h2 className="text-5xl font-bold mb-8 cyberpunk-title">
                    <span className="text-cyan-400 cyber-glow">READY TO BOOST</span>
                    <br />
                    <span className="text-pink-400 cyber-glow">YOUR PRODUCTIVITY?</span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-12">
                    Explore all the features available in your dashboard
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center">
                    <Link to="/products" className="cyber-btn cyber-btn-primary">
                      <span className="btn-text">Start Shopping</span>
                      <div className="btn-glow"></div>
                    </Link>
                    <Link to="/cart" className="cyber-btn cyber-btn-secondary">
                      <span className="btn-text">View Cart</span>
                      <div className="btn-glow"></div>
                    </Link>
                    {dashboardInfo && (
                      <Link to={dashboardInfo.route} className={`cyber-btn ${dashboardInfo.color}`}>
                        <span className="btn-text">Go to {dashboardInfo.title}</span>
                        <div className="btn-glow"></div>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-5xl font-bold mb-8 cyberpunk-title">
                    <span className="text-green-400 cyber-glow">READY TO GET</span>
                    <br />
                    <span className="text-cyan-400 cyber-glow">STARTED?</span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-12">
                    Join thousands of businesses already using our platform
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center">
                    <Link to="/products" className="cyber-btn cyber-btn-success">
                      <span className="btn-text">Browse Products</span>
                      <div className="btn-glow"></div>
                    </Link>
                    <Link to="/register" className="cyber-btn cyber-btn-primary">
                      <span className="btn-text">Start Free Trial</span>
                      <div className="btn-glow"></div>
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