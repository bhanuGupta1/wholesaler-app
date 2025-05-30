// src/pages/BusinessDashboard.jsx - Enhanced with Buyer vs Seller differentiation
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import UpgradeToSellerModal from '../components/common/UpgradeToSellerModal';
import { hasPendingUpgrade, getUpgradeStatusMessage } from '../services/businessUpgradeService';

// Simple chart component for business analytics
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
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Seller Features Component (only for sellers)
const SellerFeatures = ({ stats, darkMode }) => (
  <div className="space-y-6">
    {/* Seller Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Products Listed
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
              {stats.totalProducts || 0}
            </p>
          </div>
          <div className={`text-3xl p-3 rounded-full bg-blue-${darkMode ? '900/30' : '100'}`}>
            📦
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Sales This Month
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
              ${stats.monthlySales?.toFixed(0) || '0'}
            </p>
          </div>
          <div className={`text-3xl p-3 rounded-full bg-green-${darkMode ? '900/30' : '100'}`}>
            💰
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Active Orders
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
              {stats.activeOrders || 0}
            </p>
          </div>
          <div className={`text-3xl p-3 rounded-full bg-orange-${darkMode ? '900/30' : '100'}`}>
            📋
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Customer Rating
            </p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
              {stats.rating?.toFixed(1) || '5.0'} ⭐
            </p>
          </div>
          <div className={`text-3xl p-3 rounded-full bg-purple-${darkMode ? '900/30' : '100'}`}>
            ⭐
          </div>
        </div>
      </div>
    </div>

    {/* Seller Actions */}
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border p-6`}>
      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Seller Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/inventory" className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <div className="text-2xl mr-3">📦</div>
          <div>
            <h3 className="font-medium">Manage Inventory</h3>
            <p className="text-sm opacity-90">Add, edit, and track products</p>
          </div>
        </Link>
        
        <Link to="/orders" className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <div className="text-2xl mr-3">📋</div>
          <div>
            <h3 className="font-medium">Process Orders</h3>
            <p className="text-sm opacity-90">Manage incoming orders</p>
          </div>
        </Link>
        
        <button className="flex items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <div className="text-2xl mr-3">📊</div>
          <div>
            <h3 className="font-medium">View Analytics</h3>
            <p className="text-sm opacity-90">Sales performance data</p>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// Buyer Features Component
const BuyerFeatures = ({ stats, darkMode, user, onUpgradeSuccess }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const pendingUpgrade = hasPendingUpgrade(user);
  const upgradeMessage = getUpgradeStatusMessage(user);

  return (
    <>
      <div className="space-y-6">
        {/* Pending Upgrade Status */}
        {pendingUpgrade && (
          <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-xl border p-4`}>
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Upgrade Request Pending
                </h3>
                <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                  {upgradeMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buyer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  Total Orders
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-blue-${darkMode ? '900/30' : '100'}`}>
                🛒
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  Total Spent
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  ${stats.totalSpent?.toFixed(0) || '0'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} mt-1`}>
                  15% bulk discount applied
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-green-${darkMode ? '900/30' : '100'}`}>
                💰
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  Avg Order Value
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  ${stats.avgOrderValue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-purple-${darkMode ? '900/30' : '100'}`}>
                📊
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  Active Subscriptions
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stats.subscriptions || 0}
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-indigo-${darkMode ? '900/30' : '100'}`}>
                🔄
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Actions */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Buyer Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/catalog" className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <div className="text-2xl mr-3">🛒</div>
              <div>
                <h3 className="font-medium">Browse Products</h3>
                <p className="text-sm opacity-90">Find products to purchase</p>
              </div>
            </Link>
            
            <Link to="/orders" className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <h3 className="font-medium">My Orders</h3>
                <p className="text-sm opacity-90">Track order history</p>
              </div>
            </Link>
            
            <Link to="/cart" className="flex items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <div className="text-2xl mr-3">🛍️</div>
              <div>
                <h3 className="font-medium">Shopping Cart</h3>
                <p className="text-sm opacity-90">Review selected items</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upgrade to Seller Prompt */}
        {!pendingUpgrade && (
          <div className={`${darkMode ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-800' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'} rounded-xl border p-6`}>
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🚀</div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-orange-300' : 'text-orange-800'} mb-2`}>
                  Become a Seller & Grow Your Business
                </h3>
                <p className={`${darkMode ? 'text-orange-200' : 'text-orange-700'} mb-4`}>
                  Unlock powerful selling features and start earning revenue by listing your products on our platform.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                    <h4 className={`font-medium ${darkMode ? 'text-orange-300' : 'text-orange-800'} mb-2`}>✨ Seller Benefits</h4>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                      <li>• List unlimited products</li>
                      <li>• Manage inventory in real-time</li>
                      <li>• Process orders efficiently</li>
                      <li>• Access detailed analytics</li>
                    </ul>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                    <h4 className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>🎯 Locked Features</h4>
                    <ul className={`text-sm space-y-1 ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                      <li>🔒 Product Management</li>
                      <li>🔒 Inventory Tracking</li>
                      <li>🔒 Order Processing</li>
                      <li>🔒 Seller Analytics</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Upgrade to Seller Account
                  </button>
                  <button className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'border-orange-600 text-orange-400 hover:bg-orange-900/20' 
                      : 'border-orange-600 text-orange-600 hover:bg-orange-50'
                  }`}>
                    Learn More About Selling
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
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data');
        setLoading(false);
      }
    }

    fetchBusinessData();
  }, [user, isSeller, isBuyer]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isSeller ? 'Seller Dashboard' : 'Buyer Dashboard'}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isSeller 
                ? 'Manage your products, orders, and sales performance'
                : 'Monitor your purchases, orders, and discover new products'
              }
            </p>
          </div>
          
          {/* Business Type Badge */}
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSeller 
                ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
            }`}>
              {isSeller ? '🏪 Seller Account' : '🛒 Buyer Account'}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
            }`}>
              💼 Business User
            </span>
          </div>
        </div>
      </div>

      {/* Render appropriate features based on business type */}
      {isSeller ? (
        <SellerFeatures stats={stats} darkMode={darkMode} />
      ) : (
        <BuyerFeatures 
          stats={stats} 
          darkMode={darkMode} 
          user={user}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;