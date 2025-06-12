// src/pages/BusinessDashboard.jsx - 🎨 COMPLETE THEME INTEGRATION
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import UpgradeToSellerModal from '../components/common/UpgradeToSellerModal';
import { hasPendingUpgrade, getUpgradeStatusMessage } from '../services/businessUpgradeService';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';

// Enhanced SimpleBarChart with Theme Integration
const SimpleBarChart = ({ data, title, description, color, darkMode, themePrefix }) => {
  const max = Math.max(...data.map(item => item.value));
  
  return (
    <div className={`${themePrefix}-card p-6 transition-all duration-300 hover:scale-105 animate-slideInUp`}>
      {darkMode && <div className="card-glow"></div>}
      {!darkMode && <div className="neumorph-card-glow"></div>}
      
      <div className="relative z-10">
        <h3 className={`text-lg font-bold mb-2 ${
          darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
        }`}>
          {title}
        </h3>
        {description && (
          <p className={`text-sm mb-6 ${
            darkMode ? 'text-cyan-200' : 'text-gray-600'
          }`}>
            {description}
          </p>
        )}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className={`text-sm w-20 font-medium ${
                darkMode ? 'text-cyan-300' : 'text-gray-700'
              }`}>
                {item.name}
              </span>
              <div className="flex-1 ml-4">
                <div className={`h-6 rounded-full overflow-hidden ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-6 rounded-full transition-all duration-1000 ${
                      darkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ 
                      width: `${(item.value / max) * 100}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
              <span className={`ml-4 text-sm font-bold ${
                darkMode ? 'text-cyan-400' : 'text-blue-600'
              }`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced SellerFeatures component with complete theme integration
const SellerFeatures = ({ stats, darkMode, themePrefix }) => (
  <div className="space-y-8">
    {/* Enhanced Seller Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          title: darkMode ? 'NEURAL PRODUCTS' : 'Products Listed',
          value: stats.totalProducts || 0,
          icon: '📦',
          color: 'blue',
          delay: '0ms'
        },
        {
          title: darkMode ? 'QUANTUM REVENUE' : 'Sales This Month',
          value: `$${stats.monthlySales?.toFixed(0) || '0'}`,
          icon: '💰',
          color: 'green',
          delay: '100ms'
        },
        {
          title: darkMode ? 'ACTIVE PROTOCOLS' : 'Active Orders',
          value: stats.activeOrders || 0,
          icon: '📋',
          color: 'orange',
          delay: '200ms'
        },
        {
          title: darkMode ? 'NEURAL RATING' : 'Customer Rating',
          value: `${stats.rating?.toFixed(1) || '5.0'} ⭐`,
          icon: '⭐',
          color: 'purple',
          delay: '300ms'
        }
      ].map((metric, index) => (
        <div 
          key={index}
          className={`${themePrefix}-card p-6 group transition-all duration-500 hover:scale-110 animate-slideInUp`}
          style={{ animationDelay: metric.delay }}
        >
          {darkMode && <div className="card-glow"></div>}
          {!darkMode && <div className="neumorph-card-glow"></div>}
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                darkMode ? 'text-cyan-400' : 'text-blue-600'
              }`}>
                {metric.title}
              </p>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-cyan-100 cyber-glow' : 'text-gray-900'
              }`}>
                {metric.value}
              </p>
            </div>
            <div className={`text-5xl p-4 rounded-xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${
              darkMode 
                ? `bg-${metric.color}-900/30 border-2 border-${metric.color}-600` 
                : `bg-${metric.color}-100 border-2 border-${metric.color}-300`
            }`}>
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Enhanced Seller Actions */}
    <div className={`${themePrefix}-card p-8 transition-all duration-500 hover:scale-[1.02] animate-slideInUp`} style={{ animationDelay: '400ms' }}>
      {darkMode && <div className="card-glow"></div>}
      {!darkMode && <div className="neumorph-card-glow"></div>}
      
      <div className="relative z-10">
        <h2 className={`text-2xl font-bold mb-6 ${
          darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
        }`}>
          {darkMode ? 'SELLER COMMAND CENTER' : 'Seller Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              to: '/inventory',
              icon: '📦',
              title: darkMode ? 'INVENTORY MATRIX' : 'Manage Inventory',
              description: darkMode ? 'Neural product database' : 'View and edit products',
              color: 'blue',
              delay: '100ms'
            },
            {
              to: '/add-product',
              icon: '➕',
              title: darkMode ? 'ADD TO MATRIX' : 'Add Product',
              description: darkMode ? 'Deploy new products' : 'List new products',
              color: 'indigo',
              delay: '200ms'
            },
            {
              to: '/orders',
              icon: '📋',
              title: darkMode ? 'ORDER PROTOCOLS' : 'Process Orders',
              description: darkMode ? 'Manage neural orders' : 'Manage incoming orders',
              color: 'green',
              delay: '300ms'
            },
            {
              to: '#',
              icon: '📊',
              title: darkMode ? 'QUANTUM ANALYTICS' : 'View Analytics',
              description: darkMode ? 'Neural performance data' : 'Sales performance data',
              color: 'purple',
              delay: '400ms'
            }
          ].map((action, index) => (
            <Link 
              key={index}
              to={action.to} 
              className={`${themePrefix}-btn ${themePrefix}-btn-${action.color} group p-6 transition-all duration-500 hover:scale-110 hover:rotate-2 animate-slideInUp text-center block`}
              style={{ animationDelay: action.delay }}
            >
              {darkMode && <div className="btn-glow"></div>}
              {!darkMode && <div className="neumorph-btn-glow"></div>}
              
              <div className="relative z-10">
                <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                  {action.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced BuyerFeatures Component with complete theme integration
const BuyerFeatures = ({ stats, darkMode, themePrefix, user, onUpgradeSuccess }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const pendingUpgrade = hasPendingUpgrade(user);
  const upgradeMessage = getUpgradeStatusMessage(user);

  return (
    <>
      <div className="space-y-8">
        {/* Enhanced Pending Upgrade Status */}
        {pendingUpgrade && (
          <div className={`${themePrefix}-card p-6 animate-pulse-slow animate-slideInUp`}>
            {darkMode && <div className="card-glow"></div>}
            {!darkMode && <div className="neumorph-card-glow"></div>}
            
            <div className="flex items-center relative z-10">
              <div className="text-4xl mr-4 animate-spin">⏳</div>
              <div>
                <h3 className={`font-bold text-lg mb-2 ${
                  darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-800'
                }`}>
                  {darkMode ? 'UPGRADE PROTOCOL PENDING' : 'Upgrade Request Pending'}
                </h3>
                <p className={`${
                  darkMode ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  {upgradeMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Buyer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: darkMode ? 'TOTAL ACQUISITIONS' : 'Total Orders',
              value: stats.totalOrders || 0,
              icon: '🛒',
              color: 'blue',
              delay: '0ms'
            },
            {
              title: darkMode ? 'CREDITS SPENT' : 'Total Spent',
              value: `$${stats.totalSpent?.toFixed(0) || '0'}`,
              subtitle: darkMode ? '15% neural discount active' : '15% bulk discount applied',
              icon: '💰',
              color: 'green',
              delay: '100ms'
            },
            {
              title: darkMode ? 'AVG TRANSACTION' : 'Avg Order Value',
              value: `$${stats.avgOrderValue?.toFixed(2) || '0.00'}`,
              icon: '📊',
              color: 'purple',
              delay: '200ms'
            },
            {
              title: darkMode ? 'ACTIVE STREAMS' : 'Active Subscriptions',
              value: stats.subscriptions || 0,
              icon: '🔄',
              color: 'indigo',
              delay: '300ms'
            }
          ].map((metric, index) => (
            <div 
              key={index}
              className={`${themePrefix}-card p-6 group transition-all duration-500 hover:scale-110 animate-slideInUp`}
              style={{ animationDelay: metric.delay }}
            >
              {darkMode && <div className="card-glow"></div>}
              {!darkMode && <div className="neumorph-card-glow"></div>}
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                    darkMode ? 'text-cyan-400' : 'text-blue-600'
                  }`}>
                    {metric.title}
                  </p>
                  <p className={`text-3xl font-bold mb-1 ${
                    darkMode ? 'text-cyan-100 cyber-glow' : 'text-gray-900'
                  }`}>
                    {metric.value}
                  </p>
                  {metric.subtitle && (
                    <p className={`text-sm ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {metric.subtitle}
                    </p>
                  )}
                </div>
                <div className={`text-5xl p-4 rounded-xl transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${
                  darkMode 
                    ? `bg-${metric.color}-900/30 border-2 border-${metric.color}-600` 
                    : `bg-${metric.color}-100 border-2 border-${metric.color}-300`
                }`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Buyer Actions */}
        <div className={`${themePrefix}-card p-8 transition-all duration-500 hover:scale-[1.02] animate-slideInUp`} style={{ animationDelay: '400ms' }}>
          {darkMode && <div className="card-glow"></div>}
          {!darkMode && <div className="neumorph-card-glow"></div>}
          
          <div className="relative z-10">
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
            }`}>
              {darkMode ? 'BUYER COMMAND CENTER' : 'Buyer Actions'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  to: '/catalog',
                  icon: '🛒',
                  title: darkMode ? 'BROWSE MATRIX' : 'Browse Products',
                  description: darkMode ? 'Explore neural catalog' : 'Find products to purchase',
                  color: 'blue',
                  delay: '100ms'
                },
                {
                  to: '/orders',
                  icon: '📋',
                  title: darkMode ? 'ORDER HISTORY' : 'My Orders',
                  description: darkMode ? 'Track neural orders' : 'Track order history',
                  color: 'green',
                  delay: '200ms'
                },
                {
                  to: '/cart',
                  icon: '🛍️',
                  title: darkMode ? 'CART MATRIX' : 'Shopping Cart',
                  description: darkMode ? 'Review neural selections' : 'Review selected items',
                  color: 'purple',
                  delay: '300ms'
                }
              ].map((action, index) => (
                <Link 
                  key={index}
                  to={action.to} 
                  className={`${themePrefix}-btn ${themePrefix}-btn-${action.color} group p-6 transition-all duration-500 hover:scale-110 hover:rotate-2 animate-slideInUp text-center block`}
                  style={{ animationDelay: action.delay }}
                >
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                  
                  <div className="relative z-10">
                    <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Upgrade to Seller Prompt */}
        {!pendingUpgrade && (
          <div className={`${themePrefix}-cta-card p-8 transition-all duration-500 hover:scale-[1.02] animate-slideInUp`} style={{ animationDelay: '500ms' }}>
            {darkMode && <div className="cta-glow"></div>}
            {!darkMode && <div className="neumorph-cta-glow"></div>}
            
            <div className="flex items-start space-x-6 relative z-10">
              <div className="text-6xl animate-bounce">🚀</div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'UNLOCK SELLER PROTOCOLS' : 'Become a Seller & Grow Your Business'}
                </h3>
                <p className={`text-lg mb-6 ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode 
                    ? 'Activate advanced selling protocols and start generating revenue through our neural marketplace.'
                    : 'Unlock powerful selling features and start earning revenue by listing your products on our platform.'
                  }
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={`${themePrefix}-card p-6`}>
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="relative z-10">
                      <h4 className={`font-bold text-lg mb-4 ${
                        darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'
                      }`}>
                        ✨ {darkMode ? 'SELLER PROTOCOLS' : 'Seller Benefits'}
                      </h4>
                      <ul className={`space-y-2 ${
                        darkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">•</span>
                          {darkMode ? 'Deploy unlimited neural products' : 'List unlimited products'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">•</span>
                          {darkMode ? 'Real-time inventory matrix' : 'Manage inventory in real-time'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">•</span>
                          {darkMode ? 'Advanced order processing' : 'Process orders efficiently'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">•</span>
                          {darkMode ? 'Quantum analytics dashboard' : 'Access detailed analytics'}
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className={`${themePrefix}-card p-6`}>
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="relative z-10">
                      <h4 className={`font-bold text-lg mb-4 ${
                        darkMode ? 'text-red-400 cyber-glow' : 'text-red-600'
                      }`}>
                        🎯 {darkMode ? 'LOCKED PROTOCOLS' : 'Locked Features'}
                      </h4>
                      <ul className={`space-y-2 ${
                        darkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">🔒</span>
                          {darkMode ? 'Neural Product Management' : 'Product Management'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">🔒</span>
                          {darkMode ? 'Quantum Inventory Tracking' : 'Inventory Tracking'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">🔒</span>
                          {darkMode ? 'Advanced Order Processing' : 'Order Processing'}
                        </li>
                        <li className="flex items-center">
                          <span className="text-red-500 mr-2">🔒</span>
                          {darkMode ? 'Neural Seller Analytics' : 'Seller Analytics'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className={`${themePrefix}-btn ${themePrefix}-btn-primary ${themePrefix}-btn-dashboard group transition-all duration-300 hover:scale-110`}
                  >
                    {darkMode && <div className="btn-glow"></div>}
                    {!darkMode && <div className="neumorph-btn-glow"></div>}
                    
                    <svg className="btn-icon mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="btn-text font-bold">
                      {darkMode ? 'ACTIVATE SELLER PROTOCOLS' : 'Upgrade to Seller Account'}
                    </span>
                  </button>
                  
                  <button className={`${themePrefix}-btn ${themePrefix}-btn-outline group transition-all duration-300 hover:scale-110`}>
                    <svg className="btn-icon mr-3 group-hover:bounce transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="btn-text font-bold">
                      {darkMode ? 'LEARN NEURAL SELLING' : 'Learn More About Selling'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeToSellerModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={onUpgradeSuccess}
      />
    </>
  )
};

const BusinessDashboard = () => {
  const { darkMode } = useTheme();
  const { user, refreshUserData } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyGrowth: 0,
    avgOrderValue: 0,
    completionRate: 0,
    monthlySales: 0,
    activeOrders: 0,
    rating: 4.8,
    totalSpent: 0,
    subscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Get theme prefixes
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  const layoutPrefix = darkMode ? 'cyberpunk' : 'neumorph';

  // Determine if user is seller or buyer
  const isSeller = user?.businessType === 'seller';
  const isBuyer = user?.businessType === 'buyer';

  // Handle successful upgrade request
  const handleUpgradeSuccess = async () => {
    // Refresh user data to show the pending status
    if (refreshUserData) {
      await refreshUserData();
    }
    // Show success message or notification here if needed
  };

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        setLoading(true);
        
        // Fetch orders for revenue calculation
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            total: data.total || 0,
            status: data.status || 'pending',
            customerName: data.customerName || 'Unknown',
            createdAt: data.createdAt?.toDate() || new Date(),
            userId: data.userId
          };
        });

        // Fetch products for catalog analysis
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const totalProducts = productsSnapshot.size;

        // Calculate different metrics based on user type
        let businessStats;
        
        if (isSeller) {
          // Seller-specific metrics
          const sellerOrders = allOrders.filter(order => order.userId === user.uid);
          const monthlySales = sellerOrders
            .filter(order => order.createdAt.getMonth() === new Date().getMonth())
            .reduce((sum, order) => sum + order.total, 0);
          
          businessStats = {
            totalProducts,
            monthlySales,
            activeOrders: sellerOrders.filter(order => order.status === 'processing').length,
            rating: 4.8,
            totalRevenue: sellerOrders.reduce((sum, order) => sum + order.total, 0),
            totalOrders: sellerOrders.length
          };
        } else {
          // Buyer-specific metrics
          const buyerOrders = allOrders.filter(order => order.userId === user.uid);
          const totalSpent = buyerOrders.reduce((sum, order) => sum + order.total, 0);
          const avgOrderValue = buyerOrders.length > 0 ? totalSpent / buyerOrders.length : 0;
          
          businessStats = {
            totalOrders: buyerOrders.length,
            totalSpent,
            avgOrderValue,
            subscriptions: 2, // Mock data
            monthlyGrowth: 12.5
          };
        }

        setStats(businessStats);
        setLoading(false);
        setIsVisible(true);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data');
        setLoading(false);
      }
    }

    fetchBusinessData();
  }, [user, isSeller, isBuyer]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className={`${layoutPrefix}-layout-wrapper min-h-screen`}>
        <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />
        
        {/* Theme-specific background effects */}
        {darkMode ? (
          <>
            <div className="fixed inset-0 z-2 opacity-10 pointer-events-none">
              <div className="cyberpunk-grid"></div>
            </div>
            <div className="fixed inset-0 z-3 pointer-events-none opacity-20">
              <div className="scanlines"></div>
            </div>
          </>
        ) : (
          <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
        )}
        
        <div className="flex justify-center items-center h-screen relative z-10">
          <div className={`text-center`}>
            <div className={`${themePrefix}-loading-spinner mb-6`}></div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
            }`}>
              {darkMode ? 'LOADING NEURAL DASHBOARD...' : 'Loading Dashboard...'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className={`${layoutPrefix}-layout-wrapper min-h-screen`}>
        <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className={`${themePrefix}-card p-8 max-w-md mx-auto text-center animate-shake`}>
            {darkMode && <div className="card-glow"></div>}
            {!darkMode && <div className="neumorph-card-glow"></div>}
            
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'cyber-title text-red-400' : 'neumorph-title text-red-600'
            }`}>
              {darkMode ? 'NEURAL NETWORK ERROR' : 'Dashboard Error'}
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className={`${themePrefix}-btn ${themePrefix}-btn-red`}
            >
              <span className="font-bold">{darkMode ? 'RETRY CONNECTION' : 'Retry Loading'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${layoutPrefix}-layout-wrapper min-h-screen transition-all duration-1000 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* SECRET INVASION BACKGROUND */}
      <SecretInvasionBackground 
        intensity={0.5} 
        enableGlitch={darkMode} 
      />

      {/* Theme-specific background effects */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-2 opacity-10 pointer-events-none">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 pointer-events-none opacity-20">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12 animate-slideInUp">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
              }`}>
                {isSeller 
                  ? darkMode ? 'SELLER NEURAL COMMAND' : 'Seller Dashboard'
                  : darkMode ? 'BUYER NEURAL INTERFACE' : 'Buyer Dashboard'
                }
              </h1>
              <p className={`text-xl ${
                darkMode ? 'text-cyan-200' : 'text-gray-600'
              }`}>
                {isSeller 
                  ? darkMode 
                    ? 'Neural command center for product management and quantum sales analytics'
                    : 'Manage your products, orders, and sales performance'
                  : darkMode 
                    ? 'Neural interface for monitoring acquisitions and discovering new products'
                    : 'Monitor your purchases, orders, and discover new products'
                }
              </p>
            </div>
            
            {/* Enhanced Business Type Badges */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`${themePrefix}-card px-6 py-3 transition-all duration-300 hover:scale-110`}>
                {darkMode && <div className="card-glow"></div>}
                {!darkMode && <div className="neumorph-card-glow"></div>}
                
                <div className="flex items-center relative z-10">
                  <span className="text-2xl mr-3">
                    {isSeller ? '🏪' : '🛒'}
                  </span>
                  <span className={`font-bold ${
                    isSeller 
                      ? darkMode ? 'text-green-400' : 'text-green-600'
                      : darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {isSeller 
                      ? darkMode ? 'SELLER PROTOCOL' : 'Seller Account'
                      : darkMode ? 'BUYER PROTOCOL' : 'Buyer Account'
                    }
                  </span>
                </div>
              </div>
              
              <div className={`${themePrefix}-card px-6 py-3 transition-all duration-300 hover:scale-110`}>
                {darkMode && <div className="card-glow"></div>}
                {!darkMode && <div className="neumorph-card-glow"></div>}
                
                <div className="flex items-center relative z-10">
                  <span className="text-2xl mr-3">💼</span>
                  <span className={`font-bold ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {darkMode ? 'BUSINESS ENTITY' : 'Business User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Render appropriate features based on business type */}
        {isSeller ? (
          <SellerFeatures stats={stats} darkMode={darkMode} themePrefix={themePrefix} />
        ) : (
          <BuyerFeatures 
            stats={stats} 
            darkMode={darkMode} 
            themePrefix={themePrefix}
            user={user}
            onUpgradeSuccess={handleUpgradeSuccess}
          />
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BusinessDashboard;