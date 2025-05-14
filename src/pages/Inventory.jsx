// src/pages/Inventory.jsx - Simplified Version
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

const Inventory = () => {
<<<<<<< HEAD
  const { darkMode } = useTheme();
=======
  //State Mangement 
>>>>>>> 5cb0420 (Defined asynchronous function that load product data from Firestore.)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
<<<<<<< HEAD
=======
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


  // Available categories from our products
  const categories = ['Electronics', 'Office Supplies', 'Furniture', 'Kitchen', 'Clothing'];
>>>>>>> 5cb0420 (Defined asynchronous function that load product data from Firestore.)

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

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
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
      <h1 className="text-3xl font-bold mb-8">Inventory</h1>
      
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
                      <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
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
                      <div className="ml-4">
                        <div className="text-sm font-medium">{product.name}</div>
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
                          ? 'bg-red-100 text-red-800' 
                          : product.stock <= 20 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock || 0}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleDelete(product.id)}
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
      )}
    </div>
  );
};

export default Inventory;