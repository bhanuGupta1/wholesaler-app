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
export default Inventory;