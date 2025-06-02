// src/pages/Inventory.jsx - Enhanced with business user access control
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';
import { 
  getProducts, 
  getAllProducts, 
  getUserProducts, 
  deleteProduct,
  getProductStats 
} from '../firebase/productService';
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
    unauthorizedRedirect 
  } = useAccessControl();

  // Redirect business buyers immediately
  useEffect(() => {
    if (isBuyer) {
      navigate(unauthorizedRedirect, { replace: true });
      return;
    }
    
    if (!canAccessInventory) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [isBuyer, canAccessInventory, navigate, unauthorizedRedirect]);

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

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch products based on user role
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedProducts;
      let productStats;

      if (canViewAllProducts) {
        // Admin/Manager: See all products
        fetchedProducts = await getAllProducts();
        productStats = await getProductStats(null, 'admin');
      } else if (isSeller && user?.uid) {
        // Business Seller: See only their own products
        fetchedProducts = await getUserProducts(user.uid);
        productStats = await getProductStats(user.uid, 'business');
      } else {
        throw new Error('Unauthorized access to inventory');
      }

      setProducts(fetchedProducts);
      setStats(productStats);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load inventory');
      
      // If it's an authorization error, redirect
      if (err.message.includes('Unauthorized') || err.message.includes('permission')) {
        navigate(unauthorizedRedirect, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && canAccessInventory && !isBuyer) {
      fetchProducts();
    }
  }, [user, canAccessInventory, isBuyer]);

  // Handle product deletion with ownership check
  const handleDeleteProduct = async (productId) => {
    if (!canManageProducts) {
      showNotification('You do not have permission to delete products', 'error');
      return;
    }

    try {
      await deleteProduct(productId, user?.uid, user?.accountType);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showNotification('Product deleted successfully', 'success');
      
      // Refresh stats
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.message.includes('permission')) {
        showNotification('You can only delete products you created', 'error');
      } else {
        showNotification('Failed to delete product', 'error');
      }
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

  // Don't render anything for business buyers (they should be redirected)
  if (isBuyer) {
    return null;
  }

  if (!canAccessInventory) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">Business buyers cannot access inventory management.</p>
          <button
            onClick={() => navigate(unauthorizedRedirect)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
            Retry
          </button>
          <button
            onClick={() => navigate(unauthorizedRedirect)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Back
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
              {canViewAllProducts ? 'All Inventory' : 'My Products'}
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {canViewAllProducts 
                ? 'Manage all products in the system' 
                : 'Manage your product listings and inventory'
              }
            </p>
          </div>
          
          {/* User type indicator */}
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              canViewAllProducts
                ? darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
            }`}>
              {canViewAllProducts ? '👑 Admin/Manager View' : '🏪 Seller View'}
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
                Total Products
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
                  {canViewAllProducts && (
                    <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                      Owner
                    </th>
                  )}
                  <th className={`px-6 py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
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
                        ${product.price.toFixed(2)}
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
                    {canViewAllProducts && (
                      <td className="px-6 py-4">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {product.createdBy === user?.uid ? 'You' : product.createdBy?.slice(0, 8) || 'Unknown'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                          className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} font-medium`}
                          disabled={!canManageProducts || (product.ownedBy !== user?.uid && !canViewAllProducts)}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'} font-medium`}
                          disabled={!canManageProducts || (product.ownedBy !== user?.uid && !canViewAllProducts)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className={`text-4xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              📦
            </div>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                ? 'No products match your filters' 
                : isSeller 
                  ? 'No products listed yet'
                  : 'No products in inventory'
              }
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              {isSeller 
                ? 'Start by adding your first product to begin selling.'
                : 'Add products to get started with inventory management.'
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