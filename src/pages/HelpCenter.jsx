import React, { useState, useMemo } from 'react';
import { FaQuestionCircle, FaBook, FaVideo, FaDownload, FaSearch, FaTimes } from 'react-icons/fa';

const HelpCenter = () => {
  const [darkMode] = useState(false); // Will be connected to your theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('faq');

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
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
                  Frequently Asked Questions
                </h2>
                
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-6">
                    {filteredFAQs.map((faq, index) => (
                      <div key={faq.id} className={`${index < filteredFAQs.length - 1 ? `border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-6` : ''}`}>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                          {faq.question}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {faq.answer}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {faq.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs rounded-full ${
                                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
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
                      <div key={article.id} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {article.category}
                          </span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {article.readTime}
                          </span>
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