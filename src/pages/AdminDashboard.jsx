// src/pages/AdminDashboard.jsx - ULTIMATE ENHANCED VERSION with New Panel Integration
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, doc, deleteDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';

// ===============================================
// ENHANCED CALENDAR COMPONENT
// ===============================================
const ActivityCalendar = ({ data, darkMode, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    const processedData = {};
    data.forEach(item => {
      const dateKey = item.date?.toDateString() || new Date().toDateString();
      if (!processedData[dateKey]) {
        processedData[dateKey] = { orders: 0, revenue: 0, users: 0, activities: [] };
      }
      processedData[dateKey].orders += item.orders || 0;
      processedData[dateKey].revenue += item.revenue || 0;
      processedData[dateKey].users += item.users || 0;
      processedData[dateKey].activities.push(item);
    });
    setCalendarData(processedData);
  }, [data]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getIntensity = (date) => {
    if (!date) return 0;
    const dateKey = date.toDateString();
    const dayData = calendarData[dateKey];
    if (!dayData) return 0;
    
    const maxRevenue = Math.max(...Object.values(calendarData).map(d => d.revenue));
    return maxRevenue > 0 ? (dayData.revenue / maxRevenue) : 0;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect?.(date, calendarData[date?.toDateString()]);
  };

  const navigateMonth = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'ACTIVITY MATRIX' : 'Activity Calendar'}
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => navigateMonth(-1)}
            className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} p-2`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
          <span className={`text-lg font-bold ${darkMode ? 'text-cyan-400 cyber-glow' : 'text-indigo-600'} px-4`}>
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
          <motion.button
            onClick={() => navigateMonth(1)}
            className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} p-2`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className={`text-center text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-2`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(selectedDate).map((date, index) => {
            const intensity = getIntensity(date);
            const dayData = date ? calendarData[date.toDateString()] : null;
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isSelected = date && date.toDateString() === selectedDate.toDateString();

            return (
              <motion.div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center text-xs cursor-pointer relative overflow-hidden ${
                  !date ? 'invisible' : 
                  isSelected ? 
                    darkMode ? 'bg-cyan-600 text-black' : 'bg-indigo-600 text-white' :
                  isToday ?
                    darkMode ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-400' : 'bg-indigo-100 text-indigo-800 border border-indigo-400' :
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                } rounded transition-all duration-200`}
                style={{
                  backgroundColor: !isSelected && !isToday && intensity > 0 ? 
                    darkMode ? `rgba(0, 255, 255, ${intensity * 0.3})` : `rgba(79, 70, 229, ${intensity * 0.3})` : 
                    undefined
                }}
                onClick={() => date && handleDateClick(date)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                {date && (
                  <>
                    <span className="font-bold">{date.getDate()}</span>
                    {dayData && (
                      <div className="flex flex-col items-center">
                        <span className="text-xs opacity-75">{dayData.orders}</span>
                        <span className="text-xs opacity-75">${Math.round(dayData.revenue)}</span>
                      </div>
                    )}
                    {intensity > 0.5 && (
                      <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${
                        darkMode ? 'bg-cyan-400' : 'bg-indigo-500'
                      } animate-pulse`}></div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedDate && calendarData[selectedDate.toDateString()] && (
        <motion.div 
          className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} relative z-10`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'} mb-2`}>
            {selectedDate.toLocaleDateString()}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Orders:</span>
              <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {calendarData[selectedDate.toDateString()].orders}
              </span>
            </div>
            <div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Revenue:</span>
              <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${calendarData[selectedDate.toDateString()].revenue.toFixed(2)}
              </span>
            </div>
            <div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Users:</span>
              <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {calendarData[selectedDate.toDateString()].users}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ===============================================
// ENHANCED ADMIN PANEL QUICK ACCESS
// ===============================================
const AdminPanelAccess = ({ darkMode }) => {
  const navigate = useNavigate();

  const adminPanels = [
    {
      title: 'User Management',
      description: 'Advanced user control and role assignment',
      path: '/admin/users',
      icon: '👥',
      color: 'blue',
      stats: { total: 247, pending: 12 }
    },
    {
      title: 'User Approvals',
      description: 'Review and process account applications',
      path: '/admin/approvals',
      icon: '⏳',
      color: 'yellow',
      stats: { pending: 8, today: 3 }
    },
    {
      title: 'System Settings',
      description: 'Configure system parameters',
      path: '/admin/settings',
      icon: '⚙️',
      color: 'purple',
      stats: { configs: 24, modified: 3 }
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time metrics and insights',
      path: '/admin/analytics',
      icon: '📊',
      color: 'green',
      stats: { revenue: '$89K', orders: 1523 }
    },
    {
      title: 'Security Center',
      description: 'Monitor threats and system security',
      path: '/admin/security',
      icon: '🔒',
      color: 'red',
      stats: { alerts: 2, blocked: 15 }
    },
    {
      title: 'Legacy Panel',
      description: 'Traditional admin features',
      path: '/admin/panel',
      icon: '🏛️',
      color: 'gray',
      stats: { version: 'v1.0', status: 'OK' }
    }
  ];

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-6 relative z-10`}>
        {darkMode ? 'ADMIN CONTROL MATRIX' : 'Admin Panel Access'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {adminPanels.map((panel, index) => (
          <motion.div
            key={panel.path}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
              darkMode 
                ? `bg-gray-700/50 hover:bg-gray-700 border-${panel.color}-500/30 hover:border-${panel.color}-500/60` 
                : `bg-gray-50 hover:bg-gray-100 border-${panel.color}-200 hover:border-${panel.color}-400`
            }`}
            onClick={() => navigate(panel.path)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">{panel.icon}</div>
              <div className={`w-3 h-3 rounded-full bg-${panel.color}-500 animate-pulse`}></div>
            </div>
            
            <h4 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {panel.title}
            </h4>
            
            <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {panel.description}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(panel.stats).map(([key, value]) => (
                <div key={key} className={`p-2 rounded ${darkMode ? 'bg-gray-600/50' : 'bg-white/50'}`}>
                  <div className={`font-bold ${darkMode ? 'text-cyan-400' : `text-${panel.color}-600`}`}>
                    {value}
                  </div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                    {key}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-3 py-2 px-3 rounded text-center text-xs font-bold transition-all ${
              darkMode
                ? `text-${panel.color}-400 hover:bg-${panel.color}-500/20`
                : `text-${panel.color}-600 hover:bg-${panel.color}-500/10`
            }`}>
              ACCESS PANEL →
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ===============================================
// SYSTEM STATUS MONITOR
// ===============================================
const SystemStatusMonitor = ({ darkMode }) => {
  const [systemStatus, setSystemStatus] = useState({
    database: 'operational',
    api: 'operational', 
    storage: 'operational',
    auth: 'operational',
    cache: 'warning',
    backup: 'operational'
  });

  const services = [
    { name: 'DATABASE', key: 'database', icon: '🗄️', description: 'Firebase Firestore' },
    { name: 'API_GATEWAY', key: 'api', icon: '🔌', description: 'REST API Services' },
    { name: 'FILE_STORAGE', key: 'storage', icon: '📁', description: 'Firebase Storage' },
    { name: 'AUTHENTICATION', key: 'auth', icon: '🔐', description: 'Firebase Auth' },
    { name: 'CACHE_LAYER', key: 'cache', icon: '⚡', description: 'Redis Cache' },
    { name: 'BACKUP_SYSTEM', key: 'backup', icon: '💾', description: 'Automated Backups' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'maintenance': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-6 relative z-10`}>
        {darkMode ? 'SYSTEM STATUS MATRIX' : 'System Health Monitor'}
      </h3>

      <div className="space-y-3 relative z-10">
        {services.map((service, index) => (
          <motion.div
            key={service.key}
            className={`flex items-center justify-between p-3 rounded-lg ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            } transition-all hover:scale-102`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{service.icon}</span>
              <div>
                <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {service.name}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-${getStatusColor(systemStatus[service.key])}-500 animate-pulse`}></div>
              <span className={`text-xs font-bold px-2 py-1 rounded bg-${getStatusColor(systemStatus[service.key])}-500/20 text-${getStatusColor(systemStatus[service.key])}-500`}>
                {systemStatus[service.key].toUpperCase()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        darkMode ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
      } relative z-10`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className={`font-bold text-sm ${
            darkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            {darkMode ? 'ALL NEURAL SYSTEMS OPERATIONAL' : 'ALL SYSTEMS OPERATIONAL'}
          </span>
        </div>
        <div className={`text-center text-xs mt-1 ${
          darkMode ? 'text-green-500' : 'text-green-700'
        }`}>
          UPTIME: 99.98% • LAST UPDATE: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

// ===============================================
// MAIN ENHANCED ADMIN DASHBOARD
// ===============================================
const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Enhanced state management
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    allOrders: [],
    users: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Generate enhanced demo data
  const generateEnhancedDemoData = useCallback(() => {
    const now = new Date();
    const demoData = {
      calendarData: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        return {
          date,
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          users: Math.floor(Math.random() * 20) + 5
        };
      })
    };
    
    return demoData;
  }, []);

  const [demoData] = useState(() => generateEnhancedDemoData());

  // Original data fetching logic (preserved)
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      return users;
    } catch (error) {
      console.log('No users collection found, creating demo users');
      return [
        {
          id: 'demo-admin-1',
          email: 'admin@company.com',
          displayName: 'Admin User',
          role: 'admin',
          accountType: 'admin',
          active: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-manager-1',
          email: 'manager@company.com',
          displayName: 'Manager User',
          role: 'manager',
          accountType: 'manager',
          active: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-business-buyer-1',
          email: 'buyer@company.com',
          displayName: 'Business Buyer',
          role: 'business',
          accountType: 'business',
          businessType: 'buyer',
          active: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ];
    }
  };

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        
        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lowStock = products.filter(product => product.stock <= 10).length;
        
        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            total: data.total || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
          };
        });
        
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        
        // Fetch users
        const users = await fetchUsers();
        
        setStats({
          totalUsers: users.length,
          totalOrders: allOrders.length,
          totalRevenue,
          totalProducts: products.length,
          lowStockProducts: lowStock,
          pendingOrders,
          allOrders,
          users
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data');
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDateSelect = (date, data) => {
    showNotification(
      `${darkMode ? 'DATE SELECTED:' : 'Selected:'} ${date?.toLocaleDateString()} - ${data?.orders || 0} orders, $${data?.revenue?.toFixed(2) || '0.00'} revenue`,
      'success'
    );
  };

  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => !prev);
    showNotification(
      `${darkMode ? 'REAL-TIME MODE' : 'Real-time updates'} ${!realTimeEnabled ? 'enabled' : 'disabled'}`,
      'success'
    );
  }, [realTimeEnabled, darkMode]);

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    showNotification(darkMode ? 'NEURAL DATA REFRESHED' : 'Data refreshed successfully', 'success');
  }, [darkMode]);

  // Enhanced stat cards
  const statCards = useMemo(() => [
    { 
      title: darkMode ? 'NEURAL ENTITIES' : 'Total Users', 
      value: stats.totalUsers, 
      icon: '👥', 
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: darkMode ? 'TRANSACTIONS' : 'Total Orders', 
      value: stats.totalOrders, 
      icon: '📦', 
      color: 'green',
      change: '+8%',
      trend: 'up'
    },
    { 
      title: darkMode ? 'REVENUE MATRIX' : 'Total Revenue', 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      icon: '💰', 
      color: 'indigo',
      change: '+15%',
      trend: 'up'
    },
    { 
      title: darkMode ? 'PENDING TASKS' : 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: '⏳', 
      color: 'yellow',
      change: '-5%',
      trend: 'down'
    }
  ], [stats, darkMode]);

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'} relative`}>
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
              {darkMode ? 'INITIALIZING NEURAL MATRIX...' : 'Loading Dashboard...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'} relative`}>
        <div className="fixed inset-0 pointer-events-none z-0">
          <SecretInvasionBackground intensity={0.3} enableGlitch={darkMode} />
        </div>
        
        <motion.div 
          className="text-center py-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4 animate-bounce">⚠️</div>
          <p className="text-red-500 text-lg font-bold mb-4">{error}</p>
          <motion.button 
            onClick={() => window.location.reload()} 
            className={`${darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn neumorph-btn-primary'} px-6 py-3`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {darkMode ? 'RETRY NEURAL CONNECTION' : 'Retry'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'} relative`}>
      {/* SecretInvasion Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <SecretInvasionBackground 
          intensity={darkMode ? 0.8 : 0.6} 
          enableGlitch={darkMode} 
        />
      </div>

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

      {/* Enhanced Header */}
      <motion.div 
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900 neumorph-title'} mb-2`}>
              {darkMode ? 'NEURAL COMMAND CENTER' : 'Enhanced Admin Dashboard'}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
              {darkMode 
                ? 'ADVANCED NEURAL INTERFACE WITH QUANTUM ANALYTICS AND REAL-TIME MONITORING' 
                : 'Comprehensive analytics, real-time monitoring, and advanced panel management'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className={`text-sm rounded ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border px-3 py-2`}
            >
              <option value="24h">{darkMode ? '24H CYCLE' : 'Last 24 Hours'}</option>
              <option value="7d">{darkMode ? '7D MATRIX' : 'Last 7 Days'}</option>
              <option value="30d">{darkMode ? '30D NEURAL' : 'Last 30 Days'}</option>
              <option value="90d">{darkMode ? '90D QUANTUM' : 'Last 90 Days'}</option>
            </select>
            
            <span className={`text-sm ${darkMode ? 'text-gray-400 cyber-title' : 'text-gray-500'} font-medium`}>
              {darkMode ? 'LAST SYNC: ' : 'Updated: '}{lastUpdated.toLocaleTimeString()}
            </span>
            
            {/* Real-time toggle */}
            <div className="flex items-center">
              <motion.button 
                onClick={toggleRealTime}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 ${
                  realTimeEnabled 
                    ? darkMode ? 'border-cyan-500 bg-cyan-600' : 'border-indigo-600 bg-indigo-600' 
                    : darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-200'
                } transition-colors duration-200 ease-in-out`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    realTimeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                  layout
                />
              </motion.button>
              <span className={`ml-2 text-sm font-bold ${darkMode ? 'cyber-title' : ''}`}>
                {realTimeEnabled 
                  ? darkMode ? 'LIVE' : 'Live' 
                  : darkMode ? 'STATIC' : 'Static'
                }
              </span>
            </div>
            
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn'} p-2 rounded-full`}
              onClick={handleRefresh}
              whileHover={{ scale: 1.05, rotateZ: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
            
            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <AnimatePresence>
          {statCards.map((stat, index) => (
            <motion.div 
              key={index}
              className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {darkMode && <div className="card-glow"></div>}
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400 cyber-title' : 'text-gray-500'} uppercase tracking-wide font-bold mb-1`}>
                    {stat.title}
                  </p>
                  <motion.p 
                    className={`text-3xl font-bold ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}
                    key={stat.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.value}
                  </motion.p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-bold ${
                      stat.trend === 'up' 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} ml-2`}>
                      vs last period
                    </span>
                  </div>
                </div>
                <motion.div 
                  className={`text-5xl p-4 rounded-2xl ${
                    darkMode ? `bg-${stat.color}-900/30` : `bg-${stat.color}-100`
                  } group-hover:scale-110 transition-transform duration-300`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotateZ: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {stat.icon}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column - Calendar & Admin Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Activity Calendar */}
          <ActivityCalendar 
            data={demoData.calendarData} 
            darkMode={darkMode} 
            onDateSelect={handleDateSelect}
          />
          
          {/* NEW: Admin Panel Quick Access */}
          <AdminPanelAccess darkMode={darkMode} />
        </div>

        {/* Right Column - System Status */}
        <div className="space-y-8">
          <SystemStatusMonitor darkMode={darkMode} />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        className={`fixed bottom-6 left-6 ${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative z-50`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center gap-3 relative z-10">
          <span className={`text-sm font-bold ${darkMode ? 'cyber-title text-cyan-400' : 'text-gray-700'}`}>
            {darkMode ? 'QUICK ACCESS' : 'Quick Actions'}
          </span>
          <motion.button 
            className={`${darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn'} px-3 py-1 text-xs`}
            onClick={() => navigate('/admin/users')}
            whileHover={{ scale: 1.05 }}
          >
            Users
          </motion.button>
          <motion.button 
            className={`${darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn'} px-3 py-1 text-xs`}
            onClick={() => navigate('/admin/analytics')}
            whileHover={{ scale: 1.05 }}
          >
            Analytics
          </motion.button>
          <motion.button 
            className={`${darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn'} px-3 py-1 text-xs`}
            onClick={() => navigate('/admin/security')}
            whileHover={{ scale: 1.05 }}
          >
            Security
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;