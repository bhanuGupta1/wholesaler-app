// src/pages/Cart.jsx - Enhanced with Bulk Pricing Support
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard, Shield, Truck, Tag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Enhanced total calculations with bulk pricing support
  const calculateTotals = () => {
    let subtotal = 0;
    let totalSavings = 0;
    let originalSubtotal = 0;

    cart.forEach(item => {
      const effectivePrice = item.effectivePrice || item.price;
      const itemSubtotal = effectivePrice * item.quantity;
      subtotal += itemSubtotal;

      // Calculate savings from bulk pricing
      if (item.bulkPricing?.isBulkPrice) {
        const originalItemTotal = item.bulkPricing.originalPrice * item.quantity;
        const savings = originalItemTotal - itemSubtotal;
        totalSavings += savings;
        originalSubtotal += originalItemTotal;
      } else {
        originalSubtotal += item.price * item.quantity;
      }
    });

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

    return {
      subtotal,
      originalSubtotal,
      totalSavings,
      tax,
      total,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const { subtotal, originalSubtotal, totalSavings, tax, total, totalItems } = calculateTotals();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  const handleCreateOrder = () => {
    if (!user) {
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
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <ShoppingCart className="w-8 h-8 mr-3" />
                Shopping Cart
              </h1>
              <Link 
                to="/catalog"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Empty Cart */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg border p-12 text-center`}>
              <div className="text-8xl mb-6">🛒</div>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-3`}>
                Your cart is empty
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-8 max-w-md mx-auto`}>
                Discover amazing products and start building your perfect order.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Package className="w-6 h-6 mr-2" />
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
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Savings Badge */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center mb-2`}>
                <ShoppingCart className="w-10 h-10 mr-3" />
                Shopping Cart
            </h1>
              <div className="flex items-center space-x-4">
                <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                {totalSavings > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      You're saving ${totalSavings.toFixed(2)}!
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                to="/catalog"
                className={`inline-flex items-center px-6 py-3 border rounded-xl font-medium transition-colors ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear Cart
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Enhanced Cart Items */}
            <div className="xl:col-span-3">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg border overflow-hidden`}>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.map((item, index) => (
                    <EnhancedCartItem 
                      key={`${item.id}-${index}`}
                      item={item} 
                      onRemove={removeFromCart}
                      onUpdateQuantity={updateQuantity}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>

              {/* Bulk Pricing Info Section */}
              {cart.some(item => item.bulkPricing?.isBulkPrice) && (
                <div className={`mt-6 p-6 rounded-2xl ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                        🎉 Bulk Pricing Applied!
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                        You're getting volume discounts on qualifying items
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-800/30' : 'bg-white'}`}>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        ${totalSavings.toFixed(2)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Total Savings
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-800/30' : 'bg-white'}`}>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {cart.filter(item => item.bulkPricing?.isBulkPrice).length}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Items with Bulk Pricing
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-800/30' : 'bg-white'}`}>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {((totalSavings / originalSubtotal) * 100).toFixed(1)}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Average Discount
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Order Summary */}
            <div className="xl:col-span-1">
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg border p-6 sticky top-4`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                  <CreditCard className="w-6 h-6 mr-2" />
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  {/* Subtotal with original price if savings exist */}
                  <div className="flex justify-between items-center">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Subtotal ({totalItems} items):
                    </span>
                    <div className="text-right">
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${subtotal.toFixed(2)}
                    </span>
                      {totalSavings > 0 && (
                        <div className={`text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ${originalSubtotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bulk Savings */}
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium">
                        Bulk Savings:
                      </span>
                      <span className="font-semibold text-green-600">
                        -${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tax (10%):</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Total */}
                  <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} pt-4`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Total:
                      </span>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${total.toFixed(2)}
                      </span>
                        {totalSavings > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Saved ${totalSavings.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Checkout Options */}
                <div className="mt-8 space-y-4">
                  {/* Primary Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 px-6 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {user ? 'Quick Checkout' : 'Sign In to Checkout'}
                  </button>

                  {/* Alternative: Create Order Button */}
                  <button
                    onClick={handleCreateOrder}
                    className={`w-full py-3 px-4 border-2 border-indigo-600 text-indigo-600 text-base font-medium rounded-xl hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${darkMode ? 'hover:border-indigo-500' : ''}`}
                  >
                    {user ? 'Advanced Order' : 'Sign In for Advanced Order'}
                  </button>

                  {!user && (
                    <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      You'll be redirected to sign in before proceeding
                    </p>
                  )}
                </div>

                {/* Enhanced Features */}
                <div className="mt-6 space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center`}>
                      <Package className="w-4 h-4 mr-1" />
                    Checkout Options:
                  </h4>
                    <ul className={`space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
                    <li>• <strong>Quick Checkout:</strong> Fast, streamlined process</li>
                      <li>• <strong>Advanced Order:</strong> Business features & bulk options</li>
                  </ul>
                </div>

                  {/* Security & Shipping */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <Shield className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Secure
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <Truck className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Free Ship
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <Tag className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Best Price
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl border p-8 max-w-md w-full mx-4`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Clear Cart
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Are you sure you want to remove all {totalItems} items from your cart? 
                {totalSavings > 0 && (
                  <span className="block mt-1 text-red-600 font-medium">
                    You'll lose ${totalSavings.toFixed(2)} in bulk savings!
                  </span>
                )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                  className={`flex-1 py-3 px-4 border rounded-xl font-medium transition-colors ${
                    darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Cart Item Component with Bulk Pricing Support
const EnhancedCartItem = ({ item, onRemove, onUpdateQuantity, darkMode }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  
  // Get effective price (bulk price if available, otherwise regular price)
  const effectivePrice = item.effectivePrice || item.price;
  const hasBulkPricing = item.bulkPricing?.isBulkPrice;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
      if (onUpdateQuantity) {
        onUpdateQuantity(item.id, newQuantity);
      }
    }
  };

  const itemTotal = effectivePrice * quantity;
  const originalItemTotal = hasBulkPricing ? item.bulkPricing.originalPrice * quantity : itemTotal;
  const itemSavings = originalItemTotal - itemTotal;

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center space-x-6">
        {/* Enhanced Product Image */}
        <Link to={`/products/${item.id}`} className="flex-shrink-0 group">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </Link>

        {/* Enhanced Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/products/${item.id}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'} mb-2 transition-colors line-clamp-2`}>
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