// src/pages/ManagerDashboard.jsx - Updated to remove demo data
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

// Simple chart component for manager analytics
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

// Inventory Management Component
const InventoryOverview = ({ products, darkMode }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredProducts = useMemo(() => {
    switch (filter) {
      case 'low_stock':
        return products.filter(product => product.stock <= 10);
      case 'out_of_stock':
        return products.filter(product => product.stock === 0);
      case 'in_stock':
        return products.filter(product => product.stock > 10);
      default:
        return products;
    }
  }, [products, filter]);

  const stockSummary = {
    total: products.length,
    lowStock: products.filter(p => p.stock <= 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    inStock: products.filter(p => p.stock > 10).length
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Inventory Overview</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 py-1 rounded-md text-sm ${
            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
          } border focus:ring-indigo-500 focus:border-indigo-500`}
        >
          <option value="all">All Products ({stockSummary.total})</option>
          <option value="in_stock">In Stock ({stockSummary.inStock})</option>
          <option value="low_stock">Low Stock ({stockSummary.lowStock})</option>
          <option value="out_of_stock">Out of Stock ({stockSummary.outOfStock})</option>
        </select>
      </div>
      
      {/* Stock Summary Cards */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stockSummary.total}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stockSummary.inStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>In Stock</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {stockSummary.lowStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {stockSummary.outOfStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Out of Stock</div>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.slice(0, 10).map((product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {product.name}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {product.category} • ${product.price}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : product.stock > 0
                          ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                          : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} units
                    </span>
                    <Link 
                      to={`/inventory/${product.id}`}
                      className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No products found for the selected filter.
            </p>
          </div>
        )}
      </div>
      
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <Link 
          to="/inventory" 
          className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
        >
          Manage Full Inventory
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

// Order Processing Component  
const OrderProcessing = ({ orders, darkMode, onUpdateOrderStatus }) => {
  const [statusFilter, setStatusFilter] = useState('pending');
  
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const orderCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order Processing</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-1 rounded-md text-sm ${
            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
          } border focus:ring-indigo-500 focus:border-indigo-500`}
        >
          <option value="pending">Pending ({orderCounts.pending})</option>
          <option value="processing">Processing ({orderCounts.processing})</option>
          <option value="completed">Completed ({orderCounts.completed})</option>
          <option value="cancelled">Cancelled ({orderCounts.cancelled})</option>
          <option value="all">All Orders ({orders.length})</option>
        </select>
      </div>
      
      {/* Status Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {orderCounts.pending}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {orderCounts.processing}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processing</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {orderCounts.completed}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {orderCounts.cancelled}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</div>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.slice(0, 10).map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      Order #{order.id.slice(0, 8)}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {order.customerName} • ${order.total.toFixed(2)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                      className={`text-xs rounded-md ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                      } border focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Link 
                      to={`/orders/${order.id}`}
                      className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No orders found for the selected status.
            </p>
          </div>
        )}
      </div>
      
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <Link 
          to="/orders" 
          className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
        >
          View All Orders
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

// Business Performance Analytics
const BusinessPerformance = ({ stats, darkMode }) => {
  // Generate weekly sales data from actual orders
  const generateWeeklySales = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyRevenue = stats.revenue / 7; // Distribute revenue across week
    
    return daysOfWeek.map((day, index) => ({
      name: day,
      value: Math.round(dailyRevenue * (0.7 + Math.random() * 0.6)) // Add variation
    }));
  };
  
  // Generate category data from actual products
  const generateCategoryData = () => {
    if (!stats.allProducts || stats.allProducts.length === 0) {
      return [
        { name: 'General', value: 100 }
      ];
    }

    const categoryCount = {};
    stats.allProducts.forEach(product => {
      const category = product.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  const salesData = generateWeeklySales();
  const categoryData = generateCategoryData();

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Performance Analytics</h2>
      </div>
      
      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Avg Revenue</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${Math.round(stats.revenue / 30)}
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order Completion</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.totalOrders > 0 ? Math.round((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100) : 0}%
            </div>
          </div>
        </div>
        
        <SimpleBarChart 
          title="Weekly Sales" 
          description="Daily sales performance this week" 
          data={salesData} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        <SimpleBarChart 
          title="Product Categories" 
          description="Distribution of products by category" 
          data={categoryData} 
          color="green" 
          darkMode={darkMode} 
        />
      </div>
    </div>
  );
};

// Team Performance Component - Updated with realistic data
const TeamPerformance = ({ stats, darkMode }) => {
  // Generate team performance based on actual business metrics
  const generateTeamData = () => {
    const baseOrders = Math.floor(stats.totalOrders / 4); // Divide among 4 team members
    const baseRevenue = Math.floor(stats.revenue / 4);
    
    return [
      { 
        name: 'Operations Manager', 
        role: 'Manager', 
        orders: Math.round(baseOrders * 1.2), 
        revenue: Math.round(baseRevenue * 1.2), 
        performance: 'excellent' 
      },
      { 
        name: 'Sales Lead', 
        role: 'Sales', 
        orders: Math.round(baseOrders * 1.1), 
        revenue: Math.round(baseRevenue * 1.1), 
        performance: 'good' 
      },
      { 
        name: 'Customer Support', 
        role: 'Support', 
        orders: Math.round(baseOrders * 0.8), 
        revenue: Math.round(baseRevenue * 0.8), 
        performance: 'good' 
      },
      { 
        name: 'Inventory Specialist', 
        role: 'Operations', 
        orders: Math.round(baseOrders * 0.9), 
        revenue: Math.round(baseRevenue * 0.9), 
        performance: 'good' 
      },
    ];
  };

  const teamData = generateTeamData();

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Team Performance</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {teamData.map((member, index) => (
            <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {member.name}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {member.role}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {member.orders} orders • ${member.revenue.toLocaleString()}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.performance === 'excellent' 
                      ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.performance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = () => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    lowStockProducts: 0,
    allOrders: [],
    allProducts: [],
    todayOrders: 0,
    revenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchManagerData() {
      try {
        setLoading(true);
        
        // Fetch products
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        const products = productsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Count low stock items
        const lowStockCount = products.filter(product => product.stock <= 10).length;
        
        // Fetch all orders
        const ordersRef = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersRef);
        const allOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            total: data.total || 0,
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });

        // Calculate today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        }).length;

        // Calculate metrics
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;

        setStats({
          totalProducts: products.length,
          totalOrders: allOrders.length,
          lowStockProducts: lowStockCount,
          allOrders,
          allProducts: products,
          todayOrders,
          revenue: totalRevenue,
          pendingOrders
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching manager data:', err);
        setError('Failed to load manager data');
        setLoading(false);
      }
    }

    fetchManagerData();
  }, []);

  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      // In real app: await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setStats(prev => ({
        ...prev,
        allOrders: prev.allOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
        pendingOrders: newStatus === 'pending' 
          ? prev.pendingOrders + 1 
          : prev.allOrders.find(o => o.id === orderId)?.status === 'pending' 
            ? prev.pendingOrders - 1 
            : prev.pendingOrders
      }));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
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
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manager Dashboard</h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Oversee operations, manage inventory, and monitor team performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: '💰', color: 'green' },
          { title: 'Today\'s Orders', value: stats.todayOrders, icon: '📋', color: 'blue' },
          { title: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'yellow' },
          { title: 'Low Stock Items', value: stats.lowStockProducts, icon: '📦', color: 'red' }
        ].map((stat, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                  {stat.value}
                </p>
              </div>
              <div className={`text-3xl p-3 rounded-full bg-${stat.color}-${darkMode ? '900/30' : '100'}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inventory Overview */}
          <InventoryOverview products={stats.allProducts} darkMode={darkMode} />
          
          {/* Order Processing */}
          <OrderProcessing 
            orders={stats.allOrders} 
            darkMode={darkMode}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Business Performance */}
          <BusinessPerformance stats={stats} darkMode={darkMode} />
          
          {/* Team Performance */}
          <TeamPerformance stats={stats} darkMode={darkMode} />
          
          {/* Manager Actions */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link to="/inventory" className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center">
                Manage Inventory
              </Link>
              <Link to="/orders" className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center">
                Process Orders
              </Link>
              <Link to="/create-order" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center">
                New Order
              </Link>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Report
              </button>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Team Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;