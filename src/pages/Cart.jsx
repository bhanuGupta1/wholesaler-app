// src/pages/Cart.jsx - Complete shopping cart like Costco
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [membershipType, setMembershipType] = useState('basic');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showMembershipInfo, setShowMembershipInfo] = useState(false);

  // Determine membership type based on user email
  useEffect(() => {
    if (user?.email?.includes('business')) {
      setMembershipType('business');
    } else if (user?.email?.includes('executive')) {
      setMembershipType('executive');
    } else if (user) {
      setMembershipType('gold');
    } else {
      setMembershipType('basic');
    }
  }, [user]);

  const getBulkPrice = (product, quantity) => {
    const basePrice = product.price;
    if (quantity >= 50) return basePrice * 0.8; // 20% off for 50+
    if (quantity >= 20) return basePrice * 0.9; // 10% off for 20+
    if (quantity >= 10) return basePrice * 0.95; // 5% off for 10+
    return basePrice;
  };

  const getMembershipDiscount = () => {
    switch (membershipType) {
      case 'business': return 0.15; // 15% business discount
      case 'executive': return 0.12; // 12% executive discount
      case 'gold': return 0.05; // 5% gold member discount
      default: return 0;
    }
  };

  const applyPromoCode = () => {
    const validCodes = {
      'SAVE10': 0.10,
      'WELCOME15': 0.15,
      'BULK20': 0.20,
      'NEWCUSTOMER': 0.25
    };
    
    if (validCodes[promoCode.toUpperCase()]) {
      setPromoDiscount(validCodes[promoCode.toUpperCase()]);
    } else {
      alert('Invalid promo code');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      // Update cart logic would go here
      // For now, we'll just use the existing cart state
    }
  };

  const calculatePricing = () => {
    let subtotal = 0;
    let bulkSavings = 0;
    
    cart.forEach(item => {
      const regularPrice = item.price * item.quantity;
      const bulkPrice = getBulkPrice(item, item.quantity) * item.quantity;
      subtotal += bulkPrice;
      bulkSavings += (regularPrice - bulkPrice);
    });

    const membershipDiscount = subtotal * getMembershipDiscount();
    const promoDiscountAmount = subtotal * promoDiscount;
    const tax = (subtotal - membershipDiscount - promoDiscountAmount) * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 15.99; // Free shipping over $100
    const total = subtotal - membershipDiscount - promoDiscountAmount + tax + shipping;

    return {
      subtotal,
      bulkSavings,
      membershipDiscount,
      promoDiscountAmount,
      tax,
      shipping,
      total
    };
  };

  const pricing = calculatePricing();

  if (cart.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center`}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Start shopping to add items to your cart
            </p>
            <Link
              to="/products"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <div className="flex items-center space-x-4">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
            <button
              onClick={clearCart}
              className={`px-4 py-2 border rounded-lg ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                darkMode={darkMode}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                getBulkPrice={getBulkPrice}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 sticky top-4`}>
              {/* Membership Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Membership Level</span>
                  <button
                    onClick={() => setShowMembershipInfo(!showMembershipInfo)}
                    className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                  >
                    {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)}
                  </button>
                </div>
                
                {showMembershipInfo && (
                  <div className={`p-3 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="space-y-1">
                      <div>Basic: 0% discount</div>
                      <div>Gold: 5% discount</div>
                      <div>Executive: 12% discount</div>
                      <div>Business: 15% discount</div>
                    </div>
                    {!user && (
                      <Link
                        to="/register"
                        className="inline-block mt-2 text-indigo-600 text-sm hover:underline"
                      >
                        Sign up for membership benefits
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className={`flex-1 px-3 py-2 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Try: SAVE10, WELCOME15, BULK20, NEWCUSTOMER
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>

                {pricing.bulkSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bulk Savings:</span>
                    <span>-${pricing.bulkSavings.toFixed(2)}</span>
                  </div>
                )}

                {pricing.membershipDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Membership Discount ({(getMembershipDiscount() * 100).toFixed(0)}%):</span>
                    <span>-${pricing.membershipDiscount.toFixed(2)}</span>
                  </div>
                )}

                {pricing.promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount:</span>
                    <span>-${pricing.promoDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {pricing.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${pricing.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <hr className={`${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Savings Summary */}
              {(pricing.bulkSavings + pricing.membershipDiscount + pricing.promoDiscountAmount) > 0 && (
                <div className={`p-3 rounded mb-6 ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="text-green-600 font-medium">
                    You saved: ${(pricing.bulkSavings + pricing.membershipDiscount + pricing.promoDiscountAmount).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className={`block text-center py-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
              >
                Continue Shopping
              </Link>

              {/* Shipping Info */}
              <div className={`mt-6 p-3 rounded text-sm ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                <div className="flex items-center">
                  <span className="mr-2">🚚</span>
                  <div>
                    <div className="font-medium">Free Shipping</div>
                    <div className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      On orders over $100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, darkMode, onUpdateQuantity, onRemove, getBulkPrice }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  };

  const bulkPrice = getBulkPrice(item, quantity);
  const savings = (item.price - bulkPrice) * quantity;

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {item.category}
          </p>
          
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-lg font-bold text-indigo-600">
                ${bulkPrice.toFixed(2)}
              </span>
              {bulkPrice < item.price && (
                <span className={`ml-2 text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {savings > 0 && (
              <span className="text-sm text-green-600 font-medium">
                Save ${savings.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className={`px-3 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-l-lg`}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              className={`w-16 px-2 py-2 text-center border-l border-r ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
              min="0"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className={`px-3 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-r-lg`}
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="font-bold text-lg">
              ${(bulkPrice * quantity).toFixed(2)}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Pricing Info */}
      {quantity >= 10 && (
        <div className={`mt-4 p-3 rounded text-sm ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
          <div className="flex items-center">
            <span className="mr-2">💰</span>
            <div>
              <div className="font-medium text-green-600">Bulk Pricing Applied!</div>
              <div className={`${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                {quantity >= 50 ? '20% off for 50+ items' :
                 quantity >= 20 ? '10% off for 20+ items' :
                 '5% off for 10+ items'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;