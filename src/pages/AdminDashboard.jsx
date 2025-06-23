// src/pages/AdminDashboard.jsx - FIXED SPACING ISSUES
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  Download,
  BarChart3,
  Activity,
  Eye,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Menu,
  X,
  Home,
  Shield,
  UserCheck,
  FileText,
  Briefcase,
  LogOut,
  Archive,
  MessageCircle,
  Headphones,
  PieChart,
  TrendingDown,
  Star,
  Target,
  Layers,
  Globe,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

// ===============================================
// SKELETON LOADER COMPONENT
// ===============================================
const SkeletonLoader = ({ className = "h-4 w-full", darkMode = false }) => (
  <div className={`animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded ${className}`} />
);

// ===============================================
// DIGITAL CLOCK COMPONENT
// ===============================================
const DigitalClock = ({ darkMode }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center mb-2">
          <Clock className={`h-5 w-5 mr-2 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`} />
          <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'}`}>
            {darkMode ? 'SYS TIME' : 'Time'}
          </h3>
        </div>
        
        <motion.div 
          className={`text-2xl font-mono font-bold mb-1 ${darkMode ? 'text-cyan-400 cyber-glow' : 'text-indigo-600'}`}
          key={formatTime(time)}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(time)}
        </motion.div>
        
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDate(time)}
        </div>
      </div>
    </motion.div>
  );
};

