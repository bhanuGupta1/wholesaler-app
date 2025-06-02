import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useAccessControl } from '../hooks/useAccessControl';

const Inventory = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    canAccessInventory, 
    canViewAllProducts, 
    canManageProducts, 
    isSeller, 
    isBuyer,
    isAdmin,
    isManager,
    userAccessLevel 
  } = useAccessControl();


  return <div>Inventory Component</div>;
};
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all');
const [stockFilter, setStockFilter] = useState('all');
const [selectedProduct, setSelectedProduct] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [stats, setStats] = useState({
  totalProducts: 0,
  lowStockCount: 0,
  totalValue: 0,
  averagePrice: 0
});
const [notification, setNotification] = useState(null);

const shouldShowAllProducts = user && (isAdmin || isManager);
const shouldShowSellerProducts = user && isSeller;

useEffect(() => {
  if (user && user.accountType === 'business' && user.businessType === 'buyer') {
    navigate('/business-dashboard', { replace: true });
  }
}, [user, navigate]);
const fetchProducts = async () => {
  if (!user) {
    setError('Please log in to view inventory');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    const productsRef = collection(db, 'products');
    let productsQuery;

    if (shouldShowAllProducts) {
      productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
    } else if (shouldShowSellerProducts) {
      productsQuery = query(productsRef, where('createdBy', '==', user.uid));
    } else {
      productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(productsQuery);
    const fetchedProducts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setProducts(fetchedProducts);
    setError(null);
  } catch (err) {
    console.error('Error fetching products:', err);
    setError('Failed to load inventory');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (user && !(user.accountType === 'business' && user.businessType === 'buyer')) {
    fetchProducts();
  }
}, [user]);

const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};

const handleDeleteProduct = async (productId, productName) => {
  if (!canManageProducts) {
    showNotification('You do not have permission to delete products', 'error');
    return;
  }

  if (isSeller) {
    const product = products.find(p => p.id === productId);
    if (product && product.createdBy !== user.uid) {
      showNotification('You can only delete products you created', 'error');
      return;
    }
  }

  const confirmDelete = window.confirm(`Delete "${productName}"?`);

  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, 'products', productId));
    setProducts(prev => prev.filter(p => p.id !== productId));
    showNotification('Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Failed to delete product', 'error');
  }
};

const filteredProducts = products.filter(product => {
  const matchesSearch = searchTerm.trim() === '' || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
  
  const matchesStock = stockFilter === 'all' || 
    (stockFilter === 'low' && product.stockQuantity <= 10) ||
    (stockFilter === 'out' && product.stockQuantity === 0) ||
    (stockFilter === 'in' && product.stockQuantity > 0);
  
  return matchesSearch && matchesCategory && matchesStock;
});

const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
// add product statistics calculation
useEffect(() => {
  if (products.length > 0) {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stockQuantity <= 10);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const averagePrice = totalProducts > 0 ? 
      products.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

    setStats({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalValue,
      averagePrice
    });
  }
}, [products]);
// 

if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <span className="ml-3 text-gray-600">Loading inventory...</span>
    </div>
  );
}

if (error) {
  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="text-center py-12">
        <div className="text-4xl mb-4 text-red-500">⚠</div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Inventory</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
} 
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {shouldShowAllProducts ? 'All Inventory' : shouldShowSellerProducts ? 'My Products' : 'Product Inventory'}
      </h1>
    </div>
    {canManageProducts && (
      <button
        onClick={() => navigate('/add-product')}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        Add Product
      </button>
    )}
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
    <p>Total Products</p>
    <p>{stats.totalProducts}</p>
  </div>
  {/* Other stat cards */}
</div>


<div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
    >
      <option value="all">All Categories</option>
      {categories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
    <select
      value={stockFilter}
      onChange={(e) => setStockFilter(e.target.value)}
    >
      <option value="all">All Stock</option>
      <option value="in">In Stock</option>
      <option value="low">Low Stock</option>
    </select>
    <button onClick={fetchProducts}>Refresh</button>
  </div>
</div>


<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden`}>
  <table className="w-full">
    <thead>
      <tr>
        <th>Product</th>
        <th>Category</th>
        <th>Price</th>
        <th>Stock</th>
        {shouldShowAllProducts && <th>Owner</th>}
        {canManageProducts && <th>Actions</th>}
      </tr>
    </thead>
    <tbody>
      {filteredProducts.map(product => (
        <tr key={product.id}>
          <td>{product.name}</td>
          <td>{product.category}</td>
          <td>${product.price?.toFixed(2)}</td>
          <td>{product.stockQuantity}</td>
          {shouldShowAllProducts && <td>{product.ownedBy?.slice(0, 8)}</td>}
          {canManageProducts && (
            <td>
              <button onClick={() => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}>
                Edit
              </button>
              <button onClick={() => handleDeleteProduct(product.id, product.name)}>
                Delete
              </button>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
</div>
export default Inventory;