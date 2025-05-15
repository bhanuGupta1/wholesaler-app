// src/components/dashboard/AnalyticsCharts.jsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsCharts = ({ data, darkMode }) => {
  // Use memoized values to prevent unnecessary re-renders
  const { revenueData, inventoryData, comparisonData } = useMemo(() => {
    // Use provided data or populate with defaults if none available
    const revenue = data?.revenue || [
      { month: 'Jan', value: 4200 },
      { month: 'Feb', value: 4900 },
      { month: 'Mar', value: 5600 },
      { month: 'Apr', value: 5200 },
      { month: 'May', value: 6100 },
      { month: 'Jun', value: 7200 }
    ];
    
    const inventory = data?.inventory || [
      { category: 'Electronics', count: 42 },
      { category: 'Office', count: 28 },
      { category: 'Furniture', count: 16 },
      { category: 'Other', count: 14 }
    ];
    
    const comparison = data?.comparison || [
      { name: 'Week 1', current: 4000, previous: 3000 },
      { name: 'Week 2', current: 5000, previous: 4000 },
      { name: 'Week 3', current: 4800, previous: 5200 },
      { name: 'Week 4', current: 6000, previous: 5800 }
    ];
    
    return { revenueData: revenue, inventoryData: inventory, comparisonData: comparison };
  }, [data]);

  // Chart theme based on dark/light mode
  const chartTheme = useMemo(() => ({
    textColor: darkMode ? '#e5e7eb' : '#374151',
    gridColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltipBg: darkMode ? '#1f2937' : '#ffffff',
    tooltipBorder: darkMode ? '#4b5563' : '#e5e7eb',
    tooltipText: darkMode ? '#e5e7eb' : '#374151'
  }), [darkMode]);

  return (
    <motion.div
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Analytics</h2>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Revenue Chart */}
        <div>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>Monthly Revenue</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: chartTheme.textColor }}
                />
                <YAxis 
                  tick={{ fill: chartTheme.textColor }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: chartTheme.tooltipBg, 
                    borderColor: chartTheme.tooltipBorder,
                    color: chartTheme.tooltipText
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="value" 
                  fill={darkMode ? "#6366f1" : "#4f46e5"} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Revenue Comparison Chart */}
        <div>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>Performance Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: chartTheme.textColor }}
                />
                <YAxis 
                  tick={{ fill: chartTheme.textColor }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: chartTheme.tooltipBg, 
                    borderColor: chartTheme.tooltipBorder,
                    color: chartTheme.tooltipText
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke={darkMode ? "#10b981" : "#059669"} 
                  strokeWidth={2}
                  dot={{ fill: darkMode ? "#10b981" : "#059669", r: 5 }}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                  name="Current Period"
                />
                <Line 
                  type="monotone" 
                  dataKey="previous" 
                  stroke={darkMode ? "#6366f1" : "#4f46e5"} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: darkMode ? "#6366f1" : "#4f46e5", r: 5 }}
                  animationDuration={1500}
                  name="Previous Period"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <button className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center w-full`}>
          Export Analytics Report
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default AnalyticsCharts;