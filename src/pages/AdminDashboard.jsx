// src/pages/AdminDashboard.jsx - ULTIMATE ENHANCED VERSION with Advanced Charts & Calendar
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
  const [viewMode, setViewMode] = useState('month'); // month, week, year
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    // Process data into calendar format
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
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
// ADVANCED CHART COMPONENTS
// ===============================================
const HeatmapChart = ({ data, title, darkMode }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (day, hour) => {
    const cellData = data.find(d => d.day === day && d.hour === hour);
    return cellData ? cellData.intensity : 0;
  };

  const getValue = (day, hour) => {
    const cellData = data.find(d => d.day === day && d.hour === hour);
    return cellData ? cellData.value : 0;
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {title}
      </h3>
      
      <div className="relative z-10 overflow-x-auto">
        <div className="flex">
          {/* Hour labels */}
          <div className="flex flex-col mr-2">
            <div className="h-6"></div> {/* Spacer for day labels */}
            {days.map(day => (
              <div key={day} className={`h-4 flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          <div className="flex-1">
            {/* Hour labels */}
            <div className="flex mb-1">
              {hours.map(hour => (
                <div key={hour} className={`w-4 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hour % 4 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap cells */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex mb-1">
                {hours.map((hour, hourIndex) => {
                  const intensity = getIntensity(dayIndex, hour);
                  const value = getValue(dayIndex, hour);
                  
                  return (
                    <motion.div
                      key={`${day}-${hour}`}
                      className="w-4 h-4 mr-px rounded-sm cursor-pointer"
                      style={{
                        backgroundColor: intensity > 0 ? 
                          darkMode ? `rgba(0, 255, 255, ${intensity})` : `rgba(79, 70, 229, ${intensity})` :
                          darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                      }}
                      onMouseEnter={() => setHoveredCell({ day, hour, value, intensity })}
                      onMouseLeave={() => setHoveredCell(null)}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (dayIndex * hours.length + hourIndex) * 0.001 }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Tooltip */}
        {hoveredCell && (
          <motion.div 
            className={`absolute z-20 p-2 rounded shadow-lg ${darkMode ? 'bg-gray-800 border border-cyan-500' : 'bg-white border border-gray-200'} text-xs`}
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
              {hoveredCell.day} {hoveredCell.hour}:00
            </div>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Value: {hoveredCell.value}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const FunnelChart = ({ data, title, darkMode }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {title}
      </h3>
      
      <div className="space-y-2 relative z-10">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const conversionRate = index > 0 ? ((item.value / data[index - 1].value) * 100).toFixed(1) : 100;
          
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
                  {index > 0 && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      conversionRate >= 50 
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : conversionRate >= 25
                        ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {conversionRate}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`h-12 relative rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
                <motion.div 
                  className={`h-full ${
                    index === 0 ? darkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                    index === 1 ? darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    index === 2 ? darkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-pink-500 to-red-500' :
                    darkMode ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                  } flex items-center justify-center`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  style={{
                    clipPath: index === data.length - 1 ? 'none' : 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)'
                  }}
                >
                  <span className="text-white font-bold text-sm mix-blend-difference">
                    {((item.value / data[0].value) * 100).toFixed(1)}%
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const RadarChart = ({ data, title, darkMode }) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 40;
  const maxValue = Math.max(...data.map(d => d.value));
  
  const getPointPosition = (index, value) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const normalizedValue = (value / maxValue) * radius;
    return {
      x: center + normalizedValue * Math.cos(angle),
      y: center + normalizedValue * Math.sin(angle)
    };
  };

  const getLabelPosition = (index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const labelRadius = radius + 25;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  };

  const points = data.map((item, index) => getPointPosition(index, item.value));
  const pathData = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '') + ' Z';

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 text-center relative z-10`}>
        {title}
      </h3>
      
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
          {data.map((_, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
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
          {data.map((item, index) => {
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
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.name}:</span>
            <span className={`font-bold ${darkMode ? 'text-white cyber-glow' : 'text-gray-900'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AreaChart = ({ data, title, darkMode }) => {
  const width = 300;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  const xScale = (index) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  
  const pathData = data.reduce((path, item, index) => {
    const x = xScale(index);
    const y = yScale(item.value);
    return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, '');
  
  const areaData = pathData + ` L ${xScale(data.length - 1)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`;

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-4 relative z-10`}>
        {title}
      </h3>
      
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
            {data.map((item, index) => (
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
      
      <div className="flex justify-between text-xs mt-2">
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data[0]?.name}</span>
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data[data.length - 1]?.name}</span>
      </div>
    </motion.div>
  );
};

// ===============================================
// ACTIVITY FEED COMPONENT
// ===============================================
const ActivityFeed = ({ activities, darkMode }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤';
      case 'order': return '🛒';
      case 'system': return '⚙️';
      case 'revenue': return '💰';
      default: return '📝';
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
          <option value="revenue">{darkMode ? 'REVENUE EVENTS' : 'Revenue'}</option>
        </select>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto relative z-10">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => (
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
          ))}
        </AnimatePresence>
      </div>
      
      {filteredActivities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2 opacity-50">📊</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {darkMode ? 'NO NEURAL ACTIVITIES DETECTED' : 'No activities found'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ===============================================
// PERFORMANCE METRICS DASHBOARD
// ===============================================
const PerformanceMetrics = ({ metrics, darkMode }) => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  const metricItems = [
    { key: 'responseTime', label: 'Response Time', value: metrics.responseTime, unit: 'ms', target: 500, color: 'blue' },
    { key: 'uptime', label: 'Uptime', value: metrics.uptime, unit: '%', target: 99, color: 'green' },
    { key: 'errorRate', label: 'Error Rate', value: metrics.errorRate, unit: '%', target: 1, color: 'red', inverse: true },
    { key: 'throughput', label: 'Throughput', value: metrics.throughput, unit: 'req/s', target: 1000, color: 'purple' },
    { key: 'cpuUsage', label: 'CPU Usage', value: metrics.cpuUsage, unit: '%', target: 80, color: 'orange', inverse: true },
    { key: 'memoryUsage', label: 'Memory Usage', value: metrics.memoryUsage, unit: '%', target: 85, color: 'pink', inverse: true }
  ];

  const getPerformanceStatus = (value, target, inverse = false) => {
    const ratio = inverse ? target / value : value / target;
    if (ratio >= 0.9) return 'excellent';
    if (ratio >= 0.7) return 'good';
    if (ratio >= 0.5) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'good': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'warning': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'critical': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <motion.div 
      className={`${darkMode ? 'cyber-card' : 'neumorph-card'} p-6 relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {darkMode && <div className="card-glow"></div>}
      
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'} mb-6 relative z-10`}>
        {darkMode ? 'PERFORMANCE MATRIX' : 'Performance Metrics'}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metricItems.map((metric, index) => {
          const status = getPerformanceStatus(metric.value, metric.target, metric.inverse);
          const percentage = metric.inverse ? 
            Math.min((metric.target / metric.value) * 100, 100) :
            Math.min((metric.value / metric.target) * 100, 100);
          
          return (
            <motion.div
              key={metric.key}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedMetric === metric.key 
                  ? darkMode ? 'bg-cyan-900/30 border border-cyan-500' : 'bg-indigo-100 border border-indigo-300'
                  : darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedMetric(selectedMetric === metric.key ? null : metric.key)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {metric.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  status === 'excellent' ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800' :
                  status === 'good' ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800' :
                  status === 'warning' ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800' :
                  darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {status.toUpperCase()}
                </span>
              </div>
              
              <div className={`text-2xl font-bold ${getStatusColor(status)} mb-2`}>
                {metric.value}{metric.unit}
              </div>
              
              <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                <motion.div
                  className={`h-full rounded-full ${
                    status === 'excellent' ? 'bg-green-500' :
                    status === 'good' ? 'bg-blue-500' :
                    status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
              
              <div className="flex justify-between text-xs mt-1">
                <span className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Target: {metric.target}{metric.unit}
                </span>
                <span className={`${getStatusColor(status)}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {selectedMetric && (
        <motion.div 
          className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} relative z-10`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-indigo-600'} mb-2`}>
            {metricItems.find(m => m.key === selectedMetric)?.label} Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current:</span>
              <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {metricItems.find(m => m.key === selectedMetric)?.value}
                {metricItems.find(m => m.key === selectedMetric)?.unit}
              </span>
            </div>
            <div>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target:</span>
              <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {metricItems.find(m => m.key === selectedMetric)?.target}
                {metricItems.find(m => m.key === selectedMetric)?.unit}
              </span>
            </div>
          </div>
        </motion.div>
      )}
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
  const [dashboardLayout, setDashboardLayout] = useState('default');

  // Generate enhanced demo data
  const generateEnhancedDemoData = useCallback(() => {
    const now = new Date();
    const demoData = {
      // Calendar data
      calendarData: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        return {
          date,
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          users: Math.floor(Math.random() * 20) + 5
        };
      }),
      
      // Heatmap data
      heatmapData: Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => ({
          day,
          hour,
          intensity: Math.random(),
          value: Math.floor(Math.random() * 100)
        }))
      ).flat(),
      
      // Funnel data
      funnelData: [
        { name: 'Visitors', value: 10000 },
        { name: 'Product Views', value: 7500 },
        { name: 'Add to Cart', value: 3000 },
        { name: 'Checkout', value: 1200 },
        { name: 'Purchase', value: 800 }
      ],
      
      // Radar data
      radarData: [
        { name: 'Performance', value: 85 },
        { name: 'Reliability', value: 92 },
        { name: 'Scalability', value: 78 },
        { name: 'Security', value: 96 },
        { name: 'UX', value: 88 },
        { name: 'Speed', value: 91 }
      ],
      
      // Area chart data
      areaData: Array.from({ length: 12 }, (_, i) => ({
        name: new Date(now.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' }),
        value: Math.floor(Math.random() * 50000) + 10000
      })),
      
      // Activity feed
      activities: [
        { id: 1, type: 'user', title: 'New user registered', description: 'john@example.com joined the platform', timestamp: '2 minutes ago', value: '+1' },
        { id: 2, type: 'order', title: 'Order completed', description: 'Order #12345 has been fulfilled', timestamp: '5 minutes ago', value: '$250' },
        { id: 3, type: 'system', title: 'System update', description: 'Database optimization completed', timestamp: '10 minutes ago' },
        { id: 4, type: 'revenue', title: 'Revenue milestone', description: 'Monthly revenue target reached', timestamp: '1 hour ago', value: '$10K' },
        { id: 5, type: 'user', title: 'User role updated', description: 'jane@example.com promoted to manager', timestamp: '2 hours ago' },
        { id: 6, type: 'order', title: 'Large order placed', description: 'Enterprise client placed bulk order', timestamp: '3 hours ago', value: '$5,000' }
      ],
      
      // Performance metrics
      performanceMetrics: {
        responseTime: 245,
        uptime: 99.8,
        errorRate: 0.2,
        throughput: 1250,
        cpuUsage: 65,
        memoryUsage: 72
      }
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
        },
        {
          id: 'demo-business-seller-1',
          email: 'seller@company.com',
          displayName: 'Business Seller',
          role: 'business',
          accountType: 'business',
          businessType: 'seller',
          active: true,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-user-1',
          email: 'user@company.com',
          displayName: 'Regular User',
          role: 'user',
          accountType: 'user',
          active: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
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
      icon: '🧠', 
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: darkMode ? 'TRANSACTIONS' : 'Total Orders', 
      value: stats.totalOrders, 
      icon: '📋', 
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
              {darkMode ? 'NEURAL COMMAND CENTER' : 'Advanced Admin Dashboard'}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
              {darkMode 
                ? 'ADVANCED NEURAL INTERFACE WITH QUANTUM ANALYTICS AND REAL-TIME MONITORING' 
                : 'Comprehensive analytics, real-time monitoring, and advanced data visualization'
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
            
            {/* Layout Toggle */}
            <button
              onClick={() => setDashboardLayout(dashboardLayout === 'default' ? 'compact' : 'default')}
              className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} px-3 py-2 text-sm`}
            >
              {dashboardLayout === 'default' ? '⊞ Compact' : '⋈ Default'}
            </button>
            
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
      <div className={`grid ${dashboardLayout === 'compact' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'} gap-8 relative z-10`}>
        
        {/* Left Column - Calendar & Charts */}
        <div className={`${dashboardLayout === 'compact' ? '' : 'lg:col-span-2'} space-y-8`}>
          
          {/* Activity Calendar */}
          <ActivityCalendar 
            data={demoData.calendarData} 
            darkMode={darkMode} 
            onDateSelect={handleDateSelect}
          />
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChart 
              data={demoData.funnelData} 
              title={darkMode ? 'CONVERSION FUNNEL' : 'Sales Funnel'} 
              darkMode={darkMode} 
            />
            
            <RadarChart 
              data={demoData.radarData} 
              title={darkMode ? 'SYSTEM MATRIX' : 'Performance Radar'} 
              darkMode={darkMode} 
            />
            
            <AreaChart 
              data={demoData.areaData} 
              title={darkMode ? 'REVENUE TEMPORAL' : 'Monthly Revenue'} 
              darkMode={darkMode} 
            />
            
            <HeatmapChart 
              data={demoData.heatmapData} 
              title={darkMode ? 'ACTIVITY HEATMAP' : 'User Activity Heatmap'} 
              darkMode={darkMode} 
            />
          </div>
        </div>

        {/* Right Column - Activity Feed & Performance */}
        <div className="space-y-8">
          <ActivityFeed 
            activities={demoData.activities} 
            darkMode={darkMode} 
          />
          
          <PerformanceMetrics 
            metrics={demoData.performanceMetrics} 
            darkMode={darkMode} 
          />
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
            onClick={() => navigate('/admin/orders')}
            whileHover={{ scale: 1.05 }}
          >
            Orders
          </motion.button>
          <motion.button 
            className={`${darkMode ? 'cyber-btn cyber-btn-success' : 'neumorph-btn'} px-3 py-1 text-xs`}
            onClick={() => navigate('/admin/analytics')}
            whileHover={{ scale: 1.05 }}
          >
            Analytics
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;