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

