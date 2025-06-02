// src/pages/Unauthorized.jsx - Page for users who try to access restricted areas
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';

const Unauthorized = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { isBuyer, isSeller, unauthorizedRedirect } = useAccessControl();

  const getMessageForUser = () => {
    if (isBuyer) {
      return {
        title: 'Inventory Access Restricted',
        subtitle: 'Business Buyer accounts cannot access inventory management',
        message: 'As a Business Buyer, you have access to purchase products but cannot manage inventory. This feature is available for Business Sellers, Managers, and Administrators.',
        suggestions: [
          { text: 'Browse Product Catalog', link: '/catalog', icon: '🛒' },
          { text: 'View Your Orders', link: '/orders', icon: '📋' },
          { text: 'Go to Business Dashboard', link: '/business-dashboard', icon: '🏢' },
          { text: 'Upgrade to Seller Account', link: '/business', icon: '🚀' }
        ]
      };
    }

    if (isSeller) {
      return {
        title: 'Insufficient Permissions',
        subtitle: 'You don\'t have permission to access this resource',
        message: 'This area requires additional permissions that your account doesn\'t currently have. Contact your administrator if you believe this is an error.',
        suggestions: [
          { text: 'Manage Your Products', link: '/inventory', icon: '📦' },
          { text: 'Add New Product', link: '/add-product', icon: '➕' },
          { text: 'View Your Orders', link: '/orders', icon: '📋' },
          { text: 'Business Dashboard', link: '/business-dashboard', icon: '🏢' }
        ]
      };
    }

    return {
      title: 'Access Denied',
      subtitle: 'You don\'t have permission to access this page',
      message: 'The page you\'re trying to access requires special permissions. Please check with your administrator or use the navigation below.',
      suggestions: [
        { text: 'Go to Dashboard', link: '/', icon: '🏠' },
        { text: 'Browse Products', link: '/catalog', icon: '🛒' },
        { text: 'View Orders', link: '/orders', icon: '📋' }
      ]
    };
  };

  const { title, subtitle, message, suggestions } = getMessageForUser();

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} px-4`}>
      <div className={`max-w-md w-full p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg text-center`}>
        <div className="text-6xl mb-6">🚫</div>
        
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        
        <h2 className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {subtitle}
        </h2>
        
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {message}
        </p>

        {/* User Info */}
        {user && (
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Type:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} capitalize`}>
                  {user.accountType} {user.businessType && `(${user.businessType})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Suggestions */}
        <div className="space-y-3">
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            What you can do:
          </h3>
          
          {suggestions.map((suggestion, index) => (
            <Link
              key={index}
              to={suggestion.link}
              className={`block w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                index === 0 
                  ? darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="mr-2 text-lg">{suggestion.icon}</span>
                {suggestion.text}
              </div>
            </Link>
          ))}
        </div>

        {/* Special upgrade prompt for buyers */}
        {isBuyer && (
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
              💡 Want to manage inventory?
            </h4>
            <p className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-700'} mb-3`}>
              Upgrade to a Seller account to list products, manage inventory, and process orders.
            </p>
            <Link
              to="/business"
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Learn About Selling
            </Link>
          </div>
        )}

        {/* Contact support */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Need help?{' '}
            <a 
              href="mailto:support@wholesaler.com"
              className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} underline`}
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;