// src/pages/Checkout.jsx - New Zealand localized with Bulk Pricing Support
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { createOrderWithStockUpdate } from '../firebase/orderService';
import { CreditCard, Truck, Shield, Package, MapPin, User, Mail, Phone, Tag } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Determine if user is guest
  const isGuest = !user || user?.role === 'guest';
  const guestId = isGuest ? `guest_${Date.now()}` : null;

  // Adjust step flow for guest users (skip shipping, go straight to payment)
  const [step, setStep] = useState(isGuest ? 2 : 1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping Information - New Zealand focused
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    suburb: '',
    city: '',
    region: '',
    postcode: '',
    country: 'NZ',
    isDefault: false
  });

  // Payment Information - NZ payment methods
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'credit_card', // credit_card, debit_card, bank_transfer, afterpay, paypal
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddressSame: true,
    billingAddress: {
      address: '',
      suburb: '',
      city: '',
      region: '',
      postcode: '',
      country: 'NZ'
    }
  });

  // Delivery Options - NZ focused
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Guest contact info (for order tracking)
  const [guestContact, setGuestContact] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // New Zealand delivery options - realistic pricing
  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      price: 9.90,
      freeThreshold: 250 // Free over $250 NZD
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '1-2 business days',
      price: 19.90,
      freeThreshold: 500 // Free over $500 NZD
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day (Metro areas)',
      price: 29.90,
      freeThreshold: 1000 // Free over $1000 NZD
    },
    {
      id: 'pickup',
      name: 'Click & Collect',
      description: 'Ready in 2-4 hours',
      price: 0,
      freeThreshold: 0
    }
  ];

  // New Zealand regions
  const nzRegions = [
    'Auckland',
    'Bay of Plenty',
    'Canterbury',
    'Gisborne',
    'Hawke\'s Bay',
    'Manawatū-Whanganui',
    'Marlborough',
    'Nelson',
    'Northland',
    'Otago',
    'Southland',
    'Taranaki',
    'Tasman',
    'Waikato',
    'Wellington',
    'West Coast'
  ];

  // Enhanced calculation with bulk pricing support
  const calculateTotal = () => {
    let subtotal = 0;
    let totalBulkSavings = 0;
    let originalSubtotal = 0;

    cart.forEach(item => {
      const effectivePrice = item.effectivePrice || item.price;
      const itemSubtotal = effectivePrice * item.quantity;
      subtotal += itemSubtotal;

      // Calculate bulk savings
      if (item.bulkPricing?.isBulkPrice) {
        const originalItemTotal = item.bulkPricing.originalPrice * item.quantity;
        const savings = originalItemTotal - itemSubtotal;
        totalBulkSavings += savings;
        originalSubtotal += originalItemTotal;
      } else {
        originalSubtotal += item.price * item.quantity;
      }
    });

    const selectedDelivery = deliveryOptions.find(opt => opt.id === deliveryOption);
    const deliveryFee = subtotal >= selectedDelivery.freeThreshold ? 0 : selectedDelivery.price;
    const gst = subtotal * 0.15; // 15% GST in New Zealand
    const total = subtotal + deliveryFee + gst;

    return { 
      subtotal, 
      originalSubtotal,
      totalBulkSavings,
      deliveryFee, 
      gst, 
      total,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestContactChange = (field, value) => {
    setGuestContact(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    if (isGuest) return true; // Skip shipping validation for guests
    
    const errors = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(shippingInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!shippingInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validateNZPhone(shippingInfo.phone)) {
      errors.phone = 'Please enter a valid NZ phone number';
    }
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.region.trim()) errors.region = 'Region is required';
    if (!shippingInfo.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    } else if (!validatePostcode(shippingInfo.postcode)) {
      errors.postcode = 'Postcode must be 4 digits';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateGuestContact = () => {
    if (!isGuest) return true;
    
    const errors = {};
    
    if (!guestContact.firstName.trim()) errors.guestFirstName = 'First name is required';
    if (!guestContact.lastName.trim()) errors.guestLastName = 'Last name is required';
    if (!guestContact.email.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!validateEmail(guestContact.email)) {
      errors.guestEmail = 'Please enter a valid email address';
    }
    if (guestContact.phone && !validateNZPhone(guestContact.phone)) {
      errors.guestPhone = 'Please enter a valid NZ phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors = {};
    
    if (paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') {
      if (!paymentInfo.nameOnCard.trim()) {
        errors.nameOnCard = 'Name on card is required';
      }
      if (!paymentInfo.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!validateCardNumber(paymentInfo.cardNumber)) {
        errors.cardNumber = 'Card number must be 16 digits';
      }
      if (!paymentInfo.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!validateExpiryDate(paymentInfo.expiryDate)) {
        errors.expiryDate = 'Invalid or expired date (MM/YY)';
      }
      if (!paymentInfo.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!validateCVV(paymentInfo.cvv)) {
        errors.cvv = 'CVV must be 3-4 digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
    }
    return cleaned;
  };

  const formatPostcode = (value) => {
    // NZ postcodes are 4 digits
    return value.replace(/\D/g, '').substring(0, 4);
  };

  const formatPhoneNumber = (value) => {
    // Basic NZ phone formatting
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('64')) {
      return '+64 ' + cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      return cleaned;
    } else if (cleaned.length <= 9) {
      return '0' + cleaned;
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
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('64')) {
      return cleaned.length >= 11 && cleaned.length <= 13;
    }
    return cleaned.length >= 8 && cleaned.length <= 10;
  };

  const validatePostcode = (postcode) => {
    return /^\d{4}$/.test(postcode);
  };

  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateExpiryDate = (expiryDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
  };

  const [formErrors, setFormErrors] = useState({});

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const pricing = calculateTotal();
      
      const orderData = {
        // Customer info - handle guests differently
        customerName: isGuest 
          ? `${guestContact.firstName} ${guestContact.lastName}` 
          : `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: isGuest ? guestContact.email : shippingInfo.email,
        customerPhone: isGuest ? guestContact.phone : shippingInfo.phone,
        
        // Guest identification
        isGuestOrder: isGuest,
        guestId: guestId,
        
        // Addresses - use minimal info for guests
        shippingAddress: isGuest ? {
          firstName: guestContact.firstName,
          lastName: guestContact.lastName,
          email: guestContact.email,
          phone: guestContact.phone,
          // For guests, we'll use store pickup or minimal shipping
          address: deliveryOption === 'pickup' ? 'Store Pickup' : 'Guest Order',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',
          country: 'US'
        } : shippingInfo,
        billingAddress: isGuest ? {
          firstName: guestContact.firstName,
          lastName: guestContact.lastName,
          email: guestContact.email
        } : (paymentInfo.billingAddressSame ? shippingInfo : paymentInfo.billingAddress),
        
        // Order details
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        
        // Pricing
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        tax: pricing.tax,
        total: pricing.total,
        
        // Delivery
        deliveryOption: deliveryOption,
        specialInstructions: specialInstructions,
        
        // Payment (Note: In production, never store actual payment details!)
        paymentMethod: paymentInfo.method,
        paymentStatus: 'pending',
        
        // Status
        status: 'pending',
        userId: isGuest ? null : (user?.uid || null),
        
        // Metadata
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
      };

      const orderId = await createOrderWithStockUpdate(orderData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      
      // For guests, redirect to a special order confirmation that doesn't require login
      if (isGuest) {
        navigate(`/guest-order-confirmation/${orderId}?email=${encodeURIComponent(guestContact.email)}`);
      } else {
        navigate(`/order-confirmation/${orderId}`);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pricing = calculateTotal();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {isGuest ? 'Guest Checkout' : 'Checkout'}
          </h1>
          
          {/* Guest Notice */}
          {isGuest && (
            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-start">
                <div className="text-2xl mr-3">🛒</div>
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>
                    Checking out as Guest
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    You can complete your purchase without creating an account. We'll send order updates to your email.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress Steps - simplified for guests */}
          <div className="flex items-center justify-center mb-6">
            {(isGuest ? [
              { num: 2, label: 'Contact & Payment' },
              { num: 3, label: 'Review' }
            ] : [
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' }
            ]).map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepInfo.num 
                    ? 'bg-indigo-600 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > stepInfo.num ? '✓' : stepInfo.num}
                </div>
                <span className="ml-2 font-medium">{stepInfo.label}</span>
                {index < (isGuest ? 1 : 2) && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepInfo.num 
                      ? 'bg-indigo-600' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            darkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information (Skip for guests) */}
            {!isGuest && step === 1 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Apartment, suite, etc. (Optional)</label>
                    <input
                      type="text"
                      value={shippingInfo.apartment}
                      onChange={(e) => handleShippingChange('apartment', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <select
                      value={shippingInfo.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      {/* Add more states */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Delivery Options</h3>
                  <div className="space-y-3">
                    {deliveryOptions.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                          deliveryOption === option.id
                            ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.id}
                          checked={deliveryOption === option.id}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="mr-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {option.description}
                          </div>
                        </div>
                        <div className="text-right">
                          {option.price === 0 ? (
                            <span className="font-medium text-green-600">FREE</span>
                          ) : pricing.subtotal >= option.freeThreshold ? (
                            <div>
                              <span className="line-through text-gray-400">${option.price}</span>
                              <span className="ml-2 font-medium text-green-600">FREE</span>
                            </div>
                          ) : (
                            <span className="font-medium">${option.price}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payment Information (includes guest contact for guests) */}
            {step === 2 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">
                  {isGuest ? 'Contact & Payment Information' : 'Payment Information'}
                </h2>

                {/* Guest Contact Information */}
                {isGuest && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <input
                          type="text"
                          value={guestContact.firstName}
                          onChange={(e) => handleGuestContactChange('firstName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={guestContact.lastName}
                          onChange={(e) => handleGuestContactChange('lastName', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          value={guestContact.email}
                          onChange={(e) => handleGuestContactChange('email', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          placeholder="We'll send order updates here"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={guestContact.phone}
                          onChange={(e) => handleGuestContactChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          placeholder="For delivery updates"
                        />
                      </div>
                    </div>

                    {/* Guest Delivery Options */}
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-3">Delivery Method</h4>
                      <div className="space-y-2">
                        {/* For guests, recommend pickup or simplified delivery */}
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          deliveryOption === 'pickup'
                            ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            value="pickup"
                            checked={deliveryOption === 'pickup'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium">Store Pickup (Recommended)</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Ready in 2-4 hours • FREE
                            </div>
                          </div>
                          <span className="font-medium text-green-600">FREE</span>
                        </label>

                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          deliveryOption === 'standard'
                            ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="delivery"
                            value="standard"
                            checked={deliveryOption === 'standard'}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium">Standard Delivery</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              5-7 business days
                            </div>
                          </div>
                          <span className="font-medium">${deliveryOptions.find(opt => opt.id === 'standard')?.price}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'credit_card', name: 'Credit Card', icon: '💳' },
                      { id: 'debit_card', name: 'Debit Card', icon: '💳' },
                      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                      { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' }
                    ].map(method => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                          paymentInfo.method === method.id
                            ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentInfo.method === method.id}
                          onChange={(e) => handlePaymentChange('method', e.target.value)}
                          className="mr-3"
                        />
                        <span className="mr-2">{method.icon}</span>
                        <span>{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Card Details */}
                {(paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name on Card *</label>
                      <input
                        type="text"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full px-4 py-3 border rounded-lg ${
                          darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handlePaymentChange('expiryDate', formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength="5"
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">CVV *</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength="4"
                          className={`w-full px-4 py-3 border rounded-lg ${
                            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Payment Methods */}
                {paymentInfo.method === 'paypal' && (
                  <div className={`p-6 rounded-lg border-2 border-dashed ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🅿️</div>
                      <p className="font-medium">PayPal Payment</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        You will be redirected to PayPal to complete your payment
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <span>📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Contact Information</h3>
                    <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}>
                      <div>{isGuest ? `${guestContact.firstName} ${guestContact.lastName}` : `${shippingInfo.firstName} ${shippingInfo.lastName}`}</div>
                      <div>{isGuest ? guestContact.email : shippingInfo.email}</div>
                      {(isGuest ? guestContact.phone : shippingInfo.phone) && (
                        <div>{isGuest ? guestContact.phone : shippingInfo.phone}</div>
                      )}
                      {isGuest && <div className="text-xs text-orange-500 mt-1">Guest Order • ID: {guestId}</div>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}>
                      <div className="capitalize">{paymentInfo.method.replace('_', ' ')}</div>
                      {paymentInfo.cardNumber && (
                        <div>•••• •••• •••• {paymentInfo.cardNumber.slice(-4)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 sticky top-4`}>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>
                    {pricing.deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${pricing.deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                
                <hr className={`${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                {!isGuest && step === 1 && (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!validateShipping()}
                    className={`w-full py-3 rounded-lg font-medium ${
                      validateShipping()
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Payment
                  </button>
                )}

                {step === 2 && (
                  <>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!validatePayment() || (isGuest && !validateGuestContact())}
                      className={`w-full py-3 rounded-lg font-medium ${
                        validatePayment() && (!isGuest || validateGuestContact())
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Review Order
                    </button>
                    {!isGuest && (
                      <button
                        onClick={() => setStep(1)}
                        className={`w-full py-2 rounded-lg font-medium border ${
                          darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                      className={`w-full py-3 rounded-lg font-medium ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `${isGuest ? 'Complete Guest Order' : 'Place Order'} • $${pricing.total.toFixed(2)}`
                      )}
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className={`w-full py-2 rounded-lg font-medium border ${
                        darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Back to Payment
                    </button>
                  </>
                )}
              </div>

              {/* Security Badge */}
              <div className={`mt-6 p-3 rounded text-xs ${
                darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              } border`}>
                <div className="flex items-center">
                  <span className="mr-2">🔒</span>
                  <div>
                    <div className="font-medium text-green-600">Secure Checkout</div>
                    <div className={`${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      SSL encrypted & PCI compliant
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