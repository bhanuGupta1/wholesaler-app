// src/components/common/NoShoppingRedirect.jsx - Redirect admin/manager from shopping
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { canAccessCart, canAccessCheckout, canCreateOrders } from '../../utils/accessControl';

const NoShoppingRedirect = ({ children, type = 'cart' }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();

  // Determine which permission to check based on route type
  const hasAccess = () => {
    switch (type) {
      case 'cart':
        return canAccessCart(user);
      case 'checkout':
        return canAccessCheckout(user);
      case 'orders':
        return canCreateOrders(user);
      default:
        return canAccessCart(user);
    }
  };

  // If user doesn't have access, redirect them
  if (user && !hasAccess()) {
    const isAdmin = user?.accountType === 'admin';
    const isManager = user?.accountType === 'manager';
    
    // Redirect to their appropriate dashboard
    const redirectPath = isAdmin ? '/admin' : isManager ? '/manager' : '/';
    
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4`}>
        <div className={`max-w-md w-full p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg text-center`}>
          <div className="text-6xl mb-6">🛡️</div>
          
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Access Restricted
          </h2>
          
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isAdmin 
              ? 'As an administrator, you manage the platform rather than shop. Please use your admin panel for system management.'
              : isManager
                ? 'As a manager, you oversee operations rather than shop. Please use your manager panel for platform oversight.'
                : 'You do not have permission to access this shopping feature.'
            }
          </p>

          {/* Feature Access Info */}
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <h3 className={`font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              Your Platform Access:
            </h3>
            <ul className={`text-sm text-left space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              {isAdmin && (
                <>
                  <li>✅ User management & approvals</li>
                  <li>✅ System administration</li>
                  <li>✅ Inventory oversight</li>
                  <li>✅ Order management (view/edit)</li>
                  <li>❌ Personal shopping & cart</li>
                </>
              )}
              {isManager && (
                <>
                  <li>✅ Team management</li>
                  <li>✅ Operations oversight</li>
                  <li>✅ Analytics & reports</li>
                  <li>✅ Order management (view/edit)</li>
                  <li>❌ Personal shopping & cart</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Navigate to={redirectPath} replace />
            
            <button
              onClick={() => window.location.href = redirectPath}
              className={`block w-full py-3 px-4 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition-colors`}
            >
              Go to {isAdmin ? 'Admin' : isManager ? 'Manager' : 'Your'} Dashboard
            </button>
            
            <button
              onClick={() => window.history.back()}
              className={`block w-full py-3 px-4 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-xs`}>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 <strong>Need to test shopping features?</strong><br/>
              Use a regular user account or business account for testing cart and checkout functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  return children;
};

export default NoShoppingRedirect;