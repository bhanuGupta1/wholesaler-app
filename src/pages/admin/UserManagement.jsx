// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const UserManagement = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Backward compatibility: Normalize user data
        let status = data.status;
        if (!status) {
          // Handle old data structure
          if (data.approved === true) {
            status = 'approved';
          } else if (data.approved === false) {
            status = 'rejected';
          } else if (data.accountType === 'user') {
            status = 'approved'; // Old users were auto-approved
          } else {
            status = 'pending'; // Old business accounts need approval
          }
        }
        
        return {
          id: doc.id,
          ...data,
          status, // Use normalized status
          createdAt: data.createdAt?.toDate() || new Date(),
          // Provide defaults for missing fields
          accountType: data.accountType || 'user',
          businessType: data.businessType || (data.accountType === 'business' ? 'buyer' : null)
        };
      });
      
      // Filter out current admin and sort by created date
      const filteredUsers = allUsers
        .filter(u => u.id !== user?.uid)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, reason = null) => {
    if (updating === userId) return;
    
    setUpdating(userId);
    try {
      const updateData = {
        status: action,
        updatedAt: serverTimestamp()
      };

      if (action === 'approved') {
        updateData.approved = true; // Backward compatibility
        updateData.approvedBy = user.uid;
        updateData.approvedAt = serverTimestamp();
        updateData.rejectedReason = null;
      } else if (action === 'rejected') {
        updateData.approved = false; // Backward compatibility
        updateData.rejectedReason = reason || 'Application not approved';
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      } else if (action === 'suspended') {
        updateData.approved = false; // Backward compatibility
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, ...updateData, approvedBy: user.uid }
          : u
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.status === filter;
  });

  const userCounts = {
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected' || u.status === 'suspended').length,
    total: users.length
  };

  if (user?.accountType !== 'admin') {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600">Only administrators can access user management.</p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          User Management
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage user registrations and account approvals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
                {userCounts.pending}
              </p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Approved
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-1`}>
                {userCounts.approved}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Rejected
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mt-1`}>
                {userCounts.rejected}
              </p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Users
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                {userCounts.total}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`mb-6 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} inline-flex`}>
        {[
          { key: 'pending', label: `Pending (${userCounts.pending})`, color: 'yellow' },
          { key: 'approved', label: `Approved (${userCounts.approved})`, color: 'green' },
          { key: 'rejected', label: `Rejected (${userCounts.rejected})`, color: 'red' },
          { key: 'all', label: `All (${userCounts.total})`, color: 'blue' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === key
                ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Account Type
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Applied
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredUsers.map((userData) => (
                <tr key={userData.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {userData.firstName?.charAt(0) || userData.displayName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {userData.displayName || `${userData.firstName} ${userData.lastName}`}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {userData.email}
                        </div>
                        {userData.businessName && (
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {userData.businessName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'} capitalize`}>
                        {userData.accountType}
                      </span>
                      {userData.businessType && (
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                          {userData.businessType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userData.status === 'approved'
                        ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                        : userData.status === 'pending'
                          ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                          : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {userData.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {userData.createdAt.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {userData.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUserAction(userData.id, 'approved')}
                            disabled={updating === userData.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating === userData.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection (optional):');
                              if (reason !== null) {
                                handleUserAction(userData.id, 'rejected', reason);
                              }
                            }}
                            disabled={updating === userData.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {userData.status === 'approved' && (
                        <button
                          onClick={() => handleUserAction(userData.id, 'suspended')}
                          disabled={updating === userData.id}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      
                      {(userData.status === 'rejected' || userData.status === 'suspended') && (
                        <button
                          onClick={() => handleUserAction(userData.id, 'approved')}
                          disabled={updating === userData.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No users found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {filter === 'pending' 
                ? "No pending user applications at the moment."
                : `No ${filter} users found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;