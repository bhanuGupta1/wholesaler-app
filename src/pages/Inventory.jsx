// src/pages/Inventory.jsx - Updated with product detail links
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');


  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);
  // 

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
  // ===== END NEW =====

  // ===== NEW: Pagination =====
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
        // ===== NEW: Remove from selection if selected =====
        setSelectedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        // ===== END NEW =====
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  // Update stock
  const updateStock = async (id, newStock) => {
    try {
      await updateDoc(doc(db, 'products', id), { stock: newStock });
      setProducts(products.map(p => 
        p.id === id ? { ...p, stock: newStock } : p
      ));
    } catch (err) {
      alert('Failed to update stock');
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
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Link 
          to="/catalog"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
      
      {products.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8 text-center`}>
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Add some products to get started.
          </p>
        </div>
      ) : (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
          <table className="min-w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
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
              {products.map((product) => (
                <tr key={product.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* Make the image clickable to product details */}
                      <Link to={`/products/${product.id}`} className="flex-shrink-0 mr-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center hover:scale-105 transition-transform">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-10 w-10 rounded-md object-cover" 
                            />
                          ) : (
                            <span className="text-gray-400">📦</span>
                          )}
                        </div>
                      </Link>
                      <div>
                        {/* Make the product name clickable to product details */}
                        <Link 
                          to={`/products/${product.id}`}
                          className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
                    {product.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    ${Number(product.price || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock <= 5 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                          : product.stock <= 20 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {product.stock || 0}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      {/* View Details Button */}
                      <Link
                        to={`/products/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                      >
                        View
                      </Link>
                      <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                      {/* Edit Button (for inventory management) */}
                      <Link
                        to={`/inventory/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Edit
                      </Link>
                      <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
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
      )}
    </div>
  );
};

export default Inventory;