// src/pages/Cart.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updatingQuantity, setUpdatingQuantity] = useState(null);

  // Update quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    setUpdatingQuantity(productId);
    
    // Simulate loading for better UX
    setTimeout(() => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
      } else {
        // Update quantity logic would go here
        // For now, we'll just remove the loading state
      }
      setUpdatingQuantity(null);
    }, 300);
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = cart.length > 0 ? (subtotal > 100 ? 0 : 15) : 0; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Get user role for discount calculation
  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.email?.includes('business')) return 'business';
    return 'customer';
  };

  const userRole = getUserRole();
  const discount = userRole === 'business' ? subtotal * 0.15 : 0; // 15% business discount
  const finalTotal = total - discount;

  if (cart.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shopping Cart</h1>
          
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-12 text-center border`}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Your cart is empty
            </h2>
            <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Looks like you haven't added any products to your cart yet.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link
                to="/catalog"
                className={`inline-block px-8 py-3 rounded-lg font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
              >
                Browse Products
              </Link>
              <Link
                to="/"
                className={`inline-block px-8 py-3 rounded-lg font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Go Home
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 md:mb-0`}>
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
          
          <div className="flex space-x-4">
            <Link
              to="/catalog"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/30' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Continue Shopping
            </Link>
            
            <button
              onClick={clearCart}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' : 'text-red-700 bg-red-100 hover:bg-red-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cart Items
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={() => removeFromCart(item.id)}
                    isUpdating={updatingQuantity === item.id}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border sticky top-4`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6">
                {/* User Role Badge */}
                {user && (
                  <div className="mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
                      userRole === 'business' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {userRole === 'business' ? '🏢 Business Account' : '👤 Customer Account'}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Business Discount (15%):</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tax (10%):</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Shipping:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {shipping > 0 && (
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Free shipping on orders over $100
                    </div>
                  )}
                  
                  <div className={`flex justify-between font-bold text-lg pt-3 border-t ${darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-900'}`}>
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="mt-6 space-y-3">
                  {user ? (
                    <button
                      onClick={() => navigate('/checkout')}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
                      >
                        Sign In to Checkout
                      </button>
                      <Link
                        to="/register"
                        className={`block w-full py-3 px-4 rounded-lg font-medium text-center border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                  
                  <Link
                    to="/catalog"
                    className={`block w-full py-2 px-4 rounded-lg font-medium text-center border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border text-xs`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className={darkMode ? 'text-green-400' : 'text-green-700'}>
                      Secure checkout with SSL encryption
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping Suggestion */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            You might also like
          </h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Discover more products that complement your current selection
          </p>
          <Link
            to="/catalog"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/30' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'}`}
          >
            Browse More Products
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove, isUpdating, darkMode }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className={`p-6 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <Link to={`/inventory/${item.id}`} className="flex-shrink-0">
          <div className={`h-20 w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden`}>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <svg className="w-8 h-8" fill={darkMode ? "#4B5563" : "#D1D5DB"} viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/inventory/${item.id}`}>
            <h3 className={`font-semibold text-lg hover:text-indigo-600 dark:hover:text-indigo-400 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.name}
            </h3>
          </Link>
          {item.category && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.category}
            </p>
          )}
          <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${item.price.toFixed(2)} each
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
              disabled={isUpdating || quantity <= 1}
              className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className={`px-4 py-2 min-w-[3rem] text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mx-auto"></div>
              ) : (
                quantity
              )}
            </span>
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-[4rem]">
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${(item.price * quantity).toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className={`p-2 ${darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'} rounded-md transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;