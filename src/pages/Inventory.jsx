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



export default Inventory;