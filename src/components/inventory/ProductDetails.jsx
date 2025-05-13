// src/components/inventory/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProductStock, deleteProduct } from '../../services/productService';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Handler for updating stock
  const handleStockUpdate = async () => {
    try {
      const newStock = Math.max(0, product.stock + stockAdjustment);
      await updateProductStock(id, newStock);
      
      // Update local state
      setProduct(prev => ({
        ...prev,
        stock: newStock
      }));
      
      // Reset adjustment
      setStockAdjustment(0);
      
      alert('Stock updated successfully!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Failed to update stock. Please try again.');
    }
  };
  
  // Handler for deleting product
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id);
      alert('Product deleted successfully!');
      navigate('/inventory');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <Link
                to="/inventory"
                className="text-sm font-medium text-red-700 hover:text-red-600"
              >
                &larr; Back to Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return <div>No product found</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to="/inventory"
            className="mr-4 text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/inventory/edit/${id}`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      {/* Product Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">SKU</span>
                <span className="text-sm font-medium text-gray-900">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Category</span>
                <span className="text-sm font-medium text-gray-900">{product.category}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Price</span>
                <span className="text-sm font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</span>
              </div>
              {product.costPrice && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Cost Price</span>
                  <span className="text-sm font-medium text-gray-900">${parseFloat(product.costPrice).toFixed(2)}</span>
                </div>
              )}
              {product.supplier && (
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">Supplier</span>
                  <span className="text-sm font-medium text-gray-900">{product.supplier}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.updatedAt ? new Date(product.updatedAt.toDate()).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
            
            {product.description && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            )}
          </div>
          
          {/* Stock Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{product.stock}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium
                  ${product.stock <= 0 
                    ? 'bg-red-100 text-red-800' 
                    : product.stock <= (product.reorderPoint || 10) 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                  {product.stock <= 0 
                    ? 'Out of Stock' 
                    : product.stock <= (product.reorderPoint || 10) 
                      ? 'Low Stock' 
                      : 'In Stock'}
                </div>
              </div>
              
              {product.reorderPoint && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Reorder Point</p>
                  <p className="text-lg font-medium text-gray-900">{product.reorderPoint}</p>
                </div>
              )}
              
              <div className="mt-6">
                <label htmlFor="stock-adjustment" className="block text-sm font-medium text-gray-700 mb-2">
                  Adjust Stock
                </label>
                <div className="flex space-x-2">
                  <div className="flex rounded-md shadow-sm flex-1">
                    <button
                      type="button"
                      onClick={() => setStockAdjustment(prev => Math.max(-product.stock, prev - 1))}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
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
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full flex-1 rounded-none sm:text-sm border-gray-300 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setStockAdjustment(prev => prev + 1)}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
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
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      stockAdjustment === 0 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : stockAdjustment > 0 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {stockAdjustment === 0 
                      ? 'No Change' 
                      : stockAdjustment > 0 
                        ? `Add ${stockAdjustment}` 
                        : `Remove ${Math.abs(stockAdjustment)}`}
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stockAdjustment !== 0 && (
                    <div>
                      New stock will be: <span className="font-medium">{product.stock + stockAdjustment}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Stock History</h4>
                <p className="text-xs text-gray-500">Stock history functionality coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this product? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;