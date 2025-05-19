// src/pages/GuestDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

// Product Card Component
const ProductCard = ({ product, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md overflow-hidden transition-all duration-200 transform hover:scale-105 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badge for low stock */}
        {product.stock <= 10 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Limited Stock
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className={`text-lg font-bold mb-1 truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {product.name}
        </h3>
        
        <div className="mt-1">
          <span className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            ${parseFloat(product.price).toFixed(2)}
          </span>
          
          {product.costPrice && (
            <span className={`ml-2 text-sm line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ${parseFloat(product.costPrice * 1.2).toFixed(2)}
            </span>
          )}
        </div>
        
        <div className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 h-10`}>
          {product.description || `High-quality ${product.name.toLowerCase()} for all your needs.`}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            SKU: {product.sku || 'N/A'}
          </div>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.stock > 20 
              ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
              : product.stock > 0
                ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <div className="mt-4">
          <button 
            disabled={product.stock <= 0}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              product.stock > 0
                ? darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                : darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Guest Dashboard Component
const GuestDashboard = () => {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('price_asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // Fetch products and categories
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category))].filter(Boolean);
        setCategories(uniqueCategories);
        
        // Select featured products (those with highest stock)
        const featured = [...productsData]
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 4);
        setFeaturedProducts(featured);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'stock_desc':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [products, selectedCategory, sortOrder, searchTerm]);

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Hero Banner */}
      <div className={`mb-8 rounded-xl overflow-hidden shadow-lg relative ${darkMode ? 'bg-gray-800' : 'bg-blue-600'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="relative p-8 md:p-12 z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Welcome to Wholesaler</h1>
          <p className="text-lg md:text-xl text-white opacity-90 mb-6 max-w-2xl">
            Shop our wide selection of high-quality products at wholesale prices.
            Perfect for businesses and bulk buyers.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-blue-50 transition-colors">
              Browse Products
            </button>
            <button className={`${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-700 text-white hover:bg-blue-800'} font-bold py-2 px-6 rounded-full transition-colors`}>
              About Memberships
            </button>
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg shadow-md border mb-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="category-filter" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {/* Sort Order */}
            <label htmlFor="sort-order" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} ml-4`}>
              Sort by:
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="stock_desc">Availability</option>
            </select>
          </div>
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } border focus:ring-indigo-500 focus:border-indigo-500`}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'} p-4 rounded-lg border-l-4 mb-8`}>
          <p>{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} p-8 rounded-lg shadow-md text-center border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className={`mt-4 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>No products found</h3>
          <p className="mt-2">Try changing your search criteria or check back later for new products.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm">Showing {filteredProducts.length} products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                darkMode={darkMode} 
              />
            ))}
          </div>
        </>
      )}
      
      {/* Membership Promotion */}
      <div className={`mt-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-md`}>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Become a Member Today
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join our membership program to get exclusive deals, wholesale prices, and early access to new inventory.
            </p>
            <ul className={`mb-6 space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Special member-only pricing</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Volume discounts on all orders</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free shipping on orders over $1000</span>
              </li>
            </ul>
            <button className={`${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-3 px-6 rounded-lg transition-colors`}>
              Sign Up for Membership
            </button>
          </div>
          <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
            <div className={`h-40 w-40 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-24 w-24 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;