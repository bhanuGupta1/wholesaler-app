import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // State management
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Products, 2: Customer Info, 3: Review & Payment

  // User role detection
  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.email?.includes('admin')) return 'admin';
    if (user.email?.includes('business')) return 'business';
    return 'customer';
  };

  const userRole = getUserRole();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(product => product.stock > 0); // Only show in-stock products
      
      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  // Add product to order
  const addProductToOrder = (product, quantity) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex > -1) {
      // Update existing product quantity
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = Math.min(
        updated[existingIndex].quantity + quantity,
        product.stock
      );
      setSelectedProducts(updated);
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, {
        ...product,
        quantity: Math.min(quantity, product.stock)
      }]);
    }
  };

  // Remove product from order
  const removeProductFromOrder = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // Update product quantity in order
  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    const updated = selectedProducts.map(p => 
      p.id === productId 
        ? { ...p, quantity: Math.min(newQuantity, product.stock) }
        : p
    );
    setSelectedProducts(updated);
  };

  // Calculate pricing based on user role
  const calculatePricing = () => {
    let subtotal = 0;
    let discount = 0;
    let tax = 0;

    // Calculate subtotal
    selectedProducts.forEach(product => {
      subtotal += product.price * product.quantity;
    });

    // Apply business discount (15% off)
    if (userRole === 'business') {
      discount = subtotal * 0.15;
    }

    // Apply tax for customers (10%)
    if (userRole === 'customer') {
      tax = (subtotal - discount) * 0.10;
    }

    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  // Handle customer info changes
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

