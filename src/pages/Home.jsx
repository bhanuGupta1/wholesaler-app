// src/pages/Home.jsx - Enhanced with Futuristic Neumorphism Features
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

  // Enhanced theme-aware classes with new futuristic features
  const getThemeClasses = () => ({
    // Enhanced Buttons with new effects
    btnPrimary: darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn neumorph-btn-primary neon-border',
    btnSecondary: darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn neumorph-btn-secondary',
    btnOutline: darkMode ? 'cyber-btn cyber-btn-outline' : 'neumorph-btn neumorph-btn-outline',
    btnGhost: darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn neumorph-btn-ghost neumorph-glass',
    btnSuccess: darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn neumorph-btn-success',
    
    // Enhanced Cards with glass morphism
    card: darkMode ? 'cyber-card' : 'neumorph-card neumorph-glass',
    cardGlow: darkMode ? 'card-glow' : 'neumorph-card-glow',
    featureCard: darkMode ? 'feature-card' : 'neumorph-feature-card neumorph-holographic',
    
    // Enhanced Text with new effects
    title: darkMode ? 'cyberpunk-title' : 'neumorph-title',
    titleGlow: darkMode ? 'cyber-glow' : 'neumorph-text-shadow',
    holographicText: darkMode ? 'holographic-text' : 'neumorph-holographic-text',
    gradientText: darkMode ? 'holographic-text' : 'neumorph-gradient-text',
    description: darkMode ? 'text-gray-300' : 'text-gray-600',
    
    // Enhanced Text colors
    textPrimary: darkMode ? 'text-cyan-400' : 'text-blue-600',
    textSecondary: darkMode ? 'text-purple-400' : 'text-purple-600',
    textAccent: darkMode ? 'text-yellow-400' : 'text-green-600',
    
    // Enhanced Containers
    container: 'relative z-1',
    section: 'py-20 relative z-1',
    glassContainer: darkMode ? '' : 'neumorph-glass-strong'
  });

  const theme = getThemeClasses();
  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className={`relative z-10 text-center max-w-2xl mx-auto px-4 ${!darkMode ? 'neumorph-glass' : ''} ${!darkMode ? 'p-12 rounded-3xl' : ''}`}>
          <div className={`${darkMode ? 'cyber-loading-spinner' : 'neumorph-loading-spinner'} mb-8 mx-auto`}></div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${theme.title}`}>
            <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
              {darkMode ? 'INITIALIZING' : 'Loading'}
            </span>
            <br />
            <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
              {darkMode ? 'NEURAL INTERFACE' : 'Platform'}
            </span>
          </h1>
          <div className={`${theme.holographicText} text-lg`}>
            {darkMode ? 'Establishing secure connection...' : 'Preparing your experience...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ENHANCED HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative z-1">
        <div className="text-center max-w-6xl mx-auto px-4">
          <div className="mb-12 relative">
            {/* Enhanced main title with new effects */}
            <h1 className={`text-6xl md:text-9xl font-bold mb-6 ${theme.title}`}>
              {user ? (
                <>
                  <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                    {darkMode ? 'WELCOME BACK' : 'Welcome Back'}
                  </span>
                  <br />
                  <span 
                    className={`${theme.textSecondary} ${theme.titleGlow} ${darkMode ? 'hacker-text' : 'neumorph-holographic-text'}`} 
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
            
            {/* Enhanced subtitle with holographic effects */}
            <div className={`text-2xl md:text-4xl mb-8 ${theme.gradientText}`}>
              {darkMode ? 'NEURAL COMMERCE PLATFORM' : 'Next-Generation Wholesale Management'}
            </div>
          </div>

          {/* Enhanced description */}
          <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${theme.description} ${darkMode ? 'typewriter-text' : ''}`}>
            {user 
              ? darkMode 
                ? 'Neural interface activated. Your wholesale management systems are online.'
                : 'Welcome to your enhanced wholesale management dashboard. Advanced tools powered by modern technology.'
              : darkMode
                ? 'Next-generation wholesale platform powered by quantum neural networks.'
                : 'Experience the future of wholesale management with our advanced, intuitive platform designed for modern businesses.'
            }
          </p>
          
          {/* Enhanced action buttons */}
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={theme.btnPrimary}>
                    <span className="text-xl">{dashboardInfo.icon}</span>
                    <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>{dashboardInfo.title}</span>
                    {darkMode && <div className="btn-glow"></div>}
                    {!darkMode && <div className="neumorph-btn-glow"></div>}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Browse Products</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Shopping Cart</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/guest-dashboard" className={theme.btnGhost}>
                  <span className="text-xl">👁️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Guest View</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/login" className={theme.btnOutline}>
                  <span className="text-xl">🔑</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Sign In</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/register" className={theme.btnSuccess}>
                  <span className="text-xl">✨</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Get Started Free</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
              </>
            )}
          </div>

          {/* Enhanced Status Indicators */}
          <div className={`flex justify-center space-x-12 text-sm ${!darkMode ? 'neumorph-glass p-6 rounded-2xl inline-flex' : ''}`}>
            {(darkMode ? ['SECURE', 'QUANTUM', 'NEURAL'] : ['Secure', 'Advanced', 'Smart']).map((status, i) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  darkMode 
                    ? `bg-${['green', 'yellow', 'purple'][i]}-400 shadow-lg shadow-${['green', 'yellow', 'purple'][i]}-400/50`
                    : `bg-${['green', 'blue', 'purple'][i]}-500 shadow-lg`
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

        {/* Enhanced floating elements */}
        {darkMode ? (
          <>
            <div className="absolute top-20 left-20 hologram-float opacity-50">
              <div className="hologram-cube"></div>
            </div>
            <div className="absolute bottom-20 right-20 hologram-float opacity-50" style={{animationDelay: '2s'}}>
              <div className="hologram-pyramid"></div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-20 neumorph-float opacity-40">
              <div className="neumorph-shape neumorph-elevated"></div>
            </div>
            <div className="absolute bottom-20 right-20 neumorph-float opacity-40" style={{animationDelay: '2s'}}>
              <div className="neumorph-shape neumorph-circle neumorph-elevated"></div>
            </div>
            <div className="absolute top-1/2 right-10 neumorph-float opacity-30" style={{animationDelay: '4s'}}>
              <div className="neumorph-shape neumorph-subtle"></div>
            </div>
          </>
        )}
      </section>

      {/* ENHANCED QUICK ACCESS SECTION */}
      {user && (
        <section className={theme.section}>
          <div className={`container mx-auto px-4 ${theme.glassContainer} ${!darkMode ? 'py-16 rounded-3xl' : ''}`}>
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

      {/* ENHANCED SHOPPING SECTION FOR GUESTS */}
      {!user && (
        <section className={theme.section}>
          <div className={`container mx-auto px-4 ${theme.glassContainer} ${!darkMode ? 'py-16 rounded-3xl' : ''}`}>
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
                { to: '/products', icon: '🛒', title: 'Browse Products', desc: 'Explore our futuristic product catalog' },
                { to: '/cart', icon: '🛍️', title: 'Shopping Cart', desc: 'View your selected items with smart recommendations' },
                { to: '/guest-dashboard', icon: '👁️', title: 'Guest View', desc: 'Experience the platform as a guest user' }
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

      {/* ENHANCED FEATURES SECTION */}
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
              : 'Cutting-edge technology and intuitive design come together to revolutionize your business operations'
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', 
                title: 'Real-time Inventory', 
                desc: 'Advanced AI-powered tracking with predictive analytics and intelligent stock optimization',
                color: darkMode ? 'text-cyan-400' : 'text-blue-600'
              },
              { 
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
                title: 'Smart Order Processing', 
                desc: 'Automated workflows with machine learning optimization for seamless order management',
                color: darkMode ? 'text-green-400' : 'text-green-600'
              },
              { 
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
                title: 'Advanced Analytics', 
                desc: 'Deep insights powered by advanced algorithms to drive data-driven business decisions',
                color: darkMode ? 'text-purple-400' : 'text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className={theme.featureCard}>
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

      {/* ENHANCED ROLE-SPECIFIC DASHBOARD INFO */}
      {user && dashboardInfo && (
        <section className={theme.section}>
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto ${darkMode ? 'cyber-dashboard-card' : 'neumorph-dashboard-card neumorph-holographic'}`}>
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
                        Access your personalized dashboard with advanced features and intelligent tools
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Link to={dashboardInfo.route} className={darkMode ? 'cyber-btn cyber-btn-dashboard' : 'neumorph-btn neumorph-btn-dashboard neon-border'}>
                    <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Go to Dashboard</span>
                    {darkMode && <div className="btn-glow"></div>}
                    {!darkMode && <div className="neumorph-btn-glow"></div>}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ENHANCED CTA SECTION */}
      <section className={theme.section}>
        <div className="container mx-auto px-4 text-center">
          <div className={`max-w-6xl mx-auto ${darkMode ? 'cyber-cta-card' : 'neumorph-cta-card neumorph-holographic'}`}>
            <div className={darkMode ? 'cta-glow' : 'neumorph-cta-glow'}></div>
            <div className="relative z-10 p-16">
              <h2 className={`text-5xl font-bold mb-8 ${theme.title}`}>
                <span className={`${theme.textPrimary} ${theme.titleGlow}`}>
                  {darkMode ? 'READY TO GET' : 'Ready to Experience'}
                </span>
                <br />
                <span className={`${theme.textSecondary} ${theme.titleGlow}`}>
                  {darkMode ? 'STARTED?' : 'The Future?'}
                </span>
              </h2>
              <p className={`text-xl mb-12 ${theme.description}`}>
                {user 
                  ? 'Unlock the full potential of your business with our advanced platform features'
                  : 'Join thousands of forward-thinking businesses already transforming their operations'
                }
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                {user ? (
                  <>
                    <Link to="/products" className={theme.btnPrimary}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Start Shopping</span>
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                    </Link>
                    <Link to="/cart" className={theme.btnSecondary}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>View Cart</span>
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products" className={theme.btnSuccess}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Explore Products</span>
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                    </Link>
                    <Link to="/register" className={theme.btnPrimary}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Start Your Journey</span>
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
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