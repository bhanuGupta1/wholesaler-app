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

