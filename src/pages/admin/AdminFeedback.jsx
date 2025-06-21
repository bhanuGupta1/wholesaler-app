// src/pages/admin/AdminFeedback.jsx - Complete Feedback Management Dashboard
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Mail,
  User,
  Calendar,
  Tag,
  Flag,
  Reply,
  Trash2,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';

const AdminFeedback = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    rating: 'all',
    dateRange: '30d'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch all feedback from Firebase
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const feedbackQuery = query(
        collection(db, 'feedbacks'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(feedbackQuery);
      const feedbackData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));
      
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter and sort feedbacks
  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter(feedback => {
      // Search filter
      const matchesSearch = searchTerm.trim() === '' || 
        feedback.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || feedback.status === filters.status;

      // Category filter  
      const matchesCategory = filters.category === 'all' || feedback.category === filters.category;

      // Priority filter
      const matchesPriority = filters.priority === 'all' || feedback.priority === filters.priority;

      // Rating filter
      const matchesRating = filters.rating === 'all' || 
        (filters.rating === '5' && feedback.rating === 5) ||
        (filters.rating === '4' && feedback.rating === 4) ||
        (filters.rating === '3' && feedback.rating === 3) ||
        (filters.rating === '1-2' && feedback.rating <= 2);

      // Date range filter
      const now = new Date();
      const feedbackDate = feedback.createdAt;
      let matchesDate = true;
      
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange.replace('d', ''));
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        matchesDate = feedbackDate >= cutoff;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesRating && matchesDate;
    });

