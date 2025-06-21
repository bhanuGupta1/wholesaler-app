// src/pages/admin/AdminSettings.jsx - Real Firebase Admin Settings
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// System Configuration Component
const SystemConfig = ({ config, onUpdate, darkMode }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await onUpdate(localConfig);
    } finally {
      setSaving(false);
    }
  };

  const configSections = [
    {
      title: 'Security Settings',
      icon: '🔒',
      color: 'red',
      settings: [
        {
          key: 'requireEmailVerification',
          label: 'Require Email Verification',
          type: 'boolean',
          description: 'Users must verify email before account activation'
        },
        {
          key: 'sessionTimeout',
          label: 'Session Timeout (minutes)',
          type: 'number',
          description: 'Automatic logout after inactivity',
          min: 15,
          max: 1440
        },
        {
          key: 'maxLoginAttempts',
          label: 'Max Login Attempts',
          type: 'number',
          description: 'Maximum failed login attempts before lockout',
          min: 3,
          max: 10
        }
      ]
    },
    {
      title: 'User Management',
      icon: '👥',
      color: 'blue',
      settings: [
        {
          key: 'autoApproveUsers',
          label: 'Auto-approve New Users',
          type: 'boolean',
          description: 'Automatically approve new user registrations'
        },
        {
          key: 'allowGuestAccess',
          label: 'Allow Guest Access',
          type: 'boolean',
          description: 'Allow browsing without account registration'
        },
        {
          key: 'defaultUserRole',
          label: 'Default User Role',
          type: 'select',
          description: 'Default role assigned to new users',
          options: [
            { value: 'user', label: 'Regular User' },
            { value: 'business', label: 'Business User' }
          ]
        }
      ]
    },
    {
      title: 'Business Settings',
      icon: '🏢',
      color: 'green',
      settings: [
        {
          key: 'requireBusinessVerification',
          label: 'Require Business Verification',
          type: 'boolean',
          description: 'Business accounts need document verification'
        },
        {
          key: 'minOrderAmount',
          label: 'Minimum Order Amount ($)',
          type: 'number',
          description: 'Minimum order value for processing',
          min: 0,
          max: 1000
        },
        {
          key: 'allowBackorders',
          label: 'Allow Backorders',
          type: 'boolean',
          description: 'Allow orders when items are out of stock'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: '📢',
      color: 'purple',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          type: 'boolean',
          description: 'Send email notifications for system events'
        },
        {
          key: 'lowStockAlert',
          label: 'Low Stock Alert Threshold',
          type: 'number',
          description: 'Alert when inventory falls below this number',
          min: 0,
          max: 100
        },
        {
          key: 'orderNotifications',
          label: 'Order Notifications',
          type: 'boolean',
          description: 'Notify admins of new orders'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {configSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={`p-6 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          
          <h3 className={`text-lg font-semibold mb-4 text-${section.color}-500 flex items-center`}>
            <span className="mr-3">{section.icon}</span>
            {section.title}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {section.settings.map((setting, settingIndex) => (
              <div key={settingIndex} className={`p-4 rounded border ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {setting.label}
                </label>
                
                <div className="mb-2">
                  {setting.type === 'boolean' ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig[setting.key] || false}
                        onChange={(e) => handleConfigChange(setting.key, e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-all ${
                        localConfig[setting.key]
                          ? `bg-${section.color}-500`
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${
                          localConfig[setting.key] ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`}></div>
                      </div>
                      <span className={`ml-3 text-sm ${
                        localConfig[setting.key] 
                          ? `text-${section.color}-500` 
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {localConfig[setting.key] ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  ) : setting.type === 'select' ? (
                    <select
                      value={localConfig[setting.key] || setting.options[0].value}
                      onChange={(e) => handleConfigChange(setting.key, e.target.value)}
                      className={`w-full p-2 rounded border ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {setting.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={localConfig[setting.key] || setting.min || 0}
                      onChange={(e) => handleConfigChange(setting.key, parseInt(e.target.value))}
                      min={setting.min}
                      max={setting.max}
                      className={`w-full p-2 rounded border ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  )}
                </div>
                
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {setting.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={saving}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            saving
              ? darkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : darkMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

// Database Management Component with Real Firebase Data
const DatabaseManager = ({ darkMode }) => {
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    lastUpdated: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch real database statistics
  const fetchDbStats = async () => {
    setIsRefreshing(true);
    try {
      const [usersSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders'))
      ]);

      // Count pending approvals
      const pendingUsers = usersSnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.status === 'pending_approval' || userData.status === 'pending';
      });

      setDbStats({
        totalUsers: usersSnapshot.size,
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        pendingApprovals: pendingUsers.length,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error fetching database stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Clear test data (be careful with this!)
  const clearTestData = async () => {
    if (!window.confirm('Are you sure you want to clear test data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      const batch = writeBatch(db);
      
      // Get test users (users with test emails)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const testUsers = usersSnapshot.docs.filter(doc => {
        const email = doc.data().email || '';
        return email.includes('test') || email.includes('demo') || email.includes('example');
      });

      // Delete test users
      testUsers.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      await fetchDbStats(); // Refresh stats
    } catch (error) {
      console.error('Error clearing test data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchDbStats();
  }, []);

  const dbActions = [
    {
      title: 'Refresh Statistics',
      description: 'Update database statistics',
      action: fetchDbStats,
      loading: isRefreshing,
      color: 'blue',
      icon: '🔄'
    },
    {
      title: 'Clear Test Data',
      description: 'Remove test users and demo data',
      action: clearTestData,
      loading: isClearing,
      color: 'red',
      icon: '🧹'
    }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="mr-3">🗄️</span>
        Database Management
      </h3>

      {/* Real Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: dbStats.totalUsers, color: 'blue', icon: '👥' },
          { label: 'Total Products', value: dbStats.totalProducts, color: 'green', icon: '📦' },
          { label: 'Total Orders', value: dbStats.totalOrders, color: 'purple', icon: '📋' },
          { label: 'Pending Approvals', value: dbStats.pendingApprovals, color: 'yellow', icon: '⏳' }
        ].map((stat, index) => (
          <div key={index} className={`p-4 rounded border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          } text-center`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold text-${stat.color}-500 mb-1`}>
              {stat.value}
            </div>
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      {dbStats.lastUpdated && (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Last updated: {dbStats.lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Database Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={action.loading}
            className={`p-4 rounded border text-left transition-all ${
              action.loading
                ? darkMode
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                : darkMode
                  ? `bg-gray-700/50 border-gray-600 hover:border-${action.color}-500/50 hover:bg-gray-700`
                  : `bg-gray-50 border-gray-200 hover:border-${action.color}-500/50 hover:bg-gray-100`
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-3">{action.icon}</span>
              <span className={`text-sm font-medium ${
                action.loading 
                  ? darkMode ? 'text-gray-400' : 'text-gray-500'
                  : `text-${action.color}-500`
              }`}>
                {action.loading ? 'Processing...' : action.title}
              </span>
            </div>
            <p className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// System Logs Component with Real Firebase Data
const SystemLogs = ({ darkMode }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Fetch recent user activities as logs
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(10))
        );
        
        const recentLogs = usersSnapshot.docs.map(doc => {
          const userData = doc.data();
          const updatedAt = userData.updatedAt?.toDate() || userData.createdAt?.toDate() || new Date();
          
          return {
            timestamp: updatedAt,
            level: userData.status === 'rejected' ? 'ERROR' : 'INFO',
            message: `User ${userData.status || 'updated'}: ${userData.email}`,
            details: `Account type: ${userData.accountType || 'user'}`
          };
        });

        setLogs(recentLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLogs([{
          timestamp: new Date(),
          level: 'ERROR',
          message: 'Failed to fetch system logs',
          details: error.message
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📋</div>
          <div>Loading system logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="mr-3">📋</span>
        System Logs
      </h3>
      
      <div className={`p-4 rounded border font-mono text-sm ${
        darkMode 
          ? 'bg-gray-900 border-gray-600 text-green-400' 
          : 'bg-black border-gray-300 text-green-500'
      } max-h-96 overflow-y-auto`}>
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-start space-x-2">
                <span className="text-gray-500">
                  [{log.timestamp.toLocaleString()}]
                </span>
                <span className={`${
                  log.level === 'ERROR' ? 'text-red-400' : 
                  log.level === 'WARN' ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {log.level}:
                </span>
                <span>{log.message}</span>
              </div>
              {log.details && (
                <div className="text-gray-500 ml-4 text-xs">
                  {log.details}
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">No recent system activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Admin Settings Component
const AdminSettings = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('system');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configRef = doc(db, 'system', 'config');
        const configDoc = await getDoc(configRef);
        
        if (configDoc.exists()) {
          setConfig(configDoc.data());
        } else {
          // Set default config
          const defaultConfig = {
            requireEmailVerification: true,
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            autoApproveUsers: false,
            allowGuestAccess: true,
            defaultUserRole: 'user',
            requireBusinessVerification: true,
            minOrderAmount: 50,
            allowBackorders: true,
            emailNotifications: true,
            lowStockAlert: 10,
            orderNotifications: true
          };
          setConfig(defaultConfig);
          await setDoc(configRef, defaultConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
        showNotification('Failed to load configuration', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const updateConfig = async (newConfig) => {
    try {
      const configRef = doc(db, 'system', 'config');
      await updateDoc(configRef, {
        ...newConfig,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
      setConfig(newConfig);
      showNotification('Configuration updated successfully', 'success');
    } catch (error) {
      console.error('Error updating config:', error);
      showNotification('Failed to update configuration', 'error');
    }
  };

  const tabs = [
    { id: 'system', label: 'System Config', icon: '⚙️' },
    { id: 'database', label: 'Database', icon: '🗄️' },
    { id: 'logs', label: 'System Logs', icon: '📋' }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
              ⚙️
            </div>
            <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading Settings...
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="mr-3">⚙️</span>
              Admin Settings
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Configure system settings and manage platform behavior
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
            ← Back to Admin
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-opacity-20 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'system' && (
          <SystemConfig 
            config={config} 
            onUpdate={updateConfig} 
            darkMode={darkMode} 
          />
        )}
        
        {activeTab === 'database' && (
          <DatabaseManager darkMode={darkMode} />
        )}
        
        {activeTab === 'logs' && (
          <SystemLogs darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

export default AdminSettings;