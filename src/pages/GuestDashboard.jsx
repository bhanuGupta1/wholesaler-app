// src/pages/GuestDashboard.jsx - 🎯 FUNCTIONAL GUEST DASHBOARD with PROPER ACCESS
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get theme prefix
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  const layoutPrefix = darkMode ? 'cyberpunk' : 'neumorph';

  // Guest accessible features with REAL functionality
  const guestFeatures = [
    {
      icon: '🛍️',
      title: darkMode ? 'PRODUCT MATRIX' : 'Browse Products',
      description: darkMode 
        ? 'Explore our complete product database with advanced search protocols and real-time inventory data.'
        : 'Browse our complete product catalog with advanced search and filtering options.',
      action: 'Browse Now',
      link: '/catalog',
      color: darkMode ? 'cyan' : 'blue',
      available: true
    },
    {
      icon: '📱',
      title: darkMode ? 'QR PROTOCOLS' : 'QR Code Tools',
      description: darkMode 
        ? 'Access quantum QR generation and scanning tools for instant product identification and data transfer.'
        : 'Generate and scan QR codes for products, inventory tracking, and quick access tools.',
      action: 'Open QR Tools',
      link: '/qr-tools',
      color: darkMode ? 'purple' : 'indigo',
      available: true
    },
    {
      icon: '🏢',
      title: darkMode ? 'NEURAL CORP INFO' : 'Company Information',
      description: darkMode 
        ? 'Learn about our quantum wholesale network, corporate history, and neural technology stack.'
        : 'Discover our company story, mission, values, and wholesale solutions.',
      action: 'Learn More',
      link: '/about-us',
      color: darkMode ? 'green' : 'teal',
      available: true
    },
    {
      icon: '💬',
      title: darkMode ? 'SUPPORT MATRIX' : 'Help & Support',
      description: darkMode 
        ? 'Access our comprehensive support database and connect with neural support specialists.'
        : 'Get help, browse our knowledge base, and contact our support team.',
      action: 'Get Help',
      link: '/support-center',
      color: darkMode ? 'yellow' : 'orange',
      available: true
    },
    {
      icon: '📊',
      title: darkMode ? 'DEMO NEURAL NET' : 'Platform Demo',
      description: darkMode 
        ? 'Experience a simulated neural interface showcasing our wholesale management capabilities.'
        : 'Try our interactive demo to see platform features and capabilities.',
      action: 'Try Demo',
      link: '/demo',
      color: darkMode ? 'pink' : 'purple',
      available: false, // Demo not yet implemented
      comingSoon: true
    },
    {
      icon: '📋',
      title: darkMode ? 'FEEDBACK LOOP' : 'Feedback & Suggestions',
      description: darkMode 
        ? 'Submit feedback data to help improve our neural network algorithms and user experience.'
        : 'Share your feedback and suggestions to help us improve our platform.',
      action: 'Give Feedback',
      link: '/feedback',
      color: darkMode ? 'indigo' : 'blue',
      available: true
    }
  ];

  // Quick access items for authenticated users
  const quickAccess = [
    {
      title: darkMode ? 'NEURAL ACCESS' : 'Sign In',
      description: darkMode ? 'Login to your neural account' : 'Access your account',
      link: '/login',
      icon: '🔑',
      color: darkMode ? 'cyan' : 'blue'
    },
    {
      title: darkMode ? 'REQUEST ACCESS' : 'Create Account',
      description: darkMode ? 'Request neural network access' : 'Join our platform',
      link: '/register',
      icon: '✨',
      color: darkMode ? 'purple' : 'indigo'
    },
    {
      title: darkMode ? 'GUEST EXPLORATION' : 'Continue as Guest',
      description: darkMode ? 'Explore without neural access' : 'Browse without signing up',
      link: '/catalog',
      icon: '👁️',
      color: darkMode ? 'green' : 'teal'
    }
  ];

  // Popular product categories for quick browsing
  const productCategories = [
    { name: 'Electronics', icon: '📱', count: '2,847 items' },
    { name: 'Home & Garden', icon: '🏠', count: '1,923 items' },
    { name: 'Health & Beauty', icon: '💄', count: '1,456 items' },
    { name: 'Sports & Outdoors', icon: '⚽', count: '987 items' },
    { name: 'Automotive', icon: '🚗', count: '756 items' },
    { name: 'Industrial', icon: '🏭', count: '654 items' }
  ];

  // Recent updates/news
  const recentUpdates = [
    {
      title: darkMode ? 'Neural Network v2.0 Launch' : 'Platform Update 2.0',
      description: darkMode ? 'Enhanced quantum processing capabilities' : 'New features and improvements',
      date: '2024-03-15',
      type: 'update'
    },
    {
      title: darkMode ? 'New QR Protocol Integration' : 'Enhanced QR Tools',
      description: darkMode ? 'Advanced scanning and generation protocols' : 'Improved QR code functionality',
      date: '2024-03-10',
      type: 'feature'
    },
    {
      title: darkMode ? 'Security Matrix Enhanced' : 'Security Updates',
      description: darkMode ? 'Quantum encryption improvements' : 'Enhanced platform security',
      date: '2024-03-05',
      type: 'security'
    }
  ];

  // Auto-slide functionality for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const dashboardPath = user.accountType === 'admin' ? '/admin-dashboard' :
                           user.accountType === 'manager' ? '/manager-dashboard' :
                           user.accountType === 'business' ? '/business-dashboard' :
                           '/user-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/catalog?category=${encodeURIComponent(category.name.toLowerCase())}`);
  };

  return (
    <div className={`${layoutPrefix}-layout-wrapper min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* SECRET INVASION BACKGROUND - Always enabled with reduced intensity */}
      <SecretInvasionBackground 
        intensity={0.4} 
        enableGlitch={darkMode} 
      />

      {/* Theme-specific background effects - SUBTLE */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-2 opacity-10 pointer-events-none">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 pointer-events-none opacity-30">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 opacity-8 pointer-events-none">
            <div className="neumorph-gradient"></div>
          </div>
        </>
      )}

      {/* Enhanced Theme Toggle */}
      <div className="fixed top-6 right-6 z-50 animate-bounceIn">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Enhanced Hero Section with Search */}
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              
              {/* Main Hero Content */}
              <div className="space-y-8 animate-slideInUp">
                <h1 className={`text-5xl md:text-7xl font-bold leading-tight ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'NEURAL WHOLESALE' : 'MEGA WHOLESALE'}
                  <br />
                  <span className={darkMode ? 'text-purple-400' : 'text-indigo-600'}>
                    {darkMode ? 'NETWORK' : 'MARKETPLACE'}
                  </span>
                </h1>
                
                <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode 
                    ? 'Access the quantum-powered wholesale network. Browse products, generate QR codes, and explore our neural marketplace — no registration required.'
                    : 'Explore our intelligent wholesale marketplace. Browse products, use QR tools, and discover smart trading solutions — start immediately.'
                  }
                </p>

                {/* Enhanced Search Bar */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className={`${themePrefix}-card p-2 flex gap-2 transition-all duration-300 hover:scale-105`}>
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={darkMode ? "Search neural product matrix..." : "Search products, categories, or keywords..."}
                      className={`flex-1 px-6 py-4 text-lg font-medium transition-all duration-300 focus:scale-105 ${
                        darkMode 
                          ? 'bg-gray-900 border-2 border-cyan-600 text-cyan-100 focus:border-cyan-400 rounded-lg placeholder-cyan-700' 
                          : 'bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-500 rounded-lg placeholder-gray-500'
                      }`}
                    />
                    <button
                      type="submit"
                      className={`${themePrefix}-btn ${themePrefix}-btn-primary px-8 py-4 group transition-all duration-300 hover:scale-110`}
                    >
                      <svg className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Quick Access Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {quickAccess.map((item, index) => (
                    <Link
                      key={index}
                      to={item.link}
                      className={`${themePrefix}-btn ${themePrefix}-btn-outline group transition-all duration-300 hover:scale-110`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-2xl mr-2 group-hover:scale-125 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <span className="font-bold">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories Section */}
        <section className={`py-16 relative ${
          darkMode ? 'bg-black/50' : 'bg-white/70'
        } backdrop-blur-lg`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              <div className="text-center mb-12 animate-slideInUp">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'PRODUCT CATEGORIES' : 'Browse by Category'}
                </h2>
                <p className={`text-lg ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode ? 'Explore our quantum-organized product matrix' : 'Find products organized by category'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {productCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className={`${themePrefix}-card p-6 text-center group transition-all duration-300 hover:scale-110 animate-slideInUp`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className={`font-bold text-sm mb-1 ${
                      darkMode ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-xs ${
                      darkMode ? 'text-cyan-200' : 'text-gray-600'
                    }`}>
                      {category.count}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guest Features Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              <div className="text-center mb-12 animate-slideInUp">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'AVAILABLE PROTOCOLS' : 'What You Can Access'}
                </h2>
                <p className={`text-lg ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode ? 'All neural protocols available to guest users' : 'Everything available without registration'}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guestFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className={`${themePrefix}-card group transition-all duration-500 hover:scale-105 animate-slideInUp relative ${
                      !feature.available ? 'opacity-60' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                          {feature.icon}
                        </span>
                        {feature.comingSoon && (
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            darkMode ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600' : 'bg-orange-100 text-orange-600 border border-orange-300'
                          }`}>
                            COMING SOON
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-3 ${
                        darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                      } ${hoveredFeature === index ? 'cyber-glow' : ''}`}>
                        {feature.title}
                      </h3>
                      
                      <p className={`mb-6 leading-relaxed ${
                        darkMode ? 'text-cyan-200' : 'text-gray-600'
                      }`}>
                        {feature.description}
                      </p>
                      
                      {feature.available ? (
                        <Link
                          to={feature.link}
                          className={`${themePrefix}-btn ${themePrefix}-btn-primary w-full transition-all duration-300 hover:scale-105`}
                        >
                          <span className="font-bold">{feature.action}</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className={`${themePrefix}-btn w-full opacity-50 cursor-not-allowed ${
                            darkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-500'
                          }`}
                        >
                          <span className="font-bold">Coming Soon</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Updates Section */}
        <section className={`py-16 relative ${
          darkMode ? 'bg-black/50' : 'bg-white/70'
        } backdrop-blur-lg`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              <div className="text-center mb-12 animate-slideInUp">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'NEURAL NETWORK UPDATES' : 'Recent Updates'}
                </h2>
                <p className={`text-lg ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode ? 'Latest enhancements to the neural network' : 'Stay updated with our latest improvements'}
                </p>
              </div>
              
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div 
                    key={index}
                    className={`${themePrefix}-card p-6 group transition-all duration-300 hover:scale-105 animate-slideInUp`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-2 ${
                          darkMode ? 'text-cyan-400' : 'text-blue-600'
                        }`}>
                          {update.title}
                        </h3>
                        <p className={`mb-2 ${
                          darkMode ? 'text-cyan-200' : 'text-gray-600'
                        }`}>
                          {update.description}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(update.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded font-bold ml-4 ${
                        update.type === 'update' ? (darkMode ? 'bg-cyan-900/50 text-cyan-400' : 'bg-blue-100 text-blue-600') :
                        update.type === 'feature' ? (darkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600') :
                        (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600')
                      }`}>
                        {update.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`${themePrefix}-cta-card text-center p-12 transition-all duration-500 hover:scale-105 animate-slideInUp`}>
                {darkMode && <div className="cta-glow"></div>}
                {!darkMode && <div className="neumorph-cta-glow"></div>}
                
                <div className="relative z-10 space-y-6">
                  <div className="text-5xl animate-bounce mb-6">
                    {darkMode ? '🚀' : '✨'}
                  </div>
                  
                  <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                    darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {darkMode ? 'READY FOR FULL NEURAL ACCESS?' : 'Ready for the Full Experience?'}
                  </h2>
                  
                  <p className={`text-lg leading-relaxed mb-6 ${
                    darkMode ? 'text-cyan-200' : 'text-gray-700'
                  }`}>
                    {darkMode 
                      ? 'Unlock advanced neural protocols, personalized dashboards, and premium wholesale management features.'
                      : 'Create an account to unlock personalized dashboards, advanced features, and premium wholesale tools.'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/register" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-primary ${themePrefix}-btn-dashboard group transition-all duration-300 hover:scale-110`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                      <span className="btn-text font-bold text-lg">
                        {darkMode ? 'REQUEST NEURAL ACCESS' : 'Create Free Account'}
                      </span>
                      <svg className="btn-icon ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    
                    <Link 
                      to="/catalog" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-outline group transition-all duration-300 hover:scale-110`}
                    >
                      <span className="btn-text font-bold text-lg">
                        {darkMode ? 'CONTINUE EXPLORATION' : 'Keep Browsing'}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default GuestDashboard;