import React, { useState, useMemo } from 'react';
import { FaQuestionCircle, FaBook, FaVideo, FaDownload, FaSearch, FaTimes } from 'react-icons/fa';

const HelpCenter = () => {
  const [darkMode] = useState(false); // Will be connected to your theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

        {/* FAQ Section */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8 mb-12`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                How do I place an order?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Navigate to the Orders section, click "Create New Order", fill in customer information, 
                select products, and submit. Orders are processed immediately and stock is updated automatically.
              </p>
            </div>

            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                How do I manage inventory?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Go to the Inventory section to add, edit, or delete products. You can bulk upload products 
                via CSV, manage stock levels, and set low stock alerts.
              </p>
            </div>

            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                Can I use the system without creating an account?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes! We offer guest access where you can browse products and view orders in read-only mode. 
                However, creating an account unlocks full functionality including order management and inventory control.
              </p>
            </div>

            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                What's the difference between user roles?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Admin:</strong> Full access to all features including user management and system settings.<br />
                <strong>Manager:</strong> Can manage inventory, orders, and view analytics.<br />
                <strong>User:</strong> Can place orders and view assigned inventory.
              </p>
            </div>

            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                How do I switch between dark and light mode?
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Click the theme toggle button in the top navigation bar. Your preference will be saved 
                and applied automatically on future visits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;