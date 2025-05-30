// src/components/common/ProtectedRoute.jsx - Enhanced with approval system but keeping original name
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserStatus } from '../../hooks/useUserStatus';
import { useTheme } from '../../context/ThemeContext';

const UserStatusPage = ({ status, message, accountType }) => {
  const { darkMode } = useTheme();

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Account Pending Approval',
          color: 'yellow',
          description: 'Your business account application is being reviewed by our team.'
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Account Not Approved',
          color: 'red',
          description: 'Unfortunately, your account application was not approved.'
        };
      case 'suspended':
        return {
          icon: '🚫',
          title: 'Account Suspended',
          color: 'red',
          description: 'Your account has been temporarily suspended.'
        };
      default:
        return {
          icon: '⚠️',
          title: 'Access Restricted',
          color: 'gray',
          description: 'You don\'t have permission to access this area.'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-xl shadow-lg text-center ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        <div className="text-6xl mb-4">{statusInfo.icon}</div>
        
        <h1 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {statusInfo.title}
        </h1>
        
        <p className={`text-sm mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {statusInfo.description}
        </p>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            statusInfo.color === 'yellow' 
              ? darkMode ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : statusInfo.color === 'red'
                ? darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                : darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
          } border text-sm`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          {status === 'pending' && (
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>✅ Application submitted</p>
              <p>⏳ Under review</p>
              <p>📧 You'll be notified by email</p>
            </div>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Return to Home
          </button>

          {status === 'rejected' && (
            <button
              onClick={() => window.location.href = '/contact'}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  allowedRoles = null,
  requireApproval = true 
}) => {
  const { user, loading: authLoading } = useAuth();
  const userStatus = useUserStatus();

  // Show loading while auth or user status is loading
  if (authLoading || userStatus.status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user can access based on status
  if (requireApproval && !userStatus.canAccess) {
    return (
      <UserStatusPage 
        status={userStatus.status}
        message={userStatus.message}
        accountType={userStatus.accountType}
      />
    );
  }

  // Check specific role requirement
  if (requiredRole && userStatus.accountType !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  // Check if user role is in allowed roles array
  if (allowedRoles && !allowedRoles.includes(userStatus.accountType)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;