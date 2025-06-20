// src/pages/admin/UserPanel.jsx - Enhanced User Panel with Role Management
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

// User Role Change Component
const UserRoleManager = ({ user, onRoleChange, darkMode }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.accountType || 'user');

  const roles = [
    { value: 'admin', label: 'Administrator', color: 'red', description: 'Full system access' },
    { value: 'manager', label: 'Manager', color: 'purple', description: 'User & inventory management' },
    { value: 'business', label: 'Business User', color: 'blue', description: 'Business operations' },
    { value: 'user', label: 'Regular User', color: 'green', description: 'Standard access' },
    { value: 'guest', label: 'Guest', color: 'gray', description: 'Limited access' }
  ];

  const handleRoleChange = async () => {
    if (selectedRole === user.accountType) return;
    
    setIsChanging(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        accountType: selectedRole,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
      
      onRoleChange(user.id, selectedRole);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-cyan-500/30' 
        : 'bg-white/50 border-blue-500/30'
    } backdrop-blur-sm`}>
      <h3 className={`font-mono text-sm mb-3 ${
        darkMode ? 'text-cyan-400' : 'text-blue-600'
      }`}>
        &gt; ROLE_MANAGEMENT
      </h3>
      
      <div className="space-y-2 mb-4">
        {roles.map(role => (
          <label key={role.value} className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name={`role-${user.id}`}
              value={role.value}
              checked={selectedRole === role.value}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 mr-3 transition-all ${
              selectedRole === role.value
                ? `bg-${role.color}-500 border-${role.color}-500`
                : `border-gray-400 ${darkMode ? 'hover:border-gray-300' : 'hover:border-gray-500'}`
            }`}>
              {selectedRole === role.value && (
                <div className="w-full h-full rounded bg-white flex items-center justify-center">
                  <div className={`w-2 h-2 rounded bg-${role.color}-500`}></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              } group-hover:text-${role.color}-500`}>
                {role.label}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } font-mono`}>
                // {role.description}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleRoleChange}
        disabled={isChanging || selectedRole === user.accountType}
        className={`w-full py-2 px-4 rounded font-mono text-sm transition-all ${
          selectedRole !== user.accountType && !isChanging
            ? darkMode
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
            : darkMode
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}>
        {isChanging ? 'UPDATING...' : 'UPDATE_ROLE'}
      </button>
    </div>
  );
};

// User Security Settings Component
const UserSecurityPanel = ({ user, darkMode }) => {
  const [securityLevel, setSecurityLevel] = useState(user.securityLevel || 'standard');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled || false);
  const [lastLogin, setLastLogin] = useState(user.lastLogin || null);

  const securityLevels = [
    { value: 'basic', label: 'Basic', color: 'gray' },
    { value: 'standard', label: 'Standard', color: 'blue' },
    { value: 'enhanced', label: 'Enhanced', color: 'purple' },
    { value: 'maximum', label: 'Maximum', color: 'red' }
  ];

  const updateSecurity = async (field, value) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        [field]: value,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating security:', error);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-red-500/30' 
        : 'bg-white/50 border-red-500/30'
    } backdrop-blur-sm`}>
      <h3 className={`font-mono text-sm mb-3 ${
        darkMode ? 'text-red-400' : 'text-red-600'
      } flex items-center`}>
        <span className="animate-pulse mr-2">🔒</span>
        SECURITY_MATRIX
      </h3>

      {/* Security Level */}
      <div className="mb-4">
        <label className={`block text-xs font-mono mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          SECURITY_LEVEL:
        </label>
        <select
          value={securityLevel}
          onChange={(e) => {
            setSecurityLevel(e.target.value);
            updateSecurity('securityLevel', e.target.value);
          }}
          className={`w-full p-2 rounded border font-mono text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {securityLevels.map(level => (
            <option key={level.value} value={level.value}>
              [{level.value.toUpperCase()}] {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Two Factor Authentication */}
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={(e) => {
              setTwoFactorEnabled(e.target.checked);
              updateSecurity('twoFactorEnabled', e.target.checked);
            }}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border-2 mr-3 transition-all ${
            twoFactorEnabled
              ? 'bg-green-500 border-green-500'
              : darkMode
                ? 'border-gray-400 hover:border-gray-300'
                : 'border-gray-400 hover:border-gray-500'
          }`}>
            {twoFactorEnabled && (
              <div className="w-full h-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>
          <span className={`text-sm font-mono ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            TWO_FACTOR_AUTH
          </span>
        </label>
      </div>

      {/* Last Login Info */}
      <div className={`p-3 rounded border ${
        darkMode 
          ? 'bg-gray-700/50 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className={`text-xs font-mono ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          LAST_LOGIN:
        </div>
        <div className={`text-sm font-mono ${
          darkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {lastLogin ? new Date(lastLogin.toDate()).toLocaleString() : 'NEVER'}
        </div>
      </div>
    </div>
  );
};

// User Analytics Widget
const UserAnalytics = ({ user, darkMode }) => {
  const [analytics, setAnalytics] = useState({
    loginCount: 0,
    lastActive: null,
    actionsToday: 0,
    totalActions: 0
  });

  useEffect(() => {
    // Simulate analytics data - in real app, fetch from analytics collection
    setAnalytics({
      loginCount: Math.floor(Math.random() * 100) + 10,
      lastActive: new Date(),
      actionsToday: Math.floor(Math.random() * 50),
      totalActions: Math.floor(Math.random() * 1000) + 100
    });
  }, [user.id]);

  const metrics = [
    { label: 'LOGINS', value: analytics.loginCount, color: 'blue' },
    { label: 'TODAY', value: analytics.actionsToday, color: 'green' },
    { label: 'TOTAL', value: analytics.totalActions, color: 'purple' }
  ];

  return (
    <div className={`p-4 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-purple-500/30' 
        : 'bg-white/50 border-purple-500/30'
    } backdrop-blur-sm`}>
      <h3 className={`font-mono text-sm mb-3 ${
        darkMode ? 'text-purple-400' : 'text-purple-600'
      } flex items-center`}>
        <span className="animate-pulse mr-2">📊</span>
        USER_ANALYTICS
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`text-center p-2 rounded border ${
            darkMode 
              ? 'bg-gray-700/50 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-lg font-bold font-mono text-${metric.color}-500`}>
              {metric.value}
            </div>
            <div className={`text-xs font-mono ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      <div className={`text-xs font-mono ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        LAST_ACTIVE: {analytics.lastActive?.toLocaleString() || 'UNKNOWN'}
      </div>
    </div>
  );
};

// Main User Panel Component
const UserPanel = () => {
  const { darkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time users listener
  useEffect(() => {
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
      },
      (error) => {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.accountType === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, accountType: newRole }
        : user
    ));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className={`text-6xl mb-4 ${darkMode ? 'text-cyan-400' : 'text-blue-500'}`}>
              👥
            </div>
            <div className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              LOADING_USER_MATRIX...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold font-mono ${
              darkMode ? 'text-cyan-400' : 'text-blue-600'
            } flex items-center`}>
              <span className="animate-pulse mr-3">👥</span>
              USER_CONTROL_PANEL
            </h1>
            <p className={`font-mono text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              // Advanced user management and role assignment system
            </p>
          </div>
          
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-cyan-400 border-cyan-500/50'
                : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
            }`}
          >
            ← ADMIN_DASHBOARD
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 rounded-lg border font-mono text-sm ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`p-3 rounded-lg border font-mono text-sm ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">ALL_ROLES</option>
            <option value="admin">ADMIN</option>
            <option value="manager">MANAGER</option>
            <option value="business">BUSINESS</option>
            <option value="user">USER</option>
            <option value="guest">GUEST</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-3 font-mono text-sm ${
                viewMode === 'grid'
                  ? darkMode
                    ? 'bg-cyan-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              GRID
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-3 font-mono text-sm ${
                viewMode === 'list'
                  ? darkMode
                    ? 'bg-cyan-600 text-white'
                    : 'bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              LIST
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'TOTAL_USERS', value: users.length, color: 'blue' },
            { label: 'ADMINS', value: users.filter(u => u.accountType === 'admin').length, color: 'red' },
            { label: 'BUSINESS', value: users.filter(u => u.accountType === 'business').length, color: 'purple' },
            { label: 'ACTIVE', value: users.filter(u => u.status === 'active').length, color: 'green' }
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white/50 border-gray-200'
            } backdrop-blur-sm`}>
              <div className={`text-2xl font-bold font-mono text-${stat.color}-500`}>
                {stat.value}
              </div>
              <div className={`text-sm font-mono ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredUsers.map(user => (
          <div key={user.id} className={`p-6 rounded-lg border transition-all hover:scale-105 ${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50' 
              : 'bg-white/50 border-gray-200 hover:border-blue-500/50'
          } backdrop-blur-sm`}>
            
            {/* User Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  user.accountType === 'admin' ? 'bg-red-500 text-white' :
                  user.accountType === 'manager' ? 'bg-purple-500 text-white' :
                  user.accountType === 'business' ? 'bg-blue-500 text-white' :
                  user.accountType === 'user' ? 'bg-green-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="ml-3">
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.displayName || 'Unnamed User'}
                  </div>
                  <div className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    selectedUser?.id === user.id
                      ? darkMode
                        ? 'bg-cyan-600 text-white'
                        : 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {selectedUser?.id === user.id ? 'CLOSE' : 'MANAGE'}
                </button>
                
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1 rounded text-xs font-mono bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  DELETE
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ROLE:
                </span>
                <span className={`font-mono font-bold ${
                  user.accountType === 'admin' ? 'text-red-500' :
                  user.accountType === 'manager' ? 'text-purple-500' :
                  user.accountType === 'business' ? 'text-blue-500' :
                  user.accountType === 'user' ? 'text-green-500' :
                  'text-gray-500'
                }`}>
                  {user.accountType?.toUpperCase() || 'UNDEFINED'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  STATUS:
                </span>
                <span className={`font-mono font-bold ${
                  user.status === 'active' ? 'text-green-500' :
                  user.status === 'pending' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {user.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  CREATED:
                </span>
                <span className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user.createdAt?.toLocaleDateString() || 'UNKNOWN'}
                </span>
              </div>
            </div>

            {/* Extended Panel */}
            {selectedUser?.id === user.id && (
              <div className="mt-6 space-y-4 border-t pt-4">
                {/* Role Management */}
                <UserRoleManager 
                  user={user} 
                  onRoleChange={handleRoleChange}
                  darkMode={darkMode}
                />
                
                {/* Security Settings */}
                <UserSecurityPanel 
                  user={user} 
                  darkMode={darkMode}
                />
                
                {/* Analytics */}
                <UserAnalytics 
                  user={user} 
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            👥
          </div>
          <div className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            NO_USERS_FOUND
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;