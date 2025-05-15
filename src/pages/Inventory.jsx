// src/pages/Inventory.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import ProductModal from '../components/Inventory/ProductModal';
import LowStockAlert from '../components/Inventory/LowStockAlert';

const Inventory = () => {
  //State Mangement 
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
////   handles loading and error state
  const fetchProducts = async () => {
  try {
    setLoading(true);
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const productsList = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(productsList);
    setFilteredProducts(productsList);

    const lowStockItems = productsList.filter(product => product.stock <= lowStockThreshold);
    setLowStockCount(lowStockItems.length);
  } catch (err) {
    console.error('Error fetching products:', err);
    setError('Failed to fetch products. Please try again later.');
  } finally {
    setLoading(false);
  }
};
//
///
//import { useMemo } from 'react';
//
const filterBySearch = (products, searchTerm) => {
  if (!searchTerm) return products;
  const lowerSearch = searchTerm.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowerSearch) ||
    product.sku?.toLowerCase().includes(lowerSearch) ||
    product.description?.toLowerCase().includes(lowerSearch)
  );
};
//
//const filteredProducts = useMemo(() => {
  let result = [...products];

  if (searchTerm) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (categoryFilter) {
    result = result.filter(product => product.category === categoryFilter);
  }

  switch (sortBy) {
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'stock_asc':
      result.sort((a, b) => a.stock - b.stock);
      break;
    case 'stock_desc':
      result.sort((a, b) => b.stock - a.stock);
      break;
    default:
      result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;}
//},// [products, searchTerm, categoryFilter, sortBy];
///

  // Available categories from our products
  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Kitchen', 'Clothing'];

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
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock_asc') {
      result.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'stock_desc') {
      result.sort((a, b) => b.stock - a.stock);
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
        stock: newStock
      });
      
      setProducts(prevProducts => prevProducts.map(product => 
        product.id === id ? { ...product, stock: newStock } : product
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
  const handleAddProduct = () => 
    {
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
          const productsRef = collection(db, 'products');
          const productsSnapshot = await getDocs(productsRef);
          const productsList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsList);
        } catch (err) {
          console.error('Error fetching products:', err);
        }
      };
      
      fetchProducts();
    }
  };
///

  
  

////
const toggleStockAdjustment1 = (productId, initialAdjustment = 0) => {
  setProducts(prevProducts => {
    const productExists = prevProducts.some(p => p.id === productId);
    
    if (!productExists) {
      console.warn(`Product with ID ${productId} not found`);
      return prevProducts;
    }
    
    return prevProducts.map(product => 
      product.id === productId
        ? { 
            ...product, 
            isAdjusting: !product.isAdjusting, 
            stockAdjustment: product.isAdjusting ? 0 : initialAdjustment 
          }
        : product
    );
  });
  
  // Optional: Notify about the adjustment mode change
  const targetProduct = products.find(p => p.id === productId);
  if (targetProduct) {
    const action = targetProduct.isAdjusting ? 'cancelled' : 'started';
    setNotification(`Stock adjustment ${action} for ${targetProduct.name}`);
  }
};
//
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="mb-6">
          <button 
            onClick={() => setShowLowStockAlert(!showLowStockAlert)}
            className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
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
            />
          )}
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name, SKU, or description"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="col-span-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
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
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.isAdjusting ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex rounded-md shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleStockAdjustmentChange(product.id, (product.stockAdjustment || 0) - 1)}
                              className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
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
                              className="focus:ring-indigo-500 focus:border-indigo-500 block w-16 min-w-0 border-gray-300 text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleStockAdjustmentChange(product.id, (product.stockAdjustment || 0) + 1)}
                              className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
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
                              className="text-green-600 hover:text-green-900"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleStockAdjustment(product.id)}
                              className="text-red-600 hover:text-red-900"
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
                                ? 'bg-red-100 text-red-800' 
                                : product.stock <= lowStockThreshold * 2 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            onClick={() => toggleStockAdjustment(product.id)}
                            className="ml-2 text-gray-400 hover:text-gray-500"
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
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
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
        />
      )}
    </div>
  );
;

export default Inventory;