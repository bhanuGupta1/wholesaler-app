// src/components/common/CheckoutFlowSelector.jsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const CheckoutFlowSelector = ({ showAsModal = false, onClose = null }) => {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const { user } = useAuth();
  const { darkMode } = useTheme();

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  const handleQuickCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
    if (onClose) onClose();
  };

  const handleAdvancedOrder = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/create-order', state: { fromCart: true } } } });
    } else {
      navigate('/create-order', { state: { fromCart: true } });
    }
    if (onClose) onClose();
  };

  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.email?.includes('admin')) return 'admin';
    if (user.email?.includes('business')) return 'business';
    return 'customer';
  };

  const userRole = getUserRole();

  const content = (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${showAsModal ? 'p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Choose Your Checkout Experience
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Select the checkout process that best fits your needs
        </p>
      </div>

      {/* Cart Summary */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </span>
          </div>
          <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${cartTotal.toFixed(2)}
          </div>
        </div>
        
        {userRole === 'business' && (
          <div className={`mt-2 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            🏢 Business account - 15% bulk discount will be applied
          </div>
        )}
      </div>

      {/* Checkout Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Checkout */}
        <div 
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
            darkMode 
              ? 'border-gray-600 hover:border-indigo-500 bg-gray-700 hover:bg-gray-600' 
              : 'border-gray-200 hover:border-indigo-500 bg-white hover:bg-gray-50'
          }`}
          onClick={handleQuickCheckout}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Checkout
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Fast, streamlined process perfect for regular purchases
            </p>
            
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1 mb-6`}>
              <div>✅ 3-step process</div>
              <div>✅ Multiple payment methods</div>
              <div>✅ Express delivery options</div>
              <div>✅ Mobile optimized</div>
            </div>
            
            <button className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              {user ? 'Continue' : 'Sign In & Continue'}
            </button>
          </div>
        </div>

        {/* Advanced Order */}
        <div 
          className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
            darkMode 
              ? 'border-gray-600 hover:border-purple-500 bg-gray-700 hover:bg-gray-600' 
              : 'border-gray-200 hover:border-purple-500 bg-white hover:bg-gray-50'
          }`}
          onClick={handleAdvancedOrder}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Order
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Full-featured ordering with advanced business options
            </p>
            
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1 mb-6`}>
              <div>✅ Detailed order customization</div>
              <div>✅ Multiple payment methods</div>
              <div>✅ Business account features</div>
              <div>✅ Bulk order management</div>
              <div>✅ Advanced delivery options</div>
            </div>
            
            <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              {user ? 'Create Order' : 'Sign In & Create Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start">
          <div className="text-2xl mr-3">💡</div>
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-1`}>
              Not sure which to choose?
            </h4>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {userRole === 'business' 
                ? 'As a business user, we recommend the Advanced Order for bulk discounts and business features.'
                : 'Quick Checkout is perfect for most users. Choose Advanced Order if you need detailed customization or business features.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Close button for modal */}
      {showAsModal && onClose && (
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded-lg ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default CheckoutFlowSelector;