import React, { useState, useMemo } from 'react';
import { FaQuestionCircle, FaBook, FaVideo, FaDownload, FaSearch, FaTimes, FaChevronDown, FaEye, FaThumbsUp, FaThumbsDown, FaHome, FaChevronRight, FaStar, FaRegStar, FaPrint, FaFileExport, FaFilePdf, FaKeyboard, FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const HelpCenter = () => {
  const [darkMode] = useState(false); // Will be connected to your theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFAQs, setExpandedFAQs] = useState(new Set([1])); // First FAQ expanded by default
  const [viewCounts, setViewCounts] = useState({
    faq: { 1: 245, 2: 189, 3: 167, 4: 134, 5: 98 },
    articles: { 1: 523, 2: 387, 3: 298, 4: 201 }
  });
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/', icon: FaHome },
    { label: 'Help Center', href: '/help-center', active: true }
  ]);
  const [feedbackRatings, setFeedbackRatings] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState({ rating: 0, comment: '', submitted: false });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    helpCenter: 'operational',
    search: 'operational',
    feedback: 'operational',
    lastUpdated: new Date().toISOString()
  });

  // Update breadcrumbs based on current state
  const updateBreadcrumbs = (tab, category = null, searchTerm = null) => {
    let newBreadcrumbs = [
      { label: 'Home', href: '/', icon: FaHome },
      { label: 'Help Center', href: '/help-center' }
    ];

    if (tab === 'faq') {
      newBreadcrumbs.push({ label: 'FAQ', active: true });
    } else if (tab === 'knowledge') {
      newBreadcrumbs.push({ label: 'Knowledge Base', active: true });
    }

    if (category && category !== 'all') {
      newBreadcrumbs.push({ 
        label: category.charAt(0).toUpperCase() + category.slice(1), 
        active: true 
      });
    }

    if (searchTerm) {
      newBreadcrumbs.push({ 
        label: `Search: "${searchTerm}"`, 
        active: true 
      });
    }

    setBreadcrumbs(newBreadcrumbs);
  };

  // Update breadcrumbs when tab, category, or search changes
  React.useEffect(() => {
    updateBreadcrumbs(activeTab, selectedCategory, searchQuery);
  }, [activeTab, selectedCategory, searchQuery]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      
      // Cmd/Ctrl + P to print
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        printPage();
      }
      
      // Cmd/Ctrl + E to export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        exportToText();
      }
      
      // Tab switching with numbers
      if (e.key === '1' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab('faq');
      }
      if (e.key === '2' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setActiveTab('knowledge');
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        clearSearch();
      }
      
      // ? to show keyboard shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      // Escape to close keyboard shortcuts modal
      if (e.key === 'Escape' && showKeyboardShortcuts) {
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, showKeyboardShortcuts]);

  const rateFAQHelpful = (faqId, helpful) => {
    setFeedbackRatings(prev => ({
      ...prev,
      [`faq-${faqId}`]: helpful
    }));
  };

  const rateArticleHelpful = (articleId, helpful) => {
    setFeedbackRatings(prev => ({
      ...prev,
      [`article-${articleId}`]: helpful
    }));
  };

  const submitGlobalFeedback = () => {
    setGlobalFeedback(prev => ({ ...prev, submitted: true }));
    addNotification('Thank you for your feedback! Your input helps us improve.', 'success');
    setTimeout(() => {
      setShowFeedbackForm(false);
      setGlobalFeedback({ rating: 0, comment: '', submitted: false });
    }, 2000);
  };

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return FaCheckCircle;
      case 'degraded': return FaExclamationTriangle;
      case 'down': return FaTimes;
      default: return FaInfoCircle;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return FaCheckCircle;
      case 'warning': return FaExclamationTriangle;
      case 'error': return FaTimes;
      default: return FaInfoCircle;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // Simulate system status checks
  React.useEffect(() => {
    const checkSystemStatus = () => {
      // Simulate random status checks
      const services = ['helpCenter', 'search', 'feedback'];
      const statuses = ['operational', 'operational', 'operational', 'degraded']; // Mostly operational
      
      setSystemStatus(prev => ({
        ...prev,
        [services[Math.floor(Math.random() * services.length)]]: statuses[Math.floor(Math.random() * statuses.length)],
        lastUpdated: new Date().toISOString()
      }));
    };

    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Add notifications for user actions
  React.useEffect(() => {
    if (searchQuery && filteredFAQs.length === 0 && filteredKnowledgeBase.length === 0) {
      addNotification(`No results found for "${searchQuery}". Try different keywords or check our popular content.`, 'warning', 8000);
    }
  }, [searchQuery, filteredFAQs.length, filteredKnowledgeBase.length]);

  const printPage = () => {
    window.print();
  };

  const exportToPDF = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    alert('PDF export functionality would be implemented here using a library like jsPDF');
  };

  const exportToText = () => {
    let content = `MEGA WHOLESALER HELP CENTER\n`;
    content += `============================\n\n`;
    
    if (activeTab === 'faq') {
      content += `FREQUENTLY ASKED QUESTIONS\n`;
      content += `=========================\n\n`;
      
      filteredFAQs.forEach((faq, index) => {
        content += `${index + 1}. ${faq.question}\n`;
        content += `${'-'.repeat(faq.question.length)}\n`;
        content += `${faq.answer}\n`;
        content += `Tags: ${faq.tags.join(', ')}\n\n`;
      });
    } else {
      content += `KNOWLEDGE BASE ARTICLES\n`;
      content += `======================\n\n`;
      
      filteredKnowledgeBase.forEach((article, index) => {
        content += `${index + 1}. ${article.title}\n`;
        content += `${'-'.repeat(article.title.length)}\n`;
        content += `Category: ${article.category}\n`;
        content += `Read Time: ${article.readTime}\n`;
        content += `Summary: ${article.summary}\n`;
        content += `Tags: ${article.tags.join(', ')}\n\n`;
      });
    }
    
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `Total items: ${activeTab === 'faq' ? filteredFAQs.length : filteredKnowledgeBase.length}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `help-center-${activeTab}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Popular content based on view counts
  const popularFAQs = faqData
    .map(faq => ({ ...faq, views: viewCounts.faq[faq.id] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const popularArticles = knowledgeBase
    .map(article => ({ ...article, views: viewCounts.articles[article.id] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  const totalViews = Object.values(viewCounts.faq).reduce((sum, count) => sum + count, 0) +
                   Object.values(viewCounts.articles).reduce((sum, count) => sum + count, 0);

  const toggleFAQ = (faqId) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
      // Track view when FAQ is expanded
      setViewCounts(prev => ({
        ...prev,
        faq: {
          ...prev.faq,
          [faqId]: (prev.faq[faqId] || 0) + 1
        }
      }));
    }
    setExpandedFAQs(newExpanded);
  };

  const trackArticleView = (articleId) => {
    setViewCounts(prev => ({
      ...prev,
      articles: {
        ...prev.articles,
        [articleId]: (prev.articles[articleId] || 0) + 1
      }
    }));
  };

  const expandAllFAQs = () => {
    setExpandedFAQs(new Set(filteredFAQs.map(faq => faq.id)));
  };

  const collapseAllFAQs = () => {
    setExpandedFAQs(new Set());
  };

  // Knowledge base articles
  const knowledgeBase = [
    {
      id: 1,
      title: 'Getting Started with Mega Wholesaler',
      category: 'general',
      summary: 'Learn the basics of using our platform for inventory and order management.',
      content: 'This comprehensive guide will walk you through...',
      tags: ['getting started', 'basics', 'tutorial'],
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Advanced Inventory Management',
      category: 'inventory',
      summary: 'Master advanced features for efficient inventory control.',
      content: 'Advanced inventory management techniques...',
      tags: ['inventory', 'advanced', 'management'],
      readTime: '12 min read'
    },
    {
      id: 3,
      title: 'Order Processing Best Practices',
      category: 'orders',
      summary: 'Optimize your order workflow for maximum efficiency.',
      content: 'Best practices for processing orders quickly...',
      tags: ['orders', 'workflow', 'best practices'],
      readTime: '8 min read'
    },
    {
      id: 4,
      title: 'Understanding User Roles and Permissions',
      category: 'account',
      summary: 'Learn about different user roles and their capabilities.',
      content: 'User roles and permissions explained...',
      tags: ['roles', 'permissions', 'users'],
      readTime: '6 min read'
    }
  ];

  // Filter knowledge base articles
  const filteredKnowledgeBase = useMemo(() => {
    return knowledgeBase.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // FAQ data with categories for filtering
  const faqData = [
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Navigate to the Orders section, click "Create New Order", fill in customer information, select products, and submit. Orders are processed immediately and stock is updated automatically.',
      tags: ['order', 'place', 'create', 'submit']
    },
    {
      id: 2,
      category: 'inventory',
      question: 'How do I manage inventory?',
      answer: 'Go to the Inventory section to add, edit, or delete products. You can bulk upload products via CSV, manage stock levels, and set low stock alerts.',
      tags: ['inventory', 'stock', 'products', 'manage', 'csv', 'upload']
    },
    {
      id: 3,
      category: 'account',
      question: 'Can I use the system without creating an account?',
      answer: 'Yes! We offer guest access where you can browse products and view orders in read-only mode. However, creating an account unlocks full functionality including order management and inventory control.',
      tags: ['guest', 'account', 'access', 'browse']
    },
    {
      id: 4,
      category: 'account',
      question: "What's the difference between user roles?",
      answer: 'Admin: Full access to all features including user management and system settings. Manager: Can manage inventory, orders, and view analytics. User: Can place orders and view assigned inventory.',
      tags: ['roles', 'admin', 'manager', 'user', 'permissions']
    },
    {
      id: 5,
      category: 'general',
      question: 'How do I switch between dark and light mode?',
      answer: 'Click the theme toggle button in the top navigation bar. Your preference will be saved and applied automatically on future visits.',
      tags: ['theme', 'dark', 'light', 'mode', 'toggle']
    }
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4 md:py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Help Center
          </h1>
          <p className={`text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Find answers to your questions and learn how to use our platform
          </p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border shadow-lg animate-slide-in ${
                    darkMode 
                      ? `bg-gray-800 border-gray-600 text-white`
                      : getNotificationColor(notification.type)
                  }`}
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`mt-0.5 ${
                      notification.type === 'success' ? 'text-green-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      notification.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Dismiss notification"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* System Status Bar */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  System Status
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                {Object.entries(systemStatus).filter(([key]) => key !== 'lastUpdated').map(([service, status]) => {
                  const Icon = getStatusIcon(status);
                  return (
                    <div key={service} className="flex items-center space-x-1">
                      <Icon className={`text-xs ${getStatusColor(status)}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                        {service.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Last updated: {new Date(systemStatus.lastUpdated).toLocaleTimeString()}
              </p>
              <button 
                onClick={() => addNotification('System status refreshed', 'info', 3000)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <FaChevronRight className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                )}
                <div className="flex items-center">
                  {crumb.icon && (
                    <crumb.icon className={`mr-1 text-xs ${
                      crumb.active 
                        ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  )}
                  {crumb.active ? (
                    <span className={`font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className={`hover:underline ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {crumb.label}
                    </a>
                  )}
                </div>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <FaQuestionCircle className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              FAQ
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Common questions and answers
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <FaBook className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              User Guide
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Step-by-step tutorials
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <FaVideo className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Video Tutorials
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Watch and learn
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <FaDownload className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Downloads
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Guides and resources
            </p>
          </div>
          </div>
        </div>

        {/* Analytics & Popular Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
          {/* Help Center Stats */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-4 md:p-6 order-3 xl:order-1`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 md:mb-4 flex items-center`}>
              📊 Help Center Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center">
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{knowledgeBase.length}</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Articles</div>
              </div>
              <div className="text-center">
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faqData.length}</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>FAQ Items</div>
              </div>
              <div className="text-center">
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalViews.toLocaleString()}</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</div>
              </div>
              <div className="text-center">
                <div className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>4</div>
                <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categories</div>
              </div>
            </div>
          </div>

          {/* Most Popular FAQs */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-4 md:p-6 order-1 xl:order-2`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 md:mb-4 flex items-center`}>
              🔥 Popular FAQs
            </h3>
            <div className="space-y-2 md:space-y-3">
              {popularFAQs.map((faq, index) => (
                <div key={faq.id} className="flex items-start space-x-2 md:space-x-3">
                  <span className={`text-xs md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                      {faq.question}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {faq.views} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Popular Articles */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-4 md:p-6 order-2 xl:order-3 md:col-span-2 xl:col-span-1`}>
            <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 md:mb-4 flex items-center`}>
              📚 Popular Articles
            </h3>
            <div className="space-y-2 md:space-y-3">
              {popularArticles.map((article, index) => (
                <div key={article.id} className="flex items-start space-x-2 md:space-x-3">
                  <span className={`text-xs md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs md:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                      {article.title}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {article.views} views
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 mb-8`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search help articles, FAQs, and guides... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                }`}
                aria-label="Search help center content"
                aria-describedby="search-description"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="orders">Orders</option>
              <option value="inventory">Inventory</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>

            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
              }`}
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (? key)"
            >
              <FaKeyboard className="mr-2" />
              Shortcuts
            </button>
          </div>
          
          <div id="search-description" className="sr-only">
            Use this search box to find help articles, FAQs, and guides. You can also use Ctrl+K to focus this field.
          </div>
          
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} role="status" aria-live="polite">
                Found {activeTab === 'faq' ? filteredFAQs.length : filteredKnowledgeBase.length} result{(activeTab === 'faq' ? filteredFAQs.length : filteredKnowledgeBase.length) !== 1 ? 's' : ''}
              </span>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  aria-label="Clear all filters"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

          )}
        </div>

        {/* Tab Navigation */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border mb-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('faq')}
                className={`py-2 px-4 text-center font-medium transition-colors rounded-l-lg ${
                  activeTab === 'faq'
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`py-2 px-4 text-center font-medium transition-colors rounded-r-lg ${
                  activeTab === 'knowledge'
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Knowledge Base
              </button>
            </div>

            {/* Export/Print Controls */}
            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <button
                onClick={printPage}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
                }`}
                title="Print this page"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
              
              <div className="relative group">
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <FaFileExport className="mr-2" />
                  Export
                  <FaChevronDown className="ml-1 text-xs" />
                </button>
                
                {/* Export Dropdown */}
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="py-2">
                    <button
                      onClick={exportToPDF}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                        darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FaFilePdf className="mr-2 text-red-500" />
                      Export as PDF
                    </button>
                    <button
                      onClick={exportToText}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                        darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FaFileAlt className="mr-2 text-gray-500" />
                      Export as Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'faq' ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Frequently Asked Questions
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={expandAllFAQs}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded border border-indigo-300 hover:border-indigo-400 transition-colors"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllFAQs}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded border border-indigo-300 hover:border-indigo-400 transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
                
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg overflow-hidden`}>
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className={`w-full px-6 py-4 text-left flex justify-between items-center hover:${darkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-colors`}
                        >
                          <div className="flex-1 pr-4">
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {faq.question}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                                <FaEye className="mr-1" />
                                {viewCounts.faq[faq.id] || 0} views
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {faq.category}
                              </span>
                            </div>
                          </div>
                          <FaChevronDown className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-transform duration-200 ${
                            expandedFAQs.has(faq.id) ? 'transform rotate-180' : ''
                          }`} />
                        </button>
                        
                        {expandedFAQs.has(faq.id) && (
                          <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="pt-4">
                              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                                {faq.answer}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Helpful buttons */}
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex items-center space-x-4">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Was this helpful?
                                </span>
                                <button 
                                  onClick={() => rateFAQHelpful(faq.id, true)}
                                  className={`text-sm font-medium flex items-center transition-colors ${
                                    feedbackRatings[`faq-${faq.id}`] === true
                                      ? 'text-green-600'
                                      : 'text-gray-500 hover:text-green-600'
                                  }`}
                                >
                                  <FaThumbsUp className="mr-1" /> 
                                  Yes {feedbackRatings[`faq-${faq.id}`] === true && '✓'}
                                </button>
                                <button 
                                  onClick={() => rateFAQHelpful(faq.id, false)}
                                  className={`text-sm font-medium flex items-center transition-colors ${
                                    feedbackRatings[`faq-${faq.id}`] === false
                                      ? 'text-red-600'
                                      : 'text-gray-500 hover:text-red-600'
                                  }`}
                                >
                                  <FaThumbsDown className="mr-1" /> 
                                  No {feedbackRatings[`faq-${faq.id}`] === false && '✓'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      No results found for your search.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear search and show all FAQs
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
                  Knowledge Base Articles
                </h2>
                
                {filteredKnowledgeBase.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredKnowledgeBase.map((article) => (
                      <div 
                        key={article.id} 
                        onClick={() => trackArticleView(article.id)}
                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer relative group`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {article.category}
                          </span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                              <FaEye className="mr-1" />
                              {viewCounts.articles[article.id] || 0}
                            </span>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {article.readTime}
                            </span>
                          </div>
                        </div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {article.title}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
                          {article.summary}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs rounded-full ${
                                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Article feedback */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Was this helpful?
                          </span>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                rateArticleHelpful(article.id, true);
                              }}
                              className={`text-xs transition-colors ${
                                feedbackRatings[`article-${article.id}`] === true
                                  ? 'text-green-600'
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                            >
                              <FaThumbsUp />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                rateArticleHelpful(article.id, false);
                              }}
                              className={`text-xs transition-colors ${
                                feedbackRatings[`article-${article.id}`] === false
                                  ? 'text-red-600'
                                  : 'text-gray-400 hover:text-red-600'
                              }`}
                            >
                              <FaThumbsDown />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      No articles found for your search.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear search and show all articles
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Guides Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8 mb-12`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
            User Guides & Tutorials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FaBook className="text-blue-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Getting Started
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Complete guide to setting up your account and navigating the platform for the first time.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Creating your account
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Dashboard overview
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Basic navigation
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FaBook className="text-green-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Inventory Management
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Learn how to add, edit, and manage your product inventory effectively.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Adding new products
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Bulk CSV upload
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Stock level management
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <FaBook className="text-purple-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Order Processing
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Master the order workflow from creation to fulfillment and invoice generation.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Creating orders
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Order status management
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Invoice generation
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <FaVideo className="text-orange-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Video Tutorials
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Watch step-by-step video guides for visual learners.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Platform overview (5 min)
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Inventory setup (8 min)
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Order workflow (12 min)
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <FaDownload className="text-red-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Download Resources
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Downloadable guides, templates, and cheat sheets for offline reference.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → CSV import template
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Quick reference guide
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → User manual (PDF)
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <FaQuestionCircle className="text-indigo-600" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Troubleshooting
                </h3>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Common issues and their solutions to help you resolve problems quickly.
              </p>
              <div className="space-y-2">
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Login issues
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Performance problems
                </a>
                <a href="#" className="block text-indigo-600 hover:text-indigo-800 text-sm">
                  → Data sync issues
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowKeyboardShortcuts(false)}>
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-slide-in`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="shortcuts-title"
              aria-modal="true"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 id="shortcuts-title" className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Close shortcuts modal"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Ctrl + K
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Print page</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Ctrl + P
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Export content</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Ctrl + E
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Switch to FAQ</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Ctrl + 1
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Switch to Knowledge Base</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Ctrl + 2
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Clear search</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    Escape
                  </kbd>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show shortcuts</span>
                  <kbd className={`px-2 py-1 text-sm rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    ?
                  </kbd>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Press <kbd className={`px-1 py-0.5 text-xs rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Escape</kbd> to close this dialog
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;

