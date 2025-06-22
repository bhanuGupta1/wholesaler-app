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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Feedback Management
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Review and respond to user feedback and suggestions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                }`}
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Export CSV
              </button>
              <button
                onClick={fetchFeedbacks}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  darkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50'
                    : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50'
                }`}
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { title: 'Total Feedback', value: stats.total, icon: MessageCircle, color: 'blue' },
            { title: 'Pending Review', value: stats.pending, icon: Clock, color: 'yellow' },
            { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'green' },
            { title: 'Average Rating', value: stats.avgRating, icon: Star, color: 'purple' },
            { title: 'High Priority', value: stats.highPriority, icon: AlertTriangle, color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  stat.color === 'green' ? 'bg-green-100 text-green-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="website">Website</option>
              <option value="delivery">Delivery</option>
              <option value="billing">Billing</option>
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="1-2">1-2 Stars</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="createdAt">Date</option>
                  <option value="rating">Rating</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className={`px-2 py-1 rounded ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing {filteredFeedbacks.length} of {feedbacks.length} feedback items
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredFeedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {feedback.userName || 'Anonymous'}
                        </span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({feedback.userEmail})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (feedback.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : darkMode ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {feedback.rating || 0}/5
                        </span>
                      </div>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status || 'pending'}
                      </span>

                      <span className={`text-sm font-medium ${getPriorityColor(feedback.priority)}`}>
                        <Flag className="h-3 w-3 inline mr-1" />
                        {feedback.priority || 'medium'}
                      </span>

                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feedback.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <Tag className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feedback.category || 'general'}
                      </span>
                    </div>

                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feedback.message}
                    </p>

                    {feedback.adminResponse && (
                      <div className={`p-4 rounded-lg border-l-4 ${
                        darkMode 
                          ? 'bg-blue-900/20 border-blue-400' 
                          : 'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Admin Response by {feedback.adminResponseBy}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-500'}`}>
                            {formatDate(feedback.adminResponseAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                          {feedback.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!feedback.adminResponse && (
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowResponseModal(true);
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Reply className="h-3 w-3 mr-1 inline" />
                        Respond
                      </button>
                    )}

                    <select
                      value={feedback.status || 'pending'}
                      onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                      disabled={processing}
                      className={`px-2 py-1 rounded text-xs border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      onClick={() => deleteFeedback(feedback.id)}
                      disabled={processing}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        darkMode
                          ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredFeedbacks.length === 0 && (
            <div className={`text-center py-12 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-lg border`}>
              <MessageCircle className={`mx-auto h-12 w-12 mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No feedback found
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || Object.values(filters).some(f => f !== 'all') 
                  ? 'Try adjusting your search or filters'
                  : 'No feedback has been submitted yet'}
              </p>
            </div>
          )}
        </div>

        {/* Admin Response Modal */}
        <AnimatePresence>
          {showResponseModal && selectedFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowResponseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Respond to Feedback
                  </h3>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    ✕
                  </button>
                </div>

                <div className={`p-4 rounded-lg mb-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedFeedback.userName} ({selectedFeedback.userEmail})
                    </span>
                  </div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedFeedback.title}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedFeedback.message}
                  </p>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={6}
                    placeholder="Type your response to the user..."
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendAdminResponse}
                    disabled={!responseText.trim() || processing}
                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {processing ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminFeedback;