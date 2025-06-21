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

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = aValue instanceof Date ? aValue : new Date(aValue);
        bValue = bValue instanceof Date ? bValue : new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [feedbacks, searchTerm, filters, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 'pending').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : '0.0';
    const highPriority = feedbacks.filter(f => f.priority === 'high').length;

    return { total, pending, resolved, avgRating, highPriority };
  }, [feedbacks]);

  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      setProcessing(true);
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      await updateDoc(feedbackRef, {
        status: newStatus,
        lastUpdated: new Date()
      });

      setFeedbacks(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, status: newStatus, lastUpdated: new Date() } : f
      ));
    } catch (error) {
      console.error('Error updating feedback status:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Send admin response
  const sendAdminResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      setProcessing(true);
      const feedbackRef = doc(db, 'feedbacks', selectedFeedback.id);
      await updateDoc(feedbackRef, {
        adminResponse: responseText,
        adminResponseAt: new Date(),
        adminResponseBy: user.email,
        status: 'reviewed'
      });

      setFeedbacks(prev => prev.map(f => 
        f.id === selectedFeedback.id 
          ? { 
              ...f, 
              adminResponse: responseText,
              adminResponseAt: new Date(),
              adminResponseBy: user.email,
              status: 'reviewed'
            } 
          : f
      ));

      setShowResponseModal(false);
      setResponseText('');
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error sending admin response:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Delete feedback
  const deleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Export feedbacks to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Title', 'Category', 'Priority', 'Rating', 'Status', 'Message', 'Admin Response'];
    const csvContent = [
      headers.join(','),
      ...filteredFeedbacks.map(feedback => [
        feedback.createdAt?.toLocaleDateString() || 'N/A',
        `"${feedback.userName || 'Anonymous'}"`,
        feedback.userEmail || 'N/A',
        `"${feedback.title || ''}"`,
        feedback.category || 'general',
        feedback.priority || 'medium',
        feedback.rating || 0,
        feedback.status || 'pending',
        `"${(feedback.message || '').replace(/"/g, '""')}"`,
        `"${(feedback.adminResponse || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-100';
      case 'resolved': return darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100';
      case 'closed': return darkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-100';
      default: return darkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Loading feedback data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
