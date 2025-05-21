// src/pages/Inventory.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Link } from 'react-router-dom';
import ProductModal from '../components/inventory/ProductModal';
import LowStockAlert from '../components/inventory/LowStockAlert';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
  // Theme support
  const { darkMode } = useTheme();
  
  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Available categories from our products - will be populated dynamically
  const [categories, setCategories] = useState([
    'Electronics', 'Office Supplies', 'Furniture', 'Kitchen', 'Clothing'
  ]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Extract unique categories from fetched products
        const uniqueCategories = [...new Set(productsList.map(product => product.category).filter(Boolean))];
        if (uniqueCategories.length > 0) {
          setCategories(uniqueCategories);
        }
        
        setProducts(productsList);
        setFilteredProducts(productsList);

        // Count low stock items
        const lowStockItems = productsList.filter(product => product.stock <= lowStockThreshold);
        setLowStockCount(lowStockItems.length);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [lowStockThreshold]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply sorting
    if (sortBy === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'stock_asc') {
      result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else if (sortBy === 'stock_desc') {
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, sortBy]);

  // Handler for delete product
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Handler for updating stock
  const handleStockUpdate = async (id, newStock) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        stock: newStock,
        updatedAt: new Date()
      });
      
      setProducts(prevProducts => prevProducts.map(product => 
        product.id === id ? { ...product, stock: newStock, updatedAt: new Date() } : product
      ));
      
      alert('Stock updated successfully!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock. Please try again.');
    }
  };

  // Handler for edit product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  // Handler for add new product
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowModal(true);
  };

  // Handler for modal close
  const handleCloseModal = (refreshData = false) => {
    setShowModal(false);
    
    if (refreshData) {
      // Refresh the products after adding/editing
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const productsRef = collection(db, 'products');
          const productsSnapshot = await getDocs(productsRef);
          const productsList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsList);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching products:', err);
          setLoading(false);
        }
      };
      
      fetchProducts();
    }
  };

  // Function to toggle stock adjustment inputs
  const toggleStockAdjustment = (productId) => {
    setProducts(prevProducts => prevProducts.map(product => 
      product.id === productId 
        ? { ...product, isAdjusting: !product.isAdjusting, stockAdjustment: 0 } 
        : product
    ));
  };

  // Function to handle stock adjustment change
  const handleStockAdjustmentChange = (productId, value) => {
    setProducts(prevProducts => prevProducts.map(product => 
      product.id === productId 
        ? { ...product, stockAdjustment: parseInt(value) || 0 } 
        : product
    ));
  };

  // Function to apply stock adjustment
  const applyStockAdjustment = async (product) => {
    const newStock = Math.max(0, product.stock + (product.stockAdjustment || 0));
    await handleStockUpdate(product.id, newStock);
    toggleStockAdjustment(product.id);
  };

  // Function to handle file selection for bulk upload
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Function to handle bulk upload
  const handleBulkUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploadingImage(true);
      // Logic for processing CSV/Excel file would go here
      
      // Example: Upload to Firebase Storage
      const storageRef = ref(storage, `uploads/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Process the file (in a real implementation, you'd parse the CSV/Excel)
      console.log('File uploaded successfully:', downloadURL);
      
      setUploadingImage(false);
      setSelectedFile(null);
      alert('File uploaded successfully. Processing...');
      
      // In a real implementation, you would process the file and add products to Firestore
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingImage(false);
      alert('Error uploading file. Please try again.');
    }
  };

  // Main render logic
  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 md:mb-0`}>Inventory Management</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddProduct}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
          
          {/* Bulk Upload Button with File Input */}
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload CSV
            </label>
          </div>
          
          {/* Upload Button (only visible when file is selected) */}
          {selectedFile && (
            <button
              onClick={handleBulkUpload}
              disabled={uploadingImage}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              {uploadingImage ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Process File
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="mb-6">
          <button 
            onClick={() => setShowLowStockAlert(!showLowStockAlert)}
            className={`flex items-center px-4 py-2 ${darkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} border rounded-lg hover:bg-yellow-200 transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{lowStockCount} products below low stock threshold</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transition-transform duration-200 ${showLowStockAlert ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showLowStockAlert && (
            <LowStockAlert 
              products={products.filter(p => p.stock <= lowStockThreshold)} 
              onUpdateStock={handleStockUpdate}
              threshold={lowStockThreshold}
              onChangeThreshold={setLowStockThreshold}
              darkMode={darkMode}
            />
          )}
        </div>
      )}

      {/* Search and filters */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md p-6 mb-6 border`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="col-span-1">
            <label htmlFor="search" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Search Products</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="Search by name, SKU, or description"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-span-1">
            <label htmlFor="category" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Filter by Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-span-1">
            <label htmlFor="sortBy" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'
              }`}
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="stock_asc">Stock (Low to High)</option>
              <option value="stock_desc">Stock (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
        </div>
      ) : error ? (
        <div className={`${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-400'} p-4 mb-6 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md p-8 text-center border`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No products found</h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || categoryFilter ? 
              'Try adjusting your search or filter to find what you\'re looking for.' : 
              'Get started by adding your first product.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Product
            </button>
          </div>
        </div>
      ) : (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-lg overflow-hidden border`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Product
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Category
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Price
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Stock
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.name}</div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>${parseFloat(product.price).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isAdjusting ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex rounded-md shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleStockAdjustmentChange(product.id, (product.stockAdjustment || 0) - 1)}
                              className={`relative inline-flex items-center px-2 py-1 rounded-l-md border ${
                                darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <span className="sr-only">Decrease</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              value={product.stockAdjustment || 0}
                              onChange={(e) => handleStockAdjustmentChange(product.id, e.target.value)}
                              className={`focus:ring-indigo-500 focus:border-indigo-500 block w-16 min-w-0 text-center ${
                                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300 text-black'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleStockAdjustmentChange(product.id, (product.stockAdjustment || 0) + 1)}
                              className={`relative inline-flex items-center px-2 py-1 rounded-r-md border ${
                                darkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <span className="sr-only">Increase</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => applyStockAdjustment(product)}
                              className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleStockAdjustment(product.id)}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${product.stock <= lowStockThreshold 
                                ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800' 
                                : product.stock <= lowStockThreshold * 2 
                                  ? darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800' 
                                  : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            onClick={() => toggleStockAdjustment(product.id)}
                            className={`ml-2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className={`${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'} mr-4`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={currentProduct}
          onClose={handleCloseModal}
          categories={categories}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};