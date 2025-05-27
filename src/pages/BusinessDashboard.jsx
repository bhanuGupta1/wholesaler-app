// src/pages/BusinessDashboard.jsx - Enhanced for business users
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

// Simple chart component for business analytics
const SimpleBarChart = ({ data, title, description, color, darkMode }) => {
  const max = Math.max(...data.map(item => item.value));
  
  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{title}</h3>
      {description && <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{description}</p>}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className={`text-xs w-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.name}</span>
            <div className="flex-1 ml-2">
              <div className={`h-4 rounded-full bg-${color}-${darkMode ? '900/30' : '100'} overflow-hidden`}>
                <div 
                  className={`h-4 rounded-full bg-${color}-${darkMode ? '500' : '600'}`} 
                  style={{ width: `${(item.value / max) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Revenue Analytics Component
const RevenueAnalytics = ({ stats, darkMode }) => {
  const monthlyRevenue = [
    { name: 'Jan', value: 15200 },
    { name: 'Feb', value: 18900 },
    { name: 'Mar', value: 22100 },
    { name: 'Apr', value: 19800 },
    { name: 'May', value: 25400 },
    { name: 'Jun', value: stats.totalRevenue || 28300 },
  ];

  const growthRate = 15.3; // Mock growth rate
  const projectedRevenue = stats.totalRevenue * 1.2; // Mock projection

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Revenue Analytics</h2>
      </div>
      
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Growth Rate</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              +{growthRate}%
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Projected</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              ${projectedRevenue.toFixed(0)}
            </div>
          </div>
        </div>

        <SimpleBarChart 
          title="Monthly Revenue Trend" 
          description="Revenue performance over the last 6 months" 
          data={monthlyRevenue} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        {/* Revenue Insights */}
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
          <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            💡 Revenue Insights
          </h3>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
            <li>• June shows strongest performance with 12% increase</li>
            <li>• Quarterly growth exceeds industry average by 8%</li>
            <li>• Peak sales occur during weekends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Customer Analytics Component
const CustomerAnalytics = ({ stats, darkMode }) => {
  const customerSegments = [
    { name: 'Enterprise', value: 45 },
    { name: 'SMB', value: 35 },
    { name: 'Startup', value: 20 },
  ];

  const mockCustomerData = {
    totalCustomers: 1247,
    newCustomers: 89,
    activeCustomers: 892,
    churnRate: 2.3
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Customer Analytics</h2>
      </div>
      
      <div className="p-6">
        {/* Customer Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Customers</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {mockCustomerData.totalCustomers.toLocaleString()}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>New This Month</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              +{mockCustomerData.newCustomers}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {mockCustomerData.activeCustomers}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Churn Rate</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {mockCustomerData.churnRate}%
            </div>
          </div>
        </div>

        <SimpleBarChart 
          title="Customer Segments" 
          description="Customer distribution by business size" 
          data={customerSegments} 
          color="green" 
          darkMode={darkMode} 
        />
      </div>
    </div>
  );
};

// Business Goals Component
const BusinessGoals = ({ darkMode }) => {
  const goals = [
    { title: 'Monthly Revenue Target', current: 28300, target: 35000, unit: '$' },
    { title: 'New Customers', current: 89, target: 100, unit: '' },
    { title: 'Customer Satisfaction', current: 4.8, target: 5.0, unit: '/5' },
    { title: 'Order Fulfillment Rate', current: 96, target: 98, unit: '%' }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Business Goals</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {goals.map((goal, index) => {
            const progress = (goal.current / goal.target) * 100;
            const isOnTrack = progress >= 80;
            
            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {goal.title}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {goal.unit === '$' ? goal.unit : ''}{goal.current}{goal.unit !== '$' ? goal.unit : ''} / {goal.unit === '$' ? goal.unit : ''}{goal.target}{goal.unit !== '$' ? goal.unit : ''}
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700`}>
                  <div 
                    className={`h-2 rounded-full ${
                      isOnTrack 
                        ? darkMode ? 'bg-green-500' : 'bg-green-600'
                        : darkMode ? 'bg-yellow-500' : 'bg-yellow-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {progress.toFixed(1)}% complete
                  </span>
                  <span className={`text-xs font-medium ${
                    isOnTrack 
                      ? darkMode ? 'text-green-400' : 'text-green-600'
                      : darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {isOnTrack ? 'On Track' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Market Opportunities Component
const MarketOpportunities = ({ darkMode }) => {
  const opportunities = [
    {
      title: 'Expand to Electronics Category',
      potential: 'High',
      impact: '$15K/month',
      effort: 'Medium',
      priority: 'high'
    },
    {
      title: 'B2B Partnership Program',
      potential: 'Medium',
      impact: '$8K/month',
      effort: 'Low',
      priority: 'medium'
    },
    {
      title: 'Mobile App Development',
      potential: 'High',
      impact: '$20K/month',
      effort: 'High',
      priority: 'low'
    }
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Market Opportunities</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {opp.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  opp.priority === 'high' 
                    ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    : opp.priority === 'medium'
                      ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                }`}>
                  {opp.priority} priority
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Potential: </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{opp.potential}</span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Impact: </span>
                  <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{opp.impact}</span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Effort: </span>
                  <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{opp.effort}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BusinessDashboard = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        setLoading(true);
        
        // Fetch orders for revenue calculation
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            total: data.total || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
          };
        });

        // Calculate business metrics
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = allOrders.length;
        
        // Mock additional business data
        const mockStats = {
          totalRevenue,
          totalOrders,
          totalCustomers: 1247, // Mock data
          monthlyGrowth: 15.3 // Mock data
        };

        setStats(mockStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching business data:', err);
        setError('Failed to load business data');
        setLoading(false);
      }
    }

    fetchBusinessData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Business Dashboard
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Monitor your business performance, growth metrics, and market opportunities
        </p>
      </div>

      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Revenue
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} mt-1`}>
                +{stats.monthlyGrowth}% this month
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-green-${darkMode ? '900/30' : '100'}`}>
              💰
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Active Customers
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.totalCustomers.toLocaleString()}
              </p>
              <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                +89 this month
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-blue-${darkMode ? '900/30' : '100'}`}>
              👥
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Orders
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.totalOrders}
              </p>
              <p className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mt-1`}>
                12% increase
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-indigo-${darkMode ? '900/30' : '100'}`}>
              📦
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Avg Order Value
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-1`}>
                +8% vs last month
              </p>
            </div>
            <div className={`text-3xl p-3 rounded-full bg-purple-${darkMode ? '900/30' : '100'}`}>
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Analytics */}
          <RevenueAnalytics stats={stats} darkMode={darkMode} />
          
          {/* Customer Analytics */}
          <CustomerAnalytics stats={stats} darkMode={darkMode} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Business Goals */}
          <BusinessGoals darkMode={darkMode} />
          
          {/* Market Opportunities */}
          <MarketOpportunities darkMode={darkMode} />
          
          {/* Business Actions */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Business Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/orders" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center">
                View Orders
              </Link>
              <Link to="/inventory" className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center">
                Manage Inventory
              </Link>
              <Link to="/create-order" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center">
                Create Order
              </Link>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Export Analytics
              </button>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Schedule Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;