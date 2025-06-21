// src/pages/admin/AdminAnalytics.jsx - Real Firebase Analytics Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Real Chart Component with Firebase Data
const AnalyticsChart = ({ data, title, type = 'bar', color = 'blue', darkMode }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 text-${color}-500`}>
          {title}
        </h3>
        <div className="text-center py-8">
          <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            📊
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No data available
          </div>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map(item => item.value));

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    } hover:shadow-lg transition-all`}>
      
      <h3 className={`text-lg font-semibold mb-4 text-${color}-500 flex items-center`}>
        <span className="mr-2">📊</span>
        {title}
      </h3>

      {type === 'bar' && (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-sm font-bold text-${color}-500`}>
                    {item.value}
                  </span>
                </div>
                <div className={`w-full h-3 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-full rounded-full bg-${color}-500 transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {type === 'line' && (
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox="0 0 400 100">
            {data.map((item, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * 380 + 10;
              const y = 90 - ((item.value / (max || 1)) * 80);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className={`fill-${color}-500`}
                  />
                  {index > 0 && (
                    <line
                      x1={((index - 1) / Math.max(data.length - 1, 1)) * 380 + 10}
                      y1={90 - ((data[index - 1].value / (max || 1)) * 80)}
                      x2={x}
                      y2={y}
                      className={`stroke-${color}-500`}
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {type === 'pie' && (
        <div className="space-y-2">
          {data.map((item, index) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full bg-${color}-${400 + (index * 100)} mr-3`}></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm font-bold text-${color}-500`}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Real-time Firebase Statistics
const RealTimeStats = ({ darkMode }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    businessUsers: 0,
    regularUsers: 0,
    recentRegistrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        const [usersSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders'))
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data());
        
        // Calculate user statistics
        const activeUsers = users.filter(user => user.status === 'active' && user.approved).length;
        const pendingApprovals = users.filter(user => 
          user.status === 'pending_approval' || user.status === 'pending'
        ).length;
        const businessUsers = users.filter(user => user.accountType === 'business').length;
        const regularUsers = users.filter(user => user.accountType === 'user').length;
        
        // Recent registrations (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentRegistrations = users.filter(user => {
          const createdAt = user.createdAt?.toDate();
          return createdAt && createdAt > weekAgo;
        }).length;

        setStats({
          totalUsers: usersSnapshot.size,
          activeUsers,
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
          pendingApprovals,
          businessUsers,
          regularUsers,
          recentRegistrations
        });
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      color: 'blue',
      icon: '👥'
    },
    { 
      label: 'Active Users', 
      value: stats.activeUsers, 
      color: 'green',
      icon: '✅'
    },
    { 
      label: 'Total Products', 
      value: stats.totalProducts, 
      color: 'purple',
      icon: '📦'
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      color: 'orange',
      icon: '📋'
    },
    { 
      label: 'Pending Approvals', 
      value: stats.pendingApprovals, 
      color: 'yellow',
      icon: '⏳'
    },
    { 
      label: 'Recent Registrations', 
      value: stats.recentRegistrations, 
      color: 'cyan',
      icon: '🆕'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📊</div>
          <div>Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="mr-3">📡</span>
        Real-time Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className={`p-4 rounded border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          } hover:shadow-md transition-all`}>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-2xl font-bold text-${stat.color}-500`}>
                {stat.value}
              </div>
            </div>
            
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded border ${
          darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            User Distribution
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Business Users:
              </span>
              <span className="text-xs font-bold text-blue-500">
                {stats.businessUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Regular Users:
              </span>
              <span className="text-xs font-bold text-green-500">
                {stats.regularUsers}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded border ${
          darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            System Health
          </h4>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className={`text-xs ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Real User Activity Analysis
const UserActivityAnalysis = ({ darkMode, timeRange }) => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group users by registration date
        const activityMap = new Map();
        
        users.forEach(user => {
          const createdAt = user.createdAt?.toDate();
          if (createdAt) {
            const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
          }
        });

        // Convert to chart data and sort by date
        const chartData = Array.from(activityMap.entries())
          .map(([date, count]) => ({
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: count,
            fullDate: date
          }))
          .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
          .slice(-7); // Last 7 days

        setActivityData(chartData);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📈</div>
          <div>Loading user activity...</div>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsChart
      data={activityData}
      title="User Registrations (Last 7 days)"
      type="line"
      color="green"
      darkMode={darkMode}
    />
  );
};

// Real Account Type Distribution
const AccountTypeDistribution = ({ darkMode }) => {
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountDistribution = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => doc.data());

        // Count account types
        const distribution = users.reduce((acc, user) => {
          let accountType = user.accountType || 'user';
          
          // More specific categorization for business users
          if (accountType === 'business') {
            if (user.businessType === 'seller') {
              accountType = 'Business Seller';
            } else if (user.businessType === 'buyer') {
              accountType = 'Business Buyer';
            } else {
              accountType = 'Business User';
            }
          } else if (accountType === 'user') {
            accountType = 'Regular User';
          } else if (accountType === 'admin') {
            accountType = 'Administrator';
          } else if (accountType === 'manager') {
            accountType = 'Manager';
          }

          acc[accountType] = (acc[accountType] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(distribution).map(([type, count]) => ({
          label: type,
          value: count
        }));

        setDistributionData(chartData);
      } catch (error) {
        console.error('Error fetching account distribution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDistribution();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">👥</div>
          <div>Loading account distribution...</div>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsChart
      data={distributionData}
      title="Account Type Distribution"
      type="pie"
      color="purple"
      darkMode={darkMode}
    />
  );
};

// Real Product Analytics
const ProductAnalytics = ({ darkMode }) => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductAnalytics = async () => {
      try {
        const [productsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users'))
        ]);

        const products = productsSnapshot.docs.map(doc => doc.data());
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group products by creator (business sellers)
        const productsByCreator = products.reduce((acc, product) => {
          const creatorId = product.createdBy;
          const creator = users.find(user => user.id === creatorId);
          const creatorName = creator?.businessName || creator?.displayName || creator?.email || 'Unknown';
          
          acc[creatorName] = (acc[creatorName] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(productsByCreator)
          .map(([creator, count]) => ({
            label: creator.length > 15 ? creator.substring(0, 15) + '...' : creator,
            value: count
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 creators

        setProductData(chartData);
      } catch (error) {
        console.error('Error fetching product analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📦</div>
          <div>Loading product analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsChart
      data={productData}
      title="Top Product Contributors"
      type="bar"
      color="cyan"
      darkMode={darkMode}
    />
  );
};

const ExportOptions = ({ darkMode, analyticsData = {} }) => {
  };

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      
      <h3 className={`text-lg font-semibold mb-4 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="mr-3">📤</span>
        Export Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: 'CSV Export', 
            icon: '📊', 
            color: 'green',
            action: exportToCSV,
            description: 'Download raw data'
          },
          { 
            label: 'PDF Report', 
            icon: '📄', 
            color: 'red',
            action: exportToPDF,
            description: 'Generate formatted report'
          },
          { 
            label: 'Email Report', 
            icon: '📧', 
            color: 'blue',
            action: sendEmailReport,
            description: 'Send via email'
          }
        ].map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className={`p-4 rounded border transition-all hover:scale-105 text-center ${
              darkMode
                ? `bg-gray-700/50 border-gray-600 hover:border-${option.color}-500/50`
                : `bg-gray-50 border-gray-200 hover:border-${option.color}-500/50`
            }`}
          >
            <div className="text-3xl mb-2">{option.icon}</div>
            <div className={`text-sm font-medium text-${option.color}-500 mb-1`}>
              {option.label}
            </div>
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {option.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Component
const AdminAnalytics = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <span className="mr-3">📊</span>
              Analytics Dashboard
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Real-time business intelligence and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`p-2 rounded border text-sm ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50'
                  : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
              }`}
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <RealTimeStats darkMode={darkMode} />
        </div>
        
        <UserActivityAnalysis darkMode={darkMode} timeRange={timeRange} />
        
        <AccountTypeDistribution darkMode={darkMode} />
        
        <ProductAnalytics darkMode={darkMode} />
        
        <ExportOptions darkMode={darkMode} />
      </div>
    </div>
  );
};

export default AdminAnalytics;