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

