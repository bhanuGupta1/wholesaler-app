// src/pages/AdminDashboard.jsx - ENHANCED WITH SIDEBAR
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
  ChevronLeft
} from 'lucide-react';

// ===============================================
// SKELETON LOADER COMPONENT
// ===============================================
const SkeletonLoader = ({ className = "h-4 w-full", darkMode = false }) => (
  <div className={`animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded ${className}`} />
);

// ===============================================
// ENHANCED SIDEBAR COMPONENT
// ===============================================
const AdminSidebar = ({ darkMode, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Main',
      items: [
        { 
          icon: Home, 
          label: 'Dashboard', 
          path: '/admin/dashboard',
          description: 'Overview & Analytics'
        },
        { 
          icon: Users, 
          label: 'User Management', 
          path: '/admin/users',
          description: 'Manage Users'
        },
        { 
          icon: UserCheck, 
          label: 'Approvals', 
          path: '/admin/approvals',
          description: 'Pending Approvals'
        },
        { 
          icon: Briefcase, 
          label: 'Deal Management', 
          path: '/admin/deals',
          description: 'Manage Deals & Offers'
        }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { 
          icon: BarChart3, 
          label: 'Analytics', 
          path: '/admin/analytics',
          description: 'Detailed Analytics'
        },
        { 
          icon: FileText, 
          label: 'Reports', 
          path: '/admin/reports',
          description: 'Generate Reports'
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          icon: Shield, 
          label: 'Security', 
          path: '/admin/security',
          description: 'Security Settings'
        },
        { 
          icon: Settings, 
          label: 'Settings', 
          path: '/admin/settings',
          description: 'System Settings'
        }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-full ${
          isCollapsed ? 'w-20' : 'w-80'
        } ${
          darkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'
        } z-50 transition-all duration-300 lg:translate-x-0 lg:static lg:z-30`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <motion.h2 
                className={`text-xl font-bold ${
                  darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'
                } ${isCollapsed ? 'hidden' : ''}`}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
              >
                {darkMode ? 'NEURAL CONTROL' : 'Admin Panel'}
              </motion.h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`p-2 rounded-lg transition-colors hidden lg:block ${
                    darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-colors lg:hidden ${
                    darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            {menuItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                {!isCollapsed && (
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <motion.button
                        key={itemIndex}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? darkMode 
                              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30' 
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            : darkMode
                              ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${
                          isActive && darkMode ? 'text-cyan-400' : ''
                        }`} />
                        
                        {!isCollapsed && (
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className={`text-xs ${
                              darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        
                        {!isCollapsed && isActive && (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <motion.button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-red-900/20 text-gray-300 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-700 hover:text-red-600'
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// ===============================================
// BREADCRUMB NAVIGATION
// ===============================================
const Breadcrumb = ({ darkMode }) => (
  <nav className="flex items-center space-x-2 text-sm mb-4">
    <Link to="/" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
      Home
    </Link>
    <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</span>
    <span className={darkMode ? 'text-white' : 'text-gray-900'}>Admin Dashboard</span>
  </nav>
);

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
// ENHANCED FILTER DROPDOWN WITH PROPER Z-INDEX
// ===============================================
const FilterDropdown = ({ title, options, selected, onSelect, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
          darkMode 
            ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } transition-colors`}
      >
        <Filter className="h-4 w-4" />
        <span className="text-sm">{title}: {selected}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full left-0 mt-2 w-48 rounded-lg border shadow-xl z-50 ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="py-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selected === option
                        ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===============================================
// REAL PERFORMANCE RADAR CHART (FROM ORIGINAL)
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

        // Calculate performance metrics based on real data
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

  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 40;
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
    const labelRadius = radius + 25;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  };

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <Activity className="h-12 w-12 mx-auto mb-2" />
            <div>Loading performance radar...</div>
          </div>
        </div>
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
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 text-center relative z-10`}>
        {darkMode ? 'SYSTEM PERFORMANCE MATRIX' : 'Performance Radar'}
      </h3>
      
      {!hasData ? (
        <div className="text-center py-8 relative z-10">
          <div className="text-4xl mb-2 opacity-50">📡</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available - Add users and orders to see performance
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center relative z-10">
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
                  r="4"
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
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs relative z-10">
            {radarData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.name}:</span>
                <span className={`font-bold ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

// ===============================================
// REAL MONTHLY REVENUE CHART (FROM ORIGINAL)
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

        // Group orders by month
        const monthlyRevenue = {};
        const currentYear = new Date().getFullYear();
        
        // Initialize all months
        for (let i = 0; i < 12; i++) {
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
          monthlyRevenue[monthName] = 0;
        }

        // Sum revenue by month
        orders.forEach(order => {
          const monthName = order.createdAt.toLocaleDateString('en-US', { month: 'short' });
          monthlyRevenue[monthName] += order.total;
        });

        const data = Object.entries(monthlyRevenue).map(([name, value]) => ({
          name,
          value: Math.round(value)
        }));

        setRevenueData(data);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueData(Array.from({ length: 12 }, (_, i) => ({
          name: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          value: 0
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const width = 300;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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
  
  const areaData = pathData + ` L ${xScale(revenueData.length - 1)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`;

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <TrendingUp className="h-12 w-12 mx-auto mb-2" />
            <div>Loading revenue data...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const hasRevenue = revenueData.some(item => item.value > 0);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {darkMode ? 'REVENUE TEMPORAL MATRIX' : 'Monthly Revenue'}
      </h3>
      
      {!hasRevenue ? (
        <div className="text-center py-8 relative z-10">
          <div className="text-4xl mb-2 opacity-50">📈</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No revenue data - Add orders to see monthly trends
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center relative z-10">
            <svg width={width} height={height}>
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={darkMode ? "rgba(0, 255, 255, 0.6)" : "rgba(79, 70, 229, 0.6)"} />
                  <stop offset="100%" stopColor={darkMode ? "rgba(0, 255, 255, 0.1)" : "rgba(79, 70, 229, 0.1)"} />
                </linearGradient>
              </defs>
              
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((ratio, index) => (
                  <line
                    key={index}
                    x1={0}
                    y1={chartHeight * ratio}
                    x2={chartWidth}
                    y2={chartHeight * ratio}
                    stroke={darkMode ? "rgba(0, 255, 255, 0.1)" : "rgba(79, 70, 229, 0.1)"}
                    strokeWidth="1"
                  />
                ))}
                
                {/* Area */}
                <motion.path
                  d={areaData}
                  fill="url(#areaGradient)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
                
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
                    r="3"
                    fill={darkMode ? "#00FFFF" : "#4F46E5"}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </g>
            </svg>
          </div>
          
          {/* Month labels */}
          <div className="flex justify-between text-xs mt-2 relative z-10">
            {revenueData.slice(0, 6).map((item, index) => (
              <span key={index} className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.name}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

// ===============================================
// REAL USER ACTIVITY HEATMAP (FROM ORIGINAL)
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
          
          // Count activities for this day
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
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <Activity className="h-12 w-12 mx-auto mb-2" />
            <div>Loading activity heatmap...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const maxActivity = Math.max(...heatmapData.map(d => d.activity), 1);

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {darkMode ? 'NEURAL ACTIVITY HEATMAP' : 'User Activity Heatmap'}
      </h3>
      
      {maxActivity === 1 && heatmapData[0].activity === 0 ? (
        <div className="text-center py-8 relative z-10">
          <div className="text-4xl mb-2 opacity-50">🔥</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No activity data - Users will appear here when they log in
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2 relative z-10">
          {heatmapData.map((item, index) => {
            const intensity = item.activity / maxActivity;
            
            return (
              <motion.div
                key={index}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer`}
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
                <span className="text-xs mb-1">{item.day}</span>
                <span className="text-lg">{item.activity}</span>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs relative z-10">
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {darkMode ? 'LESS ACTIVE' : 'Less active'}
        </span>
        <div className="flex gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: darkMode 
                  ? `rgba(0, 255, 255, ${intensity})`
                  : `rgba(79, 70, 229, ${intensity})`
              }}
            />
          ))}
        </div>
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {darkMode ? 'MORE ACTIVE' : 'More active'}
        </span>
      </div>
    </motion.div>
  );
};

// ===============================================
// REAL ACTIVITY FEED (FROM ORIGINAL)
// ===============================================
const RealActivityFeed = ({ darkMode }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetch recent user activities
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(10))
        );
        
        const realActivities = [];
        
        usersSnapshot.docs.forEach((doc, index) => {
          const userData = doc.data();
          const createdAt = userData.createdAt?.toDate();
          
          if (createdAt) {
            // User registration activity
            realActivities.push({
              id: `user-created-${index}`,
              type: 'user',
              title: 'New User Registration',
              description: `${userData.email} joined the platform`,
              timestamp: formatTimeAgo(createdAt),
              value: '+1'
            });
            
            // Status change activities
            if (userData.status && userData.updatedAt) {
              let title = 'User Status Updated';
              let description = `${userData.email} status changed to ${userData.status}`;
              
              if (userData.status === 'approved') {
                title = 'User Approved';
                description = `${userData.email} account approved`;
              } else if (userData.status === 'suspended') {
                title = 'User Suspended';
                description = `${userData.email} account suspended`;
              }
              
              realActivities.push({
                id: `user-updated-${index}`,
                type: 'system',
                title,
                description,
                timestamp: formatTimeAgo(userData.updatedAt.toDate())
              });
            }
          }
        });

        // Sort by most recent first
        realActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(realActivities.slice(0, 8));
        
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
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤';
      case 'order': return '📦';
      case 'system': return '⚙️';
      case 'revenue': return '💰';
      default: return '📡';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return darkMode ? 'text-cyan-400' : 'text-blue-600';
      case 'order': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'system': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'revenue': return darkMode ? 'text-purple-400' : 'text-purple-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <motion.div 
        className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <Activity className="h-12 w-12 mx-auto mb-2" />
            <div>Loading activity feed...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'NEURAL ACTIVITY STREAM' : 'Activity Feed'}
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`text-xs rounded ${
            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
          } border px-2 py-1`}
        >
          <option value="all">{darkMode ? 'ALL ACTIVITIES' : 'All'}</option>
          <option value="user">{darkMode ? 'USER EVENTS' : 'Users'}</option>
          <option value="order">{darkMode ? 'ORDER EVENTS' : 'Orders'}</option>
          <option value="system">{darkMode ? 'SYSTEM EVENTS' : 'System'}</option>
        </select>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto relative z-10">
        <AnimatePresence>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className={`text-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {activity.title}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {activity.description}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    {activity.timestamp}
                  </p>
                </div>
                {activity.value && (
                  <div className={`text-sm font-bold ${getActivityColor(activity.type)}`}>
                    {activity.value}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">📡</div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {darkMode ? 'NO NEURAL ACTIVITIES DETECTED' : 'No activities found'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ===============================================
// REAL PERFORMANCE METRICS (FROM ORIGINAL)
// ===============================================
const RealPerformanceMetrics = ({ darkMode }) => {
  const [metrics, setMetrics] = useState({
    systemLoad: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      // Simulate real-time performance metrics
      setMetrics({
        systemLoad: Math.floor(Math.random() * 30) + 20, // 20-50%
        memoryUsage: Math.floor(Math.random() * 25) + 45, // 45-70%
        networkLatency: Math.floor(Math.random() * 50) + 10, // 10-60ms
        errorRate: Math.random() * 2 // 0-2%
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, type) => {
    if (type === 'load' || type === 'memory') {
      return value < 60 ? 'green' : value < 80 ? 'yellow' : 'red';
    } else if (type === 'latency') {
      return value < 30 ? 'green' : value < 50 ? 'yellow' : 'red';
    } else if (type === 'error') {
      return value < 1 ? 'green' : value < 2 ? 'yellow' : 'red';
    }
    return 'gray';
  };

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <Activity className="h-12 w-12 mx-auto mb-2" />
            <div>Loading performance metrics...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const performanceData = [
    { 
      label: darkMode ? 'SYSTEM LOAD' : 'System Load', 
      value: `${metrics.systemLoad}%`, 
      type: 'load', 
      icon: '⚡' 
    },
    { 
      label: darkMode ? 'MEMORY USAGE' : 'Memory Usage', 
      value: `${metrics.memoryUsage}%`, 
      type: 'memory', 
      icon: '🧠' 
    },
    { 
      label: darkMode ? 'NETWORK LATENCY' : 'Network Latency', 
      value: `${metrics.networkLatency}ms`, 
      type: 'latency', 
      icon: '🌐' 
    },
    { 
      label: darkMode ? 'ERROR RATE' : 'Error Rate', 
      value: `${metrics.errorRate.toFixed(2)}%`, 
      type: 'error', 
      icon: '⚠️' 
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
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {darkMode ? 'NEURAL PERFORMANCE MATRIX' : 'Performance Metrics'}
      </h3>
      
      <div className="space-y-4 relative z-10">
        {performanceData.map((item, index) => {
          const color = getStatusColor(
            parseFloat(item.value), 
            item.type
          );
          
          return (
            <motion.div 
              key={index}
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{item.icon}</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`font-bold text-${color}-500 mr-2`}>
                  {item.value}
                </span>
                <div className={`w-3 h-3 rounded-full bg-${color}-500 animate-pulse`}></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ===============================================
// REAL USER ANALYTICS CHART (FROM ORIGINAL)
// ===============================================
const RealUserAnalyticsChart = ({ darkMode }) => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            createdAt: data.createdAt?.toDate() || new Date(),
            status: data.status || 'active'
          };
        });

        // Group users by status
        const statusGroups = users.reduce((acc, user) => {
          const status = user.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const data = Object.entries(statusGroups).map(([status, count]) => ({
          name: status.replace('_', ' ').toUpperCase(),
          value: count,
          percentage: ((count / users.length) * 100).toFixed(1)
        }));

        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <div>Loading user analytics...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const colors = darkMode 
    ? ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF6600']
    : ['#4F46E5', '#7C3AED', '#DC2626', '#059669', '#D97706'];

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {darkMode ? 'USER STATUS MATRIX' : 'User Analytics'}
      </h3>
      
      {analyticsData.length === 0 ? (
        <div className="text-center py-8 relative z-10">
          <div className="text-4xl mb-2 opacity-50">📊</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No user data available
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {analyticsData.map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.percentage}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ===============================================
// ENHANCED METRICS CARD WITH ANIMATIONS
// ===============================================
const EnhancedMetricsCard = ({ title, value, change, icon: Icon, color, trend, darkMode, loading }) => {
  if (loading) {
    return (
      <motion.div 
        className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-20" darkMode={darkMode} />
            <SkeletonLoader className="h-8 w-16" darkMode={darkMode} />
            <SkeletonLoader className="h-3 w-12" darkMode={darkMode} />
          </div>
          <SkeletonLoader className="h-12 w-12 rounded-full" darkMode={darkMode} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400 cyber-title' : 'text-gray-600'} uppercase tracking-wide`}>
            {title}
          </p>
          <motion.p 
            className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {value}
          </motion.p>
          {change && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <motion.div 
          className={`p-3 rounded-lg ${
            darkMode ? `bg-${color}-900/30` : `bg-${color}-100`
          } group-hover:scale-110 transition-transform`}
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
          <Icon className={`h-6 w-6 ${darkMode ? `text-${color}-400` : `text-${color}-600`}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ===============================================
// ENHANCED ACTIVITY TIMELINE
// ===============================================
const EnhancedActivityTimeline = ({ activities, darkMode }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [filter, setFilter] = useState('All');

  const toggleExpanded = useCallback((id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'order':
        return 'blue';
      case 'inventory':
        return 'green';
      case 'user':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'All' || activity.type === filter.toLowerCase()
  );

  if (!activities || activities.length === 0) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'} relative z-10`}>
          {darkMode ? 'NEURAL ACTIVITY STREAM' : 'Recent Activity'}
        </h3>
        <div className="text-center py-8 relative z-10">
          <Activity className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {darkMode ? 'NO NEURAL ACTIVITIES DETECTED' : 'No recent activity'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'}`}>
          {darkMode ? 'NEURAL ACTIVITY STREAM' : 'Recent Activity'}
        </h3>
        <FilterDropdown
          title="Filter"
          options={['All', 'Orders', 'Inventory', 'Users']}
          selected={filter}
          onSelect={setFilter}
          darkMode={darkMode}
        />
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto relative z-10">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => {
            const isExpanded = expandedItems.has(activity.id);
            const color = getActivityColor(activity.type);
            
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                } transition-colors cursor-pointer`}
                onClick={() => toggleExpanded(activity.id)}
                whileHover={{ x: 5 }}
              >
                <div className={`p-2 rounded-full ${
                  darkMode ? `bg-${color}-900/30` : `bg-${color}-100`
                } flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activity.description}
                  </p>
                  
                  <AnimatePresence>
                    {isExpanded && activity.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-3 p-3 rounded-md ${
                          darkMode ? 'bg-gray-800 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {activity.details}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ===============================================
// ENHANCED ANALYTICS COMPONENT
// ===============================================
const EnhancedAnalytics = ({ darkMode }) => {
  const [analyticsData, setAnalyticsData] = useState({
    salesTrend: [],
    categoryDistribution: [],
    performanceMetrics: [],
    loading: true
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch orders for sales trend
        const ordersSnapshot = await getDocs(
          query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        );
        
        // Fetch products for category distribution
        const productsSnapshot = await getDocs(collection(db, 'products'));
        
        // Process sales trend data (last 7 days)
        const salesByDay = {};
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toDateString();
        }).reverse();

        last7Days.forEach(day => {
          salesByDay[day] = 0;
        });

        ordersSnapshot.docs.forEach(doc => {
          const order = doc.data();
          const orderDate = order.createdAt?.toDate?.()?.toDateString() || new Date().toDateString();
          if (salesByDay.hasOwnProperty(orderDate)) {
            salesByDay[orderDate] += order.total || 0;
          }
        });

        const salesTrend = last7Days.map(day => ({
          label: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.round(salesByDay[day])
        }));

        // Process category distribution
        const categoryCount = {};
        productsSnapshot.docs.forEach(doc => {
          const product = doc.data();
          const category = product.category || 'Uncategorized';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
          label: category,
          value: count
        }));

        // Performance metrics
        const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => {
          return sum + (doc.data().total || 0);
        }, 0);

        const avgOrderValue = ordersSnapshot.size > 0 ? totalRevenue / ordersSnapshot.size : 0;

        const performanceMetrics = [
          { label: 'Avg Order Value', value: Math.round(avgOrderValue) },
          { label: 'Total Products', value: productsSnapshot.size },
          { label: 'Total Orders', value: ordersSnapshot.size },
          { label: 'Revenue', value: Math.round(totalRevenue) }
        ];

        setAnalyticsData({
          salesTrend,
          categoryDistribution,
          performanceMetrics,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalyticsData();
  }, []);

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
          {darkMode && <div className="card-glow"></div>}
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'} relative z-10`}>
            {title}
          </h3>
          <div className="text-center py-8 relative z-10">
            <BarChart3 className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              No data available
            </p>
          </div>
        </div>
      );
    }

    const max = Math.max(...data.map(item => item.value));

    return (
      <div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'} relative z-10`}>
          {title}
        </h3>
        <div className="space-y-4 relative z-10">
          {data.map((item, index) => {
            const percentage = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}>
                    {item.value}
                  </span>
                </div>
                <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <motion.div 
                    className={`h-full rounded-full ${
                      darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  if (analyticsData.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
            {darkMode && <div className="card-glow"></div>}
            <SkeletonLoader className="h-6 w-32 mb-4" darkMode={darkMode} />
            <div className="space-y-3 relative z-10">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <SkeletonLoader className="h-4 w-20" darkMode={darkMode} />
                    <SkeletonLoader className="h-4 w-12" darkMode={darkMode} />
                  </div>
                  <SkeletonLoader className="h-3 w-full" darkMode={darkMode} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <SimpleBarChart 
        data={analyticsData.salesTrend} 
        title={darkMode ? "7-DAY SALES MATRIX" : "7-Day Sales Trend"} 
      />
      <SimpleBarChart 
        data={analyticsData.categoryDistribution} 
        title={darkMode ? "CATEGORY DISTRIBUTION" : "Product Categories"} 
      />
      <SimpleBarChart 
        data={analyticsData.performanceMetrics} 
        title={darkMode ? "KEY PERFORMANCE METRICS" : "Key Metrics"} 
      />
    </div>
  );
};

// ===============================================
// REAL-TIME ACTIVITY CALENDAR COMPONENT (KEPT FROM ORIGINAL)
// ===============================================
const RealActivityCalendar = ({ darkMode, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        // Fetch real user registrations and orders
        const [usersSnapshot, ordersSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders'))
        ]);

        const processedData = {};
        
        // Process user registrations
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const createdAt = userData.createdAt?.toDate();
          if (createdAt) {
            const dateKey = createdAt.toDateString();
            if (!processedData[dateKey]) {
              processedData[dateKey] = { orders: 0, revenue: 0, users: 0 };
            }
            processedData[dateKey].users += 1;
          }
        });

        // Process orders
        ordersSnapshot.docs.forEach(doc => {
          const orderData = doc.data();
          const createdAt = orderData.createdAt?.toDate();
          if (createdAt) {
            const dateKey = createdAt.toDateString();
            if (!processedData[dateKey]) {
              processedData[dateKey] = { orders: 0, revenue: 0, users: 0 };
            }
            processedData[dateKey].orders += 1;
            processedData[dateKey].revenue += orderData.total || 0;
          }
        });

        setCalendarData(processedData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

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
    return maxRevenue > 0 ? Math.min(dayData.revenue / maxRevenue, 1) : 0;
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

  if (loading) {
    return (
      <motion.div 
        className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <div>Loading calendar data...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      {/* Calendar Header */}
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

      {/* Calendar Grid */}
      <div className="relative z-10">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className={`text-center text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-2`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
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

      {/* Selected Date Info */}
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
// REAL SALES FUNNEL CHART (KEPT FROM ORIGINAL)
// ===============================================
const RealSalesFunnelChart = ({ darkMode }) => {
  const [funnelData, setFunnelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products'))
        ]);

        const totalUsers = usersSnapshot.size;
        const totalOrders = ordersSnapshot.size;
        const totalProducts = productsSnapshot.size;

        // Simulate funnel stages based on real data
        const estimatedVisitors = totalUsers * 10; // Assume 10x visitors vs registered users
        const productViews = Math.floor(estimatedVisitors * 0.75);
        const addToCart = Math.floor(productViews * 0.4);
        const checkout = Math.floor(addToCart * 0.4);
        const purchases = totalOrders;

        const data = [
          { name: 'Visitors', value: estimatedVisitors || 100 },
          { name: 'Product Views', value: productViews || 75 },
          { name: 'Add to Cart', value: addToCart || 30 },
          { name: 'Checkout', value: checkout || 12 },
          { name: 'Purchase', value: purchases || 8 }
        ];

        setFunnelData(data);
      } catch (error) {
        console.error('Error fetching funnel data:', error);
        // Fallback data if Firebase is empty
        setFunnelData([
          { name: 'Visitors', value: 0 },
          { name: 'Product Views', value: 0 },
          { name: 'Add to Cart', value: 0 },
          { name: 'Checkout', value: 0 },
          { name: 'Purchase', value: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <motion.div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
        {darkMode && <div className="card-glow"></div>}
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className={`text-center ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            <TrendingUp className="h-12 w-12 mx-auto mb-2" />
            <div>Loading sales funnel...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  const maxValue = Math.max(...funnelData.map(d => d.value));
  
  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {darkMode ? 'CONVERSION FUNNEL' : 'Sales Funnel'}
      </h3>
      
      {funnelData[0].value === 0 ? (
        <div className="text-center py-8 relative z-10">
          <div className="text-4xl mb-2 opacity-50">📊</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available - Add users and orders to see funnel
          </p>
        </div>
      ) : (
        <div className="space-y-2 relative z-10">
          {funnelData.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const conversionRate = index > 0 ? ((item.value / funnelData[index - 1].value) * 100).toFixed(1) : 100;
            const overallRate = ((item.value / funnelData[0].value) * 100).toFixed(1);
            
            return (
              <motion.div 
                key={item.name}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}>
                      {item.value.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      parseFloat(overallRate) >= 50 
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : parseFloat(overallRate) >= 25
                        ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {overallRate}%
                    </span>
                  </div>
                </div>
                
                <div className={`h-12 relative rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
                  <motion.div 
                    className={`h-full ${
                      index === 0 ? darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                      index === 1 ? darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      index === 2 ? darkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-pink-500 to-red-500' :
                      index === 3 ? darkMode ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gradient-to-r from-red-500 to-orange-500' :
                      darkMode ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                    } flex items-center justify-center`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    style={{
                      clipPath: index === funnelData.length - 1 ? 'none' : 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                    }}
                  >
                    <span className="text-white font-bold text-sm mix-blend-difference">
                      {index > 0 && `${conversionRate}%`}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// ===============================================
// MAIN ENHANCED ADMIN DASHBOARD WITH SIDEBAR
// ===============================================
const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Enhanced state management
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
  const [activities, setActivities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        value: `${stats.totalRevenue.toLocaleString()}`,
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

  // Fetch real Firebase data with enhanced processing
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all collections in parallel
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
          customerName: data.customerName || 'Unknown Customer',
          itemCount: data.itemCount || 0,
          ...data
        };
      });

      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length;

      // Generate enhanced activities from real data
      const recentActivities = [
        ...allOrders.slice(0, 3).map(order => ({
          id: `order-${order.id}`,
          type: 'order',
          action: 'New Order Placed',
          description: `Order #${order.id.substring(0, 8)} for ${order.total}`,
          timestamp: order.createdAt,
          details: `Customer: ${order.customerName}, Items: ${order.itemCount}`
        })),
        ...products.filter(p => (p.stock || 0) <= 10).slice(0, 2).map(product => ({
          id: `inventory-${product.id}`,
          type: 'inventory',
          action: 'Low Stock Alert',
          description: `${product.name} is running low`,
          timestamp: new Date(),
          details: `Current stock: ${product.stock} units, Threshold: 10 units`
        })),
        ...users.filter(u => u.status === 'pending' || u.status === 'pending_approval').slice(0, 2).map(user => ({
          id: `user-${user.id}`,
          type: 'user',
          action: 'User Registration',
          description: `${user.username || user.email || 'New user'} registered`,
          timestamp: user.createdAt ? user.createdAt.toDate() : new Date(),
          details: `Email: ${user.email}, Status: Pending approval`
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);

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

      setActivities(recentActivities);
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

  // Initial data fetch
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Enhanced notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDateSelect = (date, data) => {
    showNotification(
      `${darkMode ? 'DATE SELECTED:' : 'Selected:'} ${date?.toLocaleDateString()} - ${data?.orders || 0} orders, ${data?.revenue?.toFixed(2) || '0.00'} revenue`,
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

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAdminData();
    showNotification(darkMode ? 'NEURAL DATA REFRESHED' : 'Data refreshed successfully', 'success');
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchAdminData, darkMode]);

  // Export function
  const handleExportReport = useCallback(() => {
    const data = {
      stats,
      activities: activities.slice(0, 10),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(darkMode ? 'NEURAL REPORT EXPORTED' : 'Report exported successfully', 'success');
  }, [stats, activities, darkMode]);

  // Enhanced stat cards with real data
  const statCards = useMemo(() => [
    { 
      title: darkMode ? 'NEURAL ENTITIES' : 'Total Users', 
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
      title: darkMode ? 'PENDING TASKS' : 'Pending Approvals', 
      value: stats.pendingApprovals, 
      icon: Clock, 
      color: 'yellow',
      change: stats.pendingApprovals > 0 ? 'Action Required' : 'All Clear',
      trend: stats.pendingApprovals > 0 ? 'neutral' : 'up'
    }
  ], [processedStats, stats, darkMode]);

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
              {darkMode ? 'INITIALIZING NEURAL MATRIX...' : 'Loading Enhanced Dashboard...'}
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

      {/* Breadcrumb Navigation */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Breadcrumb darkMode={darkMode} />
      </motion.div>

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
                : 'Comprehensive analytics, real-time monitoring, and advanced data visualization'
              }
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400 cyber-title' : 'text-gray-500'} font-medium`}>
              {darkMode ? 'LAST SYNC: ' : 'Updated: '}{lastUpdated.toLocaleTimeString()}
              {realTimeEnabled && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Live
                </span>
              )}
            </span>
            
            <RealTimeToggle 
              enabled={realTimeEnabled} 
              onToggle={toggleRealTime} 
              darkMode={darkMode} 
            />
            
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh Data"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''} ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </motion.button>

            <motion.button
              onClick={handleExportReport}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Export Report"
            >
              <Download className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </motion.button>
            
            <ThemeToggle />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
          <FilterDropdown
            title="Status"
            options={['All', 'Active', 'Pending', 'Suspended']}
            selected={statusFilter}
            onSelect={setStatusFilter}
            darkMode={darkMode}
          />
          
          <FilterDropdown
            title="Activity"
            options={['All', 'Orders', 'Inventory', 'Users']}
            selected={activityFilter}
            onSelect={setActivityFilter}
            darkMode={darkMode}
          />
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <AnimatePresence>
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
        </AnimatePresence>
      </div>

      {/* Alert Section */}
      {(stats.lowStockProducts > 0 || stats.pendingApprovals > 0) && (
        <motion.div 
          className={`mb-8 p-4 rounded-xl border-l-4 ${
            darkMode 
              ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
          } relative z-10`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <div>
              <h3 className="font-medium">
                {darkMode ? 'SYSTEM ALERTS DETECTED' : 'Action Required'}
              </h3>
              <div className="mt-1 text-sm space-y-1">
                {stats.lowStockProducts > 0 && (
                  <p>{stats.lowStockProducts} products are running low on stock</p>
                )}
                {stats.pendingApprovals > 0 && (
                  <p>{stats.pendingApprovals} users are pending approval</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column - Calendar & Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Calendar */}
          <RealActivityCalendar 
            darkMode={darkMode} 
            onDateSelect={handleDateSelect}
          />
          
          {/* Enhanced Analytics Section */}
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-900'}`}>
              {darkMode ? 'NEURAL ANALYTICS MATRIX' : 'Analytics Overview'}
            </h2>
            <Suspense fallback={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}>
                    {darkMode && <div className="card-glow"></div>}
                    <SkeletonLoader className="h-6 w-32 mb-4" darkMode={darkMode} />
                    <div className="space-y-3 relative z-10">
                      {[...Array(4)].map((_, j) => (
                        <SkeletonLoader key={j} className="h-8 w-full" darkMode={darkMode} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }>
              <EnhancedAnalytics darkMode={darkMode} />
            </Suspense>
          </div>
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RealSalesFunnelChart darkMode={darkMode} />
            <RealPerformanceRadarChart darkMode={darkMode} />
            <RealMonthlyRevenueChart darkMode={darkMode} />
            <RealUserActivityHeatmap darkMode={darkMode} />
          </div>
        </div>

        {/* Right Column - Activity Feed & Performance */}
        <div className="space-y-8">
          <RealActivityFeed darkMode={darkMode} />
          <RealPerformanceMetrics darkMode={darkMode} />
          <RealUserAnalyticsChart darkMode={darkMode} />
        </div>

        {/* Right Column - Activity Feed & Quick Actions */}
        <div className="space-y-8">
          <EnhancedActivityTimeline activities={activities} darkMode={darkMode} />
          
          {/* Quick Actions Panel */}
          <motion.div 
            className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {darkMode && <div className="card-glow"></div>}
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-6 relative z-10`}>
              {darkMode ? 'NEURAL COMMAND INTERFACE' : 'Quick Actions'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { title: 'Manage Users', icon: Users, link: '/admin/users', color: 'blue' },
                { title: 'View Analytics', icon: BarChart3, link: '/admin/analytics', color: 'green' },
                { title: 'System Settings', icon: Settings, link: '/admin/settings', color: 'purple' },
                { title: 'Security Center', icon: Eye, link: '/admin/security', color: 'red' }
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={action.link}
                    className={`block p-4 rounded-lg border transition-all group ${
                      darkMode 
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:shadow-lg hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {action.title}
                        </h4>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {darkMode ? 'EXECUTE' : 'Manage'}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        darkMode ? `bg-${action.color}-900/30` : `bg-${action.color}-100`
                      } group-hover:scale-110 transition-transform`}>
                        <action.icon className={`h-4 w-4 ${
                          darkMode ? `text-${action.color}-400` : `text-${action.color}-600`
                        }`} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* System Status Panel */}
          <motion.div 
            className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {darkMode && <div className="card-glow"></div>}
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
              {darkMode ? 'SYSTEM STATUS' : 'System Health'}
            </h3>
            
            <div className="space-y-3 relative z-10">
              {[
                { label: darkMode ? 'DATABASE' : 'Database', status: 'online', color: 'green' },
                { label: darkMode ? 'API' : 'API', status: 'online', color: 'green' },
                { label: darkMode ? 'STORAGE' : 'Storage', status: 'online', color: 'green' },
                { label: darkMode ? 'CACHE' : 'Cache', status: 'optimal', color: 'blue' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  <div className="flex items-center">
                    <span className={`text-xs font-bold text-${item.color}-500 mr-2`}>
                      {item.status.toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500 animate-pulse`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Quick Actions Panel (Bottom) */}
      <motion.div 
        className={`fixed bottom-6 left-6 ${darkMode ? 'cyber-card' : 'neumorph-card'} p-4 relative z-50`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        {darkMode && <div className="card-glow"></div>}
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <span className={`text-sm font-bold ${darkMode ? 'cyber-title text-cyan-400' : 'text-gray-700'}`}>
              {darkMode ? 'QUICK ACCESS MATRIX' : 'Quick Actions'}
            </span>
          </div>
          
          {/* Primary Actions Row */}
          <div className="flex items-center gap-2 mb-2">
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/users')}
              whileHover={{ scale: 1.05 }}
              title="User Management Panel"
            >
              👥 Users
            </motion.button>
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-secondary' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/approvals')}
              whileHover={{ scale: 1.05 }}
              title="Pending User Approvals"
            >
              ⏳ Approvals
            </motion.button>
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/analytics')}
              whileHover={{ scale: 1.05 }}
              title="Advanced Analytics Dashboard"
            >
              📊 Analytics
            </motion.button>
          </div>

          {/* Secondary Actions Row */}
          <div className="flex items-center gap-2">
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/security')}
              whileHover={{ scale: 1.05 }}
              title="Security Center"
            >
              🔒 Security
            </motion.button>
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/settings')}
              whileHover={{ scale: 1.05 }}
              title="System Settings"
            >
              ⚙️ Settings
            </motion.button>
            <motion.button 
              className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} px-3 py-1 text-xs`}
              onClick={() => navigate('/admin/panel')}
              whileHover={{ scale: 1.05 }}
              title="Legacy Admin Panel"
            >
              🏛️ Legacy
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;