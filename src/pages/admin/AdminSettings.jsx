// src/pages/admin/AdminSettings.jsx - Futuristic Settings Panel
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
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
      title: 'SECURITY_MATRIX',
      icon: '🔒',
      color: 'red',
      settings: [
        {
          key: 'requireTwoFactor',
          label: 'FORCE_2FA',
          type: 'boolean',
          description: 'Require two-factor authentication for all users'
        },
        {
          key: 'sessionTimeout',
          label: 'SESSION_TIMEOUT',
          type: 'number',
          description: 'Session timeout in minutes',
          min: 15,
          max: 1440
        },
        {
          key: 'maxLoginAttempts',
          label: 'MAX_LOGIN_ATTEMPTS',
          type: 'number',
          description: 'Maximum failed login attempts before lockout',
          min: 3,
          max: 10
        }
      ]
    },
    {
      title: 'SYSTEM_BEHAVIOR',
      icon: '⚙️',
      color: 'blue',
      settings: [
        {
          key: 'autoApproveUsers',
          label: 'AUTO_APPROVE',
          type: 'boolean',
          description: 'Automatically approve new user registrations'
        },
        {
          key: 'maintenanceMode',
          label: 'MAINTENANCE_MODE',
          type: 'boolean',
          description: 'Enable maintenance mode (blocks non-admin access)'
        },
        {
          key: 'maxFileSize',
          label: 'MAX_FILE_SIZE',
          type: 'number',
          description: 'Maximum file upload size in MB',
          min: 1,
          max: 100
        }
      ]
    },
    {
      title: 'NOTIFICATION_SYSTEM',
      icon: '📢',
      color: 'purple',
      settings: [
        {
          key: 'emailNotifications',
          label: 'EMAIL_NOTIFICATIONS',
          type: 'boolean',
          description: 'Send email notifications for system events'
        },
        {
          key: 'lowStockAlert',
          label: 'LOW_STOCK_ALERTS',
          type: 'number',
          description: 'Low stock threshold for alerts',
          min: 0,
          max: 100
        },
        {
          key: 'dailyReports',
          label: 'DAILY_REPORTS',
          type: 'boolean',
          description: 'Generate and send daily system reports'
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
            : 'bg-white/50 border-gray-200'
        } backdrop-blur-sm`}>
          
          <h3 className={`font-mono text-lg mb-4 text-${section.color}-500 flex items-center`}>
            <span className="animate-pulse mr-3">{section.icon}</span>
            {section.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.settings.map((setting, settingIndex) => (
              <div key={settingIndex} className={`p-4 rounded border ${
                darkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                
                <label className={`block text-sm font-mono mb-2 ${
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
                      <span className={`ml-3 font-mono text-sm ${
                        localConfig[setting.key] 
                          ? `text-${section.color}-500` 
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {localConfig[setting.key] ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="number"
                      value={localConfig[setting.key] || setting.min || 0}
                      onChange={(e) => handleConfigChange(setting.key, parseInt(e.target.value))}
                      min={setting.min}
                      max={setting.max}
                      className={`w-full p-2 rounded border font-mono text-sm ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  )}
                </div>
                
                <p className={`text-xs font-mono ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  // {setting.description}
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
          className={`px-6 py-3 rounded-lg font-mono transition-all ${
            saving
              ? darkMode
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : darkMode
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {saving ? 'SAVING...' : 'SAVE_CONFIG'}
        </button>
      </div>
    </div>
  );
};

// Database Management Component
const DatabaseManager = ({ darkMode }) => {
  const [dbStats, setDbStats] = useState({
    totalCollections: 0,
    totalDocuments: 0,
    storageUsed: '0 MB',
    lastBackup: null
  });
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setDbStats(prev => ({
        ...prev,
        lastBackup: new Date()
      }));
      setIsBackingUp(false);
    }, 3000);
  };

  const dbActions = [
    {
      title: 'BACKUP_DATABASE',
      description: 'Create a full system backup',
      action: handleBackup,
      loading: isBackingUp,
      color: 'green',
      icon: '💾'
    },
    {
      title: 'OPTIMIZE_DB',
      description: 'Optimize database performance',
      action: () => console.log('Optimizing...'),
      loading: false,
      color: 'blue',
      icon: '⚡'
    },
    {
      title: 'CLEAR_CACHE',
      description: 'Clear all system caches',
      action: () => console.log('Clearing cache...'),
      loading: false,
      color: 'yellow',
      icon: '🧹'
    },
    {
      title: 'RESET_ANALYTICS',
      description: 'Reset analytics data',
      action: () => console.log('Resetting analytics...'),
      loading: false,
      color: 'red',
      icon: '🔄'
    }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white/50 border-gray-200'
    } backdrop-blur-sm`}>
      
      <h3 className={`font-mono text-lg mb-6 ${
        darkMode ? 'text-cyan-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="animate-pulse mr-3">🗄️</span>
        DATABASE_MANAGEMENT
      </h3>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'COLLECTIONS', value: dbStats.totalCollections, color: 'blue' },
          { label: 'DOCUMENTS', value: dbStats.totalDocuments, color: 'green' },
          { label: 'STORAGE', value: dbStats.storageUsed, color: 'purple' },
          { label: 'LAST_BACKUP', value: dbStats.lastBackup ? 'Recent' : 'Never', color: 'red' }
        ].map((stat, index) => (
          <div key={index} className={`p-4 rounded border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          } text-center`}>
            <div className={`text-lg font-bold font-mono text-${stat.color}-500`}>
              {stat.value}
            </div>
            <div className={`text-xs font-mono ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Database Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={action.loading}
            className={`p-4 rounded border text-left transition-all hover:scale-105 ${
              action.loading
                ? darkMode
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                : darkMode
                  ? `bg-gray-700/50 border-gray-600 hover:border-${action.color}-500/50`
                  : `bg-gray-50 border-gray-200 hover:border-${action.color}-500/50`
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-3">{action.icon}</span>
              <span className={`font-mono text-sm font-bold ${
                action.loading 
                  ? darkMode ? 'text-gray-400' : 'text-gray-500'
                  : `text-${action.color}-500`
              }`}>
                {action.loading ? 'PROCESSING...' : action.title}
              </span>
            </div>
            <p className={`text-xs font-mono ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              // {action.description}
            </p>
          </button>
        ))}
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
            requireTwoFactor: false,
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            autoApproveUsers: false,
            maintenanceMode: false,
            maxFileSize: 10,
            emailNotifications: true,
            lowStockAlert: 10,
            dailyReports: true
          };
          setConfig(defaultConfig);
          await setDoc(configRef, defaultConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = async (newConfig) => {
    try {
      const configRef = doc(db, 'system', 'config');
      await updateDoc(configRef, {
        ...newConfig,
        updatedAt: new Date(),
        updatedBy: user.uid
      });
      setConfig(newConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const tabs = [
    { id: 'system', label: 'SYSTEM_CONFIG', icon: '⚙️' },
    { id: 'database', label: 'DATABASE', icon: '🗄️' },
    { id: 'logs', label: 'SYSTEM_LOGS', icon: '📋' }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-cyan-400' : 'text-blue-500'}`}>
              ⚙️
            </div>
            <div className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              LOADING_SETTINGS...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold font-mono ${
              darkMode ? 'text-cyan-400' : 'text-blue-600'
            } flex items-center`}>
              <span className="animate-pulse mr-3">⚙️</span>
              ADMIN_SETTINGS
            </h1>
            <p className={`font-mono text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              // System configuration and management panel
            </p>
          </div>
          
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-cyan-400 border-cyan-500/50'
                : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
            }`}
          >
            ← ADMIN_DASHBOARD
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-opacity-20 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded font-mono text-sm transition-all ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-cyan-600 text-white'
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
          <div className={`p-6 rounded-lg border ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700' 
              : 'bg-white/50 border-gray-200'
          } backdrop-blur-sm`}>
            <h3 className={`font-mono text-lg mb-4 ${
              darkMode ? 'text-cyan-400' : 'text-blue-600'
            } flex items-center`}>
              <span className="animate-pulse mr-3">📋</span>
              SYSTEM_LOGS
            </h3>
            <div className={`p-4 rounded border font-mono text-sm ${
              darkMode 
                ? 'bg-gray-900 border-gray-600 text-green-400' 
                : 'bg-black border-gray-300 text-green-500'
            }`}>
              <div className="space-y-1">
                <div>[2025-06-21 10:30:15] INFO: System configuration updated</div>
                <div>[2025-06-21 10:25:03] INFO: User role changed: user@example.com</div>
                <div>[2025-06-21 10:20:45] WARN: Low stock alert triggered</div>
                <div>[2025-06-21 10:15:22] INFO: Database backup completed</div>
                <div>[2025-06-21 10:10:11] INFO: New user registration approved</div>
                <div>[2025-06-21 10:05:33] ERROR: Failed login attempt detected</div>
                <div>[2025-06-21 10:00:00] INFO: Daily analytics report generated</div>
                <div className="animate-pulse">▌</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;