// src/pages/Cart.jsx - Enhanced with CreateOrder Integration
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login with return path
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  // New function to go to CreateOrder with cart items
  const handleCreateOrder = () => {
    if (!user) {
      // Redirect to login with return path to CreateOrder
      navigate('/login', { state: { from: { pathname: '/create-order', state: { fromCart: true } } } });
    } else {
      navigate('/create-order', { state: { fromCart: true } });
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Shopping Cart
              </h1>
              <Link 
                to="/catalog"
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              >
                Continue Shopping
              </Link>
            </div>

            {/* Empty Cart */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-12 text-center`}>
              <div className="text-8xl mb-4">🛒</div>
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                Your cart is empty
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                Looks like you haven't added any products to your cart yet.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h1>
            <div className="flex space-x-3">
              <Link 
                to="/catalog"
                className={`inline-flex items-center px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => setShowClearConfirm(true)}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border overflow-hidden`}>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.map((item, index) => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6 sticky top-4`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Order Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items):
                    </span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tax (10%):</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} pt-3`}>
                    <div className="flex justify-between">
                      <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Total:
                      </span>
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Options */}
                <div className="mt-6 space-y-3">
                  {/* Primary Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 px-4 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    {user ? 'Quick Checkout' : 'Sign In to Checkout'}
                  </button>

                  {/* Alternative: Create Order Button */}
                  <button
                    onClick={handleCreateOrder}
                    className={`w-full py-3 px-4 border-2 border-indigo-600 text-indigo-600 text-base font-medium rounded-lg hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${darkMode ? 'hover:border-indigo-500' : ''}`}
                  >
                    {user ? 'Advanced Order' : 'Sign In for Advanced Order'}
                  </button>

                  {!user && (
                    <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      You'll be redirected to sign in before proceeding
                    </p>
                  )}
                </div>

                {/* Checkout Options Explanation */}
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-xs`}>
                  <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Checkout Options:
                  </h4>
                  <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>• <strong>Quick Checkout:</strong> Fast, streamlined process</li>
                    <li>• <strong>Advanced Order:</strong> More options & business features</li>
                  </ul>
                </div>

                {/* Security Notice */}
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border text-xs`}>
                  <div className="flex items-center">
                    <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      Secure Checkout
                    </span>
                  </div>
                  <p className={`${darkMode ? 'text-green-300' : 'text-green-600'} mt-1`}>
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Clear Cart
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className={`flex-1 py-2 px-4 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Cart Item Component
const CartItem = ({ item, onRemove, onUpdateQuantity, darkMode }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
      if (onUpdateQuantity) {
        onUpdateQuantity(item.id, newQuantity);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <Link to={`/products/${item.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-2xl">📦</span>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/products/${item.id}`}>
            <h3 className={`font-semibold ${darkMode ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'} mb-1 transition-colors`}>
              {item.name}
            </h3>
          </Link>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className={`font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              ${Number(item.price).toFixed(2)}
            </span>
            {item.category && (
              <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {item.category}
              </span>
            )}
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.stock} available
            </span>
          </div>
          
          {/* Add stock warning if quantity is close to stock limit */}
          {quantity >= item.stock * 0.8 && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ⚠️ Limited stock available
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className={`w-8 h-8 rounded-full ${
                quantity <= 1 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } flex items-center justify-center text-sm transition-colors`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={item.stock}
              value={quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value) || 1;
                handleQuantityChange(newQty);
              }}
              className={`w-16 text-center py-1 px-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= item.stock}
              className={`w-8 h-8 rounded-full ${
                quantity >= item.stock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } flex items-center justify-center text-sm transition-colors`}
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-right min-w-0">
            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(item.price * quantity).toFixed(2)}
            </div>
            {quantity > 1 && (
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ${item.price.toFixed(2)} each
              </div>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} transition-colors`}
            title="Remove from cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;