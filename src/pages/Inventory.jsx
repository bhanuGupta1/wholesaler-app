// src/pages/Inventory.jsx - FIXED: Proper seller product filtering and error handling
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import ProductModal from '../components/inventory/ProductModal';
import LowStockAlert from '../components/inventory/LowStockAlert';

const Inventory = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    canAccessInventory, 
    canViewAllProducts, 
    canManageProducts, 
    isSeller, 
    isBuyer,
    isAdmin,
    isManager,
    userAccessLevel 
  } = useAccessControl();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalValue: 0,
    averagePrice: 0
  });
  const [notification, setNotification] = useState(null);

  // Block business buyers immediately
  useEffect(() => {
    if (user && user.accountType === 'business' && user.businessType === 'buyer') {
      navigate('/business-dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Determine user access level
  const shouldShowAllProducts = user && (isAdmin || isManager);
  const shouldShowSellerProducts = user && isSeller;

  // Fetch products based on user role with proper error handling
  const fetchProducts = async () => {
    if (!user) {
      setError('Please log in to view inventory');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productsRef = collection(db, 'products');
      let productsQuery;

      if (shouldShowAllProducts) {
        // Admin/Manager: See all products
        console.log('👑 Admin/Manager: Fetching all products');
        productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
      } else if (shouldShowSellerProducts) {
        // Business Seller: See only their own products (no orderBy to avoid index issues)
        console.log('🏪 Seller: Fetching products for user:', user.uid);
        productsQuery = query(
          productsRef, 
          where('createdBy', '==', user.uid)
        );
      } else {
        // Regular users - can see all products but can't manage them
        console.log('👤 Regular user: Fetching all products (view-only)');
        productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(productsQuery);
      const fetchedProducts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          name: data.name || 'Unnamed Product',
          description: data.description || '',
          price: data.price || 0,
          stockQuantity: data.stock || data.stockQuantity || 0,
          category: data.category || 'Uncategorized',
          imageUrl: data.imageUrl || '',
          sku: data.sku || '',
          createdBy: data.createdBy || data.ownedBy || 'unknown',
          ownedBy: data.ownedBy || data.createdBy || 'unknown',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });

      // Sort products manually by creation date (newest first) for sellers
      if (shouldShowSellerProducts) {
        fetchedProducts.sort((a, b) => b.createdAt - a.createdAt);
      }
      
      console.log(`📦 Successfully fetched ${fetchedProducts.length} products for ${userAccessLevel}`);
      setProducts(fetchedProducts);

      // Calculate stats
      const totalProducts = fetchedProducts.length;
      const lowStockProducts = fetchedProducts.filter(p => p.stockQuantity <= 10);
      const totalValue = fetchedProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
      const averagePrice = totalProducts > 0 ? fetchedProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

      setStats({
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalValue,
        averagePrice
      });

      // Clear any previous errors since we succeeded
      setError(null);

    } catch (err) {
      console.error('Error fetching products:', err);
      // Better error handling - only set error for actual failures, not empty results
      if (err.code === 'permission-denied') {
        setError('You do not have permission to access inventory');
      } else if (err.code === 'failed-precondition' || err.message.includes('index')) {
        // This specifically handles the indexing issue
        console.log('Firestore indexing issue detected, trying simpler query...');
        // Try a simpler query without orderBy for sellers
        if (shouldShowSellerProducts) {
          try {
            const simpleQuery = query(productsRef, where('createdBy', '==', user.uid));
            const querySnapshot = await getDocs(simpleQuery);
            const fetchedProducts = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              fetchedProducts.push({
                id: doc.id,
                name: data.name || 'Unnamed Product',
                description: data.description || '',
                price: data.price || 0,
                stockQuantity: data.stock || data.stockQuantity || 0,
                category: data.category || 'Uncategorized',
                imageUrl: data.imageUrl || '',
                sku: data.sku || '',
                createdBy: data.createdBy || data.ownedBy || 'unknown',
                ownedBy: data.ownedBy || data.createdBy || 'unknown',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
              });
            });

            // Sort manually by creation date
            fetchedProducts.sort((a, b) => b.createdAt - a.createdAt);
            setProducts(fetchedProducts);
            
            // Calculate stats
            const totalProducts = fetchedProducts.length;
            const lowStockProducts = fetchedProducts.filter(p => p.stockQuantity <= 10);
            const totalValue = fetchedProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
            const averagePrice = totalProducts > 0 ? fetchedProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

            setStats({
              totalProducts,
              lowStockCount: lowStockProducts.length,
              totalValue,
              averagePrice
            });
            
            return; // Exit successfully
          } catch (simpleErr) {
            console.error('Simple query also failed:', simpleErr);
            setError('Unable to load inventory. Please contact support.');
          }
        } else {
          setError('Database indexing in progress. Please try again in a moment.');
        }
      } else {
        setError(`Failed to load inventory: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is logged in and not a business buyer
    if (user && !(user.accountType === 'business' && user.businessType === 'buyer')) {
      fetchProducts();
    }
  }, [user, shouldShowAllProducts, shouldShowSellerProducts]);

  // Handle product deletion with ownership check
  const handleDeleteProduct = async (productId, productName) => {
    if (!canManageProducts) {
      showNotification('You do not have permission to delete products', 'error');
      return;
    }

    // Check ownership for sellers
    if (isSeller) {
      const product = products.find(p => p.id === productId);
      if (product && product.createdBy !== user.uid && product.ownedBy !== user.uid) {
        showNotification('You can only delete products you created', 'error');
        return;
      }
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      showNotification('Product deleted successfully', 'success');
      
      // Refresh stats
      const updatedProducts = products.filter(p => p.id !== productId);
      const totalProducts = updatedProducts.length;
      const lowStockProducts = updatedProducts.filter(p => p.stockQuantity <= 10);
      const totalValue = updatedProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
      const averagePrice = totalProducts > 0 ? updatedProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

      setStats({
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalValue,
        averagePrice
      });

    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product. Please try again.', 'error');
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm.trim() === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && product.stockQuantity <= 10) ||
      (stockFilter === 'out' && product.stockQuantity === 0) ||
      (stockFilter === 'in' && product.stockQuantity > 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories for filter
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Block business buyers immediately
  if (user && user.accountType === 'business' && user.businessType === 'buyer') {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Inventory Not Available for Buyers</h2>
          <p className="text-gray-500 mb-4">Business buyers can browse and purchase products, but cannot manage inventory.</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/catalog')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
            >
              Browse Products
            </button>
            <button
              onClick={() => navigate('/business-dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4 text-red-500">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Inventory</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-400 text-green-800'
            : darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-400 text-red-800'
        } border`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {shouldShowAllProducts ? 'All Inventory' : shouldShowSellerProducts ? 'My Products' : 'Product Inventory'}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {shouldShowAllProducts 
                ? 'Manage all products in the system' 
                : shouldShowSellerProducts
                ? 'Manage your product listings and inventory'
                : 'View product inventory'
              }
            </p>
          </div>
          
          {/* User type indicator and actions */}
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              shouldShowAllProducts
                ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                : shouldShowSellerProducts
                ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
            }`}>
              {shouldShowAllProducts ? '👑 Admin/Manager View' : 
               shouldShowSellerProducts ? '🏪 Seller View' : '👤 User View'}
            </span>
            
            {canManageProducts && (
              <button
                onClick={() => navigate('/add-product')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                {shouldShowSellerProducts ? 'My Products' : 'Total Products'}
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.totalProducts}
              </p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Low Stock
              </p>
              <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                {stats.lowStockCount}
              </p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Total Value
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ${stats.totalValue.toFixed(0)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Avg Price
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                ${stats.averagePrice.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {products.length > 0 && (
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              />
            </div>
            
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'
                } border focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="all">All Stock Levels</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            
            <div>
              <button
                onClick={fetchProducts}
                className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.lowStockCount > 0 && (
        <div className="mb-6">
          <LowStockAlert 
            products={products.filter(p => p.stockQuantity <= 10)} 
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Products Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg overflow-hidden border`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Products ({filteredProducts.length})
          </h2>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Product
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Category
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Price
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Stock
                  </th>
                  {shouldShowAllProducts && (
                    <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Owner
                    </th>
                  )}
                  {canManageProducts && (
                    <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center mr-3`}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              SKU: {product.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        ${product.price?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stockQuantity <= 0 
                          ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                          : product.stockQuantity <= 10 
                            ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                            : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stockQuantity} in stock
                      </span>
                    </td>
                    {shouldShowAllProducts && (
                      <td className="px-6 py-4">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {product.ownedBy === user?.uid || product.createdBy === user?.uid ? (
                            <span className="text-green-600 font-medium">You</span>
                          ) : (
                            product.ownedBy?.slice(0, 8) || 'Unknown'
                          )}
                        </span>
                      </td>
                    )}
                    {canManageProducts && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsModalOpen(true);
                            }}
                            className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                          >
                            Edit
                          </button>
                          {/* Only show delete for admin/manager or product owner */}
                          {(shouldShowAllProducts || product.createdBy === user?.uid || product.ownedBy === user?.uid) && (
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} font-medium`}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // NO PRODUCTS FOUND STATE - This is the fix for the error
          <div className="p-12 text-center">
            <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              📦
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                ? 'No products match your filters' 
                : shouldShowSellerProducts
                ? 'No products listed yet'
                : 'No products in inventory'
              }
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {shouldShowSellerProducts
                ? 'Start by adding your first product to begin selling.'
                : canManageProducts
                ? 'Add products to get started with inventory management.'
                : 'Contact admin to add products to the inventory.'
              }
            </p>
            {canManageProducts && (
              <button
                onClick={() => navigate('/add-product')}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Add Your First Product
              </button>
            )}
            {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStockFilter('all');
                }}
                className={`ml-2 px-4 py-2 border rounded ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={(refresh) => {
            setIsModalOpen(false);
            setSelectedProduct(null);
            if (refresh) {
              fetchProducts();
            }
          }}
          categories={categories}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default Inventory;