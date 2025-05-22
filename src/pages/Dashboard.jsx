// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

// Simple chart component for data visualization
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
const FeaturedProducts = ({ products, darkMode }) => {
  // Get the top 4 products to feature
  const featuredProducts = products.slice(0, 4);
  
  return (
    <motion.div 
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Featured Products</h2>
      </div>
      
      <div className="p-5 grid grid-cols-2 gap-4">
        {featuredProducts.map((product) => (
          <Link 
            key={product.id}
            to={`/inventory/${product.id}`}
            className={`flex flex-col p-4 rounded-xl 
              hover:bg-gray-${darkMode ? '700' : '50'} 
              transition-all duration-300 border ${darkMode ? 
                'border-gray-700' : 
                'border-gray-100'}`}
          >
            <div className="h-32 w-full mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {product.name}
            </span>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {product.category}
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                ${parseFloat(product.price).toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <Link 
          to="/inventory" 
          className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}
        >
          View all products
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

// Enhanced Activity Timeline with expandable details
const ActivityTimeline = ({ activities, darkMode }) => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  
  // Filter activities based on selected type
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter(activity => activity.type === filter);
  }, [activities, filter]);
  
  const handleActivityClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activities</h2>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
          <span className="mr-2">Filter by:</span>
          <select 
            className={`form-select rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'} text-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="order">Orders</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>
      </div>
      <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className={`p-5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}
              onClick={() => handleActivityClick(activity.id)}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  activity.type === 'order' 
                    ? darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                    : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  {activity.type === 'order' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{activity.description}</p>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {activity.type === 'order' ? 'Order Management' : 'Inventory Update'}
                  </p>
                  
                  {/* Expanded details */}
                  {expandedId === activity.id && (
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} animate-fade-in`}>
                      {activity.type === 'order' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reference:</span>
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              #{activity.id.substring(0, 8)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                              ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                              Processing
                            </span>
                          </div>
                          <div className="mt-2 text-right">
                            <Link 
                              to={`/orders/${activity.id.replace('order-', '')}`} 
                              className={`text-xs font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product:</span>
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {activity.description.includes('"') 
                                ? activity.description.split('"')[1] 
                                : 'Unknown product'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock level:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                              ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                              Low stock
                            </span>
                          </div>
                          <div className="mt-2 text-right">
                            <Link 
                              to="/inventory" 
                              className={`text-xs font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View inventory
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No activities found with the selected filter.</p>
          </div>
        )}
      </div>
      <div className={`${darkMode ? 'bg-gray-700 border-gray-700' : 'bg-gray-50 border-gray-100'} px-6 py-3 border-t`}>
        <Link to="/activity" className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}>
          View all activities
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

// Interactive QuickActions Component
const QuickActions = ({ darkMode }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  
  const actions = [
    {
      id: 'new-order',
      to: '/create-order',
      name: 'New Order',
      description: 'Create customer order',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'add-product',
      to: '/inventory',
      name: 'Add Product',
      description: 'Add to inventory',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'low-stock',
      to: '/inventory',
      name: 'Low Stock',
      description: 'View alerts',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'yellow'
    },
    {
      id: 'pending-orders',
      to: '/orders',
      name: 'Pending Orders',
      description: 'Process orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'purple'
    },
  ];
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link 
            key={action.id}
            to={action.to}
            className={`flex flex-col items-center p-4 rounded-xl 
              hover:bg-${action.color}-${darkMode ? '900/20' : '50'} 
              transition-all duration-300 transform ${hoverIndex === index ? 'scale-105' : 'scale-100'}
              group border ${darkMode ? 
                `border-gray-700 hover:border-${action.color}-800` : 
                `border-gray-100 hover:border-${action.color}-100`}`}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div className={`h-12 w-12 rounded-full ${darkMode ? 
              `bg-${action.color}-900/30` : 
              `bg-${action.color}-100`} 
              flex items-center justify-center mb-3 
              ${darkMode ? 
                `group-hover:bg-${action.color}-900/50` : 
                `group-hover:bg-${action.color}-200`} 
              transition-colors`}
            >
              <span className={`${darkMode ? 
                `text-${action.color}-400` : 
                `text-${action.color}-600`}`}
              >
                {action.icon}
              </span>
            </div>
            <span className={`text-sm font-medium ${darkMode ? 
              `text-gray-200 group-hover:text-${action.color}-400` : 
              `text-gray-800 group-hover:text-${action.color}-700`}`}
            >
              {action.name}
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Enhanced Orders Table with search function
const OrdersTable = ({ orders, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(order => 
        order.customerName.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [orders, statusFilter, searchTerm]);
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-0`}>Recent Orders</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'
              } border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm transition-colors`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`form-select rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'} text-sm pr-8 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          >
            <option value="all">All orders</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <Link to="/orders" className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium flex items-center text-sm`}>
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      
      {orders.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Order ID</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Customer</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Items</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Total</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>#{order.id.slice(0, 6)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 flex-shrink-0 rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-medium`}>
                            {order.customerName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{order.customerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {order.createdAt.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center">
                          <div className={`h-6 w-6 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} flex items-center justify-center text-xs font-medium`}>
                            {order.itemCount || (order.items && order.items.length) || 0}
                          </div>
                          <span className="ml-2">items</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>${parseFloat(order.total).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${order.status === 'completed' 
                            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                            : order.status === 'pending' 
                              ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                              : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                          {order.status === 'completed' && (
                            <svg className={`mr-1.5 h-2 w-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          )}
                          {order.status === 'pending' && (
                            <svg className={`mr-1.5 h-2 w-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          )}
                          {order.status === 'cancelled' && (
                            <svg className={`mr-1.5 h-2 w-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                          )}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/orders/${order.id}`} className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'} mr-3`}>View</Link>
                        <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>Edit</a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders found with the current filters.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className={`mt-2 text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent orders found.</p>
          <Link to="/create-order" className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'}`}>
            Create your first order
          </Link>
        </div>
      )}
    </div>
  );
};

// Skeleton Loader for better loading UX
const SkeletonLoader = ({ type, darkMode }) => {
  const bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  const pulseClass = 'animate-pulse';
  
  if (type === 'card') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden h-40`}>
        <div className="p-6">
          <div className="flex items-center">
            <div className={`${bgColor} ${pulseClass} h-12 w-12 rounded-xl`}></div>
            <div className="ml-5 space-y-2">
              <div className={`${bgColor} ${pulseClass} h-4 w-24 rounded`}></div>
              <div className={`${bgColor} ${pulseClass} h-6 w-16 rounded`}></div>
            </div>
          </div>
          <div className="mt-4">
            <div className={`${bgColor} ${pulseClass} h-4 w-full rounded`}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'table') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between">
            <div className={`${bgColor} ${pulseClass} h-6 w-40 rounded`}></div>
            <div className={`${bgColor} ${pulseClass} h-6 w-24 rounded`}></div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className={`${bgColor} ${pulseClass} h-10 w-10 rounded-full`}></div>
              <div className="flex-1">
                <div className={`${bgColor} ${pulseClass} h-4 w-full rounded mb-2`}></div>
                <div className={`${bgColor} ${pulseClass} h-3 w-1/2 rounded`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return null;
};

// Enhanced Analytics component with visualization
const Analytics = ({ metrics, stats, darkMode }) => {
  // Sample data for the chart
  const monthlyData = [
    { name: 'Jan', value: 3200 },
    { name: 'Feb', value: 4100 },
    { name: 'Mar', value: 3800 },
    { name: 'Apr', value: 5200 },
    { name: 'May', value: 6100 },
    { name: 'Jun', value: metrics?.revenue?.total || 7320 },
  ];
  
  const categoryData = [
    { name: 'Electronics', value: 42 },
    { name: 'Office', value: 28 },
    { name: 'Furniture', value: 16 },
    { name: 'Other', value: 14 },
  ];
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Performance Metrics</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Revenue this month</div>
            <span className="text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {metrics?.revenue?.percentChange || 16}%
            </span>
          </div>
          <div className="relative pt-1">
            <div className={`overflow-hidden h-2 text-xs flex rounded ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-200'}`}>
              <div style={{ width: "70%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} transition-all duration-500`}></div>
            </div>
            <div className={`flex justify-between mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>$0</span>
              <span>${metrics?.revenue?.total || '7,320.80'}</span>
            </div>
          </div>
        </div>
        
        <SimpleBarChart 
          title="Monthly Revenue" 
          description="Sales performance over the last 6 months" 
          data={monthlyData} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        <SimpleBarChart 
          title="Inventory by Category" 
          description="Distribution of products across categories" 
          data={categoryData} 
          color="green" 
          darkMode={darkMode} 
        />
      </div>
      
      <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
        <a href="#" className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}>
          Generate detailed report
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { darkMode } = useTheme();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    recentOrders: []
  });
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const lowStockThreshold = 10;
  
  // Fetch dashboard data from Firebase
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch product stats
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        const products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate product stats
        const totalProducts = products.length;
        const lowStockProducts = products.filter(
          product => product.stock <= lowStockThreshold
        ).length;

        // Fetch recent orders
        const ordersRef = collection(db, 'orders');
        const recentOrdersQuery = query(
          ordersRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const ordersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          // Handle potential missing fields or different timestamp formats
          const createdAt = data.createdAt ? 
            (typeof data.createdAt.toDate === 'function' ? 
              data.createdAt.toDate() : new Date(data.createdAt)) : 
            new Date();
            
          return {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            createdAt,
            items: data.items || [],
            itemCount: data.itemCount || 0,
            total: data.total || 0,
            status: data.status || 'pending'
          };
        });

        // Get total orders count
        const ordersCountSnapshot = await getDocs(collection(db, 'orders'));
        const totalOrders = ordersCountSnapshot.size;

        // Try to get metrics data (added in new seed)
        try {
          const metricsDoc = await getDoc(doc(db, 'metrics', 'current'));
          if (metricsDoc.exists()) {
            setMetrics(metricsDoc.data());
          }
        } catch (metricsError) {
          console.log('Metrics not available:', metricsError);
          // Not critical, continue without metrics
        }

        // Generate activities from recent actions
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(
          activitiesRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const fetchedActivities = activitiesSnapshot.docs.map(doc => {
          const data = doc.data();
          const activityDate = data.createdAt ? 
            (typeof data.createdAt.toDate === 'function' ? 
              data.createdAt.toDate() : new Date(data.createdAt)) : 
            new Date();
            
          return {
            id: doc.id,
            type: data.type || 'order',
            description: data.description || 'Activity',
            time: getRelativeTime(activityDate),
            createdAt: activityDate
          };
        });

        // If no activities found, generate from orders and products
        const combinedActivities = fetchedActivities.length > 0 ? 
          fetchedActivities : [];
        
        // Add order activities if no activities found
        if (combinedActivities.length === 0 && recentOrders.length > 0) {
          recentOrders.forEach((order, index) => {
            combinedActivities.push({
              id: `order-${order.id}`,
              type: 'order',
              description: `New order from ${order.customerName}`,
              time: getRelativeTime(order.createdAt),
              createdAt: order.createdAt
            });
          });

          // Add inventory activities for low stock
          const lowStockItems = products.filter(product => product.stock <= lowStockThreshold);
          lowStockItems.slice(0, 3).forEach((product, index) => {
            combinedActivities.push({
              id: `inventory-${product.id}`,
              type: 'inventory',
              description: `Product "${product.name}" is low on stock`,
              time: 'Today', // Fallback
              createdAt: new Date()
            });
          });
        }

        // Sort activities by time
        combinedActivities.sort((a, b) => b.createdAt - a.createdAt);

        // Update state with all fetched data
        setStats({
          totalProducts,
          lowStockProducts,
          totalOrders,
          recentOrders
        });
        
        setActivities(combinedActivities);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [lowStockThreshold]);

  // Helper function to format relative time
  function getRelativeTime(date) {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Handle refresh - now with useCallback for better performance
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);
  
  // Memoize stat cards data to prevent unnecessary recalculations
  const statCards = useMemo(() => [
    {
      id: 'products',
      title: 'Products',
      value: stats.totalProducts,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
      color: 'indigo',
      description: 'in inventory',
      link: '/inventory',
      linkText: 'View inventory',
      trend: 'up'
    },
    {
      id: 'low-stock',
      title: 'Low Stock',
      value: stats.lowStockProducts,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red',
      description: 'need attention',
      link: '/inventory',
      linkText: 'View alerts',
      trend: 'down'
    },
    {
      id: 'orders',
      title: 'Orders',
      value: stats.totalOrders,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'green',
      description: 'total orders',
      link: '/orders',
      linkText: 'View orders',
      trend: 'up'
    }
  ], [stats.totalProducts, stats.lowStockProducts, stats.totalOrders]);

  // CSS for animations
  useEffect(() => {
    // Add CSS for animations to document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to Your Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Here's what's happening with your business today
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              className={`p-2 ${darkMode ? 'bg-gray-700 text-indigo-400 border-gray-600' : 'bg-white text-indigo-600 border-gray-200'} rounded-full hover:bg-indigo-${darkMode ? '900' : '50'} border shadow-sm transition-colors`}
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh dashboard data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${darkMode ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="mt-4">
          <ol className={`flex items-center space-x-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <li>
              <Link to="/" className={`hover:text-indigo-${darkMode ? '400' : '600'} transition-colors`}>Home</Link>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-800'} font-medium`}>Dashboard</span>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Loading state with skeleton loaders */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <SkeletonLoader key={i} type="card" darkMode={darkMode} />
              ))}
            </div>
            
            {/* Table and Activity Skeletons */}
            <SkeletonLoader type="table" darkMode={darkMode} />
            <SkeletonLoader type="table" darkMode={darkMode} />
          </div>
          
          <div className="space-y-8">
            <SkeletonLoader type="table" darkMode={darkMode} />
            <SkeletonLoader type="table" darkMode={darkMode} />
          </div>
        </div>
      ) : error ? (
        <div className={`${darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-400 text-red-700'} border-l-4 p-4 mb-6`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${darkMode ? 'text-red-500' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              <button 
                onClick={handleRefresh}
                className={`mt-2 text-sm ${darkMode ? 'text-red-300 hover:text-red-200' : 'text-red-700 hover:text-red-600'} font-medium focus:outline-none`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard content
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards - now using memoized data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map(card => (
                <div 
                  key={card.id}
                  className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 border hover:shadow-lg`}
                >
                  <div className="px-6 py-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-xl ${darkMode ? `bg-${card.color}-900/30` : `bg-${card.color}-100`} p-3`}>
                        <span className={`${darkMode ? `text-${card.color}-400` : `text-${card.color}-600`}`}>
                          {card.icon}
                        </span>
                      </div>
                      <div className="ml-5">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>{card.title}</div>
                        <div className={`mt-1 text-3xl font-extrabold ${darkMode ? `text-${card.color}-400` : `text-${card.color}-600`}`}>{card.value}</div>
                        <div className="mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                            card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                              card.trend === 'up' 
                                ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                                : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                            } />
                          </svg>
                          <span className={`text-sm ${
                            card.trend === 'up' ? darkMode ? 'text-green-400' : 'text-green-600' : darkMode ? 'text-red-400' : 'text-red-600'
                          } ml-1`}>{card.description}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link to={card.link} className={`text-sm ${darkMode ? `text-${card.color}-400 hover:text-${card.color}-300` : `text-${card.color}-600 hover:text-${card.color}-800`} font-medium flex items-center`}>
                        {card.linkText}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Recent Orders - Enhanced with search functionality */}
            <OrdersTable orders={stats.recentOrders} darkMode={darkMode} />
            
            {/* Activity Timeline - Enhanced with expandable details */}
            <ActivityTimeline activities={activities} darkMode={darkMode} />
          </div>

          {/* Right Sidebar with Enhanced Components */}
          <div className="space-y-8">
            {/* Quick Actions - Enhanced with hover effects */}
            <QuickActions darkMode={darkMode} />
            
            {/* Analytics with data visualization */}
            <Analytics metrics={metrics} stats={stats} darkMode={darkMode} />
            
            {/* Upcoming Deliveries */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upcoming Deliveries</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
                  <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-blue-900/50' : 'bg-blue-100'} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Office Supplies Delivery</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Arriving Today, 2:30 PM</p>
                    
                    {/* Added progress bar */}
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5 dark:bg-blue-700/30">
                      <div className={`${darkMode ? 'bg-blue-500' : 'bg-blue-600'} h-1.5 rounded-full`} style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>In Transit</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>75%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} border`}>
                  <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-green-900/50' : 'bg-green-100'} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Electronics Shipment</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Arriving Tomorrow, 10:00 AM</p>
                    
                    {/* Added progress bar */}
                    <div className="mt-2 w-full bg-green-200 rounded-full h-1.5 dark:bg-green-700/30">
                      <div className={`${darkMode ? 'bg-green-500' : 'bg-green-600'} h-1.5 rounded-full`} style={{ width: '40%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>Processing</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>40%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-50'} px-6 py-3`}>
                <a href="#" className={`text-sm font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} flex items-center justify-center`}>
                  View all deliveries
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;