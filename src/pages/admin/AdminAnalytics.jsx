// src/pages/admin/AdminAnalytics.jsx - Advanced Analytics Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Futuristic Chart Component
const FuturisticChart = ({ data, title, type = 'bar', color = 'cyan', darkMode }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
      } backdrop-blur-sm`}>
        <h3 className={`font-mono text-sm mb-4 text-${color}-500`}>
          &gt; {title}
        </h3>
        <div className="text-center py-8">
          <div className={`text-4xl mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            📊
          </div>
          <div className={`font-mono text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            NO_DATA_AVAILABLE
          </div>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map(item => item.value));

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
    } backdrop-blur-sm hover:border-${color}-500/50 transition-all`}>
      
      <h3 className={`font-mono text-sm mb-4 text-${color}-500 flex items-center`}>
        <span className="animate-pulse mr-2">▶</span>
        {title}
      </h3>

      {type === 'bar' && (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-mono ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-xs font-mono font-bold text-${color}-500`}>
                    {item.value}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-1000 animate-pulse`}
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
              const x = (index / (data.length - 1)) * 380 + 10;
              const y = 90 - ((item.value / max) * 80);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    className={`fill-${color}-500 animate-pulse`}
                  />
                  {index > 0 && (
                    <line
                      x1={(index - 1) / (data.length - 1) * 380 + 10}
                      y1={90 - ((data[index - 1].value / max) * 80)}
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
        <div className="flex flex-col space-y-2">
          {data.map((item, index) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${color}-${400 + (index * 100)} mr-2`}></div>
                  <span className={`text-xs font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <span className={`text-xs font-mono text-${color}-500`}>
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

// Real-time Metrics Widget
const RealTimeMetrics = ({ darkMode }) => {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    serverLoad: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 20,
        totalSessions: Math.floor(Math.random() * 200) + 100,
        avgSessionDuration: Math.floor(Math.random() * 30) + 10,
        bounceRate: Math.floor(Math.random() * 40) + 20,
        serverLoad: Math.floor(Math.random() * 80) + 10,
        memoryUsage: Math.floor(Math.random() * 70) + 20
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    { 
      label: 'ACTIVE_USERS', 
      value: metrics.activeUsers, 
      unit: '', 
      color: 'green',
      status: metrics.activeUsers > 30 ? 'good' : 'warning'
    },
    { 
      label: 'SESSIONS', 
      value: metrics.totalSessions, 
      unit: '', 
      color: 'blue',
      status: 'good'
    },
    { 
      label: 'AVG_DURATION', 
      value: metrics.avgSessionDuration, 
      unit: 'min', 
      color: 'purple',
      status: metrics.avgSessionDuration > 15 ? 'good' : 'warning'
    },
    { 
      label: 'BOUNCE_RATE', 
      value: metrics.bounceRate, 
      unit: '%', 
      color: 'yellow',
      status: metrics.bounceRate < 30 ? 'good' : 'warning'
    },
    { 
      label: 'SERVER_LOAD', 
      value: metrics.serverLoad, 
      unit: '%', 
      color: 'red',
      status: metrics.serverLoad < 70 ? 'good' : 'critical'
    },
    { 
      label: 'MEMORY_USAGE', 
      value: metrics.memoryUsage, 
      unit: '%', 
      color: 'cyan',
      status: metrics.memoryUsage < 60 ? 'good' : 'warning'
    }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
    } backdrop-blur-sm`}>
      
      <h3 className={`font-mono text-lg mb-6 ${
        darkMode ? 'text-cyan-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="animate-pulse mr-3">📡</span>
        REAL_TIME_METRICS
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => (
          <div key={index} className={`p-4 rounded border transition-all ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          } hover:scale-105`}>
            
            <div className="flex items-center justify-between mb-2">
              <div className={`text-2xl font-bold font-mono text-${metric.color}-500`}>
                {metric.value}{metric.unit}
              </div>
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                metric.status === 'good' ? 'bg-green-500' :
                metric.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
            </div>
            
            <div className={`text-xs font-mono ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {metric.label}
            </div>
            
            {/* Progress bar for percentage metrics */}
            {(metric.unit === '%') && (
              <div className={`mt-2 w-full h-1 rounded-full ${
                darkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}>
                <div 
                  className={`h-full rounded-full bg-${metric.color}-500 transition-all duration-1000`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="mt-6 p-4 rounded border bg-opacity-50">
        <div className={`text-sm font-mono mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SYSTEM_STATUS:
        </div>
        <div className="flex items-center">
          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className={`font-mono text-xs ${
            darkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            ALL_SYSTEMS_OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
};

// Calendar Widget
const AnalyticsCalendar = ({ darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    // Generate sample calendar data
    const data = {};
    const today = new Date();
    for (let i = -30; i <= 0; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      data[dateStr] = {
        users: Math.floor(Math.random() * 100) + 20,
        orders: Math.floor(Math.random() * 50) + 5,
        revenue: Math.floor(Math.random() * 5000) + 1000
      };
    }
    setCalendarData(data);
  }, []);

  const getCurrentMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getDayIntensity = (date) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split('T')[0];
    const data = calendarData[dateStr];
    if (!data) return 0;
    return Math.min(data.users / 100, 1);
  };

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
    } backdrop-blur-sm`}>
      
      <h3 className={`font-mono text-lg mb-6 ${
        darkMode ? 'text-purple-400' : 'text-purple-600'
      } flex items-center`}>
        <span className="animate-pulse mr-3">📅</span>
        ACTIVITY_CALENDAR
      </h3>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}
          className={`p-2 rounded font-mono text-sm transition-all ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          ←
        </button>
        
        <span className={`font-mono font-bold ${
          darkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}
          className={`p-2 rounded font-mono text-sm transition-all ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className={`p-2 text-center text-xs font-mono ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {day}
          </div>
        ))}
        
        {getCurrentMonth().map((date, index) => {
          const intensity = getDayIntensity(date);
          return (
            <div
              key={index}
              className={`aspect-square p-1 text-center text-xs font-mono cursor-pointer transition-all ${
                date
                  ? `${darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-black'} hover:scale-110`
                  : ''
              }`}
              style={{
                backgroundColor: date && intensity > 0 
                  ? `rgba(${darkMode ? '34, 197, 94' : '59, 130, 246'}, ${intensity})`
                  : 'transparent'
              }}
            >
              {date ? date.getDate() : ''}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          LESS
        </span>
        <div className="flex space-x-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: `rgba(${darkMode ? '34, 197, 94' : '59, 130, 246'}, ${intensity})`
              }}
            ></div>
          ))}
        </div>
        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          MORE
        </span>
      </div>
    </div>
  );
};

// Main Analytics Component
const AdminAnalytics = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    orderTrends: [],
    revenueData: [],
    productPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch real data from Firebase
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const productsSnapshot = await getDocs(collection(db, 'products'));

        // Process user growth data
        const userGrowth = [
          { label: 'MON', value: 45 },
          { label: 'TUE', value: 52 },
          { label: 'WED', value: 48 },
          { label: 'THU', value: 61 },
          { label: 'FRI', value: 55 },
          { label: 'SAT', value: 67 },
          { label: 'SUN', value: 73 }
        ];

        // Process order trends
        const orderTrends = [
          { label: 'Week 1', value: 23 },
          { label: 'Week 2', value: 34 },
          { label: 'Week 3', value: 45 },
          { label: 'Week 4', value: 52 }
        ];

        // Process revenue data
        const revenueData = [
          { label: 'Products', value: 65 },
          { label: 'Services', value: 25 },
          { label: 'Subscriptions', value: 10 }
        ];

        // Process product performance
        const productPerformance = [
          { label: 'Electronics', value: 89 },
          { label: 'Clothing', value: 67 },
          { label: 'Books', value: 45 },
          { label: 'Home & Garden', value: 34 },
          { label: 'Sports', value: 23 }
        ];

        setAnalyticsData({
          userGrowth,
          orderTrends,
          revenueData,
          productPerformance
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-cyan-400' : 'text-blue-500'}`}>
              📊
            </div>
            <div className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              LOADING_ANALYTICS...
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
              <span className="animate-pulse mr-3">📊</span>
              ANALYTICS_DASHBOARD
            </h1>
            <p className={`font-mono text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              // Real-time business intelligence and performance metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`p-2 rounded border font-mono text-sm ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="24h">LAST_24H</option>
              <option value="7d">LAST_7D</option>
              <option value="30d">LAST_30D</option>
              <option value="90d">LAST_90D</option>
            </select>
            
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
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <FuturisticChart
          data={analyticsData.userGrowth}
          title="USER_GROWTH_WEEKLY"
          type="line"
          color="green"
          darkMode={darkMode}
        />
        
        <FuturisticChart
          data={analyticsData.orderTrends}
          title="ORDER_TRENDS_MONTHLY"
          type="bar"
          color="blue"
          darkMode={darkMode}
        />
        
        <FuturisticChart
          data={analyticsData.revenueData}
          title="REVENUE_BREAKDOWN"
          type="pie"
          color="purple"
          darkMode={darkMode}
        />
        
        <FuturisticChart
          data={analyticsData.productPerformance}
          title="PRODUCT_PERFORMANCE"
          type="bar"
          color="cyan"
          darkMode={darkMode}
        />
        
        <AnalyticsCalendar darkMode={darkMode} />
        
        <RealTimeMetrics darkMode={darkMode} />
      </div>

      {/* Export Options */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
      } backdrop-blur-sm`}>
        
        <h3 className={`font-mono text-lg mb-4 ${
          darkMode ? 'text-cyan-400' : 'text-blue-600'
        } flex items-center`}>
          <span className="animate-pulse mr-3">📤</span>
          EXPORT_OPTIONS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'PDF_REPORT', icon: '📄', color: 'red' },
            { label: 'CSV_DATA', icon: '📊', color: 'green' },
            { label: 'JSON_EXPORT', icon: '🔧', color: 'blue' },
            { label: 'EMAIL_REPORT', icon: '📧', color: 'purple' }
          ].map((option, index) => (
            <button
              key={index}
              className={`p-4 rounded border transition-all hover:scale-105 ${
                darkMode
                  ? `bg-gray-700/50 border-gray-600 hover:border-${option.color}-500/50`
                  : `bg-gray-50 border-gray-200 hover:border-${option.color}-500/50`
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className={`font-mono text-sm text-${option.color}-500`}>
                  {option.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;