// src/pages/ProductCatalog.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const ProductCatalog = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null); // Track which product is being added
  
  // Filter and search state
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    searchTerm: '',
    sortBy: 'name', // 'name', 'price_asc', 'price_desc', 'newest'
    inStockOnly: true
  });
  
  // View state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(product => product.category).filter(Boolean))];
      
      setProducts(productsData);
      setCategories(uniqueCategories.sort());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate()) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt.toDate()) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'name':
      default:
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }
    
    return filtered;
  }, [products, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      searchTerm: '',
      sortBy: 'name',
      inStockOnly: true
    });
  };

  // Add product to cart with animation
  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    
    try {
      addToCart(product, 1);
      
      // Show success feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  // Get cart item count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Get stock status style
  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        text: 'Out of Stock',
        style: darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
      };
    } else if (stock <= 10) {
      return {
        text: 'Low Stock',
        style: darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        text: 'In Stock',
        style: darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
      };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-400'} p-4 rounded-lg border-l-4`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-800'}`}>Error Loading Products</h3>
                <div className={`mt-2 text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchProductsAndCategories}
                    className={`text-sm font-medium ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Product Catalog
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover our wide range of wholesale products
            </p>
          </div>
          
          {/* Cart Button */}
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/cart')}
              className={`relative inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md p-6 mb-8 border`}>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                darkMode ? 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/30' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="$999"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Sort Options */}
              <div>
                <label htmlFor="sort" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Sort By
                </label>
                <select
                  id="sort"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div className="md:col-span-2 lg:col-span-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                    className={`rounded border-gray-300 ${darkMode ? 'text-indigo-600 focus:ring-indigo-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                  />
                  <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Show only products in stock
                  </span>
                </label>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                    darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-12 text-center border`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No products found</h3>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Try adjusting your search criteria or filters to find what you're looking for.
            </p>
            {(filters.searchTerm || filters.category || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredAndSortedProducts.map(product => (
              viewMode === 'grid' ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  isAddingToCart={addingToCart === product.id}
                  darkMode={darkMode}
                  getStockStatus={getStockStatus}
                />
              ) : (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  isAddingToCart={addingToCart === product.id}
                  darkMode={darkMode}
                  getStockStatus={getStockStatus}
                />
              )
            ))}
          </div>
        )}

        {/* Sign In CTA for Guest Users */}
        {!user && (
          <div className={`mt-16 p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Get Better Prices</h2>
                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sign up for wholesale pricing and exclusive discounts on bulk orders.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link 
                  to="/login" 
                  className={`inline-block px-6 py-3 rounded-lg font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className={`inline-block px-6 py-3 rounded-lg font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component for Grid View
const ProductCard = ({ product, onAddToCart, isAddingToCart, darkMode, getStockStatus }) => {
  const stockStatus = getStockStatus(product.stock || 0);
  
  return (
    <div className={`border rounded-lg overflow-hidden shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'
    }`}>
      {/* Product Image */}
      <Link to={`/inventory/${product.id}`} className="block">
        <div className={`h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center overflow-hidden`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <svg className="w-16 h-16" fill={darkMode ? "#4B5563" : "#D1D5DB"} viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/inventory/${product.id}`}>
          <h3 className={`font-bold text-lg mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {product.category}
          </p>
        )}
        
        <p className={`text-sm mb-3 line-clamp-2 h-10 overflow-hidden ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price || 0).toFixed(2)}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.style}`}>
            {stockStatus.text}
          </span>
        </div>
        
        <button 
          onClick={onAddToCart}
          disabled={isAddingToCart || (product.stock || 0) <= 0}
          className={`w-full py-2 px-4 rounded font-medium transition-colors ${
            (product.stock || 0) > 0 
              ? darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400'
              : darkMode 
                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </div>
          ) : (product.stock || 0) > 0 ? (
            'Add to Cart'
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

// Product List Item Component for List View
const ProductListItem = ({ product, onAddToCart, isAddingToCart, darkMode, getStockStatus }) => {
  const stockStatus = getStockStatus(product.stock || 0);
  
  return (
    <div className={`border rounded-lg p-4 shadow-md transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <Link to={`/inventory/${product.id}`} className="flex-shrink-0">
          <div className={`h-20 w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden flex items-center justify-center`}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover h-full w-full"
              />
            ) : (
              <svg className="w-8 h-8" fill={darkMode ? "#4B5563" : "#D1D5DB"} viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        </Link>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/inventory/${product.id}`}>
            <h3 className={`font-bold text-lg hover:text-indigo-600 dark:hover:text-indigo-400 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h3>
          </Link>
          
          {product.category && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {product.category}
            </p>
          )}
          
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {product.description || 'No description available'}
          </p>
        </div>
        
        {/* Price and Actions */}
        <div className="flex flex-col items-end space-y-2">
          <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price || 0).toFixed(2)}
          </span>
          
          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.style}`}>
            {stockStatus.text}
          </span>
          
          <button 
            onClick={onAddToCart}
            disabled={isAddingToCart || (product.stock || 0) <= 0}
            className={`py-2 px-4 rounded font-medium transition-colors ${
              (product.stock || 0) > 0 
                ? darkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400'
                : darkMode 
                  ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (product.stock || 0) > 0 ? (
              'Add to Cart'
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;