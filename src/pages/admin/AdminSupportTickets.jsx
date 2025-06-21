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
  
