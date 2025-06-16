import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaComments, FaPaperPlane, FaUser, FaRobot, FaPaperclip, FaTimes, FaFileAlt, FaHistory, FaQuestionCircle, FaExclamationTriangle, FaCheckCircle, FaHeadset, FaSearch, FaBell } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const ContactSupport = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Main States
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Live Chat States
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: `Hello ${user?.displayName || 'there'}! I'm here to help you with any questions about our platform.`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Support Tickets (Mock Data - would come from API)
  const [tickets] = useState([
    {
      id: 'TICK-2024-001',
      subject: 'Login Issues with New Account',
      category: 'account',
      status: 'resolved',
      priority: 'high',
      created: '2024-06-10',
      lastUpdate: '2024-06-12',
      description: 'Unable to login after creating new account'
    },
    {
      id: 'TICK-2024-002',
      subject: 'Question about Order Process',
      category: 'orders',
      status: 'in-progress',
      priority: 'medium',
      created: '2024-06-14',
      lastUpdate: '2024-06-15',
      description: 'Need help understanding the order workflow'
    }
  ]);

  // Quick Issue Categories
  const issueCategories = [
    { id: 'account', label: 'Account & Login', icon: '👤', color: 'blue' },
    { id: 'orders', label: 'Orders & Billing', icon: '📦', color: 'green' },
    { id: 'inventory', label: 'Inventory Management', icon: '📊', color: 'purple' },
    { id: 'technical', label: 'Technical Issues', icon: '⚙️', color: 'red' },
    { id: 'general', label: 'General Questions', icon: '❓', color: 'gray' }
  ];

  // FAQ for User's Issues
  const userFAQs = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click 'Forgot Password'. Enter your email and follow the instructions.",
      category: 'account'
    },
    {
      question: "Why can't I see all products in the catalog?",
      answer: "Product visibility depends on your account type and permissions. Contact your administrator for access.",
      category: 'inventory'
    },
    {
      question: "How do I track my order status?",
      answer: "Visit the Orders section in your dashboard to see real-time order status and tracking information.",
      category: 'orders'
    },
    {
      question: "What file formats are supported for product uploads?",
      answer: "We support CSV files for bulk uploads and JPG/PNG images for product photos.",
      category: 'technical'
    }
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Support ticket submitted:', { ...formData, attachments, user: user?.email });
    setShowSuccess(true);
    setFormData({
      name: user?.displayName || '',
      email: user?.email || '',
      subject: '',
      category: 'general',
      priority: 'medium',
      message: ''
    });
    setAttachments([]);
    setIsSubmitting(false);

    setTimeout(() => setShowSuccess(false), 5000);
  };

  // Chat Handlers
  const sendChatMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: chatMessages.length + 2,
        type: 'bot',
        message: getBotResponse(newMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      return "I can help you with order-related questions! You can check your order status in the Orders section of your dashboard. Would you like me to guide you there?";
    } else if (lowerMessage.includes('password') || lowerMessage.includes('login')) {
      return "For login issues, try resetting your password from the login page. If you're still having trouble, I can escalate this to our technical team.";
    } else if (lowerMessage.includes('inventory') || lowerMessage.includes('product')) {
      return "For inventory questions, check your permissions with your account administrator. Different user roles have different access levels to products and inventory.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! You can also browse our Help Center for detailed guides, or submit a support ticket for personalized assistance from our team.";
    } else {
      return "Thanks for your message! For complex issues, I recommend submitting a support ticket so our team can give you detailed assistance. Is there anything specific I can help you with right now?";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with User Welcome */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Support Center
          </h1>
          {user && (
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Welcome back, {user.displayName || user.email}!
            </p>
          )}
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            How can we help you today?
          </p>
        </div>

        {/* Quick Contact Bar */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <FaPhone className="text-indigo-600 text-xl" />
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Phone Support</p>
                <a href="tel:+6495551234" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  +64 9 555 1234
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-indigo-600 text-xl" />
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Support</p>
                <a href="mailto:support@megawholesaler.co.nz" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                  support@megawholesaler.co.nz
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaClock className="text-indigo-600 text-xl" />
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Business Hours</p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  Mon-Fri: 9AM-6PM
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaHeadset className="text-indigo-600 text-xl" />
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Chat</p>
                <button 
                  onClick={() => setShowLiveChat(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md mb-8`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'contact', label: 'Submit Ticket', icon: FaEnvelope },
              { id: 'tickets', label: 'My Tickets', icon: FaHistory },
              { id: 'faq', label: 'Quick Help', icon: FaQuestionCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : darkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {/* Submit Ticket Tab */}
            {activeTab === 'contact' && (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Submit Support Ticket
                </h2>

                {showSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-600 mr-3 text-xl" />
                      <div>
                        <h3 className="text-green-800 font-medium">Ticket submitted successfully!</h3>
                        <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Issue Categories */}
                <div className="mb-6">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    What do you need help with?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {issueCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                        className={`p-4 rounded-lg border text-center transition-all hover:shadow-md ${
                          formData.category === category.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : darkMode
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                              : 'border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className={`text-sm font-medium ${
                          formData.category === category.id
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {category.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Please describe your issue in detail..."
                    ></textarea>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Attachments (Optional)
                    </label>
                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          darkMode 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700 hover:bg-gray-600' 
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <FaPaperclip className={`mx-auto mb-2 text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Click to attach files or drag and drop
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          Max 10MB each, 5 files total
                        </p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                        className="hidden"
                      />

                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <FaFileAlt className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <div>
                                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {file.name}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className={`p-1 rounded-full transition-colors ${
                                  darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-500 hover:text-red-600 hover:bg-red-100'
                                }`}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* My Tickets Tab */}
            {activeTab === 'tickets' && (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Your Support Tickets
                </h2>
                
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.id}
                            </h3>
                            <span className={`px-3 py-1 text-xs rounded-full border font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                            <span className={`text-sm font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority} Priority
                            </span>
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 md:mt-0`}>
                            Created: {ticket.created}
                          </div>
                        </div>
                        
                        <h4 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                          {ticket.subject}
                        </h4>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                          {ticket.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Last updated: {ticket.lastUpdate}
                          </span>
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaHistory className={`mx-auto text-6xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      No tickets yet
                    </h3>
                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
                      You haven't submitted any support tickets.
                    </p>
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Submit Your First Ticket
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                  Quick Help & FAQ
                </h2>
                
                <div className="space-y-4">
                  {userFAQs.map((faq, index) => (
                    <div key={index} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6`}>
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                        {faq.question}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {faq.answer}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {faq.category}
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          Still need help? Contact us →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Can't find what you're looking for?
                  </p>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium mr-4"
                  >
                    Submit a Ticket
                  </button>
                  <button
                    onClick={() => setShowLiveChat(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Start Live Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Widget */}
        {showLiveChat && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl w-80 h-96 flex flex-col`}>
              {/* Chat Header */}
              <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center">
                  <FaComments className="mr-2" />
                  <span className="font-medium">Live Support</span>
                  <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </div>
                <button
                  onClick={() => setShowLiveChat(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : darkMode
                          ? 'bg-gray-700 text-gray-100'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {msg.type === 'bot' && (
                          <FaRobot className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                        {msg.type === 'user' && (
                          <FaUser className="mt-1 text-white" />
                        )}
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`max-w-xs p-3 rounded-lg ${
                      darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <FaRobot className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type your message..."
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button
                    onClick={sendChatMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Live Chat Button */}
        {!showLiveChat && (
          <button
            onClick={() => setShowLiveChat(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105 z-50"
          >
            <FaComments className="text-xl" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </button>
        )}

      </div>
    </div>
  );
};

export default ContactSupport;