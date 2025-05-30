// src/pages/AddProduct.jsx - Enhanced add product page with clean access control and delete functionality
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
  const { canManageProducts, userAccessLevel, isAdmin, isManager } = useAccessControl();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState(new Set());

  // Check if user can delete products (only admin and manager)
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
    'Other'
  ];

  // Fetch recent products on component mount (for all users who can manage products)
  useEffect(() => {
    if (canManageProducts) {
      fetchRecentProducts();
    }
  }, [canManageProducts]);

  const fetchRecentProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsRef = collection(db, 'products');
      let q;
      
      if (isAdmin || isManager) {
        // Admin and Manager can see all recent products
        q = query(productsRef, orderBy('createdAt', 'desc'), limit(5));
      } else {
        // Sellers can only see products they created
        q = query(
          productsRef, 
          where('createdBy', '==', user.uid),
          orderBy('createdAt', 'desc'), 
          limit(5)
        );
      }
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      setRecentProducts(products);
    } catch (err) {
      console.error('Error fetching recent products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!canDeleteProducts) {
      setError('You do not have permission to delete products');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingProducts(prev => new Set(prev).add(productId));

    try {
      await deleteDoc(doc(db, 'products', productId));
      
      // Remove from local state
      setRecentProducts(prev => prev.filter(product => product.id !== productId));
      
      // Show success message
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

  // Clean access control check
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
    
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock) < 0) return 'Valid stock quantity is required';
    if (!formData.category) return 'Category is required';
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
      // Prepare product data with bulk pricing
      const basePrice = parseFloat(formData.price);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        price: basePrice,
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl.trim() || '',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email,
        businessId: user.uid,
        businessName: user.businessName || '',
        isApproved: ['admin', 'manager'].includes(user.accountType), // seller requires approval if needed
        status: 'active',
        bulkPricing: {
          '10': +(basePrice * 0.9).toFixed(2),
          '50': +(basePrice * 0.85).toFixed(2),
          '100': +(basePrice * 0.8).toFixed(2)
        }
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      console.log('Product added with ID:', docRef.id);
      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
      });

      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);

      // Refresh recent products list for all users who can manage products
      if (canManageProducts) {
        fetchRecentProducts();
      }

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

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Add New Product
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add a new product to your inventory
        </p>
        {/* Show user access level */}
        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
        }`}>
          ✅ {userAccessLevel} Access
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
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

          {/* Description */}
          <div>
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
              placeholder="Enter product description (optional)"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Price ($) *
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
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="0.00"
                required
              />
            </div>
            
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

          {/* Image Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Product Image
            </label>
            <ImageUploader
              existingUrl={formData.imageUrl}
              onUploadSuccess={(url) =>
                setFormData(prev => ({ ...prev, imageUrl: url }))
              }
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-4 py-2 border rounded-md font-medium ${
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
              disabled={loading}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center`}
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

      {/* Additional Info */}
      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
        <div className="flex items-start">
          <svg className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5 mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>
              Adding Products with Bulk Pricing
            </h3>
            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              Products you add will include automatic bulk pricing tiers (10+ units: 10% off, 50+ units: 15% off, 100+ units: 20% off) and will be immediately available in the inventory for orders.
            </p>
          </div>
        </div>
      </div>

      {/* Recently Added Products Section - For all users who can manage products */}
      {canManageProducts && (
        <div className={`mt-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recently Added Products
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isAdmin || isManager ? 'All recent products (Admin/Manager View)' : 'Your recent products (Seller View)'}
              </p>
            </div>
            {recentProducts.length > 0 && canDeleteProducts && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
              }`}>
                🗑️ Delete Access
              </div>
            )}
            {recentProducts.length > 0 && !canDeleteProducts && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
              }`}>
                👁️ View Only
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
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No recent products to display
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
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ${product.price?.toFixed(2)} • Stock: {product.stock}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {product.category}
                          </span>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          Added {product.createdAt.toLocaleDateString()} at {product.createdAt.toLocaleTimeString()}
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
                      
                      {/* Only show delete button for admin and manager */}
                      {canDeleteProducts && (
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

            {/* Permission Notice */}
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
              <div className="flex items-start">
                <svg className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-0.5 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-1`}>
                    🔐 Access Level Notice
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                    {canDeleteProducts ? (
                      <>
                        <strong>Admin/Manager Access:</strong> You can view all products and delete any product. Deleted products cannot be recovered.
                      </>
                    ) : (
                      <>
                        <strong>Seller Access:</strong> You can only view products you created. Only Administrators and Managers can delete products.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;