// ===============================================
// COMPREHENSIVE ACTIONS PANEL
// ===============================================
const ComprehensiveActionsPanel = ({ darkMode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('main');

  const menuSections = {
    main: [
        { 
          icon: Home, 
          label: 'Home', 
          path: '/',
        color: 'gray',
        description: 'Return to main homepage and overview'
        },
        { 
        icon: BarChart3, 
          label: 'Dashboard', 
          path: '/admin/dashboard',
        color: 'blue',
        description: 'Analytics overview and key metrics'
        },
        { 
          icon: Users, 
          label: 'User Management', 
          path: '/admin/users',
        color: 'blue',
        description: 'Manage users, roles and permissions'
        },
        { 
          icon: UserCheck, 
          label: 'Approvals', 
          path: '/admin/approvals',
        color: 'green',
        description: 'Review and approve pending users'
        },
        { 
          icon: Briefcase, 
          label: 'Deal Management', 
          path: '/admin/deals',
        color: 'purple',
        description: 'Manage deals, offers and promotions'
        }
    ],
    analytics: [
        { 
          icon: BarChart3, 
          label: 'Analytics', 
          path: '/admin/analytics',
        color: 'purple',
        description: 'Detailed analytics and reporting dashboard'
        },
        { 
          icon: FileText, 
          label: 'Reports', 
          path: '/admin/reports',
        color: 'indigo',
        description: 'Generate and export custom reports'
        }
    ],
    system: [
        { 
          icon: Shield, 
          label: 'Security', 
          path: '/admin/security',
        color: 'red',
        description: 'Security settings and access control'
        },
        { 
          icon: Settings, 
          label: 'Settings', 
          path: '/admin/settings',
        color: 'yellow',
        description: 'System configuration and preferences'
        },
        { 
          icon: Archive, 
          label: 'Legacy Panel', 
          path: '/admin/panel',
        color: 'gray',
        description: 'Access legacy admin interface'
        },
        { 
      icon: MessageCircle, 
      label: 'Feedback', 
      path: '/admin/feedback',
        color: 'pink',
        description: 'User feedback and support requests'
    },
    { 
  icon: Headphones, 
  label: 'Support Tickets', 
  path: '/admin/support',
        color: 'indigo',
        description: 'Manage customer support tickets'
}
      ]
  };

  const tabs = [
    { id: 'main', label: 'Main', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'system', label: 'System', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
          <motion.div
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-4 relative z-10 text-center`}>
        {darkMode ? 'NEURAL COMMAND CENTER' : 'Admin Navigation'}
                  </h3>
      
      {/* Tab Navigation */}
      <div className="flex mb-4 relative z-10">
        {tabs.map((tab, index) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 rounded-lg transition-all ${
                          isActive
                            ? darkMode 
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-600/30' 
                    : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                            : darkMode
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-700'
                        }`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
              <TabIcon className="h-4 w-4 mb-2" />
              <span className="text-sm font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`grid grid-cols-1 gap-3 mb-4`}>
            {menuSections[activeTab].map((action, index) => {
              const Icon = action.icon;
              
              return (
                <motion.button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`p-4 rounded-xl transition-all group text-left w-full ${
                    darkMode 
                      ? 'bg-gray-800/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? `bg-${action.color}-900/30` : `bg-${action.color}-100`
                    } group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${darkMode ? `text-${action.color}-400` : `text-${action.color}-600`}`} />
                            </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {action.label}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
                        {action.description}
                      </p>
                          </div>
                  </div>
                      </motion.button>
                    );
                  })}
                </div>
        </motion.div>
      </AnimatePresence>

      {/* Logout Button */}
            <motion.button
        onClick={handleLogout}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-xl transition-colors ${
                darkMode 
            ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/50' 
            : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
        whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
        <LogOut className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Logout</span>
            </motion.button>
    </motion.div>
  );
};

// ===============================================
// SMART NOTIFICATIONS SYSTEM
// ===============================================
const SmartNotificationSystem = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Low Stock Alert',
      message: '3 products need restocking',
      timestamp: new Date(),
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'New User Registrations',
      message: '5 users pending approval',
      timestamp: new Date(),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Revenue Milestone',
      message: 'Monthly target achieved!',
      timestamp: new Date(),
      priority: 'low'
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'info': return Bell;
      case 'success': return Star;
      case 'error': return X;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'}`}>
          {darkMode ? 'NEURAL ALERTS' : 'Smart Notifications'}
        </h3>
        <Bell className={`h-4 w-4 ${darkMode ? 'text-cyan-400' : 'text-indigo-600'} animate-pulse`} />
          </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto relative z-10">
        <AnimatePresence>
          {notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            const priorityColor = getPriorityColor(notification.priority);
            
            return (
              <motion.div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 border-${priorityColor}-500 ${
                  darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                } group cursor-pointer`}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => dismissNotification(notification.id)}
              >
                <div className="flex items-start space-x-2">
                  <Icon className={`h-4 w-4 mt-0.5 text-${priorityColor}-500 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {notification.message}
                    </p>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 block`}>
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
        </div>
                  <button className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {notifications.length === 0 && (
        <div className="text-center py-6 relative z-10">
          <Bell className={`h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No notifications
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ===============================================
// ENHANCED ACTIVITY ANALYTICS
// ===============================================
const EnhancedActivityAnalytics = ({ darkMode }) => {
  const [insights, setInsights] = useState([
    { label: 'Peak Hours', value: '2-4 PM', trend: 'up', insight: 'Most user activity' },
    { label: 'Conversion Rate', value: '12.8%', trend: 'up', insight: '+2.3% from last week' },
    { label: 'Avg Session', value: '8m 32s', trend: 'down', insight: 'Quality over quantity' },
    { label: 'User Retention', value: '78%', trend: 'up', insight: 'Above industry average' }
  ]);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'SMART INSIGHTS' : 'Activity Insights'}
      </h3>
      
      <div className="space-y-3 relative z-10">
        {insights.map((insight, index) => (
          <motion.div 
            key={index}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} hover:scale-102 transition-transform cursor-pointer`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {insight.label}
              </span>
              {insight.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {insight.value}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {insight.insight}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
);
};

// ===============================================
// REAL-TIME TOGGLE SWITCH
// ===============================================
const RealTimeToggle = ({ enabled, onToggle, darkMode }) => (
  <div className="flex items-center space-x-3">
    <Zap className={`h-4 w-4 ${enabled ? 'text-green-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      Real-time
    </span>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// ===============================================
// ADVANCED DATA EXPORT PANEL
// ===============================================
const AdvancedDataExportPanel = ({ darkMode, stats }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [exportType, setExportType] = useState('dashboard');
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    { id: 'dashboard', label: 'Dashboard Data', icon: BarChart3 },
    { id: 'users', label: 'User Analytics', icon: Users },
    { id: 'orders', label: 'Order Reports', icon: ShoppingCart },
    { id: 'system', label: 'System Metrics', icon: Settings }
  ];

  const formatOptions = [
    { id: 'json', label: 'JSON', extension: '.json' },
    { id: 'csv', label: 'CSV', extension: '.csv' },
    { id: 'pdf', label: 'PDF', extension: '.pdf' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      type: exportType,
      format: exportFormat,
      timestamp: new Date().toISOString(),
      data: stats,
      metadata: {
        exportedBy: 'Admin',
        version: '2.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportType}-export-${Date.now()}${formatOptions.find(f => f.id === exportFormat)?.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[300px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'DATA EXPORT' : 'Smart Export'}
      </h3>
      
      <div className="space-y-3 relative z-10">
        {/* Export Type Selection */}
        <div>
          <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
            Export Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => setExportType(option.id)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    exportType === option.id
                      ? darkMode 
                        ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-600/30' 
                        : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                      : darkMode
                        ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-3 w-3 mx-auto mb-1" />
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} block mb-2`}>
            Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className={`w-full p-2 text-xs rounded-lg border ${
          darkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {formatOptions.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label} ({format.extension})
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-600/30' 
              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600 border border-indigo-200'
          } disabled:opacity-50`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-current mr-2" />
              <span className="text-xs font-medium">Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Export Data</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ===============================================
// ENHANCED SYSTEM STATUS PANEL
// ===============================================
const EnhancedSystemStatusPanel = ({ darkMode }) => {
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'online', latency: '12ms', uptime: '99.9%', load: 45 },
    api: { status: 'online', latency: '8ms', uptime: '99.8%', load: 23 },
    storage: { status: 'online', latency: '15ms', uptime: '99.7%', load: 67 },
    cache: { status: 'optimal', latency: '2ms', uptime: '100%', load: 12 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        database: { ...prev.database, latency: `${Math.floor(Math.random() * 10) + 8}ms`, load: Math.floor(Math.random() * 30) + 35 },
        api: { ...prev.api, latency: `${Math.floor(Math.random() * 8) + 5}ms`, load: Math.floor(Math.random() * 20) + 15 },
        storage: { ...prev.storage, latency: `${Math.floor(Math.random() * 12) + 10}ms`, load: Math.floor(Math.random() * 25) + 55 },
        cache: { ...prev.cache, latency: `${Math.floor(Math.random() * 3) + 1}ms`, load: Math.floor(Math.random() * 15) + 5 }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'optimal':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'offline':
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getLoadColor = (load) => {
    if (load < 30) return 'green';
    if (load < 70) return 'yellow';
    return 'red';
  };

  const statusItems = [
    { key: 'database', label: 'Database', icon: Database },
    { key: 'api', label: 'API Gateway', icon: Globe },
    { key: 'storage', label: 'File Storage', icon: HardDrive },
    { key: 'cache', label: 'Cache Layer', icon: Cpu }
  ];

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[400px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'SYSTEM MATRIX' : 'System Health'}
      </h3>
      
      <div className="space-y-3 relative z-10">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          const status = systemStatus[item.key];
          const statusColor = getStatusColor(status.status);
          const loadColor = getLoadColor(status.load);
          
          return (
            <motion.div 
              key={item.key}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} hover:scale-102 transition-all cursor-pointer`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Icon className={`h-4 w-4 mr-2 text-${statusColor}-500`} />
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`text-xs font-bold text-${statusColor}-500 mr-2`}>
                    {status.status.toUpperCase()}
                  </span>
                  <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`}>
                    <motion.div
                      className={`w-2 h-2 rounded-full bg-${statusColor}-500`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs mb-2">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Latency: {status.latency}
                </span>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Uptime: {status.uptime}
                </span>
              </div>
              
              {/* Load Bar */}
              <div className="relative">
                <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <motion.div
                    className={`h-full bg-${loadColor}-500 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${status.load}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 block`}>
                  Load: {status.load}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ===============================================
// QUICK METRICS PANEL
// ===============================================
const QuickMetricsPanel = ({ darkMode, stats }) => {
  const quickMetrics = [
    { 
      label: 'Active Sessions', 
      value: Math.floor(Math.random() * 50) + 10, 
      icon: Activity, 
      color: 'blue',
      trend: '+12%'
    },
    { 
      label: 'Response Time', 
      value: '120ms', 
      icon: Zap, 
      color: 'green',
      trend: '-5%'
    },
    { 
      label: 'Error Rate', 
      value: '0.02%', 
      icon: AlertTriangle, 
      color: 'red',
      trend: '-80%'
    },
    { 
      label: 'Data Usage', 
      value: '2.4GB', 
      icon: Database, 
      color: 'purple',
      trend: '+15%'
    }
  ];

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'NEURAL METRICS' : 'Quick Metrics'}
      </h3>
      
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {quickMetrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <motion.div 
              key={index}
              className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center mb-2">
                <Icon className={`h-4 w-4 mr-2 text-${metric.color}-500`} />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {metric.label}
                </span>
              </div>
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </div>
              <div className={`text-xs ${
                metric.trend.startsWith('+') 
                  ? 'text-green-500' 
                  : metric.trend.startsWith('-') && metric.label !== 'Response Time' && metric.label !== 'Error Rate'
                    ? 'text-red-500'
                    : 'text-green-500'
              }`}>
                {metric.trend}
              </div>
            </motion.div>
          );
        })}
    </div>
    </motion.div>
  );
};

// ===============================================
// REAL PERFORMANCE RADAR CHART
// ===============================================
const RealPerformanceRadarChart = ({ darkMode }) => {
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products'))
        ]);

        const totalUsers = usersSnapshot.size;
        const totalOrders = ordersSnapshot.size;
        const totalProducts = productsSnapshot.size;

        const performance = Math.min(85 + (totalUsers > 50 ? 10 : 0), 100);
        const reliability = Math.min(90 + (totalOrders > 20 ? 5 : 0), 100);
        const scalability = Math.min(75 + (totalProducts > 30 ? 15 : 0), 100);
        const security = Math.min(95 + (totalUsers > 10 ? 5 : 0), 100);
        const ux = Math.min(80 + (totalOrders > 10 ? 10 : 0), 100);
        const speed = Math.min(85 + (totalProducts > 20 ? 10 : 0), 100);

        const data = [
          { name: 'Performance', value: performance },
          { name: 'Reliability', value: reliability },
          { name: 'Scalability', value: scalability },
          { name: 'Security', value: security },
          { name: 'UX', value: ux },
          { name: 'Speed', value: speed }
        ];

        setRadarData(data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setRadarData([
          { name: 'Performance', value: 0 },
          { name: 'Reliability', value: 0 },
          { name: 'Scalability', value: 0 },
          { name: 'Security', value: 0 },
          { name: 'UX', value: 0 },
          { name: 'Speed', value: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const size = 160; // Reduced from 180
  const center = size / 2;
  const radius = size / 2 - 25; // Reduced margin
  const maxValue = 100;
  
  const getPointPosition = (index, value) => {
    const angle = (index * 2 * Math.PI) / radarData.length - Math.PI / 2;
    const normalizedValue = (value / maxValue) * radius;
    return {
      x: center + normalizedValue * Math.cos(angle),
      y: center + normalizedValue * Math.sin(angle)
    };
  };

  const getLabelPosition = (index) => {
    const angle = (index * 2 * Math.PI) / radarData.length - Math.PI / 2;
    const labelRadius = radius + 15; // Reduced label distance
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  };

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}>
        {darkMode && <div className="card-glow"></div>}
        <SkeletonLoader className="h-6 w-24 mb-2" darkMode={darkMode} />
        <SkeletonLoader className="h-40 w-full" darkMode={darkMode} />
      </motion.div>
    );
  }

  const points = radarData.map((item, index) => getPointPosition(index, item.value));
  const pathData = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '') + ' Z';

  const hasData = radarData.some(item => item.value > 0);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 text-center relative z-10`}>
        {darkMode ? 'PERFORMANCE MATRIX' : 'Performance Radar'}
      </h3>
      
      {!hasData ? (
        <div className="text-center py-6 relative z-10">
          <div className="text-2xl mb-1 opacity-50">📡</div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available
          </p>
        </div>
      ) : (
        <div className="w-full flex justify-center relative z-10">
            <svg width={size} height={size} className="overflow-visible">
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor={darkMode ? "rgba(0, 255, 255, 0.3)" : "rgba(79, 70, 229, 0.3)"} />
                  <stop offset="100%" stopColor={darkMode ? "rgba(0, 255, 255, 0.05)" : "rgba(79, 70, 229, 0.05)"} />
                </radialGradient>
              </defs>
              
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
                <circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius * scale}
                  fill="none"
                  stroke={darkMode ? "rgba(0, 255, 255, 0.2)" : "rgba(79, 70, 229, 0.2)"}
                  strokeWidth="1"
                />
              ))}
              
              {/* Grid lines */}
              {radarData.map((_, index) => {
                const angle = (index * 2 * Math.PI) / radarData.length - Math.PI / 2;
                const endX = center + radius * Math.cos(angle);
                const endY = center + radius * Math.sin(angle);
                
                return (
                  <line
                    key={index}
                    x1={center}
                    y1={center}
                    x2={endX}
                    y2={endY}
                    stroke={darkMode ? "rgba(0, 255, 255, 0.2)" : "rgba(79, 70, 229, 0.2)"}
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Data area */}
              <motion.path
                d={pathData}
                fill="url(#radarGradient)"
                stroke={darkMode ? "#00FFFF" : "#4F46E5"}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              
              {/* Data points */}
              {points.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                r="3"
                  fill={darkMode ? "#00FFFF" : "#4F46E5"}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                />
              ))}
              
              {/* Labels */}
              {radarData.map((item, index) => {
                const labelPos = getLabelPosition(index);
                return (
                  <text
                    key={index}
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-medium ${darkMode ? 'fill-gray-300' : 'fill-gray-700'}`}
                  >
                    {item.name}
                  </text>
                );
              })}
            </svg>
          </div>
      )}
    </motion.div>
  );
};

// ===============================================
// REAL USER ACTIVITY HEATMAP
// ===============================================
const RealUserActivityHeatmap = ({ darkMode }) => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate() || new Date()
          };
        });

        // Generate activity data for the last 7 days
        const today = new Date();
        const weekData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayActivity = users.filter(user => {
            const userDate = user.lastLogin || user.createdAt;
            return userDate.toDateString() === date.toDateString();
          }).length;
          
          weekData.push({
            day: dayName,
            activity: dayActivity,
            date: date.toDateString()
          });
        }

        setHeatmapData(weekData);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
        const fallbackData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          day,
          activity: 0,
          date: new Date().toDateString()
        }));
        setHeatmapData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[150px]`}>
        {darkMode && <div className="card-glow"></div>}
        <SkeletonLoader className="h-6 w-24 mb-2" darkMode={darkMode} />
        <SkeletonLoader className="h-24 w-full" darkMode={darkMode} />
      </motion.div>
    );
  }

  const maxActivity = Math.max(...heatmapData.map(d => d.activity), 1);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[150px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'USER ACTIVITY MAP' : 'User Activity'}
      </h3>
      
      {maxActivity === 1 && heatmapData[0].activity === 0 ? (
        <div className="text-center py-6 relative z-10">
          <div className="text-2xl mb-1 opacity-50">🔥</div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No activity data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 relative z-10">
          {heatmapData.map((item, index) => {
            const intensity = item.activity / maxActivity;
            
            return (
              <motion.div
                key={index}
                className={`aspect-square rounded flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer`}
                style={{
                  backgroundColor: intensity > 0 
                    ? darkMode 
                      ? `rgba(0, 255, 255, ${0.2 + intensity * 0.6})`
                      : `rgba(79, 70, 229, ${0.2 + intensity * 0.6})`
                    : darkMode 
                      ? 'rgba(75, 85, 99, 0.3)'
                      : 'rgba(229, 231, 235, 0.5)',
                  color: intensity > 0.5 ? 'white' : darkMode ? '#9CA3AF' : '#6B7280'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                title={`${item.day}: ${item.activity} activities`}
              >
                <span className="text-xs">{item.day}</span>
                <span className="text-xs">{item.activity}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// ===============================================
// REAL ACTIVITY FEED
// ===============================================
const RealActivityFeed = ({ darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(6))
        );
        
        const realActivities = [];
        
        usersSnapshot.docs.forEach((doc, index) => {
          const userData = doc.data();
          const createdAt = userData.createdAt?.toDate();
          
          if (createdAt) {
            realActivities.push({
              id: `user-created-${index}`,
              type: 'user',
              title: 'New User Registration',
              description: `${userData.email} joined`,
              timestamp: formatTimeAgo(createdAt),
              value: '+1'
            });
          }
        });

        setActivities(realActivities.slice(0, 6));
        
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤';
      case 'order': return '📦';
      case 'system': return '⚙️';
      case 'revenue': return '💰';
      default: return '📡';
    }
  };

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[250px]`}>
        {darkMode && <div className="card-glow"></div>}
        <SkeletonLoader className="h-6 w-24 mb-2" darkMode={darkMode} />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-12 w-full" darkMode={darkMode} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[250px]`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'ACTIVITY STREAM' : 'Recent Activity'}
        </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto relative z-10">
        <AnimatePresence>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`flex items-start space-x-2 p-2 rounded ${
                  darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors cursor-pointer`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 2 }}
              >
                <div className="text-sm">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {activity.title}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activity.description}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {activity.timestamp}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <div className="text-2xl mb-1 opacity-50">📡</div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No activities found
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ===============================================
// REAL MONTHLY REVENUE CHART
// ===============================================
const RealMonthlyRevenueChart = ({ darkMode }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            total: data.total || 0,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });

        // Group orders by last 6 months
        const monthlyRevenue = {};
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          monthlyRevenue[monthName] = 0;
        }

        orders.forEach(order => {
          const monthName = order.createdAt.toLocaleDateString('en-US', { month: 'short' });
          if (monthlyRevenue.hasOwnProperty(monthName)) {
            monthlyRevenue[monthName] += order.total;
          }
        });

        const data = Object.entries(monthlyRevenue).map(([name, value]) => ({
          name,
          value: Math.round(value)
        }));

        setRevenueData(data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const width = 240; // Reduced from 280
  const height = 120;
  const margin = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxValue = Math.max(...revenueData.map(d => d.value), 1);
  const minValue = Math.min(...revenueData.map(d => d.value));
  
  const xScale = (index) => (index / Math.max(revenueData.length - 1, 1)) * chartWidth;
  const yScale = (value) => chartHeight - ((value - minValue) / Math.max(maxValue - minValue, 1)) * chartHeight;
  
  const pathData = revenueData.reduce((path, item, index) => {
    const x = xScale(index);
    const y = yScale(item.value);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}>
        {darkMode && <div className="card-glow"></div>}
        <SkeletonLoader className="h-6 w-24 mb-2" darkMode={darkMode} />
        <SkeletonLoader className="h-32 w-full" darkMode={darkMode} />
      </motion.div>
    );
  }

  const hasRevenue = revenueData.some(item => item.value > 0);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {darkMode ? 'REVENUE FLOW' : 'Monthly Revenue'}
      </h3>
      
      {!hasRevenue ? (
        <div className="text-center py-6 relative z-10">
          <div className="text-2xl mb-1 opacity-50">📈</div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No revenue data
          </p>
        </div>
      ) : (
        <div className="w-full flex justify-center relative z-10">
          <svg width={width} height={height}>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Line */}
              <motion.path
                d={pathData}
                fill="none"
                stroke={darkMode ? "#00FFFF" : "#4F46E5"}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              
              {/* Data points */}
              {revenueData.map((item, index) => (
                <motion.circle
              key={index}
                  cx={xScale(index)}
                  cy={yScale(item.value)}
                  r="2"
                  fill={darkMode ? "#00FFFF" : "#4F46E5"}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
                />
              ))}
            </g>
          </svg>
              </div>
      )}
    </motion.div>
  );
};

// ===============================================
// DONUT CHART COMPONENT
// ===============================================
const DonutChart = ({ data, title, darkMode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data || data.length === 0) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}>
        {darkMode && <div className="card-glow"></div>}
        <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
          {title}
        </h3>
        <div className="flex items-center justify-center h-32 relative z-10">
          {loading ? (
            <div className={`animate-spin rounded-full h-12 w-12 border-4 ${
              darkMode ? 'border-cyan-400 border-t-transparent' : 'border-indigo-600 border-t-transparent'
            }`}></div>
          ) : (
            <div className="text-center">
              <PieChart className={`h-8 w-8 mx-auto mb-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No data</p>
          </div>
          )}
        </div>
      </motion.div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = darkMode 
    ? ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF6600']
    : ['#4F46E5', '#7C3AED', '#DC2626', '#059669', '#D97706'];

  const size = 100; // Reduced from 120
  const center = size / 2;
  const radius = 35; // Reduced from 45
  const innerRadius = 20; // Reduced from 25

  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;
    
    return {
      ...item,
      pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full min-h-[200px]`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-sm font-bold ${darkMode ? 'text-white cyber-title' : 'text-gray-800'} mb-3 relative z-10`}>
        {title}
      </h3>
      
      <div className="flex items-center justify-between relative z-10">
        {/* Chart */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment, index) => (
              <motion.path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="hover:opacity-80 cursor-pointer"
              />
            ))}
            
            {/* Inner circle */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill={darkMode ? '#1F2937' : '#F9FAFB'}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {total}
        </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 ml-3 space-y-1">
          {segments.map((segment, index) => (
            <motion.div 
              key={index}
              className="flex items-center text-xs"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
                <div 
                className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                {segment.name}: {segment.value}
                </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ===============================================
// ENHANCED METRICS CARD
// ===============================================
const EnhancedMetricsCard = ({ title, value, change, icon: Icon, color, trend, darkMode, loading }) => {
  if (loading) {
    return (
      <motion.div 
        className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden w-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonLoader className="h-3 w-16" darkMode={darkMode} />
            <SkeletonLoader className="h-6 w-12" darkMode={darkMode} />
            <SkeletonLoader className="h-2 w-10" darkMode={darkMode} />
          </div>
          <SkeletonLoader className="h-10 w-10 rounded-full" darkMode={darkMode} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative overflow-hidden group w-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide`}>
            {title}
          </p>
          <motion.p 
            className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.p>
          {change && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <motion.div 
          className={`p-2 rounded-lg ${
            darkMode ? `bg-${color}-900/30` : `bg-${color}-100`
          } group-hover:scale-110 transition-transform`}
          animate={{ 
            scale: [1, 1.05, 1],
            rotateZ: [0, 3, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Icon className={`h-5 w-5 ${darkMode ? `text-${color}-400` : `text-${color}-600`}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ===============================================
// MAIN ADMIN DASHBOARD
// ===============================================
const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [userStatusData, setUserStatusData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  // Memoized calculations for enhanced metrics
  const processedStats = useMemo(() => {
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    return {
      users: {
        value: stats.totalUsers.toLocaleString(),
        change: calculateChange(stats.totalUsers, stats.totalUsers * 0.9),
        trend: 'up'
      },
      orders: {
        value: stats.totalOrders.toLocaleString(),
        change: calculateChange(stats.totalOrders, stats.totalOrders * 0.85),
        trend: 'up'
      },
      revenue: {
        value: `$${stats.totalRevenue.toLocaleString()}`,
        change: calculateChange(stats.totalRevenue, stats.totalRevenue * 0.92),
        trend: 'up'
      },
      products: {
        value: stats.totalProducts.toLocaleString(),
        change: calculateChange(stats.totalProducts, stats.totalProducts * 0.95),
        trend: 'up'
      }
    };
  }, [stats]);

  // Fetch real Firebase data
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders'))
      ]);

      // Process users data
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeUsers = users.filter(user => user.status === 'active' && user.approved).length;
      const pendingApprovals = users.filter(user => 
        user.status === 'pending_approval' || user.status === 'pending'
      ).length;

      // User status distribution for donut chart
      const userStatusCounts = users.reduce((acc, user) => {
        const status = user.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const userStatusChartData = Object.entries(userStatusCounts).map(([status, count]) => ({
        name: status.replace('_', ' ').toUpperCase(),
        value: count
      }));

      // Process products data
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lowStock = products.filter(product => (product.stock || 0) <= 10).length;

      // Process orders data
      const allOrders = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          total: data.total || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          ...data
        };
      });

      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length;

      // Order status distribution for donut chart
      const orderStatusCounts = allOrders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const orderStatusChartData = Object.entries(orderStatusCounts).map(([status, count]) => ({
        name: status.replace('_', ' ').toUpperCase(),
        value: count
      }));

      setStats({
        totalUsers: users.length,
        totalOrders: allOrders.length,
        totalRevenue,
        totalProducts: products.length,
        lowStockProducts: lowStock,
        pendingOrders,
        pendingApprovals,
        activeUsers
      });

      setUserStatusData(userStatusChartData);
      setOrderStatusData(orderStatusChartData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates setup
  useEffect(() => {
    if (realTimeEnabled) {
      const unsubscribes = [
        onSnapshot(collection(db, 'users'), () => fetchAdminData()),
        onSnapshot(collection(db, 'products'), () => fetchAdminData()),
        onSnapshot(collection(db, 'orders'), () => fetchAdminData())
      ];

      return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    }
  }, [realTimeEnabled, fetchAdminData]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => !prev);
    showNotification(
      `${darkMode ? 'REAL-TIME MODE' : 'Real-time updates'} ${!realTimeEnabled ? 'enabled' : 'disabled'}`,
      'success'
    );
  }, [realTimeEnabled, darkMode]);

  const handleRefresh = useCallback(async () => {
    await fetchAdminData();
    showNotification(darkMode ? 'NEURAL DATA REFRESHED' : 'Data refreshed successfully', 'success');
  }, [fetchAdminData, darkMode]);

  const statCards = useMemo(() => [
    { 
      title: darkMode ? 'TOTAL ENTITIES' : 'Total Users', 
      value: processedStats.users.value, 
      icon: Users, 
      color: 'blue',
      change: processedStats.users.change,
      trend: processedStats.users.trend
    },
    { 
      title: darkMode ? 'TRANSACTIONS' : 'Total Orders', 
      value: processedStats.orders.value, 
      icon: ShoppingCart, 
      color: 'green',
      change: processedStats.orders.change,
      trend: processedStats.orders.trend
    },
    { 
      title: darkMode ? 'REVENUE MATRIX' : 'Total Revenue', 
      value: processedStats.revenue.value, 
      icon: DollarSign, 
      color: 'purple',
      change: processedStats.revenue.change,
      trend: processedStats.revenue.trend
    },
    { 
      title: darkMode ? 'INVENTORY COUNT' : 'Total Products', 
      value: processedStats.products.value, 
      icon: Package, 
      color: 'orange',
      change: processedStats.products.change,
      trend: processedStats.products.trend
    }
  ], [processedStats, stats, darkMode]);

  if (loading) {
    return (
      <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative`}>
        <div className="fixed inset-0 pointer-events-none z-0">
          <SecretInvasionBackground intensity={0.3} enableGlitch={false} />
        </div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`w-16 h-16 border-4 ${darkMode ? 'border-cyan-500' : 'border-indigo-500'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
            <p className={`text-lg font-bold ${darkMode ? 'text-cyan-400 cyber-glow' : 'text-indigo-600'}`}>
              {darkMode ? 'INITIALIZING NEURAL MATRIX...' : 'Loading Enhanced Dashboard...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative`}>
        <div className="fixed inset-0 pointer-events-none z-0">
          <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />
        </div>
        
        <motion.div 
          className="flex items-center justify-center min-h-screen relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center py-12">
            <AlertTriangle className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Error Loading Dashboard
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {error}
            </p>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} relative`}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <SecretInvasionBackground 
          intensity={darkMode ? 0.8 : 0.6} 
          enableGlitch={darkMode} 
      />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Header Bar */}
        <header className={`flex items-center justify-between px-4 md:px-6 py-4 border-b backdrop-blur-sm ${
          darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <div>
              <h1 className={`text-xl md:text-2xl font-bold ${
              darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'
            }`}>
              {darkMode ? 'NEURAL COMMAND CENTER' : 'Admin Dashboard'}
            </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {darkMode ? 'QUANTUM INTERFACE ACTIVE' : 'Management & Analytics Hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <RealTimeToggle 
              enabled={realTimeEnabled} 
              onToggle={toggleRealTime} 
              darkMode={darkMode} 
            />
            
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`h-5 w-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </button>
            
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto overflow-x-auto">
            {/* Global Notification */}
            <AnimatePresence>
              {notification && (
                <motion.div 
                  className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    notification.type === 'success' 
                      ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
                      : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
                  } border font-bold`}
                  initial={{ opacity: 0, y: -50, x: 50 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -50, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  {notification.message}
                </motion.div>
              )}
            </AnimatePresence>

          {/* Header Section */}
            <motion.div 
            className="text-center space-y-4 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <h1 className={`text-2xl md:text-4xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'}`}>
              {darkMode ? 'NEURAL ANALYTICS HUB' : 'Enhanced Analytics Dashboard'}
                  </h1>
            <p className={`text-sm md:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} max-w-2xl mx-auto`}>
                    {darkMode 
                ? 'REAL-TIME QUANTUM DATA PROCESSING WITH ADVANCED NEURAL MONITORING' 
                : 'Comprehensive real-time analytics with advanced data visualization'
                    }
                  </p>
            <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center justify-center gap-2 flex-wrap`}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
                    {realTimeEnabled && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                        Live
                      </span>
                    )}
              </div>
            </motion.div>

            {/* Alert Section */}
            {(stats.lowStockProducts > 0 || stats.pendingApprovals > 0) && (
              <motion.div 
              className={`p-4 rounded-xl border-l-4 ${
                  darkMode 
                    ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' 
                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
              } mb-8`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                  <h3 className="font-bold">
                      {darkMode ? 'SYSTEM ALERTS DETECTED' : 'Action Required'}
                    </h3>
                  <div className="mt-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                      {stats.lowStockProducts > 0 && (
                      <div>{stats.lowStockProducts} products are running low on stock</div>
                      )}
                      {stats.pendingApprovals > 0 && (
                      <div>{stats.pendingApprovals} users are pending approval</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Main Grid Layout - FIXED FOR SPACING */}
          <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
              
            {/* Left Column - Stats & Actions */}
            <div className="xl:col-span-4 space-y-4 md:space-y-6 w-full">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {statCards.map((stat, index) => (
                  <EnhancedMetricsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    trend={stat.trend}
                    icon={stat.icon}
                    color={stat.color}
                  darkMode={darkMode} 
                    loading={loading}
                  />
                            ))}
                          </div>

              {/* Comprehensive Actions Panel */}
              <ComprehensiveActionsPanel darkMode={darkMode} />

              {/* Digital Clock */}
              <DigitalClock darkMode={darkMode} />
                        </div>

            {/* Middle Column - Charts */}
            <div className="xl:col-span-5 space-y-4 md:space-y-6 w-full">
              {/* Top Row - Donut Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <DonutChart 
                  data={userStatusData} 
                  title={darkMode ? 'USER STATUS MATRIX' : 'User Status'} 
                  darkMode={darkMode} 
                />
                <DonutChart 
                  data={orderStatusData} 
                  title={darkMode ? 'ORDER STATUS MATRIX' : 'Order Status'} 
                  darkMode={darkMode} 
                />
                </div>
                
              {/* Bottom Row - Performance & Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <RealPerformanceRadarChart darkMode={darkMode} />
                  <RealMonthlyRevenueChart darkMode={darkMode} />
                </div>

              {/* Quick Metrics Panel */}
              <QuickMetricsPanel darkMode={darkMode} stats={stats} />
              </div>

            {/* Right Column - Enhanced Activity, Analytics & System */}
            <div className="xl:col-span-3 space-y-4 md:space-y-6 w-full">
                <RealActivityFeed darkMode={darkMode} />
              <RealUserActivityHeatmap darkMode={darkMode} />
              <SmartNotificationSystem darkMode={darkMode} />
              <EnhancedActivityAnalytics darkMode={darkMode} />
              <EnhancedSystemStatusPanel darkMode={darkMode} />
              <AdvancedDataExportPanel darkMode={darkMode} stats={stats} />
              </div>
                            </div>

          {/* Footer Section */}
                <motion.div 
            className={`text-center py-6 md:py-8 mt-8 border-t ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
            <p className="text-xs md:text-sm">
              {darkMode 
                ? 'NEURAL INTERFACE v2.0 - QUANTUM ANALYTICS SYSTEM ACTIVE' 
                : 'Enhanced Admin Dashboard v2.0 - Real-time Analytics Enabled'
              }
            </p>
            </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;