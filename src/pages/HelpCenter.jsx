import React, { useState, useMemo } from 'react';
import { FaQuestionCircle, FaBook, FaVideo, FaDownload, FaSearch, FaTimes, FaChevronDown, FaEye, FaThumbsUp, FaThumbsDown, FaHome, FaChevronRight } from 'react-icons/fa';

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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Help Center
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Find answers to your questions and learn how to use our platform
          </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Help Center Stats */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              📊 Help Center Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Articles</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{knowledgeBase.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>FAQ Items</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faqData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categories</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>4</span>
              </div>
            </div>
          </div>

          {/* Most Popular FAQs */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              🔥 Popular FAQs
            </h3>
            <div className="space-y-3">
              {popularFAQs.map((faq, index) => (
                <div key={faq.id} className="flex items-start space-x-3">
                  <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
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
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
              📚 Popular Articles
            </h3>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <div key={article.id} className="flex items-start space-x-3">
                  <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
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
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search help articles, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
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
            >
              <option value="all">All Categories</option>
              <option value="orders">Orders</option>
              <option value="inventory">Inventory</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>
          
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
              </span>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
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
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'faq'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'knowledge'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Knowledge Base
            </button>
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
                                <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                                  👍 Yes
                                </button>
                                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                                  👎 No
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
                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer`}
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
                        <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
};

export default HelpCenter;