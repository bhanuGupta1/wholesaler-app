// src/pages/ProductDetail.jsx (continued)
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import ProductModal from '../components/inventory/ProductModal';
import FeedbackList from '../components/feedback/FeedbackList';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          setProduct({
            id: productSnap.id,
            ...productSnap.data()
          });
        } else {
          setError('Product not found');
        }
        
        // Fetch categories for the edit modal
        // In a real app, you'd fetch this from a separate collection or context
        setCategories(['Electronics', 'Office Supplies', 'Furniture', 'Kitchen', 'Clothing']);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Handle stock adjustment
  const handleStockUpdate = async () => {
    if (stockAdjustment === 0) return;
    
    try {
      const newStock = Math.max(0, (product.stock || 0) + stockAdjustment);
      
      // Update stock in Firestore
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date()
      });
      
      // Update local state
      setProduct({
        ...product,
        stock: newStock
      });
      
      // Reset adjustment
      setStockAdjustment(0);
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock. Please try again.');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
      navigate('/inventory');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Handle edit modal close
  const handleCloseEditModal = async (refreshData) => {
    setShowEditModal(false);
    
    if (refreshData) {
      // Refresh product data
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          setProduct({
            id: productSnap.id,
            ...productSnap.data()
          });
        }
      } catch (err) {
        console.error('Error refreshing product data:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Link to="/inventory" className={`text-indigo-${darkMode ? '400' : '600'} hover:text-indigo-${darkMode ? '300' : '800'}`}>
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/inventory" className={`text-indigo-${darkMode ? '400' : '600'} hover:text-indigo-${darkMode ? '300' : '800'}`}>
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
        {/* Product Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center">
            <Link
              to="/inventory"
              className={`mr-4 text-indigo-${darkMode ? '400' : '600'} hover:text-indigo-${darkMode ? '300' : '800'} flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold">{product.name}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-${darkMode ? '500' : '600'} hover:bg-indigo-${darkMode ? '400' : '700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-${darkMode ? '500' : '600'} hover:bg-red-${darkMode ? '400' : '700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
        
        {/* Product Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Product Image */}
          <div>
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden mb-4`}>
              <div className={`h-80 bg-gray-100 ${darkMode ? 'bg-gray-700' : ''} flex items-center justify-center`}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg 
                      className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No product image available
                    </p>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className={`mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-${darkMode ? '500' : '600'} hover:bg-indigo-${darkMode ? '400' : '700'}`}
                    >
                      Add Image
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Description */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          </div>
          
          {/* Right Column - Product Details */}
          <div className="space-y-6">
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
              <h3 className="text-lg font-medium mb-4">Product Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
                    <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.category || 'Uncategorized'}</span>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SKU</label>
                    <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.sku || 'N/A'}</span>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supplier</label>
                    <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.supplier || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Selling Price</label>
                    <span className={`block mt-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cost Price</label>
                    <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.costPrice ? `$${parseFloat(product.costPrice).toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Profit Margin</label>
                    <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product.costPrice 
                        ? `${Math.round(((product.price - product.costPrice) / product.price) * 100)}%` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stock Information */}
            <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
              <h3 className="text-lg font-medium mb-4">Stock Information</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Stock</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${parseInt(product.stock) <= 5 
                      ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                      : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {parseInt(product.stock) <= 5 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center">
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {product.stock || 0}
                  </span>
                  <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    units
                  </span>
                </div>
              </div>
              
              {product.reorderPoint && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reorder Point</label>
                  <span className={`block mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.reorderPoint}</span>
                </div>
              )}
              
              {/* Stock Adjustment */}
              <div className="mt-6">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Adjust Stock
                </label>
                <div className="flex items-center">
                  <div className="flex rounded-md shadow-sm flex-1">
                    <button
                      type="button"
                      onClick={() => setStockAdjustment(prev => Math.max(product.stock * -1, prev - 1))}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-500'} hover:bg-gray-${darkMode ? '600' : '100'}`}
                    >
                      <span className="sr-only">Decrease</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="stock-adjustment"
                      value={stockAdjustment}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (!isNaN(value)) {
                          // Prevent going below -current stock (which would make total stock negative)
                          if (value >= -product.stock) {
                            setStockAdjustment(value);
                          }
                        }
                      }}
                      className={`block w-full flex-1 rounded-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-y text-center`}
                    />
                    <button
                      type="button"
                      onClick={() => setStockAdjustment(prev => prev + 1)}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-500'} hover:bg-gray-${darkMode ? '600' : '100'}`}
                    >
                      <span className="sr-only">Increase</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleStockUpdate}
                    disabled={stockAdjustment === 0}
                    className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      stockAdjustment === 0 
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                        : stockAdjustment > 0 
                          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400' 
                          : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {stockAdjustment === 0 
                      ? 'No Change' 
                      : stockAdjustment > 0 
                        ? `Add ${stockAdjustment}` 
                        : `Remove ${Math.abs(stockAdjustment)}`}
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {stockAdjustment !== 0 && (
                    <div>
                      New stock will be: <span className="font-medium">{product.stock + stockAdjustment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last Updated: {product.updatedAt ? new Date(product.updatedAt.toDate()).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`absolute inset-0 bg-gray-500 opacity-75`}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`} id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                <button 
                  type="button" 
                  onClick={handleDeleteProduct}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  onClick={() => setConfirmDelete(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'} shadow-sm px-4 py-2 text-base font-medium hover:bg-gray-${darkMode ? '600' : '50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && (
        <ProductModal 
          product={product} 
          onClose={handleCloseEditModal}
          categories={categories}
        />
      )}
    </div>
  );
};

export default ProductDetail;