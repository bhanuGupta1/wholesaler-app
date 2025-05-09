// src/pages/Inventory.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode } = useTheme();

  // Mock data for demonstration
  const mockProducts = [
    { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 24.99, stock: 15, sku: 'E-WM-001' },
    { id: 2, name: 'USB Flash Drive 32GB', category: 'Electronics', price: 12.99, stock: 4, sku: 'E-USB-032' },
    { id: 3, name: 'Mechanical Keyboard', category: 'Electronics', price: 69.99, stock: 8, sku: 'E-KB-001' },
    { id: 4, name: 'Office Desk', category: 'Furniture', price: 199.99, stock: 3, sku: 'F-DSK-001' },
    { id: 5, name: 'Ergonomic Chair', category: 'Furniture', price: 149.99, stock: 6, sku: 'F-CHR-002' },
    { id: 6, name: 'Notebook Pack (12)', category: 'Stationery', price: 18.99, stock: 24, sku: 'S-NB-012' },
    { id: 7, name: 'Ballpoint Pens (24)', category: 'Stationery', price: 8.99, stock: 42, sku: 'S-BP-024' },
    { id: 8, name: 'LED Monitor 24"', category: 'Electronics', price: 159.99, stock: 2, sku: 'E-MON-024' },
  ];

  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter products based on filter and search term
  const filteredProducts = products.filter(product => {
    // Filter by stock level
    if (filter === 'low_stock' && product.stock > 5) return false;
    if (filter === 'out_of_stock' && product.stock > 0) return false;
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const handleAddProduct = () => {
    // Implement add product functionality
    alert('Add product feature will be implemented by Sahib');
  };

  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Inventory Management
            </h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Manage your product inventory
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button 
              onClick={handleAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="mt-4">
          <ol className={`flex items-center space-x-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <li>
              <a href="/" className="hover:text-indigo-600">Home</a>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Inventory</span>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Filters and Search */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4 md:mb-0">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Products
          </button>
          <button 
            onClick={() => setFilter('low_stock')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'low_stock' 
                ? 'bg-yellow-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Low Stock
          </button>
          <button 
            onClick={() => setFilter('out_of_stock')} 
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'out_of_stock' 
                ? 'bg-red-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Out of Stock
          </button>
        </div>
        
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <div className="absolute left-3 top-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className={`overflow-hidden rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Product</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Category</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>SKU</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Price</th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Stock</th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-md flex-shrink-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {product.category === 'Electronics' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {product.category === 'Furniture' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                          )}
                          {product.category === 'Stationery' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.category === 'Electronics' 
                          ? darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' 
                          : product.category === 'Furniture' 
                            ? darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-100 text-amber-800'
                            : darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {product.sku}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                          product.stock > 5 
                            ? darkMode ? 'bg-green-400' : 'bg-green-500' 
                            : product.stock > 0 
                              ? darkMode ? 'bg-yellow-400' : 'bg-yellow-500' 
                              : darkMode ? 'bg-red-400' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm ${
                          product.stock > 5 
                            ? darkMode ? 'text-green-400' : 'text-green-700' 
                            : product.stock > 0 
                              ? darkMode ? 'text-yellow-400' : 'text-yellow-700' 
                              : darkMode ? 'text-red-400' : 'text-red-700'
                        }`}>{product.stock} {product.stock === 1 ? 'unit' : 'units'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className={`text-indigo-600 hover:text-indigo-900 mr-3 ${darkMode ? 'hover:text-indigo-400' : ''}`}>Edit</button>
                      <button className={`text-red-600 hover:text-red-900 ${darkMode ? 'hover:text-red-400' : ''}`}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center h-64 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-lg">No products found.</p>
            <p className="mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className={`mt-4 flex items-center justify-between ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          <div className="flex items-center text-sm">
            <span>Showing <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products.length}</span> products</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled
            >
              Previous
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;