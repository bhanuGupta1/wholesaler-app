// src/pages/admin/AdminSecurity.jsx - Advanced Security Dashboard
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

// Security Threat Monitor
const ThreatMonitor = ({ darkMode }) => {
  const [threats, setThreats] = useState([]);
  const [securityLevel, setSecurityLevel] = useState('HIGH');

  useEffect(() => {
    // Simulate real-time threat detection
    const generateThreats = () => {
      const threatTypes = [
        { type: 'BRUTE_FORCE', severity: 'HIGH', description: 'Multiple failed login attempts detected' },
        { type: 'SUSPICIOUS_IP', severity: 'MEDIUM', description: 'Unusual IP access pattern' },
        { type: 'DATA_BREACH_ATTEMPT', severity: 'CRITICAL', description: 'Unauthorized database access attempt' },
        { type: 'MALWARE_DETECTED', severity: 'HIGH', description: 'Malicious file upload blocked' },
        { type: 'DDOS_ATTEMPT', severity: 'CRITICAL', description: 'Distributed denial of service attack' },
        { type: 'PRIVILEGE_ESCALATION', severity: 'HIGH', description: 'Unauthorized privilege escalation attempt' }
      ];

      const newThreats = [];
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        newThreats.push({
          ...threat,
          id: Date.now() + i,
          timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
          sourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          blocked: Math.random() > 0.3
        });
      }
      
      setThreats(newThreats.sort((a, b) => b.timestamp - a.timestamp));
    };

    generateThreats();
    const interval = setInterval(generateThreats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-red-500/30' : 'bg-white/50 border-red-500/30'
    } backdrop-blur-sm`}>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-mono text-lg ${
          darkMode ? 'text-red-400' : 'text-red-600'
        } flex items-center`}>
          <span className="animate-pulse mr-3">🛡️</span>
          THREAT_MONITOR
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-mono ${
            securityLevel === 'HIGH' 
              ? 'bg-red-500 text-white' 
              : securityLevel === 'MEDIUM'
                ? 'bg-yellow-500 text-black'
                : 'bg-green-500 text-white'
          }`}>
            SECURITY: {securityLevel}
          </div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Threat Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => {
          const count = threats.filter(t => t.severity === severity).length;
          return (
            <div key={severity} className={`p-3 rounded border text-center ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-xl font-bold font-mono text-${getSeverityColor(severity)}-500`}>
                {count}
              </div>
              <div className={`text-xs font-mono ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {severity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Threats */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {threats.slice(0, 8).map(threat => (
          <div key={threat.id} className={`p-3 rounded border flex items-center justify-between ${
            darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-mono px-2 py-1 rounded bg-${getSeverityColor(threat.severity)}-500 text-white`}>
                  {threat.type}
                </span>
                <span className={`text-xs font-mono ${
                  threat.blocked ? 'text-green-500' : 'text-red-500'
                }`}>
                  {threat.blocked ? 'BLOCKED' : 'ACTIVE'}
                </span>
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {threat.description}
              </div>
              <div className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {threat.sourceIP} • {threat.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
                INVESTIGATE
              </button>
              <button className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                darkMode
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}>
                BLOCK
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Access Control Panel
const AccessControlPanel = ({ darkMode }) => {
  const [sessions, setSessions] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);

  useEffect(() => {
    // Generate sample active sessions
    const sampleSessions = [
      {
        id: 1,
        user: 'admin@wholesaler.com',
        ip: '192.168.1.100',
        location: 'Auckland, NZ',
        device: 'Chrome/Windows',
        loginTime: new Date(Date.now() - 3600000),
        lastActivity: new Date(Date.now() - 300000),
        status: 'active'
      },
      {
        id: 2,
        user: 'manager@wholesaler.com',
        ip: '10.0.0.50',
        location: 'Sydney, AU',
        device: 'Safari/macOS',
        loginTime: new Date(Date.now() - 7200000),
        lastActivity: new Date(Date.now() - 600000),
        status: 'idle'
      },
      {
        id: 3,
        user: 'user@example.com',
        ip: '203.97.45.123',
        location: 'Unknown',
        device: 'Firefox/Linux',
        loginTime: new Date(Date.now() - 1800000),
        lastActivity: new Date(Date.now() - 120000),
        status: 'suspicious'
      }
    ];

    setSessions(sampleSessions);

    // Generate sample blocked IPs
    setBlockedIPs([
      { ip: '45.76.123.89', reason: 'Brute force attack', blockedAt: new Date(Date.now() - 86400000) },
      { ip: '178.34.56.12', reason: 'Malicious scanning', blockedAt: new Date(Date.now() - 3600000) },
      { ip: '92.123.45.67', reason: 'Suspicious activity', blockedAt: new Date(Date.now() - 7200000) }
    ]);
  }, []);

  const terminateSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const unblockIP = (ip) => {
    setBlockedIPs(prev => prev.filter(b => b.ip !== ip));
  };

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-blue-500/30' : 'bg-white/50 border-blue-500/30'
    } backdrop-blur-sm`}>
      
      <h3 className={`font-mono text-lg mb-6 ${
        darkMode ? 'text-blue-400' : 'text-blue-600'
      } flex items-center`}>
        <span className="animate-pulse mr-3">👥</span>
        ACCESS_CONTROL
      </h3>

      {/* Active Sessions */}
      <div className="mb-8">
        <h4 className={`font-mono text-sm mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          ACTIVE_SESSIONS ({sessions.length})
        </h4>
        
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className={`p-4 rounded border ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`font-mono text-sm ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {session.user}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      session.status === 'active' ? 'bg-green-500 text-white' :
                      session.status === 'idle' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className={`text-xs font-mono space-y-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div>IP: {session.ip} • {session.location}</div>
                    <div>Device: {session.device}</div>
                    <div>Login: {session.loginTime.toLocaleString()}</div>
                    <div>Last Activity: {session.lastActivity.toLocaleString()}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => terminateSession(session.id)}
                  className="px-3 py-2 rounded text-xs font-mono bg-red-600 hover:bg-red-500 text-white transition-all"
                >
                  TERMINATE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked IPs */}
      <div>
        <h4 className={`font-mono text-sm mb-4 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          BLOCKED_IPS ({blockedIPs.length})
        </h4>
        
        <div className="space-y-2">
          {blockedIPs.map((blocked, index) => (
            <div key={index} className={`p-3 rounded border flex items-center justify-between ${
              darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <div className={`font-mono text-sm ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {blocked.ip}
                </div>
                <div className={`text-xs font-mono ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {blocked.reason} • {blocked.blockedAt.toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={() => unblockIP(blocked.ip)}
                className="px-3 py-1 rounded text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white transition-all"
              >
                UNBLOCK
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Security Audit Log
const SecurityAuditLog = ({ darkMode }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Generate sample audit logs
    const logTypes = [
      { type: 'LOGIN', severity: 'info', description: 'User login successful' },
      { type: 'LOGOUT', severity: 'info', description: 'User logout' },
      { type: 'PERMISSION_CHANGE', severity: 'warning', description: 'User permissions modified' },
      { type: 'DATA_ACCESS', severity: 'info', description: 'Database query executed' },
      { type: 'FAILED_LOGIN', severity: 'warning', description: 'Failed login attempt' },
      { type: 'CONFIG_CHANGE', severity: 'critical', description: 'System configuration modified' },
      { type: 'FILE_UPLOAD', severity: 'info', description: 'File uploaded to system' },
      { type: 'ADMIN_ACCESS', severity: 'warning', description: 'Admin panel accessed' }
    ];

    const logs = [];
    for (let i = 0; i < 20; i++) {
      const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
      logs.push({
        id: i,
        ...logType,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
        user: `user${Math.floor(Math.random() * 10)}@example.com`,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      });
    }

    setAuditLogs(logs.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const filteredLogs = filter === 'all' ? auditLogs : auditLogs.filter(log => log.severity === filter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-purple-500/30' : 'bg-white/50 border-purple-500/30'
    } backdrop-blur-sm`}>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-mono text-lg ${
          darkMode ? 'text-purple-400' : 'text-purple-600'
        } flex items-center`}>
          <span className="animate-pulse mr-3">📝</span>
          SECURITY_AUDIT_LOG
        </h3>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`p-2 rounded border font-mono text-sm ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">ALL_EVENTS</option>
          <option value="critical">CRITICAL</option>
          <option value="warning">WARNING</option>
          <option value="info">INFO</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.map(log => (
          <div key={log.id} className={`p-3 rounded border ${
            darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-mono px-2 py-1 rounded bg-${getSeverityColor(log.severity)}-500 text-white`}>
                    {log.type}
                  </span>
                  <span className={`text-xs font-mono ${
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
                
                <div className={`text-xs font-mono ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  User: {log.user} • IP: {log.ip}
                </div>
              </div>
              
              <button className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}>
                DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// System Health Monitor
const SystemHealthMonitor = ({ darkMode }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    errorRate: 0
  });

  useEffect(() => {
    // Simulate real-time health metrics
    const updateMetrics = () => {
      setHealthMetrics({
        cpu: Math.floor(Math.random() * 80) + 10,
        memory: Math.floor(Math.random() * 70) + 20,
        disk: Math.floor(Math.random() * 60) + 30,
        network: Math.floor(Math.random() * 90) + 5,
        uptime: 99.9 - Math.random() * 0.8,
        errorRate: Math.random() * 2
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (value, type) => {
    if (type === 'uptime') {
      return value > 99.5 ? 'green' : value > 98 ? 'yellow' : 'red';
    } else if (type === 'errorRate') {
      return value < 1 ? 'green' : value < 2 ? 'yellow' : 'red';
    } else {
      return value < 60 ? 'green' : value < 80 ? 'yellow' : 'red';
    }
  };

  const metrics = [
    { label: 'CPU_USAGE', value: healthMetrics.cpu, unit: '%', type: 'normal' },
    { label: 'MEMORY_USAGE', value: healthMetrics.memory, unit: '%', type: 'normal' },
    { label: 'DISK_USAGE', value: healthMetrics.disk, unit: '%', type: 'normal' },
    { label: 'NETWORK_LOAD', value: healthMetrics.network, unit: '%', type: 'normal' },
    { label: 'UPTIME', value: healthMetrics.uptime.toFixed(2), unit: '%', type: 'uptime' },
    { label: 'ERROR_RATE', value: healthMetrics.errorRate.toFixed(2), unit: '%', type: 'errorRate' }
  ];

  return (
    <div className={`p-6 rounded-lg border ${
      darkMode ? 'bg-gray-800/50 border-green-500/30' : 'bg-white/50 border-green-500/30'
    } backdrop-blur-sm`}>
      
      <h3 className={`font-mono text-lg mb-6 ${
        darkMode ? 'text-green-400' : 'text-green-600'
      } flex items-center`}>
        <span className="animate-pulse mr-3">💚</span>
        SYSTEM_HEALTH
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const color = getHealthColor(parseFloat(metric.value), metric.type);
          return (
            <div key={index} className={`p-4 rounded border ${
              darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold font-mono text-${color}-500 mb-1`}>
                  {metric.value}{metric.unit}
                </div>
                <div className={`text-xs font-mono ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.label}
                </div>
                
                {/* Progress bar for percentage metrics */}
                <div className={`mt-3 w-full h-2 rounded-full ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <div 
                    className={`h-full rounded-full bg-${color}-500 transition-all duration-1000`}
                    style={{ width: `${Math.min(parseFloat(metric.value), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="mt-6 p-4 rounded border bg-opacity-50">
        <div className="flex items-center justify-between">
          <div className={`text-sm font-mono ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            OVERALL_STATUS:
          </div>
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className={`font-mono text-sm ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              SYSTEM_OPERATIONAL
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
  const [activeTab, setActiveTab] = useState('threats');

  const tabs = [
    { id: 'threats', label: 'THREAT_MONITOR', icon: '🛡️' },
    { id: 'access', label: 'ACCESS_CONTROL', icon: '👥' },
    { id: 'audit', label: 'AUDIT_LOG', icon: '📝' },
    { id: 'health', label: 'SYSTEM_HEALTH', icon: '💚' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold font-mono ${
              darkMode ? 'text-red-400' : 'text-red-600'
            } flex items-center`}>
              <span className="animate-pulse mr-3">🔒</span>
              SECURITY_COMMAND_CENTER
            </h1>
            <p className={`font-mono text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              // Advanced threat detection and system security monitoring
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

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-opacity-20 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded font-mono text-sm transition-all ${
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
        {activeTab === 'threats' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ThreatMonitor darkMode={darkMode} />
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
            <ThreatMonitor darkMode={darkMode} />
          </div>
        )}
      </div>

      {/* Emergency Actions */}
      <div className={`mt-8 p-6 rounded-lg border ${
        darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <h3 className={`font-mono text-lg mb-4 ${
          darkMode ? 'text-red-400' : 'text-red-600'
        } flex items-center`}>
          <span className="animate-pulse mr-3">🚨</span>
          EMERGENCY_ACTIONS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'LOCKDOWN_MODE', description: 'Block all external access', color: 'red' },
            { label: 'FORCE_LOGOUT', description: 'Terminate all user sessions', color: 'orange' },
            { label: 'BACKUP_NOW', description: 'Emergency system backup', color: 'blue' },
            { label: 'ALERT_ADMIN', description: 'Send emergency notifications', color: 'purple' }
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 rounded border text-left transition-all hover:scale-105 ${
                darkMode
                  ? `bg-gray-800 border-${action.color}-500/50 hover:bg-${action.color}-900/20`
                  : `bg-white border-${action.color}-200 hover:bg-${action.color}-50`
              }`}
            >
              <div className={`font-mono text-sm font-bold mb-2 text-${action.color}-500`}>
                {action.label}
              </div>
              <div className={`text-xs font-mono ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                // {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;