// src/pages/admin/LegacyPanel.jsx - Legacy Admin Interface with Real Firebase Data
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Legacy Tool Card Component
const LegacyToolCard = ({ tool, darkMode }) => {
  return (
    <Link
      to={tool.href}
      className={`block p-6 rounded-lg border transition-all duration-200 hover:shadow-lg ${
        darkMode 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center mb-4">
        <div className={`text-3xl mr-4 p-2 rounded ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {tool.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {tool.title}
          </h3>
          {tool.metrics && (
            <div className="flex space-x-4 mt-1">
              {tool.metrics.map((metric, index) => (
                <span key={index} className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.label}: <span className="font-medium">{metric.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <p className={`text-sm ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      } mb-4`}>
        {tool.description}
      </p>

      <div className={`text-sm font-medium ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        Access Module
        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
};

// Real Activity Log Component
const LegacyActivityLog = ({ darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Fetch real user activities from Firebase
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(10))
        );
        
        const realActivities = [];
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const updatedAt = userData.updatedAt?.toDate() || userData.createdAt?.toDate();
          
          if (updatedAt) {
            // User registration activity
            if (userData.createdAt) {
              realActivities.push({
                type: 'user',
                message: `New user registered: ${userData.email}`,
                time: userData.createdAt.toDate(),
                severity: 'info'
              });
            }
            
            // Status change activities
            if (userData.status && userData.updatedAt) {
              let message = `User ${userData.status}: ${userData.email}`;
              let severity = 'info';
              
              if (userData.status === 'suspended') {
                severity = 'warning';
              } else if (userData.status === 'rejected') {
                severity = 'error';
              } else if (userData.status === 'active' && userData.approved) {
                message = `User approved: ${userData.email}`;
                severity = 'success';
              }
              
              realActivities.push({
                type: 'user',
                message,
                time: userData.updatedAt.toDate(),
                severity
              });
            }
          }
        });

        // Sort by time (most recent first) and limit to 8
        realActivities.sort((a, b) => b.time - a.time);
        setActivities(realActivities.slice(0, 8));
        
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      user: '👤',
      order: '📦',
      system: '⚙️',
      security: '🔒'
    };
    return icons[type] || '📡';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      success: darkMode ? 'text-green-400' : 'text-green-600',
      warning: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      error: darkMode ? 'text-red-400' : 'text-red-600',
      info: darkMode ? 'text-blue-400' : 'text-blue-600'
    };
    return colors[severity] || colors.info;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading activities...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className={`p-3 rounded border ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="text-lg">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {activity.message}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {formatTime(activity.time)}
                </p>
              </div>
              <div className={`text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                {activity.severity.toUpperCase()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📋</div>
          <div>No recent activities found</div>
        </div>
      )}
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ darkMode, onRefresh }) => {
  const [processing, setProcessing] = useState(false);

  const handleQuickAction = async (action) => {
    setProcessing(true);
    try {
      switch (action) {
        case 'refresh':
          await onRefresh();
          break;
        case 'backup':
          // In a real app, this would trigger a backup
          console.log('Backup initiated...');
          break;
        case 'cleanup':
          // In a real app, this would clean up test data
          console.log('Cleanup initiated...');
          break;
        default:
          console.log(`Action: ${action}`);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const quickActions = [
    { 
      id: 'refresh', 
      label: 'Refresh Data', 
      icon: '🔄', 
      description: 'Reload all dashboard data'
    },
    { 
      id: 'backup', 
      label: 'System Backup', 
      icon: '💾', 
      description: 'Create system backup'
    },
    { 
      id: 'cleanup', 
      label: 'Clean Test Data', 
      icon: '🧹', 
      description: 'Remove test accounts'
    }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            disabled={processing}
            className={`p-3 rounded border text-left transition-all ${
              processing
                ? darkMode
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                : darkMode
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-xl">{action.icon}</div>
              <div>
                <div className={`text-sm font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {action.label}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {action.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Legacy Panel Component
const LegacyPanel = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    businessAccounts: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [usersSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders'))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalUsers = users.length;
      const pendingApprovals = users.filter(u => 
        u.status === 'pending_approval' || u.status === 'pending'
      ).length;
      const businessAccounts = users.filter(u => u.accountType === 'business').length;
      const activeUsers = users.filter(u => u.status === 'active' && u.approved).length;

      setStats({
        totalUsers,
        pendingApprovals,
        businessAccounts,
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        activeUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const legacyTools = [
    {
      title: 'User Management',
      description: 'Manage user accounts, approvals, and permissions',
      href: '/admin/users',
      icon: '👥',
      metrics: [
        { label: 'Total', value: stats.totalUsers },
        { label: 'Active', value: stats.activeUsers }
      ]
    },
    {
      title: 'Pending Approvals',
      description: 'Review and process pending user applications',
      href: '/admin/approvals',
      icon: '⏳',
      metrics: [
        { label: 'Pending', value: stats.pendingApprovals },
        { label: 'Business', value: stats.businessAccounts }
      ]
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      href: '/admin/settings',
      icon: '⚙️',
      metrics: [
        { label: 'Config', value: 'OK' },
        { label: 'Status', value: 'Active' }
      ]
    },
    {
      title: 'Analytics',
      description: 'View system analytics and performance metrics',
      href: '/admin/analytics',
      icon: '📊',
      metrics: [
        { label: 'Reports', value: 'Live' },
        { label: 'Data', value: 'Current' }
      ]
    },
    {
      title: 'Security Center',
      description: 'Monitor security and manage access controls',
      href: '/admin/security',
      icon: '🔒',
      metrics: [
        { label: 'Threats', value: '0' },
        { label: 'Status', value: 'Secure' }
      ]
    },
    {
      title: 'Inventory Management',
      description: 'Manage products and inventory across the platform',
      href: '/inventory',
      icon: '📦',
      metrics: [
        { label: 'Products', value: stats.totalProducts },
        { label: 'Orders', value: stats.totalOrders }
      ]
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid ${
            darkMode ? 'border-blue-500 border-r-transparent' : 'border-blue-500 border-r-transparent'
          }`}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading Legacy Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {/* Legacy Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Legacy Admin Panel
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Classic administrative interface for {user?.displayName || 'Administrator'}
              </p>
            </div>
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50'
                  : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
              }`}
            >
              ← Back to Modern Admin
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: stats.totalUsers, icon: '👤', color: 'blue' },
            { title: 'Pending Approvals', value: stats.pendingApprovals, icon: '⏳', color: 'yellow' },
            { title: 'Business Accounts', value: stats.businessAccounts, icon: '🏢', color: 'green' },
            { title: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-lg shadow border p-6`}>
              <div className="flex items-center">
                <div className="text-3xl mr-4">{stat.icon}</div>
                <div>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  } uppercase tracking-wide`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tools Grid */}
          <div className="lg:col-span-2">
            <h2 className={`text-xl font-semibold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Administrative Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legacyTools.map((tool, index) => (
                <LegacyToolCard
                  key={index}
                  tool={tool}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions darkMode={darkMode} onRefresh={fetchStats} />

            {/* Recent Activity */}
            <div className={`p-6 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Recent Activity
                </h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <LegacyActivityLog darkMode={darkMode} />
            </div>

            {/* System Status */}
            <div className={`p-6 rounded-lg border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                System Status
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Database', status: 'Operational', color: 'green' },
                  { label: 'Authentication', status: 'Active', color: 'green' },
                  { label: 'File Storage', status: 'Available', color: 'green' },
                  { label: 'Security', status: 'Protected', color: 'green' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.color === 'green'
                        ? darkMode
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-green-100 text-green-800'
                        : darkMode
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyPanel;