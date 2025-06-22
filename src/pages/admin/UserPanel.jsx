// src/pages/admin/UserPanel.jsx - FIXED: Professional Admin User Panel
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const UserPanel = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(new Set());

  // Fetch users data
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setUsers(userData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // FIXED: Professional role formatting
  const formatUserRole = (user) => {
    const { accountType, businessType } = user;
    
    switch (accountType) {
      case 'admin':
        return { label: 'Administrator', color: 'red', icon: '👑' };
      case 'manager':
        return { label: 'Manager', color: 'purple', icon: '👔' };
      case 'business':
        if (businessType === 'seller') {
          return { label: 'Business Seller', color: 'blue', icon: '🏪' };
        } else if (businessType === 'buyer') {
          return { label: 'Business Buyer', color: 'green', icon: '🛒' };
        }
        return { label: 'Business User', color: 'blue', icon: '🏢' };
      case 'user':
      default:
        return { label: 'Regular User', color: 'gray', icon: '👤' };
    }
  };

  // FIXED: Professional status formatting
  const formatUserStatus = (user) => {
    const { status, approved } = user;
    
    if (status === 'pending_approval' || status === 'pending') {
      return { label: 'Pending Approval', color: 'yellow', icon: '⏳' };
    } else if (approved && status === 'active') {
      return { label: 'Active', color: 'green', icon: '✅' };
    } else if (status === 'rejected') {
      return { label: 'Rejected', color: 'red', icon: '❌' };
    } else if (status === 'suspended') {
      return { label: 'Suspended', color: 'orange', icon: '⚠️' };
    }
    
    return { label: 'Unknown', color: 'gray', icon: '❓' };
  };

  // Filter users
  const filteredUsers = users.filter(userData => {
    const matchesSearch = 
      (userData.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (userData.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (userData.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || userData.status === statusFilter;
    const matchesAccountType = accountTypeFilter === 'all' || userData.accountType === accountTypeFilter;
    
    return matchesSearch && matchesStatus && matchesAccountType;
  });

  // Count statistics
  const statusCounts = users.reduce((counts, user) => {
    counts.all++;
    if (user.status === 'pending_approval' || user.status === 'pending') counts.pending++;
    else if (user.approved && user.status === 'active') counts.active++;
    else if (user.status === 'rejected') counts.rejected++;
    else if (user.status === 'suspended') counts.suspended++;
    return counts;
  }, { all: 0, pending: 0, active: 0, rejected: 0, suspended: 0 });

  // Handle user actions
  const handleUserAction = async (userId, action) => {
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
        case 'activate':
          updateData.approved = true;
          updateData.status = 'active';
          updateData.isActive = true;
          break;
      }
      
      await updateDoc(userRef, updateData);
      showNotification(`User ${action}d successfully`, 'success');
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

  // Handle role change
  const handleRoleChange = async (userId, newRole, newBusinessType = null) => {
    if (processing.has(userId)) return;
    
    setProcessing(prev => new Set(prev).add(userId));
    
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        accountType: newRole,
        updatedAt: new Date()
      };
      
      if (newRole === 'business' && newBusinessType) {
        updateData.businessType = newBusinessType;
      }
      
      await updateDoc(userRef, updateData);
      showNotification('User role updated successfully', 'success');
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Failed to update user role', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`text-xl ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
          Loading user panel...
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          User Management Panel
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage user accounts, roles, and permissions across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">👥</span>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Users
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statusCounts.all}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-xl border p-4`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏳</span>
            <div>
              <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} uppercase tracking-wide`}>
                Pending Approval
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {statusCounts.pending}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} rounded-xl border p-4`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} uppercase tracking-wide`}>
                Active Users
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                {statusCounts.active}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} rounded-xl border p-4`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <div>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'} uppercase tracking-wide`}>
                Rejected
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                {statusCounts.rejected}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} rounded-xl border p-4`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'} uppercase tracking-wide`}>
                Suspended
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                {statusCounts.suspended}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending_approval">Pending Approval ({statusCounts.pending})</option>
              <option value="active">Active ({statusCounts.active})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
              <option value="suspended">Suspended ({statusCounts.suspended})</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Filter by Type
            </label>
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
              } border focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="all">All Account Types</option>
              <option value="user">Regular Users</option>
              <option value="business">Business Accounts</option>
              <option value="manager">Managers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </div>

      {/* FIXED: Pending Approvals Section */}
      {statusCounts.pending > 0 && (
        <div className={`${darkMode ? 'bg-yellow-900/10 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-xl border p-6 mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              ⏳ Pending Approvals ({statusCounts.pending})
            </h3>
            <Link 
              to="/admin/approvals"
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                darkMode 
                  ? 'bg-yellow-600 text-black hover:bg-yellow-500' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              } transition-colors`}
            >
              View All Pending →
            </Link>
          </div>
          <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            You have {statusCounts.pending} user accounts waiting for approval. 
            These users cannot access their accounts until approved.
          </p>
        </div>
      )}

      {/* Users Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  User Information
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Account Type & Role
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Business Information
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Joined
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map((userData) => {
                const roleInfo = formatUserRole(userData);
                const statusInfo = formatUserStatus(userData);
                
                return (
                  <tr key={userData.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{roleInfo.icon}</div>
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {userData.displayName || userData.firstName + ' ' + userData.lastName || 'No Name'}
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
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
                          {roleInfo.label}
                        </span>
                        
                        {/* FIXED: Role Change Dropdown */}
                        <div className="mt-2">
                          <select
                            value={userData.accountType + (userData.businessType ? '-' + userData.businessType : '')}
                            onChange={(e) => {
                              const [newRole, businessType] = e.target.value.split('-');
                              handleRoleChange(userData.id, newRole, businessType);
                            }}
                            disabled={processing.has(userData.id)}
                            className={`w-full text-xs px-2 py-1 rounded ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                            } border focus:ring-blue-500 focus:border-blue-500`}
                          >
                            <option value="user">Regular User</option>
                            <option value="business-seller">Business Seller</option>
                            <option value="business-buyer">Business Buyer</option>
                            <option value="manager">Manager</option>
                            {user.accountType === 'admin' && (
                              <option value="admin">Administrator</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {userData.businessName || 'Not specified'}
                      </div>
                      {userData.businessType && (
                        <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} capitalize`}>
                          {userData.businessType === 'seller' ? '🏪 Seller' : '🛒 Buyer'}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                        statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {userData.createdAt.toLocaleDateString()}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {userData.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleUserAction(userData.id, 'approve')}
                              disabled={processing.has(userData.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleUserAction(userData.id, 'reject')}
                              disabled={processing.has(userData.id)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        
                        {userData.status === 'active' && (
                          <button
                            onClick={() => handleUserAction(userData.id, 'suspend')}
                            disabled={processing.has(userData.id)}
                            className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 disabled:opacity-50 transition-colors"
                          >
                            ⚠️ Suspend
                          </button>
                        )}
                        
                        {(userData.status === 'suspended' || userData.status === 'rejected') && (
                          <button
                            onClick={() => handleUserAction(userData.id, 'activate')}
                            disabled={processing.has(userData.id)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            🔄 Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No users found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPanel;