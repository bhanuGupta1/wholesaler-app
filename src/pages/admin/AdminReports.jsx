// src/pages/admin/AdminReports.jsx - Complete Reports Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Filter,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const AdminReports = () => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    users: [],
    orders: [],
    products: [],
    analytics: {}
  });
  const [dateRange, setDateRange] = useState('30d');
  const [selectedReports, setSelectedReports] = useState(new Set());

  // Fetch all data for reports
  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [usersSnapshot, ordersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products'))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

