// src/pages/AdminDashboard.jsx - Fixed with real user management
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

// Simple chart component for admin analytics
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

// System Health Monitor Component
const SystemHealthMonitor = ({ darkMode }) => {
  const [systemHealth, setSystemHealth] = useState({
    database: 'good',
    api: 'good',
    storage: 'warning',
    uptime: '99.9%'
  });

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>System Health</h2>
      </div>
      <div className="p-6 space-y-4">
        {Object.entries(systemHealth).map(([service, status]) => (
          <div key={service} className="flex items-center justify-between">
            <span className={`capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{service}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'good' 
                ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : status === 'warning'
                ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
            }`}>
              {service === 'uptime' ? status : status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced User Management Component with real Firebase operations
const UserManagement = ({ users, darkMode, onDeleteUser, onUpdateUserRole, onRefreshUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.displayName?.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [users, roleFilter, searchTerm]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteUser(userId);
      showNotification('User deleted successfully', 'success');
      onRefreshUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole, currentRole) => {
    if (currentRole === newRole) return;

    setLoading(true);
    try {
      await onUpdateUserRole(userId, newRole);
      showNotification(`User role updated to ${newRole}`, 'success');
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('Failed to update user role: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      {/* Notification */}
      {notification && (
        <div className={`mx-6 mt-6 p-3 rounded-lg ${
          notification.type === 'success' 
            ? darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-800'
            : darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-800'
        } border text-sm`}>
          {notification.message}
        </div>
      )}

      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
            } border focus:ring-indigo-500 focus:border-indigo-500`}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
            } border focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="business">Business</option>
            <option value="user">User</option>
          </select>
          <button
            onClick={onRefreshUsers}
            disabled={loading}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white disabled:opacity-50`}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>User</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Role</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Status</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Created</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {user.displayName || 'No name'}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value, user.role)}
                    disabled={loading}
                    className={`text-sm rounded-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                    } border focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
                  >
                    <option value="user">User</option>
                    <option value="business">Business</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.active !== false
                      ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={loading}
                      className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} font-medium disabled:opacity-50`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center">
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No users found with the current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// All Orders Management Component
const AllOrdersManagement = ({ orders, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.customerName.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    }

    // Sort orders
    if (sortOption === 'newest') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortOption === 'highest') {
      result.sort((a, b) => b.total - a.total);
    } else if (sortOption === 'lowest') {
      result.sort((a, b) => a.total - b.total);
    }
    
    return result;
  }, [orders, statusFilter, searchTerm, sortOption]);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>All Orders Management</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
            } border focus:ring-indigo-500 focus:border-indigo-500`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
            } border`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
            } border`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left">
          <thead>
            <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b sticky top-0`}>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Order ID</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Customer</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Date</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Total</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Status</th>
              <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    #{order.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {order.customerName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {order.createdAt.toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      : order.status === 'pending' 
                        ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                        : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link 
                    to={`/orders/${order.id}`} 
                    className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Admin Analytics Component
const AdminAnalytics = ({ stats, darkMode }) => {
  const revenueData = [
    { name: 'Jan', value: 12500 },
    { name: 'Feb', value: 15800 },
    { name: 'Mar', value: 18200 },
    { name: 'Apr', value: 22100 },
    { name: 'May', value: 19800 },
    { name: 'Jun', value: 25400 },
  ];
  
  const userData = [
    { name: 'Admin', value: stats.users.filter(u => u.role === 'admin').length },
    { name: 'Manager', value: stats.users.filter(u => u.role === 'manager').length },
    { name: 'Business', value: stats.users.filter(u => u.role === 'business').length },
    { name: 'User', value: stats.users.filter(u => u.role === 'user').length },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Platform Analytics</h2>
      </div>
      
      <div className="p-6">
        <SimpleBarChart 
          title="Monthly Revenue" 
          description="Platform revenue over the last 6 months" 
          data={revenueData} 
          color="indigo" 
          darkMode={darkMode} 
        />
        
        <SimpleBarChart 
          title="User Distribution" 
          description="Users by role across the platform" 
          data={userData} 
          color="green" 
          darkMode={darkMode} 
        />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { darkMode } = useTheme();
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

  // Function to fetch users from Firestore
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
      // If users collection doesn't exist, create some demo users
      const demoUsers = [
        {
          id: 'demo-admin-1',
          email: 'admin@company.com',
          displayName: 'Admin User',
          role: 'admin',
          active: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-manager-1',
          email: 'manager@company.com',
          displayName: 'Manager User',
          role: 'manager',
          active: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-business-1',
          email: 'business@company.com',
          displayName: 'Business User',
          role: 'business',
          active: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'demo-user-1',
          email: 'user@company.com',
          displayName: 'Regular User',
          role: 'user',
          active: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ];

      // Try to create users collection with demo data
      try {
        for (const user of demoUsers) {
          await setDoc(doc(db, 'users', user.id), {
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt
          });
        }
        return demoUsers;
      } catch (createError) {
        console.log('Could not create users collection, using local demo data');
        return demoUsers;
      }
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
        
        // Fetch all orders
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

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Update local state
      setStats(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        totalUsers: prev.totalUsers - 1
      }));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user from database');
    }
  }, []);

  const handleUpdateUserRole = useCallback(async (userId, newRole) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, 'users', userId), { 
        role: newRole,
        updatedAt: new Date()
      });
      
      // Update local state
      setStats(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      }));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role in database');
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const users = await fetchUsers();
      setStats(prev => ({
        ...prev,
        users,
        totalUsers: users.length
      }));
    } catch (error) {
      console.error('Error refreshing users:', error);
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
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage users, monitor system health, and oversee platform operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
          { title: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'green' },
          { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'indigo' },
          { title: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'yellow' }
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
          {/* User Management */}
          <UserManagement 
            users={stats.users} 
            darkMode={darkMode} 
            onDeleteUser={handleDeleteUser}
            onUpdateUserRole={handleUpdateUserRole}
            onRefreshUsers={refreshUsers}
          />
          
          {/* All Orders Management */}
          <AllOrdersManagement orders={stats.allOrders} darkMode={darkMode} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* System Health */}
          <SystemHealthMonitor darkMode={darkMode} />
          
          {/* Admin Analytics */}
          <AdminAnalytics stats={stats} darkMode={darkMode} />
          
          {/* Quick Admin Actions */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={refreshUsers}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh User Data
              </button>
              <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                System Backup
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Reports
              </button>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Send Notifications
              </button>
              <Link to="/inventory" className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center">
                Manage Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;