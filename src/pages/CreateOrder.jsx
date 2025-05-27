// src/pages/CreateOrder.jsx - Enhanced with Cart Integration
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { createOrderWithStockUpdate } from '../firebase/orderService';

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { cart, clearCart } = useCart();
  
  // State management using different stats
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });

  // Enhanced payment information state
  const [paymentInfo, setPaymentInfo] = useState({
    paymentMethod: 'credit_card', // 'credit_card' or 'bank_account'
    // Credit Card Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    // Bank Account Details
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    bankName: '',
    accountType: 'checking', // 'checking' or 'savings'
    // Billing Address
    billingAddressSame: true,
    billingAddress: '',
    billingCity: '',
    billingZipCode: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSource, setOrderSource] = useState('direct'); // 'direct' or 'cart'

  // Check if coming from cart
  useEffect(() => {
    if (location.state?.fromCart && cart.length > 0) {
      setOrderSource('cart');
      // Convert cart items to selected products format
      const cartProducts = cart.map(item => ({
        ...item,
        quantity: item.quantity
      }));
      setSelectedProducts(cartProducts);
      setStep(2); // Skip product selection since we have cart items
    }
  }, [location.state, cart]);

  // User role detection
  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.email?.includes('admin')) return 'admin';
    if (user.email?.includes('business')) return 'business';
    return 'customer';
  };

  const userRole = getUserRole();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(product => product.stock > 0);
      
      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to order
  const addProductToOrder = (product, quantity) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = Math.min(
        updated[existingIndex].quantity + quantity,
        product.stock
      );
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, {
        ...product,
        quantity: Math.min(quantity, product.stock)
      }]);
    }
  };

  // Remove product from order
  const removeProductFromOrder = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // Update product quantity in order
  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    const product = products.find(p => p.id === productId) || selectedProducts.find(p => p.id === productId);
    const updated = selectedProducts.map(p => 
      p.id === productId 
        ? { ...p, quantity: Math.min(newQuantity, product.stock) }
        : p
    );
    setSelectedProducts(updated);
  };

  // Calculate pricing based on user role
  const calculatePricing = () => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    selectedProducts.forEach(product => {
      subtotal += product.price * product.quantity;
    });

    if (userRole === 'business') {
      discount = subtotal * 0.15;
    }

    if (userRole === 'customer') {
      tax = (subtotal - discount) * 0.10;
    }

    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  // Handle customer info changes
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle payment info changes
  const handlePaymentInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Format card number (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Validate customer info
  const validateCustomerInfo = () => {
    const required = ['name', 'email', 'phone', 'address', 'city'];
    return required.every(field => customerInfo[field].trim() !== '');
  };

  // Validate payment info
  const validatePaymentInfo = () => {
    if (paymentInfo.paymentMethod === 'credit_card') {
      return paymentInfo.cardNumber.replace(/\s/g, '').length >= 13 &&
             paymentInfo.expiryDate.length === 5 &&
             paymentInfo.cvv.length >= 3 &&
             paymentInfo.cardHolderName.trim() !== '';
    } else {
      return paymentInfo.accountNumber.trim() !== '' &&
             paymentInfo.routingNumber.trim() !== '' &&
             paymentInfo.accountHolderName.trim() !== '' &&
             paymentInfo.bankName.trim() !== '';
    }
  };

  // Import from cart
  const importFromCart = () => {
    if (cart.length > 0) {
      const cartProducts = cart.map(item => ({
        ...item,
        quantity: item.quantity
      }));
      setSelectedProducts(cartProducts);
      setOrderSource('cart');
      setStep(2); // Skip to customer info since products are selected
    }
  };

  // Clear selection and go back to direct mode
  const clearSelection = () => {
    setSelectedProducts([]);
    setOrderSource('direct');
    setStep(1);
  };

  // Submit order
  const submitOrder = async () => {
    if (!user) {
      setError('Please sign in to place an order');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    if (!validateCustomerInfo()) {
      setError('Please fill in all required customer information');
      return;
    }

    if (!validatePaymentInfo()) {
      setError('Please fill in all required payment information');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const pricing = calculatePricing();
      
      // Prepare billing address
      const billingAddress = paymentInfo.billingAddressSame ? {
        address: customerInfo.address,
        city: customerInfo.city,
        zipCode: customerInfo.zipCode
      } : {
        address: paymentInfo.billingAddress,
        city: paymentInfo.billingCity,
        zipCode: paymentInfo.billingZipCode
      };

      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: {
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode
        },
        billingAddress,
        paymentInfo: {
          paymentMethod: paymentInfo.paymentMethod,
          // Note: In production, never store raw payment details!
          // This is for demo purposes only. Use payment processors like Stripe.
          ...(paymentInfo.paymentMethod === 'credit_card' ? {
            cardLastFour: paymentInfo.cardNumber.slice(-4),
            cardHolderName: paymentInfo.cardHolderName,
            expiryDate: paymentInfo.expiryDate
          } : {
            accountLastFour: paymentInfo.accountNumber.slice(-4),
            accountHolderName: paymentInfo.accountHolderName,
            bankName: paymentInfo.bankName,
            accountType: paymentInfo.accountType
          })
        },
        userId: user.uid,
        userRole: userRole,
        orderSource: orderSource, // Track how the order was created
        items: selectedProducts.map(product => ({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: product.quantity,
          subtotal: product.price * product.quantity
        })),
        itemCount: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        tax: pricing.tax,
        total: pricing.total,
        status: 'pending',
        paymentStatus: 'pending'
      };

      const orderId = await createOrderWithStockUpdate(orderData);
      
      // Clear cart if order was created from cart
      if (orderSource === 'cart') {
        clearCart();
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitting(false);
      navigate(`/orders/${orderId}`, { 
        state: { message: 'Order placed successfully!' }
      });

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  const pricing = calculatePricing();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Order
            </h1>
            
            {/* Order Source Indicator */}
            <div className="flex items-center space-x-4">
              {cart.length > 0 && orderSource === 'direct' && (
                <button
                  onClick={importFromCart}
                  className={`px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors ${darkMode ? 'border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-gray-900' : ''}`}
                >
                  Import from Cart ({cart.length} items)
                </button>
              )}
              
              {orderSource === 'cart' && (
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                    🛒 From Cart
                  </span>
                  <button
                    onClick={clearSelection}
                    className={`px-3 py-1 text-sm border rounded ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Start Fresh
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center mt-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userRole === 'business' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : userRole === 'customer'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {userRole === 'business' && '🏢 Business Account - 15% Bulk Discount'}
              {userRole === 'customer' && '👤 Customer Account - 10% Tax Applied'}
              {userRole === 'admin' && '⚙️ Admin Account - No Additional Charges'}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'Select Products', icon: '🛍️' },
              { num: 2, label: 'Customer & Payment Info', icon: '📋' },
              { num: 3, label: 'Review & Pay', icon: '💳' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className={`flex items-center px-4 py-2 rounded-lg ${
                  step >= stepInfo.num 
                    ? 'bg-indigo-600 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  <span className="mr-2">{stepInfo.icon}</span>
                  <span className="font-medium">{stepInfo.label}</span>
                  {stepInfo.num === 1 && orderSource === 'cart' && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                      From Cart
                    </span>
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepInfo.num 
                      ? 'bg-indigo-600' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${darkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-400 text-red-700'}`}>
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Step 1: Product Selection */}
            {step === 1 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                {/* Cart Import Notice */}
                {cart.length > 0 && orderSource === 'direct' && (
                  <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          Items in Cart
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          You have {cart.length} item(s) in your cart. Import them to create an order quickly.
                        </p>
                      </div>
                      <button
                        onClick={importFromCart}
                        className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        Import Cart
                      </button>
                    </div>
                  </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">
                  Available Products ({filteredProducts.length})
                </h2>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchTerm ? 'No products found matching your search.' : 'No products available for order.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map(product => (
                      <CompactProductCard 
                        key={product.id}
                        product={product}
                        onAddToOrder={addProductToOrder}
                        darkMode={darkMode}
                        isSelected={selectedProducts.find(p => p.id === product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Customer Information & Payment Details */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="mr-2">📋</span>
                    Customer Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={customerInfo.zipCode}
                        onChange={handleCustomerInfoChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="mr-2">💳</span>
                    Payment Information
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                        paymentInfo.paymentMethod === 'credit_card'
                          ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                          : darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={paymentInfo.paymentMethod === 'credit_card'}
                          onChange={handlePaymentInfoChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">💳 Credit Card</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Visa, MasterCard, etc.
                          </div>
                        </div>
                      </label>

                      <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                        paymentInfo.paymentMethod === 'bank_account'
                          ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                          : darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_account"
                          checked={paymentInfo.paymentMethod === 'bank_account'}
                          onChange={handlePaymentInfoChange}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">🏦 Bank Account</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Direct bank transfer
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Credit Card Fields */}
                  {paymentInfo.paymentMethod === 'credit_card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Card Holder Name *
                        </label>
                        <input
                          type="text"
                          name="cardHolderName"
                          value={paymentInfo.cardHolderName}
                          onChange={handlePaymentInfoChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setPaymentInfo(prev => ({ ...prev, cardNumber: formatted }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setPaymentInfo(prev => ({ ...prev, expiryDate: formatted }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          CVV *
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPaymentInfo(prev => ({ ...prev, cvv: value }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Account Fields */}
                  {paymentInfo.paymentMethod === 'bank_account' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Account Holder Name *
                        </label>
                        <input
                          type="text"
                          name="accountHolderName"
                          value={paymentInfo.accountHolderName}
                          onChange={handlePaymentInfoChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={paymentInfo.bankName}
                          onChange={handlePaymentInfoChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="Chase Bank"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Account Type *
                        </label>
                        <select
                          name="accountType"
                          value={paymentInfo.accountType}
                          onChange={handlePaymentInfoChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          required
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Account Number *
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={paymentInfo.accountNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPaymentInfo(prev => ({ ...prev, accountNumber: value }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="123456789"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Routing Number *
                        </label>
                        <input
                          type="text"
                          name="routingNumber"
                          value={paymentInfo.routingNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setPaymentInfo(prev => ({ ...prev, routingNumber: value }));
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="021000021"
                          maxLength="9"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  <div className="mt-8">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        name="billingAddressSame"
                        checked={paymentInfo.billingAddressSame}
                        onChange={handlePaymentInfoChange}
                        className="mr-3"
                      />
                      <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Billing address is the same as shipping address
                      </label>
                    </div>

                    {!paymentInfo.billingAddressSame && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Billing Address *
                          </label>
                          <input
                            type="text"
                            name="billingAddress"
                            value={paymentInfo.billingAddress}
                            onChange={handlePaymentInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            required={!paymentInfo.billingAddressSame}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            City *
                          </label>
                          <input
                            type="text"
                            name="billingCity"
                            value={paymentInfo.billingCity}
                            onChange={handlePaymentInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            required={!paymentInfo.billingAddressSame}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Zip Code *
                          </label>
                          <input
                            type="text"
                            name="billingZipCode"
                            value={paymentInfo.billingZipCode}
                            onChange={handlePaymentInfoChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            required={!paymentInfo.billingAddressSame}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Payment */}
            {step === 3 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="mr-2">✅</span>
                  Review & Confirm Order
                </h2>
                
                {/* Order Source Badge */}
                {orderSource === 'cart' && (
                  <div className="mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                      🛒 Order created from cart items
                    </span>
                  </div>
                )}
                
                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedProducts.map(product => (
                      <div key={product.id} className={`flex justify-between items-center p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ${product.price.toFixed(2)} × {product.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-lg">
                          ${(product.price * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{customerInfo.name}</p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{customerInfo.email}</p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{customerInfo.phone}</p>
                      </div>
                      <div>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {customerInfo.address}
                        </p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {customerInfo.city} {customerInfo.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {paymentInfo.paymentMethod === 'credit_card' ? (
                      <div>
                        <p className="font-medium">💳 Credit Card</p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          •••• •••• •••• {paymentInfo.cardNumber.slice(-4)}
                        </p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {paymentInfo.cardHolderName}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">🏦 Bank Account</p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {paymentInfo.bankName} - •••••{paymentInfo.accountNumber.slice(-4)}
                        </p>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {paymentInfo.accountHolderName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-4`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🛒</span>
                Order Summary
                {orderSource === 'cart' && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Cart
                  </span>
                )}
              </h3>
              
              {selectedProducts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🛍️</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No products selected
                  </p>
                  {cart.length > 0 && orderSource === 'direct' && (
                    <button
                      onClick={importFromCart}
                      className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Import {cart.length} items from cart
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Products */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedProducts.map(product => (
                      <div key={product.id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium truncate pr-2">{product.name}</p>
                          <button
                            onClick={() => removeProductFromOrder(product.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                              className={`w-6 h-6 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center text-sm`}
                            >
                              −
                            </button>
                            <span className="text-sm font-medium">{product.quantity}</span>
                            <button
                              onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                              className={`w-6 h-6 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center text-sm`}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold">
                            ${(product.price * product.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className={`pt-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Business Discount (15%):</span>
                          <span>-${pricing.discount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      {pricing.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span>${pricing.tax.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className={`flex justify-between font-bold text-lg pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span>Total:</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-6 space-y-3">
                {step === 1 && (
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedProducts.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      selectedProducts.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Continue to Customer Info
                    <span className="ml-2">→</span>
                  </button>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setStep(3)}
                      disabled={!validateCustomerInfo() || !validatePaymentInfo()}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        !validateCustomerInfo() || !validatePaymentInfo()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Review Order
                      <span className="ml-2">→</span>
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className={`w-full py-2 px-4 rounded-lg font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      ← Back to Products
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <button
                      onClick={submitOrder}
                      disabled={submitting}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        submitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          Place Order • ${pricing.total.toFixed(2)}
                          <span className="ml-2">✓</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className={`w-full py-2 px-4 rounded-lg font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      ← Back to Customer Info
                    </button>
                  </div>
                )}

                {/* Add link back to cart if items were imported */}
                {orderSource === 'cart' && step === 1 && (
                  <button
                    onClick={() => navigate('/cart')}
                    className={`w-full py-2 px-4 rounded-lg font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    ← Back to Cart
                  </button>
                )}
              </div>

              {/* Security Notice */}
              <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border text-xs`}>
                <div className="flex items-start">
                  <span className="mr-2">🔒</span>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      Secure Payment
                    </p>
                    <p className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} mt-1`}>
                      Your payment information is encrypted and secure.
                    </p>
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

// Compact Product Card Component
const CompactProductCard = ({ product, onAddToOrder, darkMode, isSelected }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${
      isSelected 
        ? darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
        : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        {/* Product Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <span className="text-xl">📦</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{product.name}</h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                ${product.price.toFixed(2)}
              </span>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Stock: {product.stock}
              </span>
              {product.category && (
                <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quantity and Add Button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <label className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className={`w-16 px-2 py-1 border rounded text-sm text-center ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <button
            onClick={() => onAddToOrder(product, quantity)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isSelected ? 'Add More' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;