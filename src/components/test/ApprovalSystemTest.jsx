// src/components/test/ApprovalSystemTest.jsx
// Temporary component to test the approval system with existing data
import { useState } from 'react';
import { useUserStatus } from '../../hooks/useUserStatus';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const ApprovalSystemTest = () => {
  const { user } = useAuth();
  const userStatus = useUserStatus();
  const { darkMode } = useTheme();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-w-4xl mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🧪 Approval System Test
        </h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          {showDebug ? 'Hide' : 'Show'} Debug
        </button>
      </div>
      
      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User Status</div>
          <div className={`font-medium ${
            userStatus.canAccess 
              ? darkMode ? 'text-green-400' : 'text-green-600'
              : darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {userStatus.status || 'loading...'}
          </div>
        </div>
        
        <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Type</div>
          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {userStatus.accountType || 'unknown'}
          </div>
        </div>
        
        <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Business Type</div>
          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {userStatus.businessType || 'N/A'}
          </div>
        </div>
        
        <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Can Access</div>
          <div className={`font-medium ${
            userStatus.canAccess 
              ? darkMode ? 'text-green-400' : 'text-green-600'
              : darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {userStatus.canAccess ? '✅ Yes' : '❌ No'}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {userStatus.message && (
        <div className={`p-3 rounded mb-4 ${
          userStatus.status === 'pending'
            ? darkMode ? 'bg-yellow-900/20 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
        } border text-sm`}>
          <strong>System Message:</strong> {userStatus.message}
        </div>
      )}

      {/* Status Summary */}
      <div className={`p-4 rounded mb-4 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
        <h4 className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
          📊 Current Status Summary:
        </h4>
        <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1`}>
          <div>👤 User: {user?.email || 'Not logged in'}</div>
          <div>🏷️ Account Type: {userStatus.accountType || 'Unknown'}</div>
          <div>📋 Status: {userStatus.status || 'Loading'}</div>
          <div>🔐 Access Level: {userStatus.canAccess ? 'Full Access' : 'Restricted'}</div>
          {userStatus.businessType && (
            <div>🏢 Business Type: {userStatus.businessType}</div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      {showDebug && (
        <div className={`mt-4 p-4 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔍 Debug Info:</h4>
          <pre className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} overflow-x-auto whitespace-pre-wrap`}>
            {JSON.stringify({
              authUser: {
                uid: user?.uid,
                email: user?.email,
                displayName: user?.displayName
              },
              userStatus: {
                status: userStatus.status,
                accountType: userStatus.accountType,
                businessType: userStatus.businessType,
                canAccess: userStatus.canAccess,
                message: userStatus.message
              },
              rawUserData: userStatus.userData ? {
                approved: userStatus.userData.approved,
                status: userStatus.userData.status,
                accountType: userStatus.userData.accountType,
                businessType: userStatus.userData.businessType,
                createdAt: userStatus.userData.createdAt?.toString(),
                approvedBy: userStatus.userData.approvedBy,
                rejectedReason: userStatus.userData.rejectedReason
              } : null
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => window.location.href = '/admin/users'}
          className="text-sm bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
        >
          🛡️ Admin: Manage Users
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          🏠 Go to Dashboard
        </button>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          🔄 Refresh Page
        </button>
        <button
          onClick={() => {
            const testRoutes = ['/orders', '/inventory', '/create-order'];
            const randomRoute = testRoutes[Math.floor(Math.random() * testRoutes.length)];
            window.location.href = randomRoute;
          }}
          className="text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
        >
          🧪 Test Protected Route
        </button>
      </div>

      {/* Instructions */}
      <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border text-xs`}>
        <strong>💡 Testing Instructions:</strong>
        <ul className={`mt-2 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} list-disc list-inside`}>
          <li>Check if your existing user data is correctly interpreted</li>
          <li>Try accessing protected routes to test the approval system</li>
          <li>If you're an admin, use "Manage Users" to approve pending accounts</li>
          <li>Register new accounts with different types to test the approval flow</li>
          <li>The debug panel shows raw data from Firestore for troubleshooting</li>
        </ul>
      </div>
    </div>
  );
};

export default ApprovalSystemTest;