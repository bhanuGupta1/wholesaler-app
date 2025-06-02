// src/pages/admin/UserApprovalDashboard.jsx - Professional admin interface for user approvals
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, updateDoc, doc, writeBatch, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const UserApprovalDashboard = () => {
  const { user, hasPermission } = useAuth();
  const { darkMode } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_approval');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Check if user has permission to approve users
  const canApproveUsers = hasPermission('canApproveUsers') || user?.accountType === 'admin';

  useEffect(() => {
    if (canApproveUsers) {
      fetchUsers();
    }
  }, [canApproveUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchTerm.trim() === '' || 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      // Account type filter
      const matchesAccountType = accountTypeFilter === 'all' || user.accountType === accountTypeFilter;
      
      return matchesSearch && matchesStatus && matchesAccountType;
    });
  }, [users, searchTerm, statusFilter, accountTypeFilter]);

  // Get counts for different statuses
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
      else if (user.approved) counts.approved++;
      else if (user.status === 'rejected') counts.rejected++;
      else if (user.status === 'suspended') counts.suspended++;
    });
    
    return counts;
  }, [users]);

  const handleUserAction = async (userId, action, newStatus = null) => {
    if (processing.has(userId)) return;
    
    setProcessing(prev => new Set(prev).add(userId));
    
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        updatedAt: new Date()
      };
      
      switch (action) {
        case 'approve':
          updateData.approved = true;
          updateData.status = 'active';
          updateData.isActive = true;
          // Set default permissions based on account type
          const targetUser = users.find(u => u.id === userId);
          updateData.permissions = getDefaultPermissions(targetUser?.accountType);
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
        case 'update_status':
          updateData.status = newStatus;
          updateData.approved = newStatus === 'active';
          updateData.isActive = newStatus === 'active';
          break;
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, ...updateData } : u
      ));
      
      const actionMessages = {
        approve: 'approved',
        reject: 'rejected', 
        suspend: 'suspended',
        reactivate: 'reactivated',
        update_status: `status updated to ${newStatus}`
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
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) return;
    
    try {
      const batch = writeBatch(db);
      const updateData = {
        updatedAt: new Date()
      };
      
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
      }
      
      selectedUsers.forEach(userId => {
        const userRef = doc(db, 'users', userId);
        // Add permissions for approved users
        if (action === 'approve') {
          const targetUser = users.find(u => u.id === userId);
          updateData.permissions = getDefaultPermissions(targetUser?.accountType);
        }
        batch.update(userRef, updateData);
      });
      
      await batch.commit();
      
      // Update local state
      setUsers(prev => prev.map(u => 
        selectedUsers.has(u.id) ? { ...u, ...updateData } : u
      ));
      
      setSelectedUsers(new Set());
      showNotification(`${selectedUsers.size} users ${action}ed successfully`, 'success');
    } catch (error) {
      console.error(`Error bulk ${action}ing users:`, error);
      showNotification(`Failed to bulk ${action} users`, 'error');
    }
  };

  const getDefaultPermissions = (accountType) => {
    switch (accountType) {
      case 'manager':
        return {
          canCreateOrders: true,
          canManageInventory: true,
          canViewAllOrders: true,
          canApproveUsers: false,
          canManageUsers: false
        };
      case 'business':
        return {
          canCreateOrders: true,
          canManageInventory: false,
          canViewAllOrders: false,
          canApproveUsers: false,
          canManageUsers: false
        };
      case 'user':
      default:
        return {
          canCreateOrders: true,
          canManageInventory: false,
          canViewAllOrders: false,
          canApproveUsers: false,
          canManageUsers: false
        };
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const getStatusBadge = (user) => {
    const status = user.status;
    const approved = user.approved;
    
    if (status === 'pending_approval') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
        }`}>
          Pending
        </span>
      );
    } else if (approved && status === 'active') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
        }`}>
          Approved
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
        }`}>
          Rejected
        </span>
      );
    } else if (status === 'suspended') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-800'
        }`}>
          Suspended
        </span>
      );
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
      }`}>
        {status || 'Unknown'}
      </span>
    );
  };

  if (!canApproveUsers) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to approve users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
            : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
        } border`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              User Management
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Approve, manage, and monitor user accounts across the platform
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white disabled:opacity-50 transition-colors`}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { title: 'Total Users', value: statusCounts.all, color: 'blue' },
          { title: 'Pending Approval', value: statusCounts.pending_approval, color: 'yellow' },
          { title: 'Approved', value: statusCounts.approved, color: 'green' },
          { title: 'Rejected', value: statusCounts.rejected, color: 'red' },
          { title: 'Suspended', value: statusCounts.suspended, color: 'gray' }
        ].map((stat, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
            <div className="text-center">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, email, or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-indigo-500 focus:border-indigo-500`}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending_approval">Pending ({statusCounts.pending_approval})</option>
              <option value="active">Approved ({statusCounts.approved})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
              <option value="suspended">Suspended ({statusCounts.suspended})</option>
            </select>
          </div>
          <div>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="all">All Types</option>
              <option value="user">Regular Users</option>
              <option value="business">Business</option>
              <option value="manager">Managers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-700'} font-medium`}>
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject All
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Suspend All
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className={`border px-3 py-1 rounded text-sm ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Users ({filteredUsers.length})
          </h2>
          {filteredUsers.length > 0 && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select All
              </span>
            </label>
          )}
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Select
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Account Type
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Business
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Created
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(userData.id)}
                        onChange={() => handleSelectUser(userData.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {userData.displayName || 'No Name'}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {userData.email}
                        </div>
                        {userData.phoneNumber && (
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            📞 {userData.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'} capitalize`}>
                          {userData.accountType || 'User'}
                        </span>
                        {userData.businessType && (
                          <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} capitalize`}>
                            {userData.businessType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {userData.businessName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(userData)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {userData.createdAt.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {userData.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleUserAction(userData.id, 'approve')}
                              disabled={processing.has(userData.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {processing.has(userData.id) ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleUserAction(userData.id, 'reject')}
                              disabled={processing.has(userData.id)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {userData.approved && userData.status === 'active' && (
                          <button
                            onClick={() => handleUserAction(userData.id, 'suspend')}
                            disabled={processing.has(userData.id)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                        
                        {(userData.status === 'suspended' || userData.status === 'rejected') && (
                          <button
                            onClick={() => handleUserAction(userData.id, 'reactivate')}
                            disabled={processing.has(userData.id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        )}
                        
                        <button
                          className={`text-xs ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              👥
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No users found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No users have been registered yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApprovalDashboard;