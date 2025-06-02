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

export default Inventory;