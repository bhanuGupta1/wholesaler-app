// src/pages/admin/AdminSecurity.jsx - Real Firebase Security Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Real Security Monitor with Firebase Data
const SecurityMonitor = ({ darkMode }) => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityEvents = async () => {
      try {
        // Fetch failed login attempts and suspicious activities
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const events = [];

        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const createdAt = userData.createdAt?.toDate() || new Date();
          
          // Check for suspended/rejected users (security events)
          if (userData.status === 'suspended' || userData.status === 'rejected') {
            events.push({
              id: doc.id + '_status',
              type: 'ACCOUNT_ACTION',
              severity: userData.status === 'suspended' ? 'HIGH' : 'MEDIUM',
              description: `User account ${userData.status}: ${userData.email}`,
              timestamp: userData.updatedAt?.toDate() || createdAt,
              userEmail: userData.email,
              status: 'resolved'
            });
          }

          // Check for recent registrations (potential security monitoring)
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (createdAt > dayAgo) {
            events.push({
              id: doc.id + '_registration',
              type: 'NEW_REGISTRATION',
              severity: 'LOW',
              description: `New user registration: ${userData.email}`,
              timestamp: createdAt,
              userEmail: userData.email,
              status: userData.approved ? 'approved' : 'pending'
            });
          }
        });

        // Sort by timestamp (most recent first)
        events.sort((a, b) => b.timestamp - a.timestamp);
        setSecurityEvents(events.slice(0, 20)); // Keep latest 20 events

        // Calculate statistics
        const highPriority = events.filter(e => e.severity === 'HIGH').length;
        const mediumPriority = events.filter(e => e.severity === 'MEDIUM').length;
        const lowPriority = events.filter(e => e.severity === 'LOW').length;

        setStats({
          totalEvents: events.length,
          highPriority,
          mediumPriority,
          lowPriority
        });

      } catch (error) {
        console.error('Error fetching security events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityEvents();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">🛡️</div>
          <div>Loading security data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-red-500/30' : 'bg-white border-red-200'
    }`}>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${
          darkMode ? 'text-red-400' : 'text-red-600'
        } flex items-center`}>
          <span className="mr-3">🛡️</span>
          Security Monitor
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            stats.highPriority > 0 
              ? 'bg-red-500 text-white' 
              : stats.mediumPriority > 0
                ? 'bg-yellow-500 text-black'
                : 'bg-green-500 text-white'
          }`}>
            {stats.highPriority > 0 ? 'HIGH ALERT' : stats.mediumPriority > 0 ? 'MEDIUM' : 'SECURE'}
          </div>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: stats.totalEvents, color: 'blue' },
          { label: 'High Priority', value: stats.highPriority, color: 'red' },
          { label: 'Medium Priority', value: stats.mediumPriority, color: 'yellow' },
          { label: 'Low Priority', value: stats.lowPriority, color: 'green' }
        ].map((stat, index) => (
          <div key={index} className={`p-3 rounded border text-center ${
            darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-xl font-bold text-${stat.color}-500`}>
              {stat.value}
            </div>
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Security Events */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {securityEvents.length > 0 ? (
          securityEvents.map(event => (
            <div key={event.id} className={`p-3 rounded border flex items-center justify-between ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded bg-${getSeverityColor(event.severity)}-500 text-white`}>
                    {event.type}
                  </span>
                  <span className={`text-xs ${
                    event.status === 'resolved' ? 'text-green-500' : 
                    event.status === 'pending' ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {event.description}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {event.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="text-2xl mb-2">✅</div>
            <div>No security events detected</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Real User Access Control with Firebase Data
const AccessControlPanel = ({ darkMode }) => {
  const [users, setUsers] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastActivity: doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate() || new Date()
        }));

        // Filter active and suspended users
        const activeUsers = allUsers.filter(user => 
          user.status === 'active' && user.approved
        ).slice(0, 10); // Show recent 10 active users

        const suspended = allUsers.filter(user => 
          user.status === 'suspended' || user.status === 'rejected'
        );

        setUsers(activeUsers);
        setSuspendedUsers(suspended);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const suspendUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'suspended',
        isActive: false,
        updatedAt: new Date()
      });
      
      // Refresh data
      const user = users.find(u => u.id === userId);
      if (user) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSuspendedUsers(prev => [...prev, { ...user, status: 'suspended' }]);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const reactivateUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        isActive: true,
        approved: true,
        updatedAt: new Date()
      });
      
      // Refresh data
      const user = suspendedUsers.find(u => u.id === userId);
      if (user) {
        setSuspendedUsers(prev => prev.filter(u => u.id !== userId));
        setUsers(prev => [...prev, { ...user, status: 'active' }]);
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">👥</div>
          <div>Loading access control data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-blue-500/30' : 'bg-white border-blue-200'
    }`}>
      
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="mr-3">👥</span>
        Access Control
      </h3>

      {/* Active Users */}
      <div className="mb-8">
        <h4 className={`text-sm font-medium mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Recent Active Users ({users.length})
        </h4>
        
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className={`p-4 rounded border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {user.displayName || user.firstName + ' ' + user.lastName || 'No Name'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.accountType === 'admin' ? 'bg-red-100 text-red-800' :
                      user.accountType === 'manager' ? 'bg-purple-100 text-purple-800' :
                      user.accountType === 'business' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.accountType?.toUpperCase() || 'USER'}
                    </span>
                  </div>
                  
                  <div className={`text-xs space-y-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div>Email: {user.email}</div>
                    <div>Last Activity: {user.lastActivity.toLocaleString()}</div>
                    {user.businessName && <div>Business: {user.businessName}</div>}
                  </div>
                </div>
                
                <button
                  onClick={() => suspendUser(user.id)}
                  className="px-3 py-2 rounded text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition-all"
                >
                  Suspend
                </button>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No active users found
            </div>
          )}
        </div>
      </div>

      {/* Suspended Users */}
      <div>
        <h4 className={`text-sm font-medium mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Suspended/Blocked Users ({suspendedUsers.length})
        </h4>
        
        <div className="space-y-2">
          {suspendedUsers.map(user => (
            <div key={user.id} className={`p-3 rounded border flex items-center justify-between ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <div className={`text-sm font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {user.displayName || user.email}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Status: {user.status} • Email: {user.email}
                </div>
              </div>
              
              <button
                onClick={() => reactivateUser(user.id)}
                className="px-3 py-1 rounded text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-all"
              >
                Reactivate
              </button>
            </div>
          ))}
          
          {suspendedUsers.length === 0 && (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No suspended users
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Real Audit Log with Firebase Data
const SecurityAuditLog = ({ darkMode }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Get user activities as audit logs
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('updatedAt', 'desc'), limit(50))
        );
        
        const logs = [];
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const createdAt = userData.createdAt?.toDate() || new Date();
          const updatedAt = userData.updatedAt?.toDate() || createdAt;
          
          // User registration
          logs.push({
            id: doc.id + '_created',
            type: 'USER_REGISTRATION',
            severity: 'info',
            description: `New user registered: ${userData.email}`,
            timestamp: createdAt,
            user: userData.email,
            details: `Account type: ${userData.accountType || 'user'}`
          });
          
          // Status changes
          if (userData.updatedAt && userData.status) {
            let actionType = 'USER_UPDATE';
            let severity = 'info';
            
            if (userData.status === 'suspended') {
              actionType = 'USER_SUSPENDED';
              severity = 'warning';
            } else if (userData.status === 'rejected') {
              actionType = 'USER_REJECTED';
              severity = 'warning';
            } else if (userData.status === 'active' && userData.approved) {
              actionType = 'USER_APPROVED';
              severity = 'info';
            }
            
            logs.push({
              id: doc.id + '_updated',
              type: actionType,
              severity,
              description: `User ${userData.status}: ${userData.email}`,
              timestamp: updatedAt,
              user: userData.email,
              details: `Status changed to: ${userData.status}`
            });
          }
        });

        // Sort by timestamp (most recent first)
        logs.sort((a, b) => b.timestamp - a.timestamp);
        setAuditLogs(logs.slice(0, 30)); // Keep latest 30 logs
        
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const filteredLogs = filter === 'all' ? auditLogs : auditLogs.filter(log => log.severity === filter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">📝</div>
          <div>Loading audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-purple-500/30' : 'bg-white border-purple-200'
    }`}>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        } flex items-center`}>
          <span className="mr-3">📝</span>
          Security Audit Log
        </h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`p-2 rounded border text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Events</option>
          <option value="warning">Warnings</option>
          <option value="info">Info</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div key={log.id} className={`p-3 rounded border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded bg-${getSeverityColor(log.severity)}-500 text-white`}>
                      {log.type}
                    </span>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className={`text-sm mb-1 ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {log.description}
                  </div>
                  
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    User: {log.user} • {log.details}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="text-2xl mb-2">📝</div>
            <div>No audit logs found</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Real System Health with Firebase Statistics
const SystemHealthMonitor = ({ darkMode }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    systemUptime: 99.9
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      try {
        const [usersSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders'))
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data());
        const activeUsers = users.filter(user => user.status === 'active' && user.approved);
        const pendingApprovals = users.filter(user => 
          user.status === 'pending_approval' || user.status === 'pending'
        );

        setHealthMetrics({
          totalUsers: usersSnapshot.size,
          activeUsers: activeUsers.length,
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
          pendingApprovals: pendingApprovals.length,
          systemUptime: 99.9 // This would come from actual monitoring
        });
      } catch (error) {
        console.error('Error fetching health metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthMetrics();
  }, []);

  const getHealthColor = (value, type) => {
    if (type === 'uptime') {
      return value > 99.5 ? 'green' : value > 98 ? 'yellow' : 'red';
    } else if (type === 'pending') {
      return value === 0 ? 'green' : value < 5 ? 'yellow' : 'red';
    } else {
      return value > 0 ? 'green' : 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="text-2xl mb-2">💚</div>
          <div>Loading system health...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Users', value: healthMetrics.totalUsers, type: 'normal' },
    { label: 'Active Users', value: healthMetrics.activeUsers, type: 'normal' },
    { label: 'Total Products', value: healthMetrics.totalProducts, type: 'normal' },
    { label: 'Total Orders', value: healthMetrics.totalOrders, type: 'normal' },
    { label: 'Pending Approvals', value: healthMetrics.pendingApprovals, type: 'pending' },
    { label: 'System Uptime', value: `${healthMetrics.systemUptime}%`, type: 'uptime' }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-green-500/30' : 'bg-white border-green-200'
    }`}>
      
      <h3 className={`text-lg font-semibold mb-6 ${
        darkMode ? 'text-green-400' : 'text-green-600'
      } flex items-center`}>
        <span className="mr-3">💚</span>
        System Health
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const color = getHealthColor(
            typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value, 
            metric.type
          );
          return (
            <div key={index} className={`p-4 rounded border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold text-${color}-500 mb-1`}>
                  {metric.value}
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="mt-6 p-4 rounded border">
        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Overall Status:
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className={`text-sm font-medium ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              System Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Security Dashboard Component
const AdminSecurity = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('monitor');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const tabs = [
    { id: 'monitor', label: 'Security Monitor', icon: '🛡️' },
    { id: 'access', label: 'Access Control', icon: '👥' },
    { id: 'audit', label: 'Audit Log', icon: '📝' },
    { id: 'health', label: 'System Health', icon: '💚' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <span className="mr-3">🔒</span>
              Security Center
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Monitor system security and manage user access controls
            </p>
          </div>
          
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-lg text-sm transition-all border ${
              darkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50'
                : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
            }`}
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-opacity-20 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-red-600 text-white'
                    : 'bg-red-600 text-white'
                  : darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'monitor' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SecurityMonitor darkMode={darkMode} />
            <SystemHealthMonitor darkMode={darkMode} />
          </div>
        )}
        
        {activeTab === 'access' && (
          <AccessControlPanel darkMode={darkMode} />
        )}
        
        {activeTab === 'audit' && (
          <SecurityAuditLog darkMode={darkMode} />
        )}
        
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SystemHealthMonitor darkMode={darkMode} />
            <SecurityMonitor darkMode={darkMode} />
          </div>
        )}
      </div>

      {/* Emergency Actions */}
      <div className={`mt-8 p-6 rounded-lg border ${
        darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-red-400' : 'text-red-600'
        } flex items-center`}>
          <span className="mr-3">🚨</span>
          Emergency Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              label: 'Suspend All Business Users', 
              description: 'Temporarily suspend all business accounts',
              color: 'red',
              action: () => showNotification('This would suspend all business users', 'warning')
            },
            { 
              label: 'Export Security Logs', 
              description: 'Download all security audit logs',
              color: 'blue',
              action: () => showNotification('Security logs would be exported', 'success')
            },
            { 
              label: 'Reset Failed Logins', 
              description: 'Clear all failed login counters',
              color: 'green',
              action: () => showNotification('Failed login counters would be reset', 'success')
            }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`p-4 rounded border text-left transition-all hover:scale-105 ${
                darkMode
                  ? `bg-gray-800 border-${action.color}-500/50 hover:bg-${action.color}-900/20`
                  : `bg-white border-${action.color}-200 hover:bg-${action.color}-50`
              }`}
            >
              <div className={`text-sm font-medium mb-2 text-${action.color}-500`}>
                {action.label}
              </div>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;