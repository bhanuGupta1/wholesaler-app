import React, { useState } from 'react';
import { FaQuestionCircle, FaBook, FaVideo, FaDownload, FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

const HelpCenter = () => {
  const [darkMode] = useState(false); // Connect to your theme context
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'Navigate to the Orders section, click "Create New Order", fill in customer information, select products, and submit. Orders are processed immediately.'
    },
    {
      id: 2,
      question: 'How do I manage inventory?',
      answer: 'Go to the Inventory section to add, edit, or delete products. You can bulk upload products via CSV and manage stock levels.'
    },
    {
      id: 3,
      question: 'Can I use the system without creating an account?',
      answer: 'Yes! We offer guest access where you can browse products and view orders in read-only mode. Creating an account unlocks full functionality.'
    },
    {
      id: 4,
      question: 'What are the different user roles?',
      answer: 'Admin: Full access to all features. Manager: Can manage inventory and orders. User: Can place orders and view assigned inventory.'
    },
    {
      id: 5,
      question: 'How do I switch between dark and light mode?',
      answer: 'Click the theme toggle button in the top navigation bar. Your preference will be saved automatically.'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
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
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaQuestionCircle className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>FAQ</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Common questions and answers
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaBook className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>User Guide</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Step-by-step tutorials
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaVideo className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Video Tutorials</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Watch and learn
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow`}>
            <FaDownload className="text-indigo-600 text-3xl mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Downloads</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Guides and resources
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <div className="relative max-w-md mx-auto">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-8 text-center`}>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className={`border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className={`w-full px-6 py-4 text-left flex justify-between items-center hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors rounded-lg`}
                >
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </h3>
                  <FaChevronDown 
                    className={`text-gray-400 transition-transform duration-200 ${
                      expandedFAQ === faq.id ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-600">
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-4`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No FAQs found. Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Link */}
        <div className="mt-12 text-center">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Still need help?
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact-support"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;