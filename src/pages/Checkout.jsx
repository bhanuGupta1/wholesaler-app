// src/pages/Checkout.jsx - Complete checkout process like Costco
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { createOrderWithStockUpdate } from '../firebase/orderService';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    isDefault: false
  });

  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'credit_card', // credit_card, debit_card, paypal, apple_pay, google_pay
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddressSame: true,
    billingAddress: {
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Delivery Options
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      price: 15.99,
      freeThreshold: 100
    },
    {
      id: 'expedited',
      name: 'Expedited Delivery',
      description: '2-3 business days',
      price: 29.99,
      freeThreshold: 200
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day',
      price: 49.99,
      freeThreshold: 500
    },
    {
      id: 'pickup',
      name: 'Store Pickup',
      description: 'Ready in 2-4 hours',
      price: 0,
      freeThreshold: 0
    }
  ];

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedDelivery = deliveryOptions.find(opt => opt.id === deliveryOption);
    const deliveryFee = subtotal >= selectedDelivery.freeThreshold ? 0 : selectedDelivery.price;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    return { subtotal, deliveryFee, tax, total };
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => shippingInfo[field].trim() !== '');
  };

  const validatePayment = () => {
    if (paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') {
      return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.nameOnCard;
    }
    return true; // For other payment methods
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

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const pricing = calculateTotal();
      
      const orderData = {
        // Customer info
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone,
        
        // Addresses
        shippingAddress: shippingInfo,
        billingAddress: paymentInfo.billingAddressSame ? shippingInfo : paymentInfo.billingAddress,
        
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
        userId: user?.uid || null,
        
        // Metadata
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
      };

      const orderId = await createOrderWithStockUpdate(orderData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
      
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
          <h1 className="text-3xl font-bold mb-4">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepInfo.num 
                    ? 'bg-indigo-600 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step > stepInfo.num ? '✓' : stepInfo.num}
                </div>
                <span className="ml-2 font-medium">{stepInfo.label}</span>
                {index < 2 && (
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
            {/* Step 1: Shipping Information */}
            {step === 1 && (
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

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

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

                {/* Billing Address */}
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={paymentInfo.billingAddressSame}
                      onChange={(e) => handlePaymentChange('billingAddressSame', e.target.checked)}
                      className="mr-3"
                    />
                    <label className="text-sm font-medium">
                      Billing address is same as shipping address
                    </label>
                  </div>
                </div>
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

                {/* Shipping & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}>
                      <div>{shippingInfo.firstName} {shippingInfo.lastName}</div>
                      <div>{shippingInfo.address}</div>
                      {shippingInfo.apartment && <div>{shippingInfo.apartment}</div>}
                      <div>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</div>
                      <div>{shippingInfo.phone}</div>
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
                {step === 1 && (
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
                      disabled={!validatePayment()}
                      className={`w-full py-3 rounded-lg font-medium ${
                        validatePayment()
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Review Order
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className={`w-full py-2 rounded-lg font-medium border ${
                        darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Back to Shipping
                    </button>
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
                        `Place Order • $${pricing.total.toFixed(2)}`
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