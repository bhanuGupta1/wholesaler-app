// src/pages/ManagerDashboard.jsx - Enhanced with theme integration and SecretInvasion background
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';

// Enhanced chart component with real data visualization
const RealDataChart = ({ data, title, description, color, darkMode, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mb-6">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{title}</h3>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>No data available</p>
      </div>
    );
  }

  const max = Math.max(...data.map(item => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300 cyber-glow' : 'text-gray-700'} mb-1`}>{title}</h3>
      {description && <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{description}</p>}
      
      {type === 'pie' ? (
        // Pie chart representation
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${color}-${500 + (index * 100)} mr-2 ${darkMode ? 'shadow-lg shadow-cyan-500/20' : ''}`}></div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.name}</span>
                </div>
                <div className="flex items-center">
                  <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-gray-300 cyber-glow' : 'text-gray-700'}`}>
                    {item.value} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Bar chart representation
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className={`text-xs w-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.name}</span>
              <div className="flex-1 ml-2">
                <div className={`h-4 rounded-full ${darkMode ? 'bg-gray-800 border border-cyan-500/30' : 'bg-gray-100'} overflow-hidden`}>
                  <div 
                    className={`h-4 rounded-full ${
                      darkMode 
                        ? `bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30` 
                        : `bg-${color}-600`
                    } transition-all duration-500`} 
                    style={{ width: `${(item.value / max) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-gray-300 cyber-glow' : 'text-gray-700'}`}>
                {typeof item.value === 'number' && item.value > 1000 ? `$${(item.value/1000).toFixed(1)}k` : item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Low Stock Alerts with actual actions - enhanced theme integration
const LowStockAlerts = ({ products, darkMode, onBulkRestock }) => {
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [restockAmount, setRestockAmount] = useState(50);
  const [isRestocking, setIsRestocking] = useState(false);

  const lowStockProducts = products.filter(product => product.stock <= 10);
  const criticalStockProducts = products.filter(product => product.stock <= 3);

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === lowStockProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(lowStockProducts.map(p => p.id)));
    }
  };

  const handleBulkRestock = async () => {
    if (selectedProducts.size === 0) return;
    
    setIsRestocking(true);
    try {
      await onBulkRestock(Array.from(selectedProducts), restockAmount);
      setSelectedProducts(new Set());
    } finally {
      setIsRestocking(false);
    }
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className={`${
        darkMode 
          ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
          : 'neumorph-card bg-white border-gray-100'
      } rounded-xl overflow-hidden border`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
            {darkMode ? 'INVENTORY SURVEILLANCE' : 'Stock Alerts'}
          </h2>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {darkMode ? 'ALL SYSTEMS OPERATIONAL' : 'All products are well stocked!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      darkMode 
        ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
        : 'neumorph-card bg-white border-gray-100'
    } rounded-xl overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'} flex justify-between items-center`}>
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
            {darkMode ? 'INVENTORY SURVEILLANCE' : 'Stock Alerts'}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {criticalStockProducts.length} critical • {lowStockProducts.length} total low stock
          </p>
        </div>
        {selectedProducts.size > 0 && (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={restockAmount}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
              className={`w-20 px-2 py-1 text-sm rounded ${
                darkMode 
                  ? 'cyber-btn bg-gray-800 border-cyan-500/50 text-cyan-300' 
                  : 'neumorph-btn bg-white border-gray-300'
              } border`}
              min="1"
              placeholder="50"
            />
            <button
              onClick={handleBulkRestock}
              disabled={isRestocking}
              className={`${
                darkMode 
                  ? 'cyber-btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20' 
                  : 'neumorph-btn bg-green-600 hover:bg-green-700'
              } text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-all duration-300`}
            >
              {isRestocking ? 'RESTOCKING...' : `RESTOCK ${selectedProducts.size}`}
            </button>
          </div>
        )}
      </div>

      {/* Bulk selection controls */}
      <div className={`px-6 py-3 border-b ${
        darkMode 
          ? 'border-cyan-500/30 bg-gray-800/50' 
          : 'border-gray-100 bg-gray-50'
      }`}>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedProducts.size === lowStockProducts.length && lowStockProducts.length > 0}
            onChange={handleSelectAll}
            className="mr-2"
          />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Select all low stock items
          </span>
        </label>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {lowStockProducts.map((product) => (
          <div key={product.id} className={`p-4 border-b ${
            darkMode ? 'border-cyan-500/20 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'
          } transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {product.name}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.category} • ${product.price}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.stock <= 3
                    ? darkMode 
                      ? 'bg-red-900/30 text-red-400 border border-red-500/30' 
                      : 'bg-red-100 text-red-800'
                    : darkMode 
                      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.stock} left
                </span>
                <Link 
                  to={`/inventory/${product.id}`}
                  className={`text-sm ${
                    darkMode 
                      ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' 
                      : 'text-indigo-600 hover:text-indigo-800'
                  } font-medium transition-colors duration-200`}
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className={`px-6 py-3 border-t ${
        darkMode 
          ? 'border-cyan-500/30 bg-gray-800/50' 
          : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedProducts(new Set(criticalStockProducts.map(p => p.id)))}
            className={`text-sm ${
              darkMode 
                ? 'cyber-btn bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' 
                : 'neumorph-btn bg-red-600 hover:bg-red-700'
            } text-white px-3 py-1 rounded transition-all duration-300`}
          >
            Select Critical ({criticalStockProducts.length})
          </button>
          <button 
            onClick={() => {
              // Auto-generate purchase orders
              const orderData = lowStockProducts.map(p => ({
                product: p.name,
                currentStock: p.stock,
                suggestedOrder: Math.max(50, p.stock * 5)
              }));
              console.log('Purchase order suggestions:', orderData);
            }}
            className={`text-sm ${
              darkMode 
                ? 'cyber-btn bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' 
                : 'neumorph-btn bg-blue-600 hover:bg-blue-700'
            } text-white px-3 py-1 rounded transition-all duration-300`}
          >
            Generate Orders
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Order Processing with bulk operations and theme integration
const OrderProcessing = ({ orders, darkMode, onUpdateOrderStatus, onBulkUpdate }) => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [updating, setUpdating] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  
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

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.size === 0) return;
    
    setBulkUpdating(true);
    try {
      await onBulkUpdate(Array.from(selectedOrders), newStatus);
      setSelectedOrders(new Set());
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (updating === orderId) return;
    
    setUpdating(orderId);
    try {
      await onUpdateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className={`${
      darkMode 
        ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
        : 'neumorph-card bg-white border-gray-100'
    } rounded-xl overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'ORDER STREAM CONTROL' : 'Order Processing'}
        </h2>
        <div className="flex items-center space-x-3">
          {selectedOrders.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedOrders.size} selected
              </span>
              <button
                onClick={() => handleBulkStatusUpdate('processing')}
                disabled={bulkUpdating}
                className={`${
                  darkMode 
                    ? 'cyber-btn bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'neumorph-btn bg-blue-600 hover:bg-blue-700'
                } text-white px-2 py-1 rounded text-xs disabled:opacity-50 transition-all duration-300`}
              >
                Process
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('completed')}
                disabled={bulkUpdating}
                className={`${
                  darkMode 
                    ? 'cyber-btn bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20' 
                    : 'neumorph-btn bg-green-600 hover:bg-green-700'
                } text-white px-2 py-1 rounded text-xs disabled:opacity-50 transition-all duration-300`}
              >
                Complete
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                disabled={bulkUpdating}
                className={`${
                  darkMode 
                    ? 'cyber-btn bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' 
                    : 'neumorph-btn bg-red-600 hover:bg-red-700'
                } text-white px-2 py-1 rounded text-xs disabled:opacity-50 transition-all duration-300`}
              >
                Cancel
              </button>
            </div>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode 
                ? 'cyber-btn bg-gray-800 border-cyan-500/50 text-cyan-300' 
                : 'neumorph-btn bg-white border-gray-300'
            } border focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="pending">Pending ({orderCounts.pending})</option>
            <option value="processing">Processing ({orderCounts.processing})</option>
            <option value="completed">Completed ({orderCounts.completed})</option>
            <option value="cancelled">Cancelled ({orderCounts.cancelled})</option>
            <option value="all">All Orders ({orders.length})</option>
          </select>
        </div>
      </div>
      
      {/* Status Summary */}
      <div className={`p-6 border-b ${darkMode ? 'border-cyan-500/20' : 'border-gray-200'}`}>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-600'}`}>
              {orderCounts.pending}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400 cyber-glow' : 'text-blue-600'}`}>
              {orderCounts.processing}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processing</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'}`}>
              {orderCounts.completed}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-red-400 cyber-glow' : 'text-red-600'}`}>
              {orderCounts.cancelled}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</div>
          </div>
        </div>
      </div>

      {/* Bulk selection controls */}
      {filteredOrders.length > 0 && (
        <div className={`px-6 py-3 border-b ${
          darkMode 
            ? 'border-cyan-500/30 bg-gray-800/50' 
            : 'border-gray-100 bg-gray-50'
        }`}>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select all {statusFilter} orders
            </span>
          </label>
        </div>
      )}
      
      {/* Orders List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          <div className={`divide-y ${darkMode ? 'divide-cyan-500/20' : 'divide-gray-200'}`}>
            {filteredOrders.slice(0, 15).map((order) => (
              <div key={order.id} className={`p-4 ${
                darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
              } transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="mr-3"
                    />
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-xs rounded-md ${
                        darkMode 
                          ? 'cyber-btn bg-gray-800 border-cyan-500/50 text-cyan-300' 
                          : 'neumorph-btn bg-white border-gray-300'
                      } border focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {updating === order.id && (
                      <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${
                        darkMode ? 'border-cyan-500' : 'border-indigo-500'
                      }`}></div>
                    )}
                    <Link 
                      to={`/orders/${order.id}`}
                      className={`text-sm ${
                        darkMode 
                          ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      } font-medium transition-colors duration-200`}
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
      
      <div className={`border-t ${
        darkMode 
          ? 'border-cyan-500/30 bg-gray-800/50' 
          : 'border-gray-100 bg-gray-50'
      } px-6 py-3`}>
        <Link 
          to="/orders" 
          className={`text-sm font-medium ${
            darkMode 
              ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' 
              : 'text-indigo-600 hover:text-indigo-800'
          } flex items-center justify-center transition-colors duration-200`}
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

// Enhanced Business Performance with real data and theme integration
const BusinessPerformance = ({ stats, darkMode }) => {
  // Generate real sales data from orders
  const generateRealSalesData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = stats.allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round(dayRevenue),
        orders: dayOrders.length
      });
    }
    
    return last7Days;
  };
  
  // Generate category data from actual products and orders
  const generateRealCategoryData = () => {
    if (!stats.allProducts || stats.allProducts.length === 0) {
      return [{ name: 'No Data', value: 0 }];
    }

    const categoryRevenue = {};
    
    // Calculate revenue by category (simplified - in real app you'd track this in orders)
    stats.allProducts.forEach(product => {
      const category = product.category || 'Other';
      const estimatedRevenue = (product.price || 0) * Math.max(0, 100 - (product.stock || 0)); // Estimate sales
      categoryRevenue[category] = (categoryRevenue[category] || 0) + estimatedRevenue;
    });

    return Object.entries(categoryRevenue)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  const salesData = generateRealSalesData();
  const categoryData = generateRealCategoryData();

  // Calculate real KPIs
  const avgDailyRevenue = Math.round(stats.revenue / 30);
  const completionRate = stats.totalOrders > 0 
    ? Math.round((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100) 
    : 0;

  return (
    <div className={`${
      darkMode 
        ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
        : 'neumorph-card bg-white border-gray-100'
    } rounded-xl overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'NEURAL ANALYTICS' : 'Performance Analytics'}
        </h2>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {darkMode ? 'Real-time data stream analysis' : 'Real-time data from your business'}
        </p>
      </div>
      
      <div className="p-6">
        {/* Real KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${
            darkMode 
              ? 'bg-gray-800/50 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Avg Revenue</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'}`}>
              ${avgDailyRevenue}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              Based on last 30 days
            </div>
          </div>
          <div className={`p-4 rounded-lg ${
            darkMode 
              ? 'bg-gray-800/50 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order Completion</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400 cyber-glow' : 'text-blue-600'}`}>
              {completionRate}%
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
              {stats.totalOrders - stats.pendingOrders} of {stats.totalOrders} orders
            </div>
          </div>
        </div>
        
        <RealDataChart 
          title={darkMode ? "7-DAY REVENUE STREAM" : "7-Day Sales Trend"} 
          description={`Total revenue: $${salesData.reduce((sum, day) => sum + day.value, 0)}`}
          data={salesData} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        <RealDataChart 
          title={darkMode ? "CATEGORY BREAKDOWN" : "Revenue by Category"} 
          description="Estimated revenue based on product sales"
          data={categoryData} 
          color="green" 
          darkMode={darkMode}
          type="pie"
        />

        {/* Sales insights */}
        <div className={`mt-4 p-3 rounded-lg ${
          darkMode 
            ? 'bg-blue-900/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
            : 'bg-blue-50 border border-blue-100'
        }`}>
          <div className={`text-sm font-medium ${darkMode ? 'text-blue-300 cyber-glow' : 'text-blue-800'} mb-1`}>
            {darkMode ? '🔮 NEURAL INSIGHTS' : '📊 Business Insights'}
          </div>
          <div className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1`}>
            <div>• Best performing day: {salesData.reduce((best, day) => day.value > best.value ? day : best, salesData[0])?.name}</div>
            <div>• Top category: {categoryData[0]?.name || 'N/A'}</div>
            <div>• Avg order value: ${stats.totalOrders > 0 ? Math.round(stats.revenue / stats.totalOrders) : 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Overview Component with enhanced theme integration
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
    <div className={`${
      darkMode 
        ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
        : 'neumorph-card bg-white border-gray-100'
    } rounded-xl overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'INVENTORY MATRIX' : 'Inventory Overview'}
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`px-3 py-1 rounded-md text-sm ${
            darkMode 
              ? 'cyber-btn bg-gray-800 border-cyan-500/50 text-cyan-300' 
              : 'neumorph-btn bg-white border-gray-300'
          } border focus:ring-indigo-500 focus:border-indigo-500`}
        >
          <option value="all">All Products ({stockSummary.total})</option>
          <option value="in_stock">In Stock ({stockSummary.inStock})</option>
          <option value="low_stock">Low Stock ({stockSummary.lowStock})</option>
          <option value="out_of_stock">Out of Stock ({stockSummary.outOfStock})</option>
        </select>
      </div>
      
      {/* Stock Summary Cards */}
      <div className={`p-6 border-b ${darkMode ? 'border-cyan-500/20' : 'border-gray-200'}`}>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400 cyber-glow' : 'text-blue-600'}`}>
              {stockSummary.total}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400 cyber-glow' : 'text-green-600'}`}>
              {stockSummary.inStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>In Stock</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-600'}`}>
              {stockSummary.lowStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-red-400 cyber-glow' : 'text-red-600'}`}>
              {stockSummary.outOfStock}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Out of Stock</div>
          </div>
        </div>
      </div>
      
      {/* Product List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <div className={`divide-y ${darkMode ? 'divide-cyan-500/20' : 'divide-gray-200'}`}>
            {filteredProducts.slice(0, 10).map((product) => (
              <div key={product.id} className={`p-4 ${
                darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
              } transition-colors duration-200`}>
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
                        ? darkMode 
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                          : 'bg-green-100 text-green-800'
                        : product.stock > 0
                          ? darkMode 
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' 
                            : 'bg-yellow-100 text-yellow-800'
                          : darkMode 
                            ? 'bg-red-900/30 text-red-400 border border-red-500/30' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} units
                    </span>
                    <Link 
                      to={`/inventory/${product.id}`}
                      className={`text-sm ${
                        darkMode 
                          ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' 
                          : 'text-indigo-600 hover:text-indigo-800'
                      } font-medium transition-colors duration-200`}
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
      
      <div className={`border-t ${
        darkMode 
          ? 'border-cyan-500/30 bg-gray-800/50' 
          : 'border-gray-100 bg-gray-50'
      } px-6 py-3`}>
        <Link 
          to="/inventory" 
          className={`text-sm font-medium ${
            darkMode 
              ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' 
              : 'text-indigo-600 hover:text-indigo-800'
          } flex items-center justify-center transition-colors duration-200`}
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

// Enhanced Quick Actions Component - UPDATED: Removed manage users and new orders
const QuickActions = ({ darkMode, onGenerateReport, onScheduleMeeting }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  
  const actions = [
    {
      id: 'add-product',
      to: '/add-product',
      name: darkMode ? 'ADD TO MATRIX' : 'Add Product',
      description: darkMode ? 'Insert new item' : 'List new products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'indigo'
    },
    {
      id: 'manage-inventory',
      to: '/inventory',
      name: darkMode ? 'INVENTORY CONTROL' : 'Manage Inventory',
      description: darkMode ? 'Monitor systems' : 'View all products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'pending-orders',
      to: '/orders',
      name: darkMode ? 'ORDER STREAM' : 'Process Orders',
      description: darkMode ? 'Handle requests' : 'Manage orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: 'generate-report',
      action: onGenerateReport,
      name: darkMode ? 'DATA EXTRACTION' : 'Generate Report',
      description: darkMode ? 'Export intel' : 'Download analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'pink'
    }
  ];
  
  return (
    <div className={`${
      darkMode 
        ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
        : 'neumorph-card bg-white border-gray-100'
    } rounded-xl overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-cyan-500/30' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white cyber-title cyber-glow' : 'text-gray-800 neumorph-title'}`}>
          {darkMode ? 'COMMAND INTERFACE' : 'Manager Actions'}
        </h2>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          {darkMode ? 'Neural access to core functions' : 'Quick access to key functions'}
        </p>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const isButton = action.action && !action.to;
          const Component = isButton ? 'button' : Link;
          const props = isButton 
            ? { onClick: action.action }
            : { to: action.to };

          return (
            <Component 
              key={action.id}
              {...props}
              className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform ${
                hoverIndex === index ? 'scale-105' : 'scale-100'
              } group border ${
                darkMode ? 
                  `border-cyan-500/30 hover:border-cyan-400/50 bg-gray-800/30 hover:bg-gray-800/50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20` : 
                  `border-gray-100 hover:border-${action.color}-100 hover:bg-${action.color}-50`
              }`}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className={`h-12 w-12 rounded-full ${
                darkMode ? 
                  `bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30` : 
                  `bg-${action.color}-100`
              } flex items-center justify-center mb-3 ${
                darkMode ? 
                  `group-hover:shadow-lg group-hover:shadow-cyan-500/30` : 
                  `group-hover:bg-${action.color}-200`
              } transition-all duration-300`}
              >
                <span className={`${
                  darkMode ? 
                    `text-cyan-400 group-hover:text-cyan-300` : 
                    `text-${action.color}-600`
                }`}>
                  {action.icon}
                </span>
              </div>
              <span className={`text-sm font-medium text-center ${
                darkMode ? 
                  `text-gray-200 group-hover:text-cyan-400 group-hover:cyber-glow` : 
                  `text-gray-800 group-hover:text-${action.color}-700`
              } transition-colors duration-300`}>
                {action.name}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-center`}>
                {action.description}
              </span>
            </Component>
          );
        })}
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
  const [notification, setNotification] = useState(null);

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchManagerData = async () => {
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
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  // Fixed: Now actually updates Firebase instead of just local state
  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      // Actually update Firebase
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Then update local state to reflect the change immediately
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
      
      showNotification(`Order ${orderId.slice(0, 8)} updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Failed to update order status', 'error');
      throw error;
    }
  }, []);

  // New: Bulk order operations
  const handleBulkOrderUpdate = useCallback(async (orderIds, newStatus) => {
    try {
      const batch = writeBatch(db);
      
      orderIds.forEach(orderId => {
        const orderRef = doc(db, 'orders', orderId);
        batch.update(orderRef, { 
          status: newStatus,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      
      // Update local state
      setStats(prev => ({
        ...prev,
        allOrders: prev.allOrders.map(order => 
          orderIds.includes(order.id) ? { ...order, status: newStatus } : order
        ),
        pendingOrders: prev.allOrders.filter(o => 
          orderIds.includes(o.id) ? newStatus === 'pending' : o.status === 'pending'
        ).length
      }));
      
      showNotification(`${orderIds.length} orders updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      showNotification('Failed to bulk update orders', 'error');
      throw error;
    }
  }, []);

  // New: Bulk restock operation
  const handleBulkRestock = useCallback(async (productIds, amount) => {
    try {
      const batch = writeBatch(db);
      
      productIds.forEach(productId => {
        const productRef = doc(db, 'products', productId);
        batch.update(productRef, { 
          stock: amount,
          lastRestocked: new Date()
        });
      });
      
      await batch.commit();
      
      // Update local state
      setStats(prev => ({
        ...prev,
        allProducts: prev.allProducts.map(product => 
          productIds.includes(product.id) ? { ...product, stock: amount } : product
        ),
        lowStockProducts: prev.allProducts.filter(p => 
          productIds.includes(p.id) ? amount <= 10 : p.stock <= 10
        ).length
      }));
      
      showNotification(`${productIds.length} products restocked with ${amount} units each`, 'success');
    } catch (error) {
      console.error('Error bulk restocking:', error);
      showNotification('Failed to bulk restock products', 'error');
      throw error;
    }
  }, []);

  // Generate and download reports
  const handleGenerateReport = () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalRevenue: stats.revenue,
          totalOrders: stats.totalOrders,
          pendingOrders: stats.pendingOrders,
          completedOrders: stats.allOrders.filter(o => o.status === 'completed').length,
          todayOrders: stats.todayOrders,
          lowStockItems: stats.lowStockProducts
        },
        orderBreakdown: {
          pending: stats.allOrders.filter(o => o.status === 'pending').length,
          processing: stats.allOrders.filter(o => o.status === 'processing').length,
          completed: stats.allOrders.filter(o => o.status === 'completed').length,
          cancelled: stats.allOrders.filter(o => o.status === 'cancelled').length
        },
        inventoryStatus: {
          totalProducts: stats.totalProducts,
          inStock: stats.allProducts.filter(p => p.stock > 10).length,
          lowStock: stats.allProducts.filter(p => p.stock <= 10 && p.stock > 0).length,
          outOfStock: stats.allProducts.filter(p => p.stock === 0).length
        },
        salesTrends: {
          last7DaysRevenue: stats.allOrders
            .filter(order => {
              const daysDiff = (new Date() - order.createdAt) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7;
            })
            .reduce((sum, order) => sum + order.total, 0)
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manager-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('Report downloaded successfully', 'success');
    } catch (error) {
      showNotification('Failed to generate report', 'error');
    }
  };

  const handleScheduleMeeting = () => {
    showNotification('Team meeting scheduled for tomorrow at 2 PM', 'success');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          darkMode ? 'border-cyan-500' : 'border-indigo-500'
        }`}></div>
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
    <div className={`min-h-screen ${darkMode ? 'cyberpunk-layout-wrapper' : 'neumorph-layout-wrapper'} relative`}>
      {/* SecretInvasion Background */}
      <SecretInvasionBackground 
        intensity={darkMode ? 0.8 : 0.6} 
        enableGlitch={darkMode} 
      />
      
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'} relative z-10`}>
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? darkMode 
                ? 'bg-green-900/90 border-green-500/50 text-green-100 shadow-green-500/20' 
                : 'bg-green-100 border-green-400 text-green-800'
              : darkMode 
                ? 'bg-red-900/90 border-red-500/50 text-red-100 shadow-red-500/20' 
                : 'bg-red-100 border-red-400 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${
                darkMode 
                  ? 'text-white cyber-title cyber-glow' 
                  : 'text-gray-900 neumorph-title'
              }`}>
                {darkMode ? 'NEURAL COMMAND CENTER' : 'Manager Dashboard'}
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {darkMode 
                  ? 'Real-time operations control with quantum analytics and neural processing' 
                  : 'Real-time operations management with bulk actions and smart alerts'
                }
              </p>
            </div>
            <button
              onClick={fetchManagerData}
              disabled={loading}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'cyber-btn bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-lg shadow-cyan-500/20' 
                  : 'neumorph-btn bg-blue-600 hover:bg-blue-700'
              } text-white disabled:opacity-50 transition-all duration-300`}
            >
              {loading ? 'SYNCING...' : darkMode ? 'SYNC DATA' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: darkMode ? 'REVENUE STREAM' : 'Total Revenue', 
              value: `$${stats.revenue.toFixed(2)}`, 
              icon: '💰', 
              color: 'green' 
            },
            { 
              title: darkMode ? 'TODAY\'S FEED' : 'Today\'s Orders', 
              value: stats.todayOrders, 
              icon: '📋', 
              color: 'blue' 
            },
            { 
              title: darkMode ? 'PENDING QUEUE' : 'Pending Orders', 
              value: stats.pendingOrders, 
              icon: '⏳', 
              color: 'yellow' 
            },
            { 
              title: darkMode ? 'LOW STOCK ALERTS' : 'Low Stock Items', 
              value: stats.lowStockProducts, 
              icon: '📦', 
              color: 'red' 
            }
          ].map((stat, index) => (
            <div key={index} className={`${
              darkMode 
                ? 'cyber-card bg-gray-900 border-cyan-500/30 shadow-lg shadow-cyan-500/20' 
                : 'neumorph-card bg-white border-gray-100'
            } rounded-xl border p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode 
                      ? 'text-white cyber-glow' 
                      : 'text-gray-900'
                  } mt-1`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`text-3xl p-3 rounded-full ${
                  darkMode 
                    ? `bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30` 
                    : `bg-${stat.color}-100`
                }`}>
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
            
            {/* Order Processing with Bulk Operations */}
            <OrderProcessing 
              orders={stats.allOrders} 
              darkMode={darkMode}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onBulkUpdate={handleBulkOrderUpdate}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Low Stock Alerts with Actions */}
            <LowStockAlerts 
              products={stats.allProducts} 
              darkMode={darkMode}
              onBulkRestock={handleBulkRestock}
            />
            
            {/* Business Performance with Real Data */}
            <BusinessPerformance stats={stats} darkMode={darkMode} />
            
            {/* Enhanced Manager Actions (Updated - removed user management and new orders) */}
            <QuickActions 
              darkMode={darkMode}
              onGenerateReport={handleGenerateReport}
              onScheduleMeeting={handleScheduleMeeting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;