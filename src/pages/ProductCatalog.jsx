// src/pages/ProductCatalog.jsx - Complete product browsing like Costco
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const ProductCatalog = () => {
  const { darkMode } = useTheme();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'name'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const categoriesSet = new Set();
      snapshot.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) categoriesSet.add(category);
      });
      setCategories(Array.from(categoriesSet));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'name'
    });
  };

  const getBulkPrice = (product, quantity) => {
    const basePrice = product.price;
    if (quantity >= 50) return basePrice * 0.8; // 20% off for 50+
    if (quantity >= 20) return basePrice * 0.9; // 10% off for 20+
    if (quantity >= 10) return basePrice * 0.95; // 5% off for 10+
    return basePrice;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover quality products at wholesale prices
          </p>
        </div>

        {/* Filters Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock Level</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className={`px-4 py-2 border rounded-lg ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filter toggles */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="mr-2"
              />
              In Stock Only
            </label>

            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                darkMode={darkMode}
                viewMode={viewMode}
                onAddToCart={addToCart}
                getBulkPrice={getBulkPrice}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, darkMode, viewMode, onAddToCart, getBulkPrice, user }) => {
  const [quantity, setQuantity] = useState(1);
  const [showBulkPricing, setShowBulkPricing] = useState(false);

  const bulkTiers = [
    { min: 1, max: 9, discount: 0 },
    { min: 10, max: 19, discount: 5 },
    { min: 20, max: 49, discount: 10 },
    { min: 50, max: 999, discount: 20 }
  ];

  if (viewMode === 'list') {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 flex items-center space-x-6`}>
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {product.description || 'No description available'}
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Stock: {product.stock}
            </span>
            {product.category && (
              <span className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {product.category}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className={`w-20 px-3 py-2 border rounded text-center ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
          <button
            onClick={() => onAddToCart(product, quantity)}
            disabled={product.stock === 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`}>
      <div className="aspect-w-1 aspect-h-1 w-full h-48 bg-gray-200">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        
        {product.category && (
          <span className={`inline-block px-2 py-1 text-xs rounded mb-2 ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {product.category}
          </span>
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Stock: {product.stock}
            </span>
          </div>
          
          <button
            onClick={() => setShowBulkPricing(!showBulkPricing)}
            className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
          >
            View bulk pricing
          </button>
        </div>

        {showBulkPricing && (
          <div className={`mb-3 p-2 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            {bulkTiers.map(tier => (
              <div key={tier.min} className="flex justify-between">
                <span>{tier.min}+ items:</span>
                <span className="font-medium">
                  ${getBulkPrice(product, tier.min).toFixed(2)} 
                  {tier.discount > 0 && <span className="text-green-600 ml-1">(-{tier.discount}%)</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className={`flex-1 px-3 py-2 border rounded text-center ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}
          />
          <button
            onClick={() => onAddToCart(product, quantity)}
            disabled={product.stock === 0}
            className={`flex-1 py-2 rounded-lg font-medium ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;