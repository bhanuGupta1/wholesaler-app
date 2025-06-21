// src/pages/admin/AdminSupportTickets.jsx - Complete Support Tickets Management
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
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Tag,
  Flag,
  Reply,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Download,
  MessageSquare,
  Headphones,
  FileText,
  ArrowUpRight
} from 'lucide-react';

const AdminSupportTickets = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    dateRange: '30d'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch all support tickets
  const fetchSupportTickets = async () => {
    try {
      setLoading(true);
      const ticketsQuery = query(
        collection(db, 'supportTickets'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ticketsQuery);
      const ticketData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt)
      }));
      
      setTickets(ticketData);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      // Search filter
      const matchesSearch = searchTerm.trim() === '' || 
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || ticket.status === filters.status;

      // Category filter  
      const matchesCategory = filters.category === 'all' || ticket.category === filters.category;

      // Priority filter
      const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;

      // Date range filter
      const now = new Date();
      const ticketDate = ticket.createdAt;
      let matchesDate = true;
      
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange.replace('d', ''));
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        matchesDate = ticketDate >= cutoff;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
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
  }, [tickets, searchTerm, filters, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const highPriority = tickets.filter(t => t.priority === 'high').length;

    // Calculate average response time (in hours)
    const respondedTickets = tickets.filter(t => t.responses && t.responses.length > 0);
    const avgResponseTime = respondedTickets.length > 0 
      ? respondedTickets.reduce((sum, ticket) => {
          const firstResponse = ticket.responses[0];
          const responseTime = (firstResponse.createdAt - ticket.createdAt) / (1000 * 60 * 60); // hours
          return sum + responseTime;
        }, 0) / respondedTickets.length
      : 0;

    return { 
      total, 
      open, 
      inProgress, 
      resolved, 
      closed, 
      highPriority,
      avgResponseTime: avgResponseTime.toFixed(1)
    };
  }, [tickets]);

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setProcessing(true);
      const ticketRef = doc(db, 'supportTickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.email
      });

      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, status: newStatus, updatedAt: new Date(), lastUpdatedBy: user.email }
          : t
      ));
    } catch (error) {
      console.error('Error updating ticket status:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Add response to ticket
  const addTicketResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    try {
      setProcessing(true);
      const ticketRef = doc(db, 'supportTickets', selectedTicket.id);
      
      const response = {
        message: responseMessage,
        respondedBy: user.email,
        respondedAt: serverTimestamp(),
        type: 'admin_response'
      };

      // Get current responses or initialize empty array
      const currentResponses = selectedTicket.responses || [];
      const updatedResponses = [...currentResponses, response];

      await updateDoc(ticketRef, {
        responses: updatedResponses,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.email
      });

      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { 
              ...t, 
              responses: updatedResponses,
              status: 'in_progress',
              updatedAt: new Date(),
              lastUpdatedBy: user.email
            }
          : t
      ));

      setShowResponseModal(false);
      setResponseMessage('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error adding ticket response:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Export tickets to CSV
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Date', 'User', 'Email', 'Subject', 'Category', 'Priority', 'Status', 'Message', 'Responses'];
    const csvContent = [
      headers.join(','),
      ...filteredTickets.map(ticket => [
        ticket.ticketId || ticket.id,
        ticket.createdAt?.toLocaleDateString() || 'N/A',
        `"${ticket.userName || 'Unknown'}"`,
        ticket.userEmail || 'N/A',
        `"${ticket.subject || ''}"`,
        ticket.category || 'general',
        ticket.priority || 'medium',
        ticket.status || 'open',
        `"${(ticket.message || '').replace(/"/g, '""')}"`,
        `"${(ticket.responses || []).length} responses"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `support-tickets-${new Date().toISOString().split('T')[0]}.csv`);
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
      case 'open': return darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100';
      case 'in_progress': return darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-100';
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Loading support tickets...</div>
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
                Support Tickets Management
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Manage and respond to user support requests and tickets
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
                onClick={fetchSupportTickets}
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

