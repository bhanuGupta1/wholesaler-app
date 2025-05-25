// src/pages/CreateOrder.jsx - Complete Order Creation Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { createOrderWithStockUpdate } from '../firebase/orderService';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // State management
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Products, 2: Customer Info, 3: Review & Payment

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
      })).filter(product => product.stock > 0); // Only show in-stock products
      
      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  // Add product to order
  const addProductToOrder = (product, quantity) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex > -1) {
      // Update existing product quantity
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = Math.min(
        updated[existingIndex].quantity + quantity,
        product.stock
      );
      setSelectedProducts(updated);
    } else {
      // Add new product
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

    const product = products.find(p => p.id === productId);
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

    // Calculate subtotal
    selectedProducts.forEach(product => {
      subtotal += product.price * product.quantity;
    });

    // Apply business discount (15% off)
    if (userRole === 'business') {
      discount = subtotal * 0.15;
    }

    // Apply tax for customers (10%)
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

  // Validate customer info
  const validateCustomerInfo = () => {
    const required = ['name', 'email', 'phone', 'address', 'city'];
    return required.every(field => customerInfo[field].trim() !== '');
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

    try {
      setSubmitting(true);
      setError('');

      const pricing = calculatePricing();
      
      // Prepare order data for the enhanced service
      const orderData = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: {
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode
        },
        userId: user.uid,
        userRole: userRole,
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

      // Create order using enhanced service (handles stock update automatically)
      const orderId = await createOrderWithStockUpdate(orderData);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment - update order status
      // In a real app, this would be handled by payment webhook
      await updateOrderStatus(orderId, 'processing', 'completed');

      setSubmitting(false);
      
      // Redirect to order confirmation
      navigate(`/orders/${orderId}`, { 
        state: { message: 'Order placed successfully!' }
      });

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order. Please try again.');
      setSubmitting(false);
    }
  };

  // Render loading state
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
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create New Order
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {userRole === 'business' && 'Business Account - 15% Bulk Discount Applied'}
            {userRole === 'customer' && 'Customer Account - 10% Tax Applied'}
            {userRole === 'admin' && 'Admin Account - No Additional Charges'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-indigo-600 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNum 
                    ? darkMode ? 'text-white' : 'text-gray-900'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stepNum === 1 && 'Select Products'}
                  {stepNum === 2 && 'Customer Info'}
                  {stepNum === 3 && 'Review & Pay'}
                </span>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step > stepNum 
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
          <div className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-400'} border-l-4`}>
            <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Product Selection */}
            {step === 1 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Select Products</h2>
                
                {products.length === 0 ? (
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No products available for order.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        onAddToOrder={addProductToOrder}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedProducts.length === 0}
                    className={`px-6 py-2 rounded-md font-medium ${
                      selectedProducts.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Continue to Customer Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {step === 2 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleCustomerInfoChange}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className={`px-6 py-2 border rounded-md font-medium ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Back to Products
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!validateCustomerInfo()}
                    className={`px-6 py-2 rounded-md font-medium ${
                      !validateCustomerInfo()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Payment */}
            {step === 3 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-xl font-semibold mb-6">Review & Payment</h2>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedProducts.map(product => (
                      <div key={product.id} className={`flex justify-between items-center p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ${product.price.toFixed(2)} × {product.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(product.price * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                  <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-medium">{customerInfo.name}</p>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{customerInfo.email}</p>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{customerInfo.phone}</p>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {customerInfo.address}, {customerInfo.city} {customerInfo.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className={`px-6 py-2 border rounded-md font-medium ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Back to Customer Info
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={submitting}
                    className={`px-6 py-2 rounded-md font-medium text-white ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitting ? 'Processing...' : `Place Order - $${pricing.total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 sticky top-4`}>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {selectedProducts.length === 0 ? (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  No products selected
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Selected Products */}
                  <div className="space-y-2">
                    {selectedProducts.map(product => (
                      <div key={product.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="text-sm">{product.quantity}</span>
                            <button
                              onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeProductFromOrder(product.id)}
                              className="text-red-500 text-sm ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium">
                          ${(product.price * product.quantity).toFixed(2)}
                        </p>
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
                        <div className="flex justify-between text-green-600">
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
                      
                      <div className={`flex justify-between font-semibold text-lg pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span>Total:</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToOrder, darkMode }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className={`w-16 h-16 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-md flex items-center justify-center`}>
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ${product.price.toFixed(2)} • Stock: {product.stock}
          </p>
          
          {/* Quantity and Add Button */}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className={`w-16 px-2 py-1 border rounded text-sm ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => onAddToOrder(product, quantity)}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;