// src/pages/ProductCatalog.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const ProductCatalog = () => {
  const { darkMode } = useTheme();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch products on mount
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
      }));
      
      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const inStock = product.stock > 0;
      
      return matchesSearch && matchesCategory && inStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortDirection]);

  // Handle add to cart
  const handleAddToCart = (product, quantity = 1) => {
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }
    
    addToCart(product, quantity);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white bg-green-500 transform transition-transform duration-300`;
    successMessage.textContent = `Added ${product.name} to cart!`;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(successMessage), 300);
    }, 2000);
  };

  // Get cart quantity for product
  const getCartQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`p-4 rounded-lg border-l-4 ${darkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-400 text-red-700'}`}>
            <p>{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Product Catalog
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover our wide range of wholesale products
            </p>
          </div>
          
          {/* Cart Button */}
          <div className="mt-4 lg:mt-0">
            <Link
              to="/cart"
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Cart {cart.length > 0 && (
                <span className={`ml-1 px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-800 text-white'}`}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 mb-6 border`}>
          {/* Search Bar */}
          <div className="relative mb-4">
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

          {/* Filter Toggle Button (Mobile) */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full flex items-center justify-center px-4 py-2 border rounded-lg ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters & Sorting
            </button>
          </div>

          {/* Filters and Controls */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="category">Category</option>
                <option value="stock">Stock</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Order
              </label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                View
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'grid'
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'list'
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-12 text-center`}>
            <div className="text-6xl mb-4">📦</div>
            <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
              No products found
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No products available at the moment'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedProducts.map(product => (
              viewMode === 'grid' ? (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                  darkMode={darkMode}
                />
              ) : (
                <ProductListItem 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                  darkMode={darkMode}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component for Grid View
const ProductCard = ({ product, onAddToCart, cartQuantity, darkMode }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group`}>
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl">📦</span>
            </div>
          )}
          
          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              product.stock <= 5 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : product.stock <= 20 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {product.stock} left
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className={`font-semibold ${darkMode ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'} mb-1 transition-colors line-clamp-2`}>
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
            {product.category}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          {cartQuantity > 0 && (
            <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-800'}`}>
              {cartQuantity} in cart
            </span>
          )}
        </div>

        {/* Add to Cart Controls */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center text-sm transition-colors`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className={`flex-1 text-center py-1 px-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center text-sm transition-colors`}
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => onAddToCart(product, quantity)}
            className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// Product List Item Component for List View
const ProductListItem = ({ product, onAddToCart, cartQuantity, darkMode }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center space-x-6">
        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-2xl">📦</span>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/products/${product.id}`}>
            <h3 className={`font-semibold ${darkMode ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'} mb-1 transition-colors`}>
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center space-x-4 text-sm">
            {product.category && (
              <span className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {product.category}
              </span>
            )}
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Stock: {product.stock}
            </span>
            {cartQuantity > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-800'}`}>
                {cartQuantity} in cart
              </span>
            )}
          </div>
          
          {product.description && (
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
              {product.description}
            </p>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center space-x-4">
          <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center text-sm transition-colors`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className={`w-16 text-center py-1 px-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center text-sm transition-colors`}
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => onAddToCart(product, quantity)}
            className="py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;