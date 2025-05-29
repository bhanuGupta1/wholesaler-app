// src/pages/Inventory.jsx - Improved and Fixed Version
import { useState, useEffect, useMemo } from 'react'; // FIXED: Added useMemo import
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  writeBatch // FIXED: Added writeBatch import
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
  const { darkMode } = useTheme();
  
  // Core state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Enhanced state for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk operations state
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [operationLoading, setOperationLoading] = useState(false); // IMPROVED: Added operation loading state

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // IMPROVED: Clear previous errors
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FIXED: Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // FIXED: Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'in-stock') {
        matchesStock = product.stock > 10;
      } else if (stockFilter === 'low-stock') {
        matchesStock = product.stock > 0 && product.stock <= 10;
      } else if (stockFilter === 'out-of-stock') {
        matchesStock = product.stock === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
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
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortDirection]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // IMPROVED: Enhanced delete product with better error handling
  const handleDelete = async (id) => {
    const product = products.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${product?.name || 'this product'}"?`)) {
      try {
        setOperationLoading(true);
        await deleteDoc(doc(db, 'products', id));
        setProducts(prev => prev.filter(p => p.id !== id));
        
        // Remove from selection if selected
        setSelectedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        // IMPROVED: Show success message
        console.log('Product deleted successfully');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // IMPROVED: Enhanced update stock with validation
  const updateStock = async (id, newStock) => {
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    try {
      setOperationLoading(true);
      await updateDoc(doc(db, 'products', id), { 
        stock: newStock,
        updatedAt: new Date() // IMPROVED: Add timestamp
      });
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, stock: newStock } : p
      ));
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  // Bulk operations
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId, checked) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  // IMPROVED: Enhanced bulk delete with progress tracking
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    const productNames = Array.from(selectedProducts)
      .map(id => products.find(p => p.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
    
    const confirmMessage = selectedProducts.size <= 3 
      ? `Delete these products: ${productNames}?`
      : `Delete ${selectedProducts.size} selected products (${productNames} and ${selectedProducts.size - 3} more)?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setOperationLoading(true);
        const batch = writeBatch(db);
        
        selectedProducts.forEach(productId => {
          batch.delete(doc(db, 'products', productId));
        });
        
        await batch.commit();
        
        setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
        setSelectedProducts(new Set());
        setShowBulkActions(false);
        
        console.log(`Successfully deleted ${selectedProducts.size} products`);
      } catch (err) {
        console.error('Error deleting products:', err);
        alert('Failed to delete some products. Please try again.');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // IMPROVED: Enhanced bulk stock update with validation
  const handleBulkStockUpdate = async () => {
    if (selectedProducts.size === 0 || !bulkStockValue) return;
    
    const stockValue = parseInt(bulkStockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      alert('Please enter a valid stock value (0 or greater)');
      return;
    }
    
    try {
      setOperationLoading(true);
      const batch = writeBatch(db);
      
      selectedProducts.forEach(productId => {
        batch.update(doc(db, 'products', productId), { 
          stock: stockValue,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
      
      setProducts(prev => prev.map(p => 
        selectedProducts.has(p.id) ? { ...p, stock: stockValue } : p
      ));
      
      setSelectedProducts(new Set());
      setShowBulkActions(false);
      setBulkStockValue('');
      
      console.log(`Successfully updated stock for ${selectedProducts.size} products`);
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock for some products. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  // IMPROVED: Enhanced CSV export with better formatting
  const exportToCSV = () => {
    try {
      const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
      const csvContent = [
        headers,
        ...filteredAndSortedProducts.map(p => [
          `"${p.name || ''}"`, // Quote names to handle commas
          p.sku || '',
          p.category || 'Uncategorized',
          p.price || 0,
          p.stock || 0,
          p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock'
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('Inventory exported successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  // IMPROVED: Reset filters function
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setSortBy('name');
    setSortDirection('asc');
    setCurrentPage(1);
    setSelectedProducts(new Set());
  };

  // IMPROVED: Get stock statistics
  const stockStats = useMemo(() => {
    return {
      total: products.length,
      inStock: products.filter(p => p.stock > 10).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
    };
  }, [products]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Error Loading Inventory</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Enhanced Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total: <span className="font-semibold text-lg">{stockStats.total}</span>
            </div>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing: <span className="font-semibold text-lg">{filteredAndSortedProducts.length}</span>
            </div>
            <div className="text-green-600 dark:text-green-400">
              In Stock: <span className="font-semibold text-lg">{stockStats.inStock}</span>
            </div>
            <div className="text-yellow-600 dark:text-yellow-400">
              Low Stock: <span className="font-semibold text-lg">{stockStats.lowStock}</span>
            </div>
            <div className="text-red-600 dark:text-red-400">
              Out of Stock: <span className="font-semibold text-lg">{stockStats.outOfStock}</span>
            </div>
          </div>
          <div className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Inventory Value: <span className="font-semibold">${stockStats.totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Browse Catalog
          </Link>
          <button
            onClick={exportToCSV}
            disabled={operationLoading}
            className={`inline-flex items-center px-4 py-2 border rounded-lg shadow-sm transition-colors ${
              operationLoading
                ? 'opacity-50 cursor-not-allowed'
                : darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 mb-6 border`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Search Products
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} ({products.filter(p => p.category === category).length})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Stock Status
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock (&gt;10) ({stockStats.inStock})</option>
              <option value="low-stock">Low Stock (1-10) ({stockStats.lowStock})</option>
              <option value="out-of-stock">Out of Stock (0) ({stockStats.outOfStock})</option>
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
              <option value="category">Category</option>
              <option value="price">Price</option>
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
        </div>

        {/* Results and Clear Filters */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
            {filteredAndSortedProducts.length !== products.length && 
              ` (filtered from ${products.length} total)`}
          </p>
          {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'name' || sortDirection !== 'asc') && (
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <div className={`${darkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} underline`}
              >
                {showBulkActions ? 'Hide' : 'Show'} Bulk Actions
              </button>
            </div>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Clear Selection
            </button>
          </div>
          
          {showBulkActions && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Stock value"
                  min="0"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(e.target.value)}
                  className={`px-3 py-1 border rounded text-sm w-24 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={handleBulkStockUpdate}
                  disabled={!bulkStockValue || operationLoading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={operationLoading}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Products Table or Empty State */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium mb-2">
            {products.length === 0 ? 'No products found' : 'No products match your filters'}
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {products.length === 0 
              ? 'Add some products to get started.' 
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {products.length === 0 ? (
            <Link
              to="/products"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Products
            </Link>
          ) : (
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && selectedProducts.size === paginatedProducts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Link to={`/products/${product.id}`} className="flex-shrink-0 mr-4">
                          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-12 w-12 rounded-lg object-cover" 
                              />
                            ) : (
                              <span className="text-gray-400 text-xl">📦</span>
                            )}
                          </div>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/products/${product.id}`}
                            className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                          >
                            {product.name}
                          </Link>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.category ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.category}
                        </span>
                      ) : (
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          product.stock <= 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : product.stock <= 5 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                              : product.stock <= 10 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {product.stock || 0}
                          {product.stock <= 0 && ' (Out)'}
                          {product.stock > 0 && product.stock <= 5 && ' (Critical)'}
                          {product.stock > 5 && product.stock <= 10 && ' (Low)'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                            disabled={operationLoading}
                            className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 text-sm font-medium disabled:opacity-50 transition-colors"
                            title="Decrease stock"
                          >
                            −
                          </button>
                          <button
                            onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                            disabled={operationLoading}
                            className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 text-sm font-medium disabled:opacity-50 transition-colors"
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                          View
                        </Link>
                        <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                        <Link
                          to={`/inventory/${product.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Edit
                        </Link>
                        <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={operationLoading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50"
                          title="Delete product"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Items per page:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1 border rounded text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === 1
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  } ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : darkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  } ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 flex items-center space-x-3`}>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;