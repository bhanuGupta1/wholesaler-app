// src/pages/GuestDashboard.jsx - Updated with product detail links
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom'; // Add this import
import ThemeToggle from '../components/common/ThemeToggle';

// ProductCard Component with hover effects and theme support
const ProductCard = ({ product, darkMode }) => {
  return (
    <div className={`border rounded-lg p-4 shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900'
    }`}>
      {/* Make the image clickable to product details */}
      <Link to={`/products/${product.id}`} className="block">
        <div className={`h-48 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center rounded-md mb-4 overflow-hidden`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover h-full w-full hover:scale-105 transition-transform duration-300"
            />
          ) : (
            // SVG placeholder
            <svg className="w-16 h-16" fill={darkMode ? "#4B5563" : "#D1D5DB"} viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </Link>

      {/* Make the product name clickable to product details */}
      <Link to={`/products/${product.id}`}>
        <h3 className={`font-bold text-lg mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {product.name}
        </h3>
      </Link>
      
      <p className={`text-sm mb-2 line-clamp-2 h-10 overflow-hidden ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {product.description || 'No description available'}
      </p>
      <div className="flex items-center justify-between mt-4">
        <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ${Number(product.price).toFixed(2)}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${
          product.stock > 10 
            ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
            : product.stock > 0
              ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
              : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
        }`}>
          {product.stock > 10 
            ? 'In Stock' 
            : product.stock > 0 
              ? 'Low Stock' 
              : 'Out of Stock'}
        </span>
      </div>
      <div className="flex space-x-2 mt-4">
        {/* View Details Button */}
        <Link 
          to={`/products/${product.id}`}
          className={`flex-1 py-2 px-4 rounded font-medium text-center border transition-colors ${
            darkMode 
              ? 'border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white' 
              : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          View Details
        </Link>
        {/* Add to Cart Button */}
        <button 
          className={`flex-1 py-2 px-4 rounded font-medium ${
            product.stock > 0 
              ? darkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : darkMode 
                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// Featured Product Component
const FeaturedProduct = ({ product, darkMode }) => {
  if (!product) return null;
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 rounded-lg overflow-hidden border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-lg p-6 mb-10`}>
      {/* Make the featured product image clickable */}
      <Link to={`/products/${product.id}`} className="block">
        <div className={`h-80 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg overflow-hidden flex items-center justify-center hover:scale-105 transition-transform duration-300`}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <svg className="w-24 h-24" fill={darkMode ? "#4B5563" : "#D1D5DB"} viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </Link>
      <div className="flex flex-col justify-center">
        <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit mb-2 ${
          darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
        }`}>
          Featured Product
        </div>
        {/* Make the featured product title clickable */}
        <Link to={`/products/${product.id}`}>
          <h2 className={`text-2xl font-bold mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {product.name}
          </h2>
        </Link>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {product.description || 'No description available'}
        </p>
        <div className="flex items-center space-x-4 mb-6">
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            product.stock > 10 
              ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
              : product.stock > 0
                ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                : darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 10 
              ? 'In Stock' 
              : product.stock > 0 
                ? 'Low Stock' 
                : 'Out of Stock'}
          </span>
        </div>
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-6 rounded-lg font-medium ${
              product.stock > 0 
                ? darkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : darkMode 
                  ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
          {/* View Details Button for Featured Product */}
          <Link 
            to={`/products/${product.id}`}
            className={`py-2 px-6 rounded-lg font-medium transition-colors ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const GuestDashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from Firestore
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Create base query
        const productsRef = collection(db, 'products');
        
        // Add filters if necessary
        let productsQuery = productsRef;
        if (selectedCategory) {
          productsQuery = query(productsRef, where('category', '==', selectedCategory));
        }
        
        // Execute query
        const productsSnapshot = await getDocs(productsQuery);
        let productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Apply search filter (client-side since Firestore doesn't support LIKE)
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          productsData = productsData.filter(product => 
            product.name?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        if (sortOption === 'price_asc') {
          productsData.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOption === 'price_desc') {
          productsData.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOption === 'name_asc') {
          productsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortOption === 'name_desc') {
          productsData.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        }
        
        // Set featured product (pick the first one or one with an image)
        const productWithImage = productsData.find(product => product.imageUrl);
        setFeaturedProduct(productWithImage || productsData[0] || null);
        
        // Set all products
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [selectedCategory, searchTerm, sortOption]);

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Hero Section with Toggle */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Wholesaler
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Browse our premium inventory and find quality products at wholesale prices
          </p>
        </div>
        <ThemeToggle className="ml-4" />
      </div>
      
      {/* Featured Product */}
      {featuredProduct && <FeaturedProduct product={featuredProduct} darkMode={darkMode} />}
      
      {/* Filters and Search */}
      <div className={`mb-8 p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="col-span-2">
            <label htmlFor="search" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Search Products
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300'
                }`}
                placeholder="Search by name, description or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Category
            </label>
            <select
              id="category"
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'
              } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Sort Options */}
          <div>
            <label htmlFor="sort" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Sort By
            </label>
            <select
              id="sort"
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300'
              } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
        </div>
      )}
      
      {error && (
        <div className={`${darkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-400 text-red-700'} p-4 rounded-lg mb-8 border-l-4`}>
          {error}
        </div>
      )}
      
      {/* Product Grid */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>No products found</h3>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Try changing your search criteria or check back later for new products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} darkMode={darkMode} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Sign In Prompt */}
      <div className={`mt-16 p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:flex-1">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create an Account</h2>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Register to access wholesale pricing, place orders, and manage your inventory.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a 
              href="/login" 
              className={`inline-block px-6 py-3 rounded-lg font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              Sign Up Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;