// src/pages/Home.jsx - Fixed JSX Syntax Errors
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
    const dashboards = {
      admin: { title: 'Admin Dashboard', route: '/admin-dashboard', icon: '⚙️' },
      manager: { title: 'Manager Dashboard', route: '/manager-dashboard', icon: '📊' },
      user: { title: 'User Dashboard', route: '/user-dashboard', icon: '👤' }
    };
    
    if (accountType === 'business') {
      return businessType === 'seller' 
        ? { title: 'Seller Dashboard', route: '/business-dashboard', icon: '🏪' }
        : { title: 'Buyer Dashboard', route: '/business-dashboard', icon: '🛒' };
    }
    
    return dashboards[accountType] || null;
  };

  // Theme-aware classes
  const getThemeClasses = () => ({
    // Buttons
    btnPrimary: darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn neumorph-btn-primary',
    btnSecondary: darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn neumorph-btn-secondary',
    btnOutline: darkMode ? 'cyber-btn cyber-btn-outline' : 'neumorph-btn neumorph-btn-outline',
    btnGhost: darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn neumorph-btn-ghost',
    btnSuccess: darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn neumorph-btn-success',
    
    // Cards
    card: darkMode ? 'cyber-card' : 'neumorph-card',
    cardGlow: darkMode ? 'card-glow' : 'neumorph-card-glow',
    
    // Text
    title: darkMode ? 'cyberpunk-title' : 'neumorph-title',
    titleGlow: darkMode ? 'cyber-glow' : 'neumorph-text-shadow',
    description: darkMode ? 'text-gray-300' : 'text-gray-600',
    
    // Backgrounds
    bgPrimary: darkMode ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    textPrimary: darkMode ? 'text-cyan-400' : 'text-blue-600',
    textSecondary: darkMode ? 'text-purple-400' : 'text-purple-600',
    textAccent: darkMode ? 'text-yellow-400' : 'text-green-600',
    
    // Containers
    container: darkMode ? 'relative z-10' : 'relative z-10',
    section: darkMode ? 'py-20 relative z-10' : 'py-20 relative z-10'
  });

  const theme = getThemeClasses();
  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme.bgPrimary}`}>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <div className={`${darkMode ? 'cyber-loading-spinner' : 'neumorph-loading-spinner'} mb-8`}></div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${theme.title}`}>
            <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
              {darkMode ? 'INITIALIZING' : 'Loading'}
            </span>
            <br />
            <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
              {darkMode ? 'NEURAL INTERFACE' : 'Platform'}
            </span>
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className={theme.bgPrimary}>
      {/* Background Effects - HIGHER Z-INDEX to show above main content */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-5 opacity-15 pointer-events-none">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-6 pointer-events-none">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-4">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-100 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="fixed inset-0 z-5 opacity-10 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
        </>
      )}

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center max-w-6xl mx-auto px-4">
          <div className="mb-12 relative">
            <h1 className={`text-6xl md:text-9xl font-bold mb-6 ${theme.title}`}>
              {user ? (
                <>
                  <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                    {darkMode ? 'WELCOME BACK' : 'Welcome Back'}
                  </span>
                  <br />
                  <span 
                    className={`${theme.textSecondary} ${theme.titleGlow} ${darkMode ? 'hacker-text' : ''}`} 
                    data-text={user.displayName || user.email?.split('@')[0] || 'USER'}
                  >
                    {user.displayName || user.email?.split('@')[0] || 'USER'}
                  </span>
                </>
              ) : (
                <>
                  <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                    {darkMode ? 'WHOLESALER' : 'Wholesaler'}
                  </span>
                  <br />
                  <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
                    {darkMode ? '2077' : 'Platform'}
                  </span>
                </>
              )}
            </h1>
            
            <div className={`text-2xl md:text-4xl mb-8 ${theme.description} ${darkMode ? 'holographic-text' : 'neumorph-gradient-text'}`}>
              {darkMode ? 'NEURAL COMMERCE PLATFORM' : 'Modern Wholesale Management'}
            </div>
          </div>

          <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${theme.description} ${darkMode ? 'typewriter-text' : ''}`}>
            {user 
              ? darkMode 
                ? 'Neural interface activated. Your wholesale management systems are online.'
                : 'Welcome to your wholesale management dashboard. Everything you need is at your fingertips.'
              : darkMode
                ? 'Next-generation wholesale platform powered by quantum neural networks.'
                : 'Streamline your wholesale operations with our comprehensive management platform.'
            }
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : ''}>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : ''}>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={theme.btnPrimary}>
                    <span className="text-xl">{dashboardInfo.icon}</span>
                    <span className={darkMode ? 'btn-text' : ''}>{dashboardInfo.title}</span>
                    {darkMode && <div className="btn-glow"></div>}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : ''}>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : ''}>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/guest-dashboard" className={theme.btnGhost}>
                  <span className="text-xl">👁️</span>
                  <span className={darkMode ? 'btn-text' : ''}>Guest View</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/login" className={theme.btnOutline}>
                  <span className="text-xl">🔑</span>
                  <span className={darkMode ? 'btn-text' : ''}>Sign In</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
                
                <Link to="/register" className={theme.btnSuccess}>
                  <span className="text-xl">✨</span>
                  <span className={darkMode ? 'btn-text' : ''}>Get Started Free</span>
                  {darkMode && <div className="btn-glow"></div>}
                </Link>
              </>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center space-x-12 text-sm">
            {(darkMode ? ['SECURE', 'QUANTUM', 'NEURAL'] : ['Secure', 'Advanced', 'Smart']).map((status, i) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  darkMode 
                    ? `bg-${['green', 'yellow', 'purple'][i]}-400 shadow-lg shadow-${['green', 'yellow', 'purple'][i]}-400/50`
                    : `bg-${['green', 'blue', 'purple'][i]}-500`
                }`}></div>
                <span className={`font-bold ${
                  darkMode 
                    ? `font-mono text-${['green', 'yellow', 'purple'][i]}-400`
                    : `text-${['green', 'blue', 'purple'][i]}-600`
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        {darkMode ? (
          <>
            <div className="absolute top-20 left-20 hologram-float">
              <div className="hologram-cube"></div>
            </div>
            <div className="absolute bottom-20 right-20 hologram-float" style={{animationDelay: '2s'}}>
              <div className="hologram-pyramid"></div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-20 neumorph-float">
              <div className="neumorph-shape"></div>
            </div>
            <div className="absolute bottom-20 right-20 neumorph-float" style={{animationDelay: '2s'}}>
              <div className="neumorph-shape neumorph-circle"></div>
            </div>
          </>
        )}
      </section>

      {/* QUICK ACCESS SECTION */}
      {user && (
        <section className={theme.section}>
          <div className="container mx-auto px-4">
            <h2 className={`text-5xl font-bold text-center mb-16 ${theme.title}`}>
              <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                {darkMode ? 'QUICK ACCESS' : 'Quick Access'}
              </span>
              <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
                {darkMode ? ' TERMINAL' : ' Dashboard'}
              </span>
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
                  <div className={theme.card}>
                    <div className={theme.cardGlow}></div>
                    <div className="card-content">
                      <div className={`text-5xl mb-6 ${darkMode ? 'card-icon' : 'neumorph-card-icon'}`}>{item.icon}</div>
                      <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'card-title' : 'neumorph-card-title'}`}>{item.title}</h3>
                      <p className={`${darkMode ? 'card-description' : 'neumorph-card-description'}`}>{item.desc}</p>
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
        <section className={theme.section}>
          <div className="container mx-auto px-4">
            <h2 className={`text-5xl font-bold text-center mb-16 ${theme.title}`}>
              <span className={`${theme.textAccent} ${theme.titleGlow}`}>
                {darkMode ? 'START' : 'Start'}
              </span>
              <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                {darkMode ? ' SHOPPING' : ' Shopping'}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { to: '/products', icon: '🛒', title: 'Browse Products', desc: 'Explore our product catalog' },
                { to: '/cart', icon: '🛍️', title: 'Shopping Cart', desc: 'View your selected items' },
                { to: '/guest-dashboard', icon: '👁️', title: 'Guest View', desc: 'Browse as a guest user' }
              ].map((item, index) => (
                <Link key={index} to={item.to} className="group">
                  <div className={theme.card}>
                    <div className={theme.cardGlow}></div>
                    <div className="card-content">
                      <div className={`text-5xl mb-6 ${darkMode ? 'card-icon' : 'neumorph-card-icon'}`}>{item.icon}</div>
                      <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'card-title' : 'neumorph-card-title'}`}>{item.title}</h3>
                      <p className={`${darkMode ? 'card-description' : 'neumorph-card-description'}`}>{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      <section className={theme.section}>
        <div className="container mx-auto px-4">
          <h2 className={`text-5xl font-bold text-center mb-4 ${theme.title}`}>
            <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
              {user ? (darkMode ? 'PLATFORM' : 'Platform') : (darkMode ? 'WHY CHOOSE' : 'Why Choose')}
            </span>
            <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
              {user ? (darkMode ? ' FEATURES' : ' Features') : (darkMode ? ' US?' : ' Us?')}
            </span>
          </h2>
          
          <p className={`text-xl text-center mb-16 max-w-4xl mx-auto ${theme.description}`}>
            {darkMode 
              ? 'Advanced quantum algorithms power your business operations'
              : 'Modern solutions designed to streamline your business operations'
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', 
                title: 'Real-time Inventory', 
                desc: 'Track your products with real-time updates and intelligent stock alerts',
                color: darkMode ? 'text-cyan-400' : 'text-blue-600'
              },
              { 
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
                title: 'Order Processing', 
                desc: 'Efficient order management from creation to delivery and beyond',
                color: darkMode ? 'text-green-400' : 'text-green-600'
              },
              { 
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
                title: 'Analytics & Reports', 
                desc: 'Comprehensive insights and reports to drive informed business decisions',
                color: darkMode ? 'text-purple-400' : 'text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className={darkMode ? 'feature-card' : 'neumorph-feature-card'}>
                <div className={`inline-flex mb-6 ${feature.color}`}>
                  <div className={darkMode ? 'icon-glow' : 'neumorph-icon-glow'}></div>
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${feature.color}`}>{feature.title}</h3>
                <p className={`text-lg ${theme.description}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE-SPECIFIC DASHBOARD INFO */}
      {user && dashboardInfo && (
        <section className={theme.section}>
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto ${darkMode ? 'cyber-dashboard-card' : 'neumorph-dashboard-card'}`}>
              <div className={darkMode ? 'dashboard-glow' : 'neumorph-dashboard-glow'}></div>
              <div className="md:flex md:items-center md:justify-between relative z-10 p-12">
                <div className="md:flex-1">
                  <div className="flex items-center mb-6">
                    <span className={`text-6xl mr-6 ${darkMode ? 'dashboard-icon' : 'neumorph-dashboard-icon'}`}>
                      {dashboardInfo.icon}
                    </span>
                    <div>
                      <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'} ${theme.title}`}>
                        Your {dashboardInfo.title}
                      </h2>
                      <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Access your personalized dashboard with role-specific features and tools
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Link to={dashboardInfo.route} className={darkMode ? 'cyber-btn cyber-btn-dashboard' : 'neumorph-btn neumorph-btn-dashboard'}>
                    <span className={darkMode ? 'btn-text' : ''}>Go to Dashboard</span>
                    {darkMode && <div className="btn-glow"></div>}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className={theme.section}>
        <div className="container mx-auto px-4 text-center">
          <div className={`max-w-6xl mx-auto ${darkMode ? 'cyber-cta-card' : 'neumorph-cta-card'}`}>
            <div className={darkMode ? 'cta-glow' : 'neumorph-cta-glow'}></div>
            <div className="relative z-10 p-16">
              <h2 className={`text-5xl font-bold mb-8 ${theme.title}`}>
                <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                  {darkMode ? 'READY TO GET' : 'Ready to Get'}
                </span>
                <br />
                <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
                  {darkMode ? 'STARTED?' : 'Started?'}
                </span>
              </h2>
              <p className={`text-xl mb-12 ${theme.description}`}>
                {user 
                  ? 'Explore all the features available in your dashboard'
                  : 'Join thousands of businesses already using our platform'
                }
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                {user ? (
                  <>
                    <Link to="/products" className={theme.btnPrimary}>
                      <span className={darkMode ? 'btn-text' : ''}>Start Shopping</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                    <Link to="/cart" className={theme.btnSecondary}>
                      <span className={darkMode ? 'btn-text' : ''}>View Cart</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products" className={theme.btnSuccess}>
                      <span className={darkMode ? 'btn-text' : ''}>Browse Products</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                    <Link to="/register" className={theme.btnPrimary}>
                      <span className={darkMode ? 'btn-text' : ''}>Start Free Trial</span>
                      {darkMode && <div className="btn-glow"></div>}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
              </section>
    </div>
  );
};

export default Home;