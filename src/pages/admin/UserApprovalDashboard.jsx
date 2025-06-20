// src/pages/admin/UserApprovalDashboard.jsx - Enhanced Futuristic User Management
import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc, writeBatch, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

// Futuristic Status Badge Component
const FuturisticStatusBadge = ({ user, darkMode }) => {
  const getStatusConfig = () => {
    const status = user.status;
    const approved = user.approved;
    
    if (status === 'pending_approval') {
      return {
        label: 'PENDING',
        colors: darkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' : 'bg-yellow-100 text-yellow-800 border-yellow-400/50',
        animation: 'animate-pulse'
      };
    } else if (approved && status === 'active') {
      return {
        label: 'APPROVED',
        colors: darkMode ? 'bg-green-900/30 text-green-400 border-green-500/50' : 'bg-green-100 text-green-800 border-green-400/50',
        animation: ''
      };
    } else if (status === 'rejected') {
      return {
        label: 'REJECTED',
        colors: darkMode ? 'bg-red-900/30 text-red-400 border-red-500/50' : 'bg-red-100 text-red-800 border-red-400/50',
        animation: ''
      };
    } else if (status === 'suspended') {
      return {
        label: 'SUSPENDED',
        colors: darkMode ? 'bg-gray-900/30 text-gray-400 border-gray-500/50' : 'bg-gray-100 text-gray-800 border-gray-400/50',
        animation: ''
      };
    }
    
    return {
      label: 'UNKNOWN',
      colors: darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-500/50' : 'bg-blue-100 text-blue-800 border-blue-400/50',
      animation: 'animate-pulse'
    };
  };

  const config = getStatusConfig();
  
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-mono uppercase border ${config.colors} ${config.animation} transition-all duration-300`}>
      [{config.label}]
    </span>
  );
};

// Enhanced User Card Component
const FuturisticUserCard = ({ userData, darkMode, onAction, processing, selected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`group relative p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
        selected 
          ? darkMode ? 'border-cyan-500 bg-cyan-900/20' : 'border-blue-500 bg-blue-50'
          : darkMode ? 'border-gray-600 bg-gray-800/50 hover:border-cyan-500/50' : 'border-gray-200 bg-white hover:border-blue-500/50'
      } backdrop-blur-sm cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(userData.id)}
    >
      {/* Selection indicator */}
      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
        selected 
          ? darkMode ? 'border-cyan-500 bg-cyan-500' : 'border-blue-500 bg-blue-500'
          : darkMode ? 'border-gray-500' : 'border-gray-300'
      }`}>
        {selected && (
          <div className={`w-full h-full rounded-full ${
            darkMode ? 'bg-cyan-400' : 'bg-blue-400'
          } animate-pulse`}></div>
        )}
      </div>

      {/* Animated border effect */}
      {isHovered && (
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
          darkMode ? 'from-cyan-500/10 to-purple-500/10' : 'from-blue-500/10 to-indigo-500/10'
        } animate-pulse pointer-events-none`}></div>
      )}

      <div className="relative space-y-3">
        {/* User Avatar & Info */}
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full ${
            darkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          } flex items-center justify-center text-white font-bold text-lg`}>
            {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : userData.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              {userData.displayName || 'No Name'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate font-mono`}>
              {userData.email}
            </p>
            {userData.phoneNumber && (
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
                📞 {userData.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Account Type & Business Info */}
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} capitalize font-mono`}>
              {userData.accountType || 'User'}
            </span>
            {userData.businessType && (
              <span className={`ml-2 text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} capitalize font-mono`}>
                [{userData.businessType}]
              </span>
            )}
          </div>
          <FuturisticStatusBadge user={userData} darkMode={darkMode} />
        </div>

        {/* Business Name */}
        {userData.businessName && (
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
            🏢 {userData.businessName}
          </div>
        )}

        {/* Created Date */}
        <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
          CREATED: {userData.createdAt.toLocaleDateString()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          {userData.status === 'pending_approval' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onAction(userData.id, 'approve'); }}
                disabled={processing.has(userData.id)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all duration-300 ${
                  darkMode 
                    ? 'bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/50' 
                    : 'bg-green-600/20 hover:bg-green-600/40 text-green-600 border border-green-500/50'
                } disabled:opacity-50 hover:scale-105`}
              >
                {processing.has(userData.id) ? 'PROCESSING...' : '✓ APPROVE'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAction(userData.id, 'reject'); }}
                disabled={processing.has(userData.id)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all duration-300 ${
                  darkMode 
                    ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50' 
                    : 'bg-red-600/20 hover:bg-red-600/40 text-red-600 border border-red-500/50'
                } disabled:opacity-50 hover:scale-105`}
              >
                ✗ REJECT
              </button>
            </>
          )}
          
          {userData.approved && userData.status === 'active' && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(userData.id, 'suspend'); }}
              disabled={processing.has(userData.id)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all duration-300 ${
                darkMode 
                  ? 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-500/50' 
                  : 'bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-600 border border-yellow-500/50'
              } disabled:opacity-50 hover:scale-105`}
            >
              ⏸ SUSPEND
            </button>
          )}
          
          {(userData.status === 'suspended' || userData.status === 'rejected') && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(userData.id, 'reactivate'); }}
              disabled={processing.has(userData.id)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-mono transition-all duration-300 ${
                darkMode 
                  ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50' 
                  : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-600 border border-blue-500/50'
              } disabled:opacity-50 hover:scale-105`}
            >
              ▶ REACTIVATE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Enhanced UserApprovalDashboard Component
const UserApprovalDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { darkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [notification, setNotification] = useState(null);
  const [realTimeConnected, setRealTimeConnected] = useState(false);

  // Check permissions
  const canApproveUsers = hasPermission('canApproveUsers') || user?.accountType === 'admin';

  // Real-time Firebase listener
  useEffect(() => {
    if (!canApproveUsers) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setUsers(fetchedUsers);
        setLoading(false);
        setRealTimeConnected(true);
      },
      (error) => {
        console.error('Real-time users listener error:', error);
        setRealTimeConnected(false);
        setLoading(false);
        showNotification('Real-time connection failed', 'error');
      }
    );

    return () => unsubscribe();
  }, [canApproveUsers]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm.trim() === '' || 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending_approval' && user.status === 'pending_approval') ||
        (statusFilter === 'active' && user.approved && user.status === 'active') ||
        (statusFilter === 'rejected' && user.status === 'rejected') ||
        (statusFilter === 'suspended' && user.status === 'suspended');
      
      const matchesAccountType = accountTypeFilter === 'all' || user.accountType === accountTypeFilter;
      
      return matchesSearch && matchesStatus && matchesAccountType;
    });
  }, [users, searchTerm, statusFilter, accountTypeFilter]);

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: users.length,
      pending_approval: 0,
      approved: 0,
      rejected: 0,
      suspended: 0
    };
    
    users.forEach(user => {
      if (user.status === 'pending_approval') counts.pending_approval++;
      else if (user.approved && user.status === 'active') counts.approved++;
      else if (user.status === 'rejected') counts.rejected++;
      else if (user.status === 'suspended') counts.suspended++;
    });
    
    return counts;
  }, [users]);

  const handleUserAction = useCallback(async (userId, action) => {
    if (processing.has(userId)) return;
    
    setProcessing(prev => new Set(prev).add(userId));
    
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = { updatedAt: new Date() };
      
      switch (action) {
        case 'approve':
          updateData.approved = true;
          updateData.status = 'active';
          updateData.isActive = true;
          break;
        case 'reject':
          updateData.approved = false;
          updateData.status = 'rejected';
          updateData.isActive = false;
          break;
        case 'suspend':
          updateData.approved = false;
          updateData.status = 'suspended';
          updateData.isActive = false;
          break;
        case 'reactivate':
          updateData.approved = true;
          updateData.status = 'active';
          updateData.isActive = true;
          break;
      }
      
      await updateDoc(userRef, updateData);
      
      const actionMessages = {
        approve: 'approved',
        reject: 'rejected', 
        suspend: 'suspended',
        reactivate: 'reactivated'
      };
      
      showNotification(`User ${actionMessages[action]} successfully`, 'success');
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      showNotification(`Failed to ${action} user`, 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [processing, showNotification]);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedUsers.size === 0) return;
    
    try {
      const batch = writeBatch(db);
      const updateData = { updatedAt: new Date() };
      
      switch (action) {
        case 'approve':
          updateData.approved = true;
          updateData.status = 'active';
          updateData.isActive = true;
          break;
        case 'reject':
          updateData.approved = false;
          updateData.status = 'rejected';
          updateData.isActive = false;
          break;
        case 'suspend':
          updateData.approved = false;
          updateData.status = 'suspended';
          updateData.isActive = false;
          break;
        case 'delete':
          // Handle deletion separately
          const deletePromises = Array.from(selectedUsers).map(userId => 
            deleteDoc(doc(db, 'users', userId))
          );
          await Promise.all(deletePromises);
          setSelectedUsers(new Set());
          showNotification(`${selectedUsers.size} users deleted successfully`, 'success');
          return;
      }
      
      selectedUsers.forEach(userId => {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, updateData);
      });
      
      await batch.commit();
      setSelectedUsers(new Set());
      showNotification(`${selectedUsers.size} users ${action}ed successfully`, 'success');
    } catch (error) {
      console.error(`Error bulk ${action}ing users:`, error);
      showNotification(`Failed to bulk ${action} users`, 'error');
    }
  }, [selectedUsers, showNotification]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  }, [selectedUsers.size, filteredUsers]);

  if (!canApproveUsers) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`text-8xl mb-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>🚫</div>
          <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} font-mono`}>
            [ACCESS_DENIED]
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
            Insufficient privileges for user management operations
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className={`inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid ${
            darkMode ? 'border-cyan-500 border-r-transparent' : 'border-blue-500 border-r-transparent'
          }`}></div>
          <p className={`mt-4 font-mono ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
            LOADING_USER_MATRIX...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border backdrop-blur-sm ${
            notification.type === 'success' 
              ? darkMode ? 'bg-green-900/80 border-green-500/50 text-green-100' : 'bg-green-100/80 border-green-400/50 text-green-800'
              : darkMode ? 'bg-red-900/80 border-red-500/50 text-red-100' : 'bg-red-100/80 border-red-400/50 text-red-800'
          } animate-slide-in`}>
            <div className="flex items-center">
              <span className="font-mono text-sm">[SYSTEM]: {notification.message}</span>
            </div>
          </div>
        )}

        {/* Futuristic Header */}
        <div className="mb-8 relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            darkMode ? 'from-cyan-500/10 to-purple-500/10' : 'from-blue-500/10 to-indigo-500/10'
          } rounded-xl blur-xl`}></div>
          <div className={`relative p-6 rounded-xl border ${
            darkMode ? 'border-cyan-500/30 bg-gray-900/50' : 'border-blue-500/30 bg-white/50'
          } backdrop-blur-sm`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-4xl font-bold ${
                  darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400' 
                           : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'
                } font-mono`}>
                  USER_MANAGEMENT.sys
                </h1>
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                  &gt; Advanced user approval and monitoring interface
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse mr-2`}></div>
                  <span className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    REAL_TIME: {realTimeConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className={`flex rounded-lg p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 ${
                      viewMode === 'grid'
                        ? darkMode ? 'bg-cyan-600 text-white' : 'bg-blue-600 text-white'
                        : darkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    GRID
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 ${
                      viewMode === 'table'
                        ? darkMode ? 'bg-cyan-600 text-white' : 'bg-blue-600 text-white'
                        : darkMode ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    TABLE
                  </button>
                </div>
                <button
                  onClick={handleSelectAll}
                  className={`px-4 py-2 rounded-lg font-mono text-sm ${
                    darkMode 
                      ? 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/50' 
                      : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-600 border border-purple-500/50'
                  } transition-all duration-300 hover:scale-105`}
                >
                  {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? 'DESELECT_ALL' : 'SELECT_ALL'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { title: 'TOTAL', value: statusCounts.all, color: 'cyan', icon: '👥' },
            { title: 'PENDING', value: statusCounts.pending_approval, color: 'yellow', icon: '⏳' },
            { title: 'APPROVED', value: statusCounts.approved, color: 'green', icon: '✅' },
            { title: 'REJECTED', value: statusCounts.rejected, color: 'red', icon: '❌' },
            { title: 'SUSPENDED', value: statusCounts.suspended, color: 'gray', icon: '⏸️' }
          ].map((stat, index) => (
            <div key={index} className={`relative group hover:scale-105 transition-all duration-300`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${
                darkMode 
                  ? `from-${stat.color}-500/20 to-${stat.color}-600/20` 
                  : `from-${stat.color}-400/20 to-${stat.color}-500/20`
              } rounded-xl blur-sm group-hover:blur-none transition-all duration-300`}></div>
              <div className={`relative ${
                darkMode ? 'bg-gray-900/80' : 'bg-white/80'
              } backdrop-blur-sm rounded-xl shadow-lg border ${
                darkMode ? `border-${stat.color}-500/30` : `border-${stat.color}-400/30`
              } p-4 text-center`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wider font-mono`}>
                  {stat.title}
                </p>
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } font-mono`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className={`mb-6 p-6 rounded-xl border ${
          darkMode ? 'border-cyan-500/30 bg-gray-900/50' : 'border-blue-500/30 bg-white/50'
        } backdrop-blur-sm`}>
          <h3 className={`text-lg font-bold ${
            darkMode ? 'text-cyan-400' : 'text-blue-600'
          } font-mono mb-4 flex items-center`}>
            <span className="animate-pulse mr-2">🔍</span>
            FILTER_CONTROLS.panel
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                SEARCH_QUERY:
              </label>
              <input
                type="text"
                placeholder="Enter name, email, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg font-mono text-sm ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 focus:border-cyan-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } border focus:ring-2 focus:ring-opacity-50 transition-all duration-300`}
              />
            </div>
            <div>
              <label className={`block text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                STATUS_FILTER:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg font-mono text-sm ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 focus:border-cyan-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } border focus:ring-2 focus:ring-opacity-50 transition-all duration-300`}
              >
                <option value="all">ALL ({statusCounts.all})</option>
                <option value="pending_approval">PENDING ({statusCounts.pending_approval})</option>
                <option value="active">APPROVED ({statusCounts.approved})</option>
                <option value="rejected">REJECTED ({statusCounts.rejected})</option>
                <option value="suspended">SUSPENDED ({statusCounts.suspended})</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                TYPE_FILTER:
              </label>
              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg font-mono text-sm ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 focus:border-cyan-500' 
                    : 'bg-white border-gray-300 focus:border-blue-500'
                } border focus:ring-2 focus:ring-opacity-50 transition-all duration-300`}
              >
                <option value="all">ALL_TYPES</option>
                <option value="user">USERS</option>
                <option value="business">BUSINESS</option>
                <option value="manager">MANAGERS</option>
                <option value="admin">ADMINS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {selectedUsers.size > 0 && (
          <div className={`mb-6 p-4 rounded-xl border ${
            darkMode ? 'border-yellow-500/50 bg-yellow-900/20' : 'border-yellow-400/50 bg-yellow-50'
          } backdrop-blur-sm animate-slide-in`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                darkMode ? 'text-yellow-300' : 'text-yellow-800'
              } font-mono flex items-center`}>
                <span className="animate-pulse mr-2">⚡</span>
                BULK_MODE: {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/50' 
                      : 'bg-green-600/20 hover:bg-green-600/40 text-green-600 border border-green-500/50'
                  }`}
                >
                  ✓ APPROVE_ALL
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50' 
                      : 'bg-red-600/20 hover:bg-red-600/40 text-red-600 border border-red-500/50'
                  }`}
                >
                  ✗ REJECT_ALL
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 border border-gray-500/50' 
                      : 'bg-gray-600/20 hover:bg-gray-600/40 text-gray-600 border border-gray-500/50'
                  }`}
                >
                  ⏸ SUSPEND_ALL
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50' 
                      : 'bg-red-600/20 hover:bg-red-600/40 text-red-600 border border-red-500/50'
                  }`}
                >
                  🗑 DELETE_ALL
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 border border-gray-500/50' 
                      : 'bg-gray-600/20 hover:bg-gray-600/40 text-gray-600 border border-gray-500/50'
                  }`}
                >
                  CLEAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Display */}
        {filteredUsers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((userData) => (
                <FuturisticUserCard
                  key={userData.id}
                  userData={userData}
                  darkMode={darkMode}
                  onAction={handleUserAction}
                  processing={processing}
                  selected={selectedUsers.has(userData.id)}
                  onSelect={handleSelectUser}
                />
              ))}
            </div>
          ) : (
            // Table View (simplified for space)
            <div className={`rounded-xl border ${
              darkMode ? 'border-cyan-500/30 bg-gray-900/50' : 'border-blue-500/30 bg-white/50'
            } backdrop-blur-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${
                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-100'
                    } border-b`}>
                      <th className={`px-6 py-3 text-xs font-mono ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        SELECT
                      </th>
                      <th className={`px-6 py-3 text-xs font-mono ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        USER_DATA
                      </th>
                      <th className={`px-6 py-3 text-xs font-mono ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        TYPE
                      </th>
                      <th className={`px-6 py-3 text-xs font-mono ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        STATUS
                      </th>
                      <th className={`px-6 py-3 text-xs font-mono ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      } uppercase tracking-wider`}>
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(userData.id)}
                            onChange={() => handleSelectUser(userData.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${
                              darkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            } flex items-center justify-center text-white font-bold text-sm mr-3`}>
                              {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : userData.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} font-mono`}>
                                {userData.displayName || 'No Name'}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                                {userData.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'} capitalize font-mono`}>
                            {userData.accountType || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <FuturisticStatusBadge user={userData} darkMode={darkMode} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {userData.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleUserAction(userData.id, 'approve')}
                                  disabled={processing.has(userData.id)}
                                  className={`px-2 py-1 rounded text-xs font-mono transition-all duration-300 ${
                                    darkMode 
                                      ? 'bg-green-600/20 hover:bg-green-600/40 text-green-400' 
                                      : 'bg-green-600/20 hover:bg-green-600/40 text-green-600'
                                  } disabled:opacity-50`}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleUserAction(userData.id, 'reject')}
                                  disabled={processing.has(userData.id)}
                                  className={`px-2 py-1 rounded text-xs font-mono transition-all duration-300 ${
                                    darkMode 
                                      ? 'bg-red-600/20 hover:bg-red-600/40 text-red-400' 
                                      : 'bg-red-600/20 hover:bg-red-600/40 text-red-600'
                                  } disabled:opacity-50`}
                                >
                                  ✗
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className={`p-12 text-center rounded-xl border ${
            darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-200 bg-white/50'
          } backdrop-blur-sm`}>
            <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              👥
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2 font-mono`}>
              [NO_USERS_FOUND]
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
              {searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all'
                ? 'Adjust search parameters or clear filters'
                : 'No users registered in the system'
              }
            </p>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserApprovalDashboard;