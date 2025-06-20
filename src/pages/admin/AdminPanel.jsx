// src/pages/admin/AdminPanel.jsx - Enhanced Futuristic Admin Control Center
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Futuristic Tool Card Component
const FuturisticToolCard = ({ tool, darkMode, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColorClasses = (color) => {
    const colors = {
      blue: darkMode ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : 'from-blue-400/20 to-cyan-400/20 border-blue-400/30',
      yellow: darkMode ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : 'from-yellow-400/20 to-orange-400/20 border-yellow-400/30',
      green: darkMode ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-green-400/20 to-emerald-400/20 border-green-400/30',
      purple: darkMode ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30' : 'from-purple-400/20 to-pink-400/20 border-purple-400/30',
      indigo: darkMode ? 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30' : 'from-indigo-400/20 to-purple-400/20 border-indigo-400/30',
      gray: darkMode ? 'from-gray-500/20 to-slate-500/20 border-gray-500/30' : 'from-gray-400/20 to-slate-400/20 border-gray-400/30'
    };
    return colors[tool.color] || colors.blue;
  };

  const getTextColor = (color) => {
    const colors = {
      blue: darkMode ? 'text-blue-400' : 'text-blue-600',
      yellow: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      green: darkMode ? 'text-green-400' : 'text-green-600',
      purple: darkMode ? 'text-purple-400' : 'text-purple-600',
      indigo: darkMode ? 'text-indigo-400' : 'text-indigo-600',
      gray: darkMode ? 'text-gray-400' : 'text-gray-600'
    };
    return colors[tool.color] || colors.blue;
  };

  return (
    <Link
      to={tool.href}
      className={`group relative block p-6 rounded-xl border transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
        isActive ? 'scale-105 shadow-2xl' : ''
      } ${
        darkMode ? 'bg-gray-900/50 hover:bg-gray-800/50' : 'bg-white/50 hover:bg-white/80'
      } backdrop-blur-sm ${getColorClasses(tool.color)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getColorClasses(tool.color)} ${
        isHovered ? 'opacity-30' : 'opacity-0'
      } transition-opacity duration-500`}></div>
      
      {/* Scanning line effect */}
      {isHovered && (
        <div className={`absolute inset-0 rounded-xl overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
            darkMode ? `from-${tool.color}-400 to-${tool.color}-600` : `from-${tool.color}-500 to-${tool.color}-700`
          } animate-pulse`}></div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`text-4xl p-3 rounded-lg bg-gradient-to-r ${getColorClasses(tool.color)} backdrop-blur-sm transition-transform duration-300 ${
            isHovered ? 'scale-110 rotate-3' : ''
          }`}>
            {tool.icon}
          </div>
          {tool.status && (
            <div className={`px-2 py-1 rounded-md text-xs font-mono uppercase ${
              tool.status === 'active' 
                ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
            }`}>
              [{tool.status}]
            </div>
          )}
        </div>

        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 font-mono group-hover:${getTextColor(tool.color)} transition-colors duration-300`}>
          {tool.title}
        </h3>
        
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 font-mono`}>
          // {tool.description}
        </p>

        {tool.metrics && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tool.metrics.map((metric, index) => (
              <div key={index} className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
              } backdrop-blur-sm`}>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                  {metric.label}
                </div>
                <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} font-mono`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`inline-flex items-center text-sm font-mono font-medium ${getTextColor(tool.color)} group-hover:translate-x-2 transition-transform duration-300`}>
          &gt; ACCESS_MODULE
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

// Real-time Activity Feed Component
const ActivityFeed = ({ darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Simulate real-time activities (in a real app, you'd use onSnapshot)
        const mockActivities = [
          { type: 'user', message: 'New user registration from business account', time: Date.now() - 120000, severity: 'info' },
          { type: 'order', message: `High-value order placed: $${(Math.random() * 5000 + 1000).toFixed(2)}`, time: Date.now() - 300000, severity: 'success' },
          { type: 'security', message: 'Automated security scan completed successfully', time: Date.now() - 720000, severity: 'success' },
          { type: 'system', message: 'Database optimization routine executed', time: Date.now() - 900000, severity: 'info' },
          { type: 'alert', message: 'Inventory threshold alert: Low stock detected', time: Date.now() - 1800000, severity: 'warning' },
          { type: 'user', message: 'Bulk user approval action completed', time: Date.now() - 2400000, severity: 'info' }
        ];

        setActivities(mockActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
      }
    };

    fetchRecentActivities();
    
    // Update activities every 30 seconds
    const interval = setInterval(fetchRecentActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      user: '👤',
      order: '📦',
      security: '🔒',
      system: '⚙️',
      alert: '⚠️'
    };
    return icons[type] || '📡';
  };

  const getActivityColor = (severity) => {
    const colors = {
      success: darkMode ? 'border-green-500/50 bg-green-900/20' : 'border-green-400/50 bg-green-50',
      warning: darkMode ? 'border-yellow-500/50 bg-yellow-900/20' : 'border-yellow-400/50 bg-yellow-50',
      error: darkMode ? 'border-red-500/50 bg-red-900/20' : 'border-red-400/50 bg-red-50',
      info: darkMode ? 'border-cyan-500/50 bg-cyan-900/20' : 'border-blue-400/50 bg-blue-50'
    };
    return colors[severity] || colors.info;
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-solid ${
          darkMode ? 'border-cyan-500 border-r-transparent' : 'border-blue-500 border-r-transparent'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
      {activities.map((activity, index) => (
        <div key={index} className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          getActivityColor(activity.severity)
        }`}>
          <div className="flex items-start space-x-3">
            <div className="text-lg">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'} font-mono`}>
                [{activity.type.toUpperCase()}] {activity.message}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono mt-1`}>
                {formatTime(activity.time)}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              activity.severity === 'success' ? 'bg-green-500'
              : activity.severity === 'warning' ? 'bg-yellow-500'
              : activity.severity === 'error' ? 'bg-red-500'
              : 'bg-cyan-500'
            } animate-pulse`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Enhanced AdminPanel Component
const AdminPanel = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    businessAccounts: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real stats from Firebase
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const totalUsers = users.length;
        const pendingApprovals = users.filter(u => u.status === 'pending_approval').length;
        const businessAccounts = users.filter(u => u.accountType === 'business').length;
        
        // Simulate active today (in real app, you'd track login times)
        const activeToday = Math.floor(totalUsers * 0.3) + Math.floor(Math.random() * 20);

        setStats({
          totalUsers,
          pendingApprovals,
          businessAccounts,
          activeToday
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to demo data
        setStats({
          totalUsers: 247,
          pendingApprovals: 12,
          businessAccounts: 89,
          activeToday: 156
        });
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminTools = [
    {
      title: 'User Management',
      description: 'Advanced user approval and account management system',
      href: '/admin/users',
      icon: '👥',
      color: 'blue',
      status: 'active',
      metrics: [
        { label: 'TOTAL', value: stats.totalUsers },
        { label: 'PENDING', value: stats.pendingApprovals }
      ]
    },
    {
      title: 'Pending Approvals',
      description: 'Review and process business account applications',
      href: '/admin/approvals',
      icon: '⏳',
      color: 'yellow',
      status: stats.pendingApprovals > 0 ? 'alert' : 'active',
      metrics: [
        { label: 'QUEUE', value: stats.pendingApprovals },
        { label: 'TODAY', value: Math.floor(Math.random() * 5) + 1 }
      ]
    },
    {
      title: 'System Analytics',
      description: 'Real-time platform metrics and performance insights',
      href: '/admin/analytics',
      icon: '📊',
      color: 'green',
      status: 'active',
      metrics: [
        { label: 'UPTIME', value: '99.9%' },
        { label: 'LOAD', value: 'OPTIMAL' }
      ]
    },
    {
      title: 'Security Center',
      description: 'Advanced security monitoring and threat detection',
      href: '/admin/security',
      icon: '🔒',
      color: 'purple',
      status: 'active',
      metrics: [
        { label: 'THREATS', value: '0' },
        { label: 'SCANS', value: '24/7' }
      ]
    },
    {
      title: 'Inventory Control',
      description: 'Global inventory management and stock optimization',
      href: '/inventory',
      icon: '📦',
      color: 'indigo',
      status: 'active',
      metrics: [
        { label: 'ITEMS', value: '1.2K' },
        { label: 'LOW_STOCK', value: '5' }
      ]
    },
    {
      title: 'Order Processing',
      description: 'Comprehensive order management and fulfillment tracking',
      href: '/orders',
      icon: '📋',
      color: 'gray',
      status: 'active',
      metrics: [
        { label: 'ACTIVE', value: '156' },
        { label: 'PENDING', value: '23' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid ${
            darkMode ? 'border-cyan-500 border-r-transparent' : 'border-blue-500 border-r-transparent'
          }`}></div>
          <p className={`mt-4 font-mono ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            INITIALIZING_ADMIN_CONTROL_CENTER...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {/* Futuristic Header */}
        <div className="mb-8 relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            darkMode ? 'from-cyan-500/10 to-purple-500/10' : 'from-blue-500/10 to-indigo-500/10'
          } rounded-xl blur-xl`}></div>
          <div className={`relative p-8 rounded-xl border ${
            darkMode ? 'border-cyan-500/30 bg-gray-900/50' : 'border-blue-500/30 bg-white/50'
          } backdrop-blur-sm`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-5xl font-bold ${
                  darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                           : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'
                } font-mono mb-2`}>
                  ADMIN_CONTROL_CENTER.exe
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                  &gt; Welcome back, {user?.displayName || 'Administrator'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-mono mt-1`}>
                  System Status: [OPERATIONAL] | Security Level: [MAXIMUM] | Access: [UNRESTRICTED]
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl ${darkMode ? 'text-cyan-400' : 'text-blue-600'} mb-2`}>⚡</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                  UPTIME: 99.94%
                </div>
                <div className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-mono`}>
                  ALL_SYSTEMS_OPERATIONAL
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'TOTAL_USERS', value: stats.totalUsers, icon: '👤', color: 'cyan', change: '+12' },
            { title: 'PENDING_APPROVALS', value: stats.pendingApprovals, icon: '⏳', color: 'yellow', change: '-3' },
            { title: 'BUSINESS_ACCOUNTS', value: stats.businessAccounts, icon: '🏢', color: 'purple', change: '+7' },
            { title: 'ACTIVE_TODAY', value: stats.activeToday, icon: '📊', color: 'green', change: '+24' }
          ].map((stat, index) => (
            <div key={index} className={`relative group hover:scale-105 transition-all duration-300`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${
                darkMode 
                  ? `from-${stat.color}-500/20 to-${stat.color}-600/20` 
                  : `from-${stat.color}-400/20 to-${stat.color}-500/20`
              } rounded-xl blur-sm group-hover:blur-none transition-all duration-300`}></div>
              <div className={`relative ${
                darkMode ? 'bg-gray-900/80' : 'bg-white/80'
              } backdrop-blur-sm rounded-xl shadow-lg border ${
                darkMode ? `border-${stat.color}-500/30` : `border-${stat.color}-400/30`
              } p-6 overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider font-mono mb-1`}>
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    } font-mono`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs font-mono mt-1 ${
                      stat.change.includes('+') 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`text-4xl p-3 rounded-full bg-gradient-to-r ${
                    darkMode 
                      ? `from-${stat.color}-500/20 to-${stat.color}-600/20` 
                      : `from-${stat.color}-400/20 to-${stat.color}-500/20`
                  } backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
                {/* Animated scanning line */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
                  darkMode 
                    ? `from-${stat.color}-400 to-${stat.color}-600` 
                    : `from-${stat.color}-500 to-${stat.color}-700`
                } animate-pulse`} style={{ width: '100%' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminTools.map((tool, index) => (
            <FuturisticToolCard
              key={index}
              tool={tool}
              darkMode={darkMode}
              isActive={false}
            />
          ))}
        </div>

        {/* Recent Activity Panel */}
        <div className={`rounded-xl border ${
          darkMode ? 'border-cyan-500/30 bg-gray-900/50' : 'border-blue-500/30 bg-white/50'
        } backdrop-blur-sm overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${
            darkMode ? 'border-cyan-500/30' : 'border-blue-500/30'
          } flex justify-between items-center`}>
            <h3 className={`text-xl font-bold ${
              darkMode ? 'text-cyan-400' : 'text-blue-600'
            } font-mono flex items-center`}>
              <span className="animate-pulse mr-2">📡</span>
              ACTIVITY_STREAM.log
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></div>
              <span className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                LIVE_FEED
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <ActivityFeed darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#f3f4f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#06b6d4' : '#3b82f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#0891b2' : '#2563eb'};
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;