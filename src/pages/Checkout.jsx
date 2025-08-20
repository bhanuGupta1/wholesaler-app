// src/pages/Checkout.jsx - Enhanced with Auto-Apply Bulk Pricing Support
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import {
  createOrderWithStockUpdate,
  validateOrderItems,
} from "../firebase/orderService";
import {
  CreditCard,
  Truck,
  Shield,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Tag,
} from "lucide-react";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Determine if user is guest
  const isGuest = !user || user?.role === "guest";
  const guestId = isGuest ? `guest_${Date.now()}` : null;

  // Adjust step flow for guest users (skip shipping, go straight to payment)
  const [step, setStep] = useState(isGuest ? 2 : 1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processedCart, setProcessedCart] = useState([]);

  // NEW: Auto-apply bulk pricing whenever cart changes
  useEffect(() => {
    const cartWithBulkPricing = cart.map((item) => {
      return calculateItemBulkPricing(item);
    });
    setProcessedCart(cartWithBulkPricing);
  }, [cart]);

  // NEW: Function to calculate bulk pricing for an item (same as Cart)
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

  // Shipping Information - New Zealand focused
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "",
    address: "",
    suburb: "",
    city: "",
    region: "",
    postcode: "",
    country: "NZ",
    isDefault: false,
  });

  // Payment Information - NZ payment methods
  const [paymentInfo, setPaymentInfo] = useState({
    method: "credit_card", // credit_card, debit_card, bank_transfer, afterpay, paypal
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingAddressSame: true,
    billingAddress: {
      address: "",
      suburb: "",
      city: "",
      region: "",
      postcode: "",
      country: "NZ",
    },
  });

  // Delivery Options - NZ focused
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Guest contact info (for order tracking)
  const [guestContact, setGuestContact] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  // New Zealand delivery options - realistic pricing
  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "3-5 business days",
      price: 9.9,
      freeThreshold: 250, // Free over $250 NZD
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "1-2 business days",
      price: 19.9,
      freeThreshold: 500, // Free over $500 NZD
    },
    {
      id: "overnight",
      name: "Overnight Delivery",
      description: "Next business day (Metro areas)",
      price: 29.9,
      freeThreshold: 1000, // Free over $1000 NZD
    },
    {
      id: "pickup",
      name: "Click & Collect",
      description: "Ready in 2-4 hours",
      price: 0,
      freeThreshold: 0,
    },
  ];

  // New Zealand regions
  const nzRegions = [
    "Auckland",
    "Bay of Plenty",
    "Canterbury",
    "Gisborne",
    "Hawke's Bay",
    "Manawatū-Whanganui",
    "Marlborough",
    "Nelson",
    "Northland",
    "Otago",
    "Southland",
    "Taranaki",
    "Tasman",
    "Waikato",
    "Wellington",
    "West Coast",
  ];

  // UPDATED: Enhanced calculation with auto-applied bulk pricing
  const calculateTotal = () => {
    let subtotal = 0;
    let totalBulkSavings = 0;
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
        totalBulkSavings += savings;
      }
    });

    const selectedDelivery = deliveryOptions.find(
      (opt) => opt.id === deliveryOption,
    );
    const deliveryFee =
      subtotal >= selectedDelivery.freeThreshold ? 0 : selectedDelivery.price;
    const gst = subtotal * 0.15; // 15% GST in New Zealand
    const total = subtotal + deliveryFee + gst;

    return {
      subtotal,
      originalSubtotal,
      totalBulkSavings,
      deliveryFee,
      gst,
      total,
      totalItems: processedCart.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuestContactChange = (field, value) => {
    setGuestContact((prev) => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    if (isGuest) return true; // Skip shipping validation for guests

    const errors = {};

    if (!shippingInfo.firstName.trim())
      errors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim())
      errors.lastName = "Last name is required";
    if (!shippingInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(shippingInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!shippingInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validateNZPhone(shippingInfo.phone)) {
      errors.phone = "Please enter a valid NZ phone number";
    }
    if (!shippingInfo.address.trim()) errors.address = "Address is required";
    if (!shippingInfo.city.trim()) errors.city = "City is required";
    if (!shippingInfo.region.trim()) errors.region = "Region is required";
    if (!shippingInfo.postcode.trim()) {
      errors.postcode = "Postcode is required";
    } else if (!validatePostcode(shippingInfo.postcode)) {
      errors.postcode = "Postcode must be 4 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateGuestContact = () => {
    if (!isGuest) return true;

    const errors = {};

    if (!guestContact.firstName.trim())
      errors.guestFirstName = "First name is required";
    if (!guestContact.lastName.trim())
      errors.guestLastName = "Last name is required";
    if (!guestContact.email.trim()) {
      errors.guestEmail = "Email is required";
    } else if (!validateEmail(guestContact.email)) {
      errors.guestEmail = "Please enter a valid email address";
    }
    if (guestContact.phone && !validateNZPhone(guestContact.phone)) {
      errors.guestPhone = "Please enter a valid NZ phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors = {};

    if (
      paymentInfo.method === "credit_card" ||
      paymentInfo.method === "debit_card"
    ) {
      if (!paymentInfo.nameOnCard.trim()) {
        errors.nameOnCard = "Name on card is required";
      }
      if (!paymentInfo.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (!validateCardNumber(paymentInfo.cardNumber)) {
        errors.cardNumber = "Card number must be 16 digits";
      }
      if (!paymentInfo.expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
      } else if (!validateExpiryDate(paymentInfo.expiryDate)) {
        errors.expiryDate = "Invalid or expired date (MM/YY)";
      }
      if (!paymentInfo.cvv.trim()) {
        errors.cvv = "CVV is required";
      } else if (!validateCVV(paymentInfo.cvv)) {
        errors.cvv = "CVV must be 3-4 digits";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return (
        cleaned.substring(0, 2) +
        (cleaned.length > 2 ? "/" + cleaned.substring(2, 4) : "")
      );
    }
    return cleaned;
  };

  const formatPostcode = (value) => {
    // NZ postcodes are 4 digits
    return value.replace(/\D/g, "").substring(0, 4);
  };

  const formatPhoneNumber = (value) => {
    // Basic NZ phone formatting
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("64")) {
      return "+64 " + cleaned.substring(2);
    } else if (cleaned.startsWith("0")) {
      return cleaned;
    } else if (cleaned.length <= 9) {
      return "0" + cleaned;
    }
    return value;
  };

  // Enhanced validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateNZPhone = (phone) => {
    // NZ phone numbers: 021/022/027/029 (mobile) or 03/04/06/07/09 (landline)
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("64")) {
      return cleaned.length >= 11 && cleaned.length <= 13;
    }
    return cleaned.length >= 8 && cleaned.length <= 10;
  };

  const validatePostcode = (postcode) => {
    return /^\d{4}$/.test(postcode);
  };

  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, "");
    return /^\d{16}$/.test(cleaned);
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateExpiryDate = (expiryDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

    const [month, year] = expiryDate.split("/").map((num) => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth))
      return false;

    return true;
  };

  const [formErrors, setFormErrors] = useState({});

  // UPDATED: Enhanced handlePlaceOrder with comprehensive validation
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate that cart is not empty
      if (processedCart.length === 0) {
        setError("Your cart is empty");
        return;
      }

      // CRITICAL: Validate all items have valid prices before proceeding
      const invalidItems = processedCart.filter((item) => {
        const effectivePrice = item.effectivePrice ?? item.price;
        return (
          effectivePrice === undefined ||
          effectivePrice === null ||
          effectivePrice < 0
        );
      });

      if (invalidItems.length > 0) {
        console.error("Items with invalid prices:", invalidItems);
        setError(
          "Some items have invalid pricing. Please refresh the page and try again.",
        );
        return;
      }

      // Validate required contact information
      if (isGuest) {
        if (
          !guestContact.firstName?.trim() ||
          !guestContact.lastName?.trim() ||
          !guestContact.email?.trim()
        ) {
          setError("Please fill in all required contact information");
          return;
        }
      }

      const pricing = calculateTotal();

      // Prepare items for order creation - ensure all prices are valid
      const orderItems = processedCart.map((item) => {
        const effectivePrice = item.effectivePrice ?? item.price ?? 0;
        const originalPrice = item.price ?? 0;
        const quantity = item.quantity ?? 0;

        return {
          productId: item.id || item.productId,
          productName: item.name || item.productName,
          price: originalPrice, // Original price
          effectivePrice: effectivePrice, // Price after bulk discounts
          quantity: quantity,
          subtotal: effectivePrice * quantity,
          // Include bulk pricing info if available
          hasBulkDiscount: item.hasBulkDiscount || false,
          bulkPricing: item.bulkPricing || null,
          // Add any other item properties
          sku: item.sku || "",
          category: item.category || "",
          imageUrl: item.imageUrl || "",
        };
      });

      // Validate items before sending to order service
      try {
        validateOrderItems(orderItems);
      } catch (validationError) {
        setError(validationError.message);
        return;
      }

      const orderData = {
        // Customer info - handle guests differently
        customerName: isGuest
          ? `${guestContact.firstName} ${guestContact.lastName}`.trim()
          : `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
        customerEmail: isGuest ? guestContact.email : shippingInfo.email,
        customerPhone: isGuest ? guestContact.phone : shippingInfo.phone,

        // Guest identification
        isGuestOrder: isGuest,
        guestId: guestId,

        // Addresses - New Zealand format
        shippingAddress: isGuest
          ? {
              firstName: guestContact.firstName,
              lastName: guestContact.lastName,
              email: guestContact.email,
              phone: guestContact.phone,
              address:
                deliveryOption === "pickup" ? "Click & Collect" : "Guest Order",
              suburb: "N/A",
              city: "N/A",
              region: "N/A",
              postcode: "N/A",
              country: "New Zealand",
            }
          : shippingInfo,
        billingAddress: isGuest
          ? {
              firstName: guestContact.firstName,
              lastName: guestContact.lastName,
              email: guestContact.email,
            }
          : paymentInfo.billingAddressSame
            ? shippingInfo
            : paymentInfo.billingAddress,

        // VALIDATED order items with guaranteed valid prices
        items: orderItems,

        // Enhanced pricing with auto-applied bulk savings
        originalSubtotal: pricing.originalSubtotal,
        subtotal: pricing.subtotal,
        totalBulkSavings: pricing.totalBulkSavings,
        deliveryFee: pricing.deliveryFee,
        gst: pricing.gst, // GST instead of tax
        taxAmount: pricing.gst, // Also include taxAmount for compatibility
        total: pricing.total,
        totalAmount: pricing.total, // Include totalAmount for compatibility
        currency: "NZD",

        // Delivery
        deliveryOption: deliveryOption,
        specialInstructions: specialInstructions,

        // Payment (Note: In production, never store actual payment details!)
        paymentMethod: paymentInfo.method,
        paymentStatus: "pending",

        // Status
        status: "pending",
        userId: isGuest ? null : user?.uid || null,

        // Metadata
        itemCount: processedCart.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0,
        ),
        hasBulkDiscounts: pricing.totalBulkSavings > 0,
        bulkDiscountsAutoApplied: processedCart.some(
          (item) => item.hasBulkDiscount,
        ),

        // Order source and analytics
        orderSource: "checkout",

        // New Zealand specific
        country: "New Zealand",
        timezone: "Pacific/Auckland",
      };

      console.log("Creating order with validated data:", orderData); // For debugging

      // Create the order using the fixed order service
      const orderId = await createOrderWithStockUpdate(orderData);

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect
      clearCart();

      if (isGuest) {
        navigate(
          `/guest-order-confirmation/${orderId}?email=${encodeURIComponent(guestContact.email)}`,
        );
      } else {
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pricing = calculateTotal();

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Package className="w-10 h-10 mr-3" />
            {isGuest ? "Guest Checkout" : "Checkout"}
          </h1>

          {/* Guest Notice */}
          {isGuest && (
            <div
              className={`mb-6 p-6 rounded-xl ${darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"} border`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-4">🇳🇿</div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-blue-300" : "text-blue-800"} mb-2`}
                  >
                    Checking out as Guest
                  </h3>
                  <p
                    className={`${darkMode ? "text-blue-200" : "text-blue-700"}`}
                  >
                    Complete your purchase without creating an account. We'll
                    send order updates to your email. All prices in NZD.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* UPDATED: Enhanced Bulk Savings Notice */}
          {pricing.totalBulkSavings > 0 && (
            <div
              className={`mb-6 p-6 rounded-xl ${darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"} border`}
            >
              <div className="flex items-center">
                <Tag className="w-8 h-8 mr-3 text-green-600" />
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${darkMode ? "text-green-300" : "text-green-800"} mb-1`}
                  >
                    🎉 You're saving ${pricing.totalBulkSavings.toFixed(2)} NZD
                    with auto-applied bulk pricing!
                  </h3>
                  <p
                    className={`${darkMode ? "text-green-200" : "text-green-700"}`}
                  >
                    Bulk discounts have been automatically applied based on your
                    quantities and will be maintained through checkout.
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${darkMode ? "text-green-300" : "text-green-700"}`}
                  >
                    {
                      processedCart.filter((item) => item.hasBulkDiscount)
                        .length
                    }{" "}
                    items with bulk pricing
                  </div>
                  <div
                    className={`text-xs ${darkMode ? "text-green-400" : "text-green-600"}`}
                  >
                    Auto-applied at checkout
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps - simplified for guests */}
          <div className="flex items-center justify-center mb-6">
            {(isGuest
              ? [
                  { num: 2, label: "Contact & Payment" },
                  { num: 3, label: "Review" },
                ]
              : [
                  { num: 1, label: "Shipping" },
                  { num: 2, label: "Payment" },
                  { num: 3, label: "Review" },
                ]
            ).map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    step >= stepInfo.num
                      ? "bg-indigo-600 text-white"
                      : darkMode
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > stepInfo.num ? "✓" : stepInfo.num}
                </div>
                <span className="ml-3 font-medium">{stepInfo.label}</span>
                {index < (isGuest ? 1 : 2) && (
                  <div
                    className={`w-20 h-1 mx-6 rounded ${
                      step > stepInfo.num
                        ? "bg-indigo-600"
                        : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 ${
              darkMode
                ? "bg-red-900/30 border-red-800 text-red-400"
                : "bg-red-50 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {/* Step 1: Shipping Information (Skip for guests) */}
            {!isGuest && step === 1 && (
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-8`}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        handleShippingChange("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl ${
                        formErrors.firstName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      }`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        handleShippingChange("lastName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl ${
                        formErrors.lastName
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      }`}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleShippingChange("email", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl ${
                        formErrors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleShippingChange(
                          "phone",
                          formatPhoneNumber(e.target.value),
                        )
                      }
                      placeholder="021 234 5678"
                      className={`w-full px-4 py-3 border rounded-xl ${
                        formErrors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      placeholder="123 Queen Street"
                      className={`w-full px-4 py-3 border rounded-xl ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Suburb
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.suburb}
                      onChange={(e) =>
                        handleShippingChange("suburb", e.target.value)
                      }
                      placeholder="CBD"
                      className={`w-full px-4 py-3 border rounded-xl ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleShippingChange("city", e.target.value)
                      }
                      placeholder="Auckland"
                      className={`w-full px-4 py-3 border rounded-xl ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Region *
                    </label>
                    <select
                      value={shippingInfo.region}
                      onChange={(e) =>
                        handleShippingChange("region", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-xl ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      required
                    >
                      <option value="">Select Region</option>
                      {nzRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postcode}
                      onChange={(e) =>
                        handleShippingChange(
                          "postcode",
                          formatPostcode(e.target.value),
                        )
                      }
                      placeholder="1010"
                      maxLength="4"
                      className={`w-full px-4 py-3 border rounded-xl ${
                        formErrors.postcode
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      }`}
                      required
                    />
                    {formErrors.postcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.postcode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Options
                  </h3>
                  <div className="space-y-3">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          deliveryOption === option.id
                            ? darkMode
                              ? "border-indigo-500 bg-indigo-900/20 shadow-lg"
                              : "border-indigo-500 bg-indigo-50 shadow-lg"
                            : darkMode
                              ? "border-gray-600 hover:border-gray-500"
                              : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.id}
                          checked={deliveryOption === option.id}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="mr-4 w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="font-semibold">{option.name}</div>
                          <div
                            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {option.description}
                          </div>
                        </div>
                        <div className="text-right">
                          {option.price === 0 ? (
                            <span className="font-semibold text-green-600">
                              FREE
                            </span>
                          ) : pricing.subtotal >= option.freeThreshold ? (
                            <div>
                              <span className="line-through text-gray-400">
                                ${option.price.toFixed(2)}
                              </span>
                              <span className="ml-2 font-semibold text-green-600">
                                FREE
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold">
                              ${option.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-xl ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder="Leave at door, ring doorbell, etc..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payment Information (includes guest contact for guests) */}
            {step === 2 && (
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-8`}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  {isGuest
                    ? "Contact & Payment Information"
                    : "Payment Information"}
                </h2>

                {/* Guest Contact Information */}
                {isGuest && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={guestContact.firstName}
                          onChange={(e) =>
                            handleGuestContactChange(
                              "firstName",
                              e.target.value,
                            )
                          }
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.guestFirstName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          required
                        />
                        {formErrors.guestFirstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.guestFirstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={guestContact.lastName}
                          onChange={(e) =>
                            handleGuestContactChange("lastName", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.guestLastName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          required
                        />
                        {formErrors.guestLastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.guestLastName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={guestContact.email}
                          onChange={(e) =>
                            handleGuestContactChange("email", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.guestEmail
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          placeholder="your.email@example.co.nz"
                          required
                        />
                        {formErrors.guestEmail && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.guestEmail}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={guestContact.phone}
                          onChange={(e) =>
                            handleGuestContactChange(
                              "phone",
                              formatPhoneNumber(e.target.value),
                            )
                          }
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.guestPhone
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          placeholder="021 234 5678"
                        />
                        {formErrors.guestPhone && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.guestPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Guest Delivery Options */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3 flex items-center">
                        <Truck className="w-4 h-4 mr-1" />
                        Delivery Method
                      </h4>
                      <div className="space-y-3">
                        <label
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            deliveryOption === "pickup"
                              ? darkMode
                                ? "border-indigo-500 bg-indigo-900/20"
                                : "border-indigo-500 bg-indigo-50"
                              : darkMode
                                ? "border-gray-600"
                                : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={deliveryOption === "pickup"}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="mr-3 w-5 h-5"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">
                              Click & Collect (Recommended)
                            </div>
                            <div
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              Ready in 2-4 hours • FREE
                            </div>
                          </div>
                          <span className="font-semibold text-green-600">
                            FREE
                          </span>
                        </label>

                        <label
                          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            deliveryOption === "standard"
                              ? darkMode
                                ? "border-indigo-500 bg-indigo-900/20"
                                : "border-indigo-500 bg-indigo-50"
                              : darkMode
                                ? "border-gray-600"
                                : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value="standard"
                            checked={deliveryOption === "standard"}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="mr-3 w-5 h-5"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">
                              Standard Delivery
                            </div>
                            <div
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              3-5 business days across New Zealand
                            </div>
                          </div>
                          <span className="font-semibold">
                            $
                            {deliveryOptions
                              .find((opt) => opt.id === "standard")
                              ?.price.toFixed(2)}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods - NZ focused */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Choose Payment Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "credit_card",
                        name: "Credit Card",
                        icon: "💳",
                        desc: "Visa, Mastercard",
                      },
                      {
                        id: "debit_card",
                        name: "Debit Card",
                        icon: "💳",
                        desc: "EFTPOS, Visa Debit",
                      },
                      {
                        id: "bank_transfer",
                        name: "Bank Transfer",
                        icon: "🏦",
                        desc: "Direct from bank",
                      },
                      {
                        id: "afterpay",
                        name: "Afterpay",
                        icon: "💰",
                        desc: "Buy now, pay later",
                      },
                      {
                        id: "paypal",
                        name: "PayPal",
                        icon: "🅿️",
                        desc: "PayPal account",
                      },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                          paymentInfo.method === method.id
                            ? darkMode
                              ? "border-indigo-500 bg-indigo-900/20"
                              : "border-indigo-500 bg-indigo-50"
                            : darkMode
                              ? "border-gray-600 hover:border-gray-500"
                              : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentInfo.method === method.id}
                          onChange={(e) =>
                            handlePaymentChange("method", e.target.value)
                          }
                          className="mr-3 w-5 h-5"
                        />
                        <span className="mr-3 text-2xl">{method.icon}</span>
                        <div>
                          <div className="font-semibold">{method.name}</div>
                          <div
                            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {method.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Card Details */}
                {(paymentInfo.method === "credit_card" ||
                  paymentInfo.method === "debit_card") && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) =>
                          handlePaymentChange("nameOnCard", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-xl ${
                          formErrors.nameOnCard
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : darkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        }`}
                        required
                      />
                      {formErrors.nameOnCard && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.nameOnCard}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) =>
                          handlePaymentChange(
                            "cardNumber",
                            formatCardNumber(e.target.value),
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full px-4 py-3 border rounded-xl ${
                          formErrors.cardNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : darkMode
                              ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        }`}
                        required
                      />
                      {formErrors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) =>
                            handlePaymentChange(
                              "expiryDate",
                              formatExpiryDate(e.target.value),
                            )
                          }
                          placeholder="MM/YY"
                          maxLength="5"
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.expiryDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          required
                        />
                        {formErrors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) =>
                            handlePaymentChange(
                              "cvv",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="123"
                          maxLength="4"
                          className={`w-full px-4 py-3 border rounded-xl ${
                            formErrors.cvv
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : darkMode
                                ? "bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                : "bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          }`}
                          required
                        />
                        {formErrors.cvv && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Payment Methods */}
                {paymentInfo.method === "afterpay" && (
                  <div
                    className={`p-6 rounded-xl border-2 border-dashed ${
                      darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">💰</div>
                      <p className="font-semibold text-lg">Afterpay Payment</p>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
                      >
                        Split your purchase into 4 equal payments, due every 2
                        weeks
                      </p>
                      <div className="mt-3 text-xs text-green-600 font-medium">
                        No interest if paid on time
                      </div>
                    </div>
                  </div>
                )}

                {paymentInfo.method === "bank_transfer" && (
                  <div
                    className={`p-6 rounded-xl border-2 border-dashed ${
                      darkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🏦</div>
                      <p className="font-semibold text-lg">Bank Transfer</p>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
                      >
                        Bank details will be provided after order confirmation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-8`}
              >
                <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

                {/* UPDATED: Enhanced Order Items with Auto-Applied Bulk Pricing */}
                <div className="space-y-4 mb-8">
                  {processedCart.map((item) => {
                    const effectivePrice = item.effectivePrice || item.price;
                    const hasBulkPricing = item.hasBulkDiscount;
                    const itemSavings = hasBulkPricing
                      ? (item.price - effectivePrice) * item.quantity
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center space-x-4 p-4 border rounded-xl ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <div className="space-y-1">
                            <p
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              Qty: {item.quantity} × $
                              {effectivePrice.toFixed(2)}
                              {hasBulkPricing && (
                                <span className="ml-2 text-green-600 font-medium">
                                  (was ${item.price.toFixed(2)})
                                </span>
                              )}
                            </p>
                            {hasBulkPricing && (
                              <div className="flex items-center space-x-2">
                                <Tag className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  Auto bulk discount:{" "}
                                  {item.bulkPricing.bulkDiscount.toFixed(0)}%
                                  off • {item.bulkPricing.bulkTier}+ units
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${(effectivePrice * item.quantity).toFixed(2)}
                          </div>
                          {itemSavings > 0 && (
                            <div className="text-sm text-green-600 font-medium">
                              Saved ${itemSavings.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Contact & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Contact Information
                    </h3>
                    <div
                      className={`p-4 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">
                          {isGuest
                            ? `${guestContact.firstName} ${guestContact.lastName}`
                            : `${shippingInfo.firstName} ${shippingInfo.lastName}`}
                        </div>
                        <div>
                          {isGuest ? guestContact.email : shippingInfo.email}
                        </div>
                        {(isGuest
                          ? guestContact.phone
                          : shippingInfo.phone) && (
                          <div>
                            {isGuest ? guestContact.phone : shippingInfo.phone}
                          </div>
                        )}
                        {isGuest && (
                          <div
                            className={`text-xs mt-2 px-2 py-1 rounded ${darkMode ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-700"}`}
                          >
                            Guest Order • ID: {guestId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      Payment Method
                    </h3>
                    <div
                      className={`p-4 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                    >
                      <div className="space-y-1 text-sm">
                        <div className="font-medium capitalize">
                          {paymentInfo.method.replace("_", " ")}
                        </div>
                        {paymentInfo.cardNumber && (
                          <div>
                            •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
                          </div>
                        )}
                        <div className="text-xs text-green-600 font-medium">
                          All payments in NZD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* UPDATED: Enhanced Order Summary Sidebar with Auto-Applied Bulk Pricing */}
          <div className="xl:col-span-1">
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-lg border p-6 sticky top-4`}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {/* Original subtotal if bulk savings exist */}
                {pricing.totalBulkSavings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span
                      className={`${darkMode ? "text-gray-400" : "text-gray-500"} line-through`}
                    >
                      Original subtotal:
                    </span>
                    <span
                      className={`${darkMode ? "text-gray-400" : "text-gray-500"} line-through`}
                    >
                      ${pricing.originalSubtotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal ({pricing.totalItems} items):</span>
                  <span className="font-semibold">
                    ${pricing.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Auto-Applied Bulk Savings */}
                {pricing.totalBulkSavings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Auto Bulk Savings:
                    </span>
                    <span className="font-bold text-green-600">
                      -${pricing.totalBulkSavings.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `$${pricing.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (15%):</span>
                  <span>${pricing.gst.toFixed(2)}</span>
                </div>

                <hr
                  className={`${darkMode ? "border-gray-600" : "border-gray-200"}`}
                />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total (NZD):</span>
                  <div className="text-right">
                    <div>${pricing.total.toFixed(2)}</div>
                    {pricing.totalBulkSavings > 0 && (
                      <div className="text-sm font-normal text-green-600">
                        You saved ${pricing.totalBulkSavings.toFixed(2)}!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                {!isGuest && step === 1 && (
                  <button
                    onClick={() => {
                      if (validateShipping()) {
                        setStep(2);
                      }
                    }}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${"bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"}`}
                  >
                    Continue to Payment
                  </button>
                )}

                {step === 2 && (
                  <>
                    <button
                      onClick={() => {
                        const paymentValid = validatePayment();
                        const guestValid = isGuest
                          ? validateGuestContact()
                          : true;
                        if (paymentValid && guestValid) {
                          setStep(3);
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${"bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"}`}
                    >
                      Review Order
                    </button>
                    {!isGuest && (
                      <button
                        onClick={() => setStep(1)}
                        className={`w-full py-3 rounded-xl font-medium border transition-colors ${
                          darkMode
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Back to Shipping
                      </button>
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 shadow-lg"
                      } text-white`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center">
                            <Shield className="w-5 h-5 mr-2" />
                            {isGuest ? "Complete Guest Order" : "Place Order"}
                          </div>
                          <div className="text-sm font-normal mt-1">
                            ${pricing.total.toFixed(2)} NZD
                          </div>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className={`w-full py-3 rounded-xl font-medium border transition-colors ${
                        darkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Back to Payment
                    </button>
                  </>
                )}

                {/* Validation Error Summary */}
                {Object.keys(formErrors).length > 0 && (
                  <div
                    className={`mt-4 p-4 rounded-xl ${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border`}
                  >
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 text-red-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-red-600">
                        Please fix the following errors:
                      </span>
                    </div>
                    <div
                      className={`text-sm space-y-1 ${darkMode ? "text-red-300" : "text-red-600"}`}
                    >
                      {Object.keys(formErrors).length} field(s) need attention
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Security & NZ Info */}
              <div className="mt-6 space-y-3">
                <div
                  className={`p-4 rounded-xl text-sm ${
                    darkMode
                      ? "bg-green-900/20 border-green-800"
                      : "bg-green-50 border-green-200"
                  } border`}
                >
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-semibold text-green-600">
                      Secure NZ Checkout
                    </span>
                  </div>
                  <div
                    className={`text-xs space-y-1 ${darkMode ? "text-green-300" : "text-green-600"}`}
                  >
                    <div>• SSL encrypted & PCI compliant</div>
                    <div>• All prices include GST</div>
                    <div>• NZ consumer rights protected</div>
                    {pricing.totalBulkSavings > 0 && (
                      <div>• Auto bulk discounts applied</div>
                    )}
                  </div>
                </div>

                {/* Payment Features */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    className={`p-3 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
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
                    className={`p-3 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <Truck
                      className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                    />
                    <div
                      className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Fast Ship
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <Tag
                      className={`w-5 h-5 mx-auto mb-1 ${darkMode ? "text-purple-400" : "text-purple-600"}`}
                    />
                    <div
                      className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Auto Bulk
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

export default Checkout;
