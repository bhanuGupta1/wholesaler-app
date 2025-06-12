// src/pages/Home.jsx - ENHANCED: Fully utilizing advanced neumorphism features
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

  // ENHANCED: Fully utilizing advanced neumorphism classes
  const getThemeClasses = () => ({
    // Enhanced Buttons with premium effects
    btnPrimary: darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn neumorph-btn-primary neon-border',
    btnSecondary: darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn neumorph-btn-secondary neumorph-elevated',
    btnOutline: darkMode ? 'cyber-btn cyber-btn-outline' : 'neumorph-btn neumorph-btn-outline neumorph-subtle',
    btnGhost: darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn neumorph-btn-ghost neumorph-breathing',
    btnSuccess: darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn neumorph-btn-success neumorph-elevated',
    
    // Enhanced Cards with premium glass effects
    card: darkMode ? 'cyber-card' : 'neumorph-card neumorph-breathing',
    cardGlow: darkMode ? 'card-glow' : 'neumorph-card-glow',
    featureCard: darkMode ? 'feature-card' : 'neumorph-feature-card neumorph-elevated',
    
    // Enhanced Text with advanced effects
    title: darkMode ? 'cyberpunk-title' : 'neumorph-title',
    titleGlow: darkMode ? 'cyber-glow' : 'neumorph-text-shadow',
    titleEmbossed: darkMode ? 'cyber-glow' : 'neumorph-embossed',
    titleDebossed: darkMode ? 'text-gray-600' : 'neumorph-debossed',
    holographicText: darkMode ? 'holographic-text' : 'neumorph-holographic-text',
    gradientText: darkMode ? 'holographic-text' : 'neumorph-gradient-text',
    description: darkMode ? 'text-gray-300' : 'text-gray-600 neumorph-text-shadow',
    
    // Enhanced Text colors with premium effects
    textPrimary: darkMode ? 'text-cyan-400' : 'text-blue-600',
    textSecondary: darkMode ? 'text-purple-400' : 'text-purple-600',
    textAccent: darkMode ? 'text-yellow-400' : 'text-green-600',
    
    // Enhanced Containers with glass morphism
    container: 'relative z-1',
    section: 'py-20 relative z-1',
    glassContainer: darkMode ? '' : 'neumorph-glass-strong neumorph-elevated',
    premiumContainer: darkMode ? '' : 'neumorph-holographic neumorph-elevated',
    
    // NEW: Premium loading effects
    loadingContainer: darkMode ? '' : 'neumorph-glass-strong neumorph-breathing',
    loadingSpinner: darkMode ? 'cyber-loading-spinner' : 'neumorph-loading-spinner',
    
    // NEW: Premium status indicators
    statusContainer: darkMode ? '' : 'neumorph-glass neumorph-subtle',
    
    // NEW: Enhanced dashboard and CTA cards
    dashboardCard: darkMode ? 'cyber-dashboard-card' : 'neumorph-dashboard-card neumorph-breathing',
    ctaCard: darkMode ? 'cyber-cta-card' : 'neumorph-cta-card neumorph-holographic'
  });

  const theme = getThemeClasses();
  const dashboardInfo = getDashboardInfo();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* ENHANCED: Premium loading with advanced glass morphism */}
        <div className={`relative z-10 text-center max-w-2xl mx-auto px-4 ${!darkMode ? 'p-16 rounded-3xl neumorph-glass-strong neumorph-elevated neumorph-breathing' : ''}`}>
          {/* ENHANCED: Add quantum glow effect for light mode */}
          {!darkMode && <div className="neumorph-card-glow"></div>}
          
          <div className={`${theme.loadingSpinner} mb-8 mx-auto`}></div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${theme.title}`}>
            <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
              {darkMode ? 'INITIALIZING' : 'LOADING'}
            </span>
            <br />
            <span className={`${theme.textSecondary} ${theme.titleDebossed}`}>
              {darkMode ? 'NEURAL INTERFACE' : 'PLATFORM'}
            </span>
          </h1>
          <div className={`${theme.holographicText} text-lg`}>
            {darkMode ? 'Establishing secure connection...' : 'Preparing your enhanced experience...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ENHANCED HERO SECTION with Premium Effects */}
      <section className="min-h-screen flex items-center justify-center relative z-1">
        {/* ENHANCED: Add wave effects for light mode */}
        {!darkMode && (
          <div className="neumorph-waves">
            <div className="neumorph-wave"></div>
            <div className="neumorph-wave"></div>
            <div className="neumorph-wave"></div>
          </div>
        )}
        
        <div className="text-center max-w-6xl mx-auto px-4">
          <div className="mb-12 relative">
            {/* ENHANCED: Premium title with advanced effects */}
            <h1 className={`text-6xl md:text-9xl font-bold mb-6 ${theme.title} ${!darkMode ? 'neumorph-breathing' : ''}`}>
              {user ? (
                <>
                  <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
                    {darkMode ? 'WELCOME BACK' : 'WELCOME BACK'}
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
                  <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
                    {darkMode ? 'WHOLESALER' : 'WHOLESALER'}
                  </span>
                  <br />
                  <span className={`${theme.textSecondary} ${theme.holographicText}`}>
                    {darkMode ? '2077' : 'PLATFORM'}
                  </span>
                </>
              )}
            </h1>
            
            {/* ENHANCED: Premium subtitle with quantum effects */}
            <div className={`text-2xl md:text-4xl mb-8 ${theme.gradientText} ${!darkMode ? 'neumorph-breathing' : ''}`}>
              {darkMode ? 'NEURAL COMMERCE PLATFORM' : 'TACTICAL BUSINESS COMMAND CENTER'}
            </div>
          </div>

          {/* ENHANCED: Premium description with glass container */}
          <div className={`${!darkMode ? 'neumorph-glass p-8 rounded-2xl mb-12 neumorph-subtle' : 'mb-12'}`}>
            <p className={`text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed ${theme.description}`}>
              {user 
                ? darkMode 
                  ? 'Neural interface activated. Your wholesale management systems are online.'
                  : 'Command center operational. Your tactical business management systems are fully armed and ready for deployment.'
                : darkMode
                  ? 'Next-generation wholesale platform powered by quantum neural networks.'
                  : 'Deploy the ultimate business warfare platform with military-grade precision tools designed for tactical market domination.'
              }
            </p>
          </div>
          
          {/* ENHANCED: Premium action buttons with advanced effects */}
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {user ? (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Browse Products</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Shopping Cart</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                {dashboardInfo && (
                  <Link to={dashboardInfo.route} className={theme.btnPrimary}>
                    <span className="text-xl">{dashboardInfo.icon}</span>
                    <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>{dashboardInfo.title}</span>
                    {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/products" className={theme.btnPrimary}>
                  <span className="text-xl">🛒</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Browse Products</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/cart" className={theme.btnSecondary}>
                  <span className="text-xl">🛍️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Shopping Cart</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/guest-dashboard" className={theme.btnGhost}>
                  <span className="text-xl">👁️</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Recon Mode</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/login" className={theme.btnOutline}>
                  <span className="text-xl">🔑</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Sign In</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
                
                <Link to="/register" className={theme.btnSuccess}>
                  <span className="text-xl">✨</span>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Deploy Free</span>
                  {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                </Link>
              </>
            )}
          </div>

          {/* ENHANCED: Premium Status Indicators with glass morphism */}
          <div className={`flex justify-center space-x-12 text-sm ${theme.statusContainer} ${!darkMode ? 'p-8 rounded-2xl inline-flex' : ''}`}>
            {!darkMode && <div className="neumorph-card-glow"></div>}
            {(darkMode ? ['SECURE', 'QUANTUM', 'NEURAL'] : ['SECURE', 'TACTICAL', 'ARMED']).map((status, i) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${!darkMode ? 'neumorph-status-dot' : ''} ${
                  darkMode 
                    ? `bg-${['green', 'yellow', 'purple'][i]}-400 shadow-lg shadow-${['green', 'yellow', 'purple'][i]}-400/50 animate-pulse`
                    : `bg-${['green', 'blue', 'purple'][i]}-500 shadow-lg`
                }`}></div>
                <span className={`font-bold ${
                  darkMode 
                    ? `font-mono text-${['green', 'yellow', 'purple'][i]}-400`
                    : `text-${['green', 'blue', 'purple'][i]}-600 neumorph-embossed`
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ENHANCED: Premium floating elements with more variety */}
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
            {/* ENHANCED: More floating shapes with premium effects */}
            <div className="absolute top-20 left-20 neumorph-float opacity-80">
              <div className="neumorph-floating-shape neumorph-floating-cube neumorph-elevated"></div>
            </div>
            <div className="absolute bottom-20 right-20 neumorph-float opacity-80" style={{animationDelay: '2s'}}>
              <div className="neumorph-floating-shape neumorph-floating-sphere neumorph-elevated"></div>
            </div>
            <div className="absolute top-1/2 right-10 neumorph-float opacity-70" style={{animationDelay: '4s'}}>
              <div className="neumorph-floating-shape neumorph-floating-diamond neumorph-elevated"></div>
            </div>
            <div className="absolute top-1/3 left-1/4 neumorph-float opacity-60" style={{animationDelay: '6s'}}>
              <div className="neumorph-floating-shape neumorph-floating-hexagon neumorph-elevated"></div>
            </div>
            <div className="absolute bottom-1/3 left-20 neumorph-float opacity-70" style={{animationDelay: '8s'}}>
              <div className="neumorph-floating-shape neumorph-floating-triangle neumorph-elevated"></div>
            </div>
            <div className="absolute top-1/4 right-1/3 neumorph-float opacity-50" style={{animationDelay: '10s'}}>
              <div className="neumorph-floating-shape neumorph-floating-cube neumorph-elevated"></div>
            </div>
            <div className="absolute bottom-1/4 left-1/3 neumorph-float opacity-65" style={{animationDelay: '12s'}}>
              <div className="neumorph-floating-shape neumorph-floating-sphere neumorph-elevated"></div>
            </div>
            
            {/* ENHANCED: Premium particle system */}
            <div className="neumorph-particles-container">
              <div className="neumorph-particle" style={{animationDelay: '0s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '2s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '4s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '6s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '8s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '10s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '12s'}}></div>
              <div className="neumorph-particle" style={{animationDelay: '14s'}}></div>
            </div>
          </>
        )}
      </section>

      {/* ENHANCED QUICK ACCESS SECTION with Premium Glass */}
      {user && (
        <section className={theme.section}>
          <div className={`container mx-auto px-4 ${theme.premiumContainer} ${!darkMode ? 'py-20 rounded-3xl' : ''}`}>
            {!darkMode && <div className="neumorph-cta-glow"></div>}
            
            <h2 className={`text-5xl font-bold text-center mb-16 ${theme.title}`}>
              <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
                {darkMode ? 'QUICK ACCESS' : 'TACTICAL ACCESS'}
              </span>
              <span className={`${theme.textSecondary} ${theme.holographicText}`}>
                {darkMode ? ' TERMINAL' : ' COMMAND'}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { to: '/orders', icon: '📋', title: 'My Orders', desc: 'Advanced command management with tactical tracking protocols' },
                { 
                  to: user.accountType === 'business' && user.businessType === 'seller' ? '/inventory' : '/create-order', 
                  icon: user.accountType === 'business' && user.businessType === 'seller' ? '📦' : '➕', 
                  title: user.accountType === 'business' && user.businessType === 'seller' ? 'My Arsenal' : 'Deploy Order', 
                  desc: user.accountType === 'business' && user.businessType === 'seller' ? 'Strategic product deployment system' : 'Launch orders with tactical AI assistance' 
                },
                { to: '/products', icon: '🛒', title: 'Browse Arsenal', desc: 'Explore our tactical equipment ecosystem' },
                { to: '/cart', icon: '🛍️', title: 'Command Cart', desc: 'Strategic cart with intel-based recommendations' }
              ].map((item, index) => (
                <Link key={index} to={item.to} className="group">
                  <div className={`${theme.card} neumorph-elevated`}>
                    <div className={theme.cardGlow}></div>
                    <div className="card-content neumorph-card-content">
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

      {/* ENHANCED SHOPPING SECTION FOR GUESTS with Premium Effects */}
      {!user && (
        <section className={theme.section}>
          <div className={`container mx-auto px-4 ${theme.premiumContainer} ${!darkMode ? 'py-20 rounded-3xl' : ''}`}>
            {!darkMode && <div className="neumorph-cta-glow"></div>}
            
            <h2 className={`text-5xl font-bold text-center mb-16 ${theme.title}`}>
              <span className={`${theme.textAccent} ${theme.titleEmbossed}`}>
                {darkMode ? 'START' : 'BEGIN YOUR'}
              </span>
              <span className={`${theme.textPrimary} ${theme.holographicText}`}>
                {darkMode ? ' SHOPPING' : ' MISSION'}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { to: '/products', icon: '🛒', title: 'Explore Arsenal', desc: 'Discover our tactical-enhanced product catalog with strategic AI intel' },
                { to: '/cart', icon: '🛍️', title: 'Command Cart', desc: 'Experience tactical shopping with predictive battle analytics and precision features' },
                { to: '/guest-dashboard', icon: '👁️', title: 'Recon Mission', desc: 'Preview our platform capabilities with full reconnaissance access and tactical demo features' }
              ].map((item, index) => (
                <Link key={index} to={item.to} className="group">
                  <div className={`${theme.card} neumorph-elevated`}>
                    <div className={theme.cardGlow}></div>
                    <div className="card-content neumorph-card-content">
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

      {/* ENHANCED FEATURES SECTION with Premium Glass */}
      <section className={theme.section}>
        <div className="container mx-auto px-4">
          <h2 className={`text-5xl font-bold text-center mb-4 ${theme.title}`}>
            <span className={`${theme.textSecondary} ${theme.titleEmbossed}`}>
              {user ? (darkMode ? 'PLATFORM' : 'PLATFORM') : (darkMode ? 'WHY CHOOSE' : 'WHY CHOOSE')}
            </span>
            <span className={`${theme.textPrimary} ${theme.holographicText}`}>
              {user ? (darkMode ? ' FEATURES' : ' FEATURES') : (darkMode ? ' US?' : ' US?')}
            </span>
          </h2>
          
          {/* ENHANCED: Premium description container */}
          <div className={`${!darkMode ? 'neumorph-glass-strong p-8 rounded-2xl mb-16' : 'mb-16'}`}>
            <p className={`text-xl text-center max-w-4xl mx-auto ${theme.description}`}>
              {darkMode 
                ? 'Advanced quantum algorithms power your business operations'
                : 'Cutting-edge quantum technology and intuitive neumorphic design converge to revolutionize your business operations with unprecedented efficiency'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', 
                title: 'Tactical Inventory', 
                desc: 'Military-grade tracking systems with advanced reconnaissance, strategic analytics, and battlefield-ready stock deployment',
                color: darkMode ? 'text-cyan-400' : 'text-blue-600'
              },
              { 
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
                title: 'Command Processing', 
                desc: 'Automated warfare protocols with tactical AI optimization, strategic routing, and precision order execution systems',
                color: darkMode ? 'text-green-400' : 'text-green-600'
              },
              { 
                icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
                title: 'Battle Analytics', 
                desc: 'Strategic intelligence powered by advanced combat algorithms, predictive warfare modeling, and real-time tactical operations data',
                color: darkMode ? 'text-purple-400' : 'text-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className={`${theme.featureCard} neon-border`}>
                <div className={`inline-flex mb-6 ${feature.color} neumorph-feature-icon`}>
                  {darkMode && <div className="icon-glow"></div>}
                  {!darkMode && <div className="neumorph-icon-glow"></div>}
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${feature.color} ${!darkMode ? 'neumorph-embossed' : ''}`}>{feature.title}</h3>
                <p className={`text-lg ${theme.description}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENHANCED ROLE-SPECIFIC DASHBOARD INFO with Premium Effects */}
      {user && dashboardInfo && (
        <section className={theme.section}>
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto ${theme.dashboardCard}`}>
              {darkMode ? <div className="dashboard-glow"></div> : <div className="neumorph-dashboard-glow"></div>}
              <div className="md:flex md:items-center md:justify-between relative z-10">
                <div className="md:flex-1">
                  <div className="flex items-center mb-6">
                    <span className={`text-6xl mr-6 ${darkMode ? 'dashboard-icon' : 'neumorph-dashboard-icon'}`}>
                      {dashboardInfo.icon}
                    </span>
                    <div>
                      <h2 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800 neumorph-embossed'} ${theme.title}`}>
                        Your {dashboardInfo.title}
                      </h2>
                      <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600 neumorph-text-shadow'}`}>
                        Access your personalized command center with advanced tactical features and strategic automation systems
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Link to={dashboardInfo.route} className={`${darkMode ? 'cyber-btn cyber-btn-dashboard' : 'neumorph-btn neumorph-btn-dashboard neon-border'} text-lg px-8 py-4`}>
                    <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Access Dashboard</span>
                    {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ENHANCED CTA SECTION with Premium Holographic Effects */}
      <section className={theme.section}>
        <div className="container mx-auto px-4 text-center">
          <div className={`max-w-6xl mx-auto ${theme.ctaCard}`}>
            {darkMode ? <div className="cta-glow"></div> : <div className="neumorph-cta-glow"></div>}
            <div className="relative z-10">
              <h2 className={`text-5xl font-bold mb-8 ${theme.title}`}>
                <span className={`${theme.textPrimary} ${theme.titleEmbossed}`}>
                  {darkMode ? 'READY TO GET' : 'READY TO DEPLOY'}
                </span>
                <br />
                <span className={`${theme.textSecondary} ${theme.holographicText}`}>
                  {darkMode ? 'STARTED?' : 'THE ARSENAL?'}
                </span>
              </h2>
              <p className={`text-xl mb-12 ${theme.description} ${!darkMode ? 'neumorph-text-shadow' : ''}`}>
                {user 
                  ? 'Unlock the full potential of your business with our advanced tactical platform features and AI-powered combat systems'
                  : 'Join thousands of elite commanders already dominating their markets with our revolutionary tactical-enhanced battle platform'
                }
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                {user ? (
                  <>
                    <Link to="/products" className={`${theme.btnPrimary} neon-border`}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Deploy Arsenal</span>
                      {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                    </Link>
                    <Link to="/cart" className={theme.btnSecondary}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>View Command</span>
                      {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products" className={`${theme.btnSuccess} neon-border`}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Explore Platform</span>
                      {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
                    </Link>
                    <Link to="/register" className={`${theme.btnPrimary} neon-border`}>
                      <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>Start Your Journey</span>
                      {darkMode ? <div className="btn-glow"></div> : <div className="neumorph-btn-glow"></div>}
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