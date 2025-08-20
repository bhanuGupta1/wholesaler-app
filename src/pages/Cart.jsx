// src/pages/Cart.jsx - Enhanced with Auto-Apply Bulk Pricing
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  CreditCard,
  Shield,
  Truck,
  Tag,
} from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [processedCart, setProcessedCart] = useState([]);

  // NEW: Auto-apply bulk pricing whenever cart changes
  useEffect(() => {
    const cartWithBulkPricing = cart.map((item) => {
      return calculateItemBulkPricing(item);
    });
    setProcessedCart(cartWithBulkPricing);
  }, [cart]);

  // NEW: Function to calculate bulk pricing for an item
  const calculateItemBulkPricing = (item) => {
    // If product doesn't have bulk pricing, return as-is
    if (!item.bulkPricing || typeof item.bulkPricing !== "object") {
      return {
        ...item,
        effectivePrice: item.price,
        hasBulkDiscount: false,
      };
    }

    // Get all bulk pricing tiers and sort by quantity (descending)
    const bulkTiers = Object.keys(item.bulkPricing)
      .map((tier) => parseInt(tier))
      .filter((tier) => !isNaN(tier))
      .sort((a, b) => b - a);

    // Find the highest tier that applies to current quantity
    const applicableTier = bulkTiers.find((tier) => item.quantity >= tier);

    if (applicableTier) {
      const bulkPrice = item.bulkPricing[applicableTier.toString()];
      const savings = item.price - bulkPrice;
      const discountPercent = (savings / item.price) * 100;

      return {
        ...item,
        effectivePrice: bulkPrice,
        hasBulkDiscount: true,
        bulkPricing: {
          ...item.bulkPricing,
          isBulkPrice: true,
          originalPrice: item.price,
          bulkDiscount: discountPercent,
          bulkTier: applicableTier,
          appliedPrice: bulkPrice,
          savings: savings,
        },
      };
    }

    // No bulk tier applies
    return {
      ...item,
      effectivePrice: item.price,
      hasBulkDiscount: false,
      bulkPricing: {
        ...item.bulkPricing,
        isBulkPrice: false,
      },
    };
  };

  // Enhanced total calculations with auto-applied bulk pricing
  const calculateTotals = () => {
    let subtotal = 0;
    let totalSavings = 0;
    let originalSubtotal = 0;

    processedCart.forEach((item) => {
      const effectivePrice = item.effectivePrice || item.price;
      const itemSubtotal = effectivePrice * item.quantity;
      subtotal += itemSubtotal;

      // Calculate original subtotal and savings
      const originalItemTotal = item.price * item.quantity;
      originalSubtotal += originalItemTotal;

      if (item.hasBulkDiscount) {
        const savings = originalItemTotal - itemSubtotal;
        totalSavings += savings;
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
      totalItems: processedCart.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const { subtotal, originalSubtotal, totalSavings, tax, total, totalItems } =
    calculateTotals();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
    } else {
      navigate("/checkout");
    }
  };

  const handleCreateOrder = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: { pathname: "/create-order", state: { fromCart: true } },
        },
      });
    } else {
      navigate("/create-order", { state: { fromCart: true } });
    }
  };

  // NEW: Handle quantity updates with bulk pricing recalculation
  const handleQuantityUpdate = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
    // Bulk pricing will be recalculated automatically via useEffect
  };

  if (processedCart.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"} flex items-center`}
              >
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
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-12 text-center`}
            >
              <div className="text-8xl mb-6">🛒</div>
              <h2
                className={`text-3xl font-bold ${darkMode ? "text-gray-200" : "text-gray-900"} mb-3`}
              >
                Your cart is empty
              </h2>
              <p
                className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"} mb-8 max-w-md mx-auto`}
              >
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
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Savings Badge */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} flex items-center mb-2`}
              >
                <ShoppingCart className="w-10 h-10 mr-3" />
                Shopping Cart
              </h1>
              <div className="flex items-center space-x-4">
                <span
                  className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {totalItems} {totalItems === 1 ? "item" : "items"}
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
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
            {/* Enhanced Cart Items with Auto-Applied Bulk Pricing */}
            <div className="xl:col-span-3">
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border overflow-hidden`}
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {processedCart.map((item, index) => (
                    <EnhancedCartItem
                      key={`${item.id}-${index}`}
                      item={item}
                      onRemove={removeFromCart}
                      onUpdateQuantity={handleQuantityUpdate}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Bulk Pricing Info Section */}
              {processedCart.some((item) => item.hasBulkDiscount) && (
                <div
                  className={`mt-6 p-6 rounded-2xl ${darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"} border`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${darkMode ? "text-green-300" : "text-green-800"}`}
                      >
                        🎉 Bulk Pricing Applied Automatically!
                      </h3>
                      <p
                        className={`text-sm ${darkMode ? "text-green-200" : "text-green-700"}`}
                      >
                        Your quantities qualify for volume discounts
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-green-800/30" : "bg-white"}`}
                    >
                      <div
                        className={`text-2xl font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        ${totalSavings.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm ${darkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        Total Savings
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-green-800/30" : "bg-white"}`}
                    >
                      <div
                        className={`text-2xl font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        {
                          processedCart.filter((item) => item.hasBulkDiscount)
                            .length
                        }
                      </div>
                      <div
                        className={`text-sm ${darkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        Items with Bulk Pricing
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-green-800/30" : "bg-white"}`}
                    >
                      <div
                        className={`text-2xl font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        {totalSavings > 0
                          ? ((totalSavings / originalSubtotal) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </div>
                      <div
                        className={`text-sm ${darkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        Average Discount
                      </div>
                    </div>
                  </div>

                  {/* NEW: Show breakdown of bulk discounts per item */}
                  <div className="mt-4">
                    <h4
                      className={`text-sm font-semibold ${darkMode ? "text-green-300" : "text-green-700"} mb-2`}
                    >
                      Applied Discounts:
                    </h4>
                    <div className="space-y-2">
                      {processedCart
                        .filter((item) => item.hasBulkDiscount)
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`flex justify-between text-xs ${darkMode ? "text-green-200" : "text-green-600"}`}
                          >
                            <span>
                              {item.name} ({item.quantity} units)
                            </span>
                            <span>
                              {item.bulkPricing.bulkDiscount.toFixed(1)}% off •
                              Save $
                              {(
                                item.bulkPricing.savings * item.quantity
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NEW: Show potential bulk discounts for items close to thresholds */}
              {processedCart.some((item) => hasNearbyBulkTiers(item)) && (
                <div
                  className={`mt-6 p-6 rounded-2xl ${darkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${darkMode ? "text-yellow-300" : "text-yellow-800"}`}
                      >
                        💡 Get More Savings!
                      </h3>
                      <p
                        className={`text-sm ${darkMode ? "text-yellow-200" : "text-yellow-700"}`}
                      >
                        You're close to additional bulk discounts
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {processedCart
                      .filter((item) => hasNearbyBulkTiers(item))
                      .map((item) => {
                        const nextTier = getNextBulkTier(item);
                        const additionalSavings = nextTier
                          ? calculateAdditionalSavings(item, nextTier)
                          : 0;

                        return (
                          <div
                            key={item.id}
                            className={`flex justify-between text-sm ${darkMode ? "text-yellow-200" : "text-yellow-700"}`}
                          >
                            <span>{item.name}</span>
                            <span>
                              Add {nextTier ? nextTier - item.quantity : 0} more
                              for ${additionalSavings.toFixed(2)} extra savings
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Order Summary */}
            <div className="xl:col-span-1">
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-6 sticky top-4`}
              >
                <h2
                  className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6 flex items-center`}
                >
                  <CreditCard className="w-6 h-6 mr-2" />
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {/* Subtotal with original price if savings exist */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Subtotal ({totalItems} items):
                    </span>
                    <div className="text-right">
                      <span
                        className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        ${subtotal.toFixed(2)}
                      </span>
                      {totalSavings > 0 && (
                        <div
                          className={`text-sm line-through ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          ${originalSubtotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bulk Savings */}
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium">
                        Auto Bulk Savings:
                      </span>
                      <span className="font-semibold text-green-600">
                        -${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span
                      className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                      Tax (10%):
                    </span>
                    <span
                      className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  {/* Total */}
                  <div
                    className={`border-t ${darkMode ? "border-gray-600" : "border-gray-200"} pt-4`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Total:
                      </span>
                      <div className="text-right">
                        <span
                          className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
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
                    {user ? "Quick Checkout" : "Sign In to Checkout"}
                  </button>

                  {/* Alternative: Create Order Button */}
                  <button
                    onClick={handleCreateOrder}
                    className={`w-full py-3 px-4 border-2 border-indigo-600 text-indigo-600 text-base font-medium rounded-xl hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${darkMode ? "hover:border-indigo-500" : ""}`}
                  >
                    {user ? "Advanced Order" : "Sign In for Advanced Order"}
                  </button>

                  {!user && (
                    <p
                      className={`text-xs text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      You'll be redirected to sign in before proceeding
                    </p>
                  )}
                </div>

                {/* Enhanced Features */}
                <div className="mt-6 space-y-3">
                  <div
                    className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"} text-sm`}
                  >
                    <h4
                      className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2 flex items-center`}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Checkout Options:
                    </h4>
                    <ul
                      className={`space-y-1 ${darkMode ? "text-gray-300" : "text-gray-600"} text-xs`}
                    >
                      <li>
                        • <strong>Quick Checkout:</strong> Fast, streamlined
                        process
                      </li>
                      <li>
                        • <strong>Advanced Order:</strong> Business features &
                        bulk options
                      </li>
                    </ul>
                  </div>

                  {/* Security & Shipping */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <Shield
                        className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-green-400" : "text-green-600"}`}
                      />
                      <div
                        className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Secure
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <Truck
                        className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                      />
                      <div
                        className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Free Ship
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <Tag
                        className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-purple-400" : "text-purple-600"}`}
                      />
                      <div
                        className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Auto Bulk Pricing
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
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-2xl border p-8 max-w-md w-full mx-4`}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3
                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
              >
                Clear Cart
              </h3>
              <p
                className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}
              >
                Are you sure you want to remove all {totalItems} items from your
                cart?
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
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
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

// NEW: Helper functions for bulk pricing calculations
const hasNearbyBulkTiers = (item) => {
  if (!item.bulkPricing || typeof item.bulkPricing !== "object") return false;

  const bulkTiers = Object.keys(item.bulkPricing)
    .map((tier) => parseInt(tier))
    .filter((tier) => !isNaN(tier))
    .sort((a, b) => a - b);

  // Check if there's a tier within 5 units of current quantity
  return bulkTiers.some(
    (tier) => tier > item.quantity && tier <= item.quantity + 5,
  );
};

const getNextBulkTier = (item) => {
  if (!item.bulkPricing || typeof item.bulkPricing !== "object") return null;

  const bulkTiers = Object.keys(item.bulkPricing)
    .map((tier) => parseInt(tier))
    .filter((tier) => !isNaN(tier))
    .sort((a, b) => a - b);

  return bulkTiers.find((tier) => tier > item.quantity);
};

const calculateAdditionalSavings = (item, nextTier) => {
  if (!item.bulkPricing || !nextTier) return 0;

  const nextTierPrice = item.bulkPricing[nextTier.toString()];
  const currentPrice = item.effectivePrice || item.price;
  const additionalUnits = nextTier - item.quantity;

  return (currentPrice - nextTierPrice) * nextTier; // Total savings if they reach next tier
};

// Enhanced Cart Item Component with Auto-Applied Bulk Pricing Support
const EnhancedCartItem = ({ item, onRemove, onUpdateQuantity, darkMode }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  // Get effective price (bulk price if available, otherwise regular price)
  const effectivePrice = item.effectivePrice || item.price;
  const hasBulkPricing = item.hasBulkDiscount;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
      if (onUpdateQuantity) {
        onUpdateQuantity(item.id, newQuantity);
      }
    }
  };

  const itemTotal = effectivePrice * quantity;
  const originalItemTotal = item.price * quantity;
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
            <h3
              className={`text-lg font-semibold ${darkMode ? "text-white hover:text-indigo-400" : "text-gray-900 hover:text-indigo-600"} mb-2 transition-colors line-clamp-2`}
            >
              {item.name}
            </h3>
          </Link>

          {/* Pricing Information */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span
                className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                ${effectivePrice.toFixed(2)}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  each
                </span>
              </span>

              {hasBulkPricing && (
                <>
                  <span
                    className={`text-sm line-through ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {item.bulkPricing?.bulkDiscount?.toFixed(0) || 0}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Bulk Pricing Info */}
            {hasBulkPricing && (
              <div
                className={`p-2 rounded-lg ${darkMode ? "bg-green-900/20" : "bg-green-50"} border border-green-200 dark:border-green-800`}
              >
                <div className="flex items-center text-sm">
                  <Tag className="w-4 h-4 mr-1 text-green-600" />
                  <span
                    className={`font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}
                  >
                    Auto Bulk Pricing - {item.bulkPricing?.bulkTier}+ units
                  </span>
                </div>
              </div>
            )}

            {/* Product Meta */}
            <div className="flex items-center space-x-4 text-sm">
              {item.sku && (
                <span
                  className={`font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  SKU: {item.sku}
                </span>
              )}
              {item.category && (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                >
                  {item.category}
                </span>
              )}
              <span
                className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {item.stock} available
              </span>
            </div>
          </div>

          {/* Stock Warning */}
          {quantity >= item.stock * 0.8 && (
            <div
              className={`mt-2 p-2 rounded-lg ${darkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
            >
              <p
                className={`text-xs font-medium ${darkMode ? "text-yellow-400" : "text-yellow-700"} flex items-center`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Limited stock - only {item.stock - quantity} left after this
                quantity
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Quantity Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                quantity <= 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Minus className="w-4 h-4" />
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
              className={`w-20 text-center py-2 px-3 border rounded-lg font-medium ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= item.stock}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                quantity >= item.stock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced Subtotal Display */}
          <div className="text-right min-w-0">
            <div
              className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              ${itemTotal.toFixed(2)}
            </div>

            {hasBulkPricing && itemSavings > 0 && (
              <div className="space-y-1">
                <div
                  className={`text-sm line-through ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  ${originalItemTotal.toFixed(2)}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Saved ${itemSavings.toFixed(2)}
                </div>
              </div>
            )}

            {quantity > 1 && (
              <div
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                ${effectivePrice.toFixed(2)} × {quantity}
              </div>
            )}
          </div>

          {/* Enhanced Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            className={`p-3 rounded-full transition-colors ${
              darkMode
                ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
            } group`}
            title="Remove from cart"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
