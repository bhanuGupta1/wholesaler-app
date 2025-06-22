// src/pages/AddProduct.jsx - Enhanced with all necessary product fields
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import ImageUploader from '../components/common/ImageUploader';

const AddProduct = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { canManageProducts, userAccessLevel, isAdmin, isManager, isSeller } = useAccessControl();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '', // MSRP/List price (highest)
    price: '',         // Current selling price (middle)
    costPrice: '',     // Our wholesale cost (lowest)
    stock: '',
    category: '',
    imageUrl: '',      // Primary image
    imageUrls: [],     // Additional images array
    sku: '',
    supplier: '',
    tags: '',
    reorderPoint: '',
    enableBulkPricing: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState(new Set());
  const [pricingErrors, setPricingErrors] = useState({});

  // Check if user can delete products (admin, manager, or their own products)
  const canDeleteProducts = isAdmin || isManager;

  const categories = [
    'Electronics',
    'Office Supplies',
    'Furniture',
    'Home & Garden',
    'Health & Beauty',
    'Automotive',
    'Sports & Recreation',
    'Books & Media',
    'Clothing & Accessories',
    'Tools & Hardware',
    'Kitchen',
    'Other'
  ];

  const commonSuppliers = [
    'Apple Inc.',
    'Samsung Electronics',
    'Sony Corporation',
    'Microsoft Corporation',
    'Nike Inc.',
    'Canon Inc.',
    'Herman Miller',
    'Dyson Ltd.',
    'KitchenAid',
    'Tesla Inc.',
    'Bose Corporation',
    'Patagonia Inc.',
    'Custom Supplier'
  ];

  // Fetch recent products based on user role with ownership filtering
  useEffect(() => {
    if (canManageProducts) {
      fetchRecentProducts();
    }
  }, [canManageProducts, user]);

  // Auto-calculate reorder point when stock changes
  useEffect(() => {
    if (formData.stock && !formData.reorderPoint) {
      const autoReorderPoint = Math.max(5, Math.floor(parseInt(formData.stock) * 0.1));
      setFormData(prev => ({
        ...prev,
        reorderPoint: autoReorderPoint.toString()
      }));
    }
  }, [formData.stock]);

  // Validate pricing structure
  useEffect(() => {
    validatePricing();
  }, [formData.costPrice, formData.price, formData.originalPrice]);

  const validatePricing = () => {
    const errors = {};
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.price) || 0;
    const original = parseFloat(formData.originalPrice) || 0;

    if (cost && selling && cost >= selling) {
      errors.costPrice = 'Cost price must be less than selling price';
    }
    if (selling && original && selling > original) {
      errors.price = 'Selling price cannot be higher than original price';
    }
    if (cost && original && cost >= original) {
      errors.originalPrice = 'Original price must be higher than cost price';
    }

    setPricingErrors(errors);
  };

  // Calculate profit margins
  const calculateMargins = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.price) || 0;
    const original = parseFloat(formData.originalPrice) || 0;

    const profitMargin = cost && selling ? (((selling - cost) / selling) * 100).toFixed(1) : 0;
    const markup = cost && selling ? (((selling - cost) / cost) * 100).toFixed(1) : 0;
    const discountPercent = original && selling ? (((original - selling) / original) * 100).toFixed(1) : 0;

    return { profitMargin, markup, discountPercent };
  };

  const fetchRecentProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsRef = collection(db, 'products');
      let q;
      
      if (isAdmin || isManager) {
        q = query(productsRef, orderBy('createdAt', 'desc'), limit(5));
      } else if (isSeller && user?.uid) {
        q = query(
          productsRef, 
          where('createdBy', '==', user.uid),
          limit(5)
        );
      } else {
        q = query(
          productsRef, 
          where('createdBy', '==', user?.uid || 'none'),
          limit(5)
        );
      }
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Product',
          description: data.description || '',
          price: data.price || 0,
          originalPrice: data.originalPrice || data.price || 0,
          costPrice: data.costPrice || 0,
          stock: data.stock || data.stockQuantity || 0,
          category: data.category || 'Uncategorized',
          imageUrl: data.imageUrl || '',
          sku: data.sku || '',
          supplier: data.supplier || '',
          createdBy: data.createdBy || 'unknown',
          ownedBy: data.ownedBy || data.createdBy || 'unknown',
          createdByEmail: data.createdByEmail || 'unknown',
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      if (!isAdmin && !isManager) {
        products.sort((a, b) => b.createdAt - a.createdAt);
      }
      
      setRecentProducts(products);
    } catch (err) {
      console.error('Error fetching recent products:', err);
      if (err.code === 'failed-precondition' || err.message.includes('index')) {
        if ((isSeller || !isAdmin) && user?.uid) {
          try {
            const simpleQuery = query(productsRef, where('createdBy', '==', user.uid), limit(5));
            const snapshot = await getDocs(simpleQuery);
            const products = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || 'Unnamed Product',
                price: data.price || 0,
                originalPrice: data.originalPrice || data.price || 0,
                stock: data.stock || data.stockQuantity || 0,
                category: data.category || 'Uncategorized',
                createdAt: data.createdAt?.toDate() || new Date()
              };
            });
            products.sort((a, b) => b.createdAt - a.createdAt);
            setRecentProducts(products);
          } catch (simpleErr) {
            console.error('Simple query also failed:', simpleErr);
          }
        }
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!canDeleteProducts) {
      const product = recentProducts.find(p => p.id === productId);
      if (!product || (product.createdBy !== user?.uid && product.ownedBy !== user?.uid)) {
        setError('You can only delete products you created');
        return;
      }
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingProducts(prev => new Set(prev).add(productId));

    try {
      await deleteDoc(doc(db, 'products', productId));
      setRecentProducts(prev => prev.filter(product => product.id !== productId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Access control check
  if (!canManageProducts) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <div className={`max-w-md mx-auto text-center p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          <div className="text-6xl mb-4">🚫</div>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Access Denied
          </h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You need seller, manager, or admin permissions to add products.
          </p>
          <div className={`p-3 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Current access level: <span className="font-medium">{userAccessLevel}</span>
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/catalog')}
              className="block w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate(-1)}
              className={`block w-full py-2 px-4 border rounded-lg transition-colors ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid selling price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) return 'Valid stock quantity is required';
    if (!formData.category) return 'Category is required';
    
    // Pricing validation
    if (Object.keys(pricingErrors).length > 0) {
      return 'Please fix pricing errors before submitting';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const basePrice = parseFloat(formData.price);
      const stockQuantity = parseInt(formData.stock);
      const originalPrice = parseFloat(formData.originalPrice) || basePrice;
      const costPrice = parseFloat(formData.costPrice) || 0;
      const reorderPoint = parseInt(formData.reorderPoint) || Math.max(5, Math.floor(stockQuantity * 0.1));

      // Process tags
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag)
        : [formData.category.toLowerCase(), formData.name.toLowerCase().split(' ')[0]];

      // Process image URLs - filter out empty strings
      const additionalImages = formData.imageUrls.filter(url => url.trim());
      const allImages = formData.imageUrl ? [formData.imageUrl, ...additionalImages] : additionalImages;

      const productData = {
        // Basic product info
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        price: basePrice,
        originalPrice: originalPrice,
        costPrice: costPrice,
        stock: stockQuantity,
        stockQuantity: stockQuantity,
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || '', // Primary image
        imageUrls: additionalImages, // Additional images array
        allImages: allImages, // All images combined for easy access
        sku: formData.sku.trim() || '',
        supplier: formData.supplier.trim() || '',
        tags: tags,
        reorderPoint: reorderPoint,
        
        // Ownership tracking fields
        createdBy: user.uid,
        ownedBy: user.uid,
        createdByEmail: user.email,
        businessId: user.uid,
        businessName: user.businessName || user.displayName || '',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Status and approval
        isApproved: true,
        status: 'active',
        
        // Bulk pricing (only if enabled)
        bulkPricing: formData.enableBulkPricing ? {
          '10': +(basePrice * 0.9).toFixed(2),
          '50': +(basePrice * 0.85).toFixed(2),
          '100': +(basePrice * 0.8).toFixed(2)
        } : {}
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      console.log('Product added with ID:', docRef.id);
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        originalPrice: '',
        price: '',
        costPrice: '',
        stock: '',
        category: '',
        imageUrl: '',
        imageUrls: [],
        sku: '',
        supplier: '',
        tags: '',
        reorderPoint: '',
        enableBulkPricing: true
      });

      setTimeout(() => {
        navigate('/inventory');
      }, 2000);

      fetchRecentProducts();

    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  const { profitMargin, markup, discountPercent } = calculateMargins();

  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Add New Product
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Create a comprehensive product listing with pricing, inventory, and business details
        </p>
        <div className="mt-2 flex items-center space-x-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
          }`}>
            ✅ {userAccessLevel} Access
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
          }`}>
            👤 Owner: {user?.displayName || user?.email || 'You'}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-800'} border`}>
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Product added successfully! Redirecting to inventory...
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-800'} border`}>
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Form */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border`}>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Basic Information Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="sku" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="e.g., APL-IP16-256"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💰 Pricing & Margins
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Price */}
              <div>
                <label htmlFor="costPrice" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Cost Price ($)
                  <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (Your wholesale cost)
                  </span>
                </label>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    pricingErrors.costPrice 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="0.00"
                />
                {pricingErrors.costPrice && (
                  <p className="text-red-500 text-xs mt-1">{pricingErrors.costPrice}</p>
                )}
              </div>

              {/* Selling Price */}
              <div>
                <label htmlFor="price" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Selling Price ($) *
                  <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (Current price)
                  </span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    pricingErrors.price 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="0.00"
                  required
                />
                {pricingErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{pricingErrors.price}</p>
                )}
              </div>

              {/* Original Price */}
              <div>
                <label htmlFor="originalPrice" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Original Price ($)
                  <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (MSRP/List price)
                  </span>
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    pricingErrors.originalPrice 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="0.00"
                />
                {pricingErrors.originalPrice && (
                  <p className="text-red-500 text-xs mt-1">{pricingErrors.originalPrice}</p>
                )}
              </div>
            </div>

            {/* Pricing Analytics */}
            {(formData.price || formData.costPrice || formData.originalPrice) && (
              <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 Pricing Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {profitMargin > 0 && (
                    <div className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      📈 Profit Margin: {profitMargin}%
                    </div>
                  )}
                  {markup > 0 && (
                    <div className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      🔢 Markup: {markup}%
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      🏷️ Discount: {discountPercent}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📦 Inventory Management
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Quantity */}
              <div>
                <label htmlFor="stock" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="0"
                  required
                />
              </div>

              {/* Reorder Point */}
              <div>
                <label htmlFor="reorderPoint" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Reorder Point
                  <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (When to restock)
                  </span>
                </label>
                <input
                  type="number"
                  id="reorderPoint"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Auto-calculated"
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Auto-calculated as 10% of stock (minimum 5 units)
                </p>
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🏢 Business Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Supplier */}
              <div>
                <label htmlFor="supplier" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Supplier
                </label>
                <select
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="">Select supplier</option>
                  {commonSuppliers.map(supplier => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
                {formData.supplier === 'Custom Supplier' && (
                  <input
                    type="text"
                    placeholder="Enter custom supplier name"
                    className={`w-full mt-2 px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  />
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Tags
                  <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="e.g., premium, wireless, portable"
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Auto-generated from category and product name if left empty
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🖼️ Product Image
            </h3>
            
            {/* Image URL Input */}
            <div className="mb-4">
              <label htmlFor="imageUrl" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Image URL
                <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  (Direct link to product image)
                </span>
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="https://example.com/product-image.jpg"
              />
              
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Image Preview:
                  </p>
                  <div className={`w-32 h-32 rounded-lg border-2 border-dashed ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  } flex items-center justify-center overflow-hidden`}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Product preview" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `
                          <div class="text-center p-4">
                            <span class="text-red-500 text-sm">❌ Invalid image URL</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className={`flex-1 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
              <span className={`px-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>OR</span>
              <div className={`flex-1 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>

            {/* File Upload */}
            <div>
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload Image File
                <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  (Upload from your device)
                </span>
              </p>
              <ImageUploader
                initialImage={formData.imageUrl}
                onImageUploaded={(url) =>
                  setFormData(prev => ({ ...prev, imageUrl: url }))
                }
                folder="product-images"
                customId={user?.uid}
                darkMode={darkMode}
                autoUpload={true}
              />
            </div>

            {/* Common Image URLs for Testing/Demo */}
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🔗 Quick Image URLs (for testing):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop' }))}
                  className={`text-left p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'} transition-colors`}
                >
                  📱 Generic Phone
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' }))}
                  className={`text-left p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'} transition-colors`}
                >
                  👟 Sneakers
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop' }))}
                  className={`text-left p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'} transition-colors`}
                >
                  💻 Laptop
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop' }))}
                  className={`text-left p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'} transition-colors`}
                >
                  ⌚ Watch
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Pricing Option */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🎯 Bulk Pricing
            </h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enableBulkPricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableBulkPricing: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enable automatic bulk pricing discounts
                </span>
              </label>
              
              {formData.enableBulkPricing && formData.price && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bulk Pricing Tiers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      📦 10+ units: ${(parseFloat(formData.price) * 0.9).toFixed(2)} (10% off)
                    </div>
                    <div className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      📦 50+ units: ${(parseFloat(formData.price) * 0.85).toFixed(2)} (15% off)
                    </div>
                    <div className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      📦 100+ units: ${(parseFloat(formData.price) * 0.8).toFixed(2)} (20% off)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-2 border rounded-md font-medium ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(pricingErrors).length > 0}
              className={`px-8 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center`}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Ownership Information */}
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
        <div className="flex items-start">
          <svg className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>
              Ownership & Business Features
            </h3>
            <ul className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1`}>
              <li>• Products automatically owned by you with full management rights</li>
              <li>• Pricing structure tracks cost, selling, and original prices for margin analysis</li>
              <li>• Bulk pricing tiers automatically calculated when enabled</li>
              <li>• Inventory reorder points help manage stock levels</li>
              <li>• Supplier and tag information for better organization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recently Added Products Section */}
      {canManageProducts && (
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isSeller ? 'My Recent Products' : 'Recently Added Products'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isAdmin || isManager 
                  ? 'All recent products (Admin/Manager View)' 
                  : isSeller
                  ? 'Your recent product listings'
                  : 'Your recent products'
                }
              </p>
            </div>
            {recentProducts.length > 0 && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                canDeleteProducts
                  ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                  : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
              }`}>
                {canDeleteProducts ? '🗑️ Delete Access' : '👁️ View Only'}
              </div>
            )}
          </div>

          <div className="p-6">
            {loadingProducts ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <span className={`ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading recent products...</span>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className={`text-4xl mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>📦</div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  {isSeller ? 'No products created yet' : 'No recent products to display'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {isSeller ? 'Add your first product above to start selling' : 'Products you create will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center overflow-hidden`}>
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              ${product.price?.toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className={`text-xs line-through ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                ${product.originalPrice?.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Stock: {product.stock}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {product.category}
                          </span>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          Added {product.createdAt.toLocaleDateString()}
                          {(isAdmin || isManager) && product.createdBy !== user.uid && (
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                            }`}>
                              by {product.createdByEmail || 'other user'}
                            </span>
                          )}
                          {product.createdBy === user.uid && (
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                            }`}>
                              by you
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          darkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'
                        } transition-colors`}
                      >
                        View
                      </button>
                      
                      {(canDeleteProducts || product.createdBy === user?.uid) && (
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          disabled={deletingProducts.has(product.id)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            deletingProducts.has(product.id)
                              ? 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                              : darkMode 
                                ? 'text-red-400 hover:bg-red-900/20 border border-red-800'
                                : 'text-red-600 hover:bg-red-50 border border-red-200'
                          }`}
                        >
                          {deletingProducts.has(product.id) ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white mr-1"></div>
                              Deleting...
                            </div>
                          ) : (
                            '🗑️ Delete'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;