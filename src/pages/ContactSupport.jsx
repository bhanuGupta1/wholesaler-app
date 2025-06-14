import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaComments, FaPaperPlane, FaUser, FaRobot, FaPaperclip, FaTimes, FaFileAlt } from 'react-icons/fa';

const ContactSupport = () => {
  const [darkMode] = useState(false); // Will be connected to your theme context
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [tickets, setTickets] = useState([
    {
      id: 'TICK-001',
      subject: 'Unable to upload CSV file',
      status: 'open',
      priority: 'high',
      created: '2025-06-10',
      lastUpdate: '2025-06-12'
    },
    {
      id: 'TICK-002',
      subject: 'Question about user roles',
      status: 'resolved',
      priority: 'medium',
      created: '2025-06-08',
      lastUpdate: '2025-06-09'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setFormErrors(prev => ({
          ...prev,
          attachments: `File "${file.name}" is too large. Maximum size is 10MB.`
        }));
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          attachments: `File type "${file.type}" is not supported.`
        }));
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
      setFormErrors(prev => ({ ...prev, attachments: '' }));
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual form submission logic with file uploads
      console.log('Form submitted:', { ...formData, attachments });
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        priority: 'medium',
        message: ''
      });
      setAttachments([]);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
      
    } catch (error) {
      setFormErrors({ submit: 'Failed to submit support ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: 'bot',
        message: getBotResponse(newMessage),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('place')) {
      return "To place an order, go to the Orders section and click 'Create New Order'. You'll need to fill in customer information and select products.";
    } else if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return "For inventory management, navigate to the Inventory section where you can add, edit, or delete products and manage stock levels.";
    } else if (lowerMessage.includes('account') || lowerMessage.includes('login')) {
      return "You can browse as a guest or create an account for full access. Account creation is free and gives you complete access to all features.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! You can also check our Help Center for detailed guides or submit a support ticket for personalized assistance.";
    } else {
      return "Thanks for your message! For detailed assistance, please check our Help Center or submit a support ticket, and our team will get back to you.";
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Contact Support
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get in touch with our support team for personalized assistance
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaPhone className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Phone Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
              Call us directly
            </p>
            <a href="tel:+6495551234" className="text-indigo-600 hover:text-indigo-800 font-medium">
              +64 9 555 1234
            </a>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaEnvelope className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Email Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-2`}>
              Send us a message
            </p>
            <a href="mailto:support@megawholesaler.co.nz" className="text-indigo-600 hover:text-indigo-800 font-medium">
              support@megawholesaler.co.nz
            </a>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaClock className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Business Hours
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Mon-Fri: 9AM-6PM<br />
              Sat: 10AM-4PM<br />
              Sun: Closed
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 text-center hover:shadow-xl transition-shadow`}>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mx-auto mb-4">
              <FaMapMarkerAlt className="text-indigo-600 text-xl" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Location
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Auckland, New Zealand<br />
              CBD Office
            </p>
          </div>
        </div>

        {/* Emergency Support Section */}
        <div className="mb-12">
          <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl p-6`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">🚨</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>
                  Emergency Support
                </h3>
                <p className={`${darkMode ? 'text-red-200' : 'text-red-700'} mb-4`}>
                  For critical system outages, security incidents, or urgent business-impacting issues that require immediate attention.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`${darkMode ? 'bg-red-800/30' : 'bg-red-100'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                      Emergency Hotline
                    </h4>
                    <a 
                      href="tel:+6494000911"
                      className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-600'} hover:underline`}
                    >
                      +64 9 400 0911
                    </a>
                    <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'} mt-1`}>
                      24/7 Emergency Line
                    </p>
                  </div>

                  <div className={`${darkMode ? 'bg-red-800/30' : 'bg-red-100'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                      Critical Email
                    </h4>
                    <a 
                      href="mailto:emergency@megawholesaler.co.nz"
                      className={`text-sm font-bold ${darkMode ? 'text-red-300' : 'text-red-600'} hover:underline break-all`}
                    >
                      emergency@megawholesaler.co.nz
                    </a>
                    <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'} mt-1`}>
                      Monitored 24/7
                    </p>
                  </div>

                  <div className={`${darkMode ? 'bg-red-800/30' : 'bg-red-100'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                      Response Time
                    </h4>
                    <p className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      &lt; 15 minutes
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'} mt-1`}>
                      Guaranteed response
                    </p>
                  </div>
                </div>

                <div className={`mt-4 p-3 ${darkMode ? 'bg-red-800/20' : 'bg-red-100'} rounded-lg`}>
                  <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                    <strong>What qualifies as emergency:</strong> System-wide outages, security breaches, data loss, payment processing failures, or any issue preventing critical business operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Tracking Section */}
        <div className="mb-12">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Your Support Tickets
            </h2>
            
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {ticket.id}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                          <span className={`text-sm font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} Priority
                          </span>
                        </div>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                          {ticket.subject}
                        </h3>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-x-4`}>
                          <span>Created: {ticket.created}</span>
                          <span>Last Update: {ticket.lastUpdate}</span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  No support tickets yet.
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Submit a support request below to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Send us a Message
              </h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">✓</div>
                    <div>
                      <h3 className="text-green-800 font-medium">Support ticket submitted successfully!</h3>
                      <p className="text-green-700 text-sm">We'll get back to you within our response time guidelines.</p>
                    </div>
                  </div>
                </div>
              )}

              {formErrors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3">⚠</div>
                    <div>
                      <h3 className="text-red-800 font-medium">Submission failed</h3>
                      <p className="text-red-700 text-sm">{formErrors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                        formErrors.name 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
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
                        formErrors.email 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
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
                        formErrors.subject 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Brief description of your issue"
                    />
                    {formErrors.subject && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
                    )}
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
                      formErrors.message 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                  {formErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
                  )}
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
                        Supported: Images, PDF, Word documents (Max 10MB each, 5 files total)
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

                    {/* Display attached files */}
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
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className={`p-1 rounded-full hover:bg-red-100 transition-colors ${
                                darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formErrors.attachments && (
                      <p className="text-sm text-red-600">{formErrors.attachments}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
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
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Support Options Sidebar */}
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Need Immediate Help?
              </h3>
              <div className="space-y-4">
                <a
                  href="tel:+6495551234"
                  className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <FaPhone className="text-indigo-600 mr-3" />
                  <span className="text-indigo-700 font-medium">Call Now</span>
                </a>
                <a
                  href="mailto:support@megawholesaler.co.nz"
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FaEnvelope className="text-green-600 mr-3" />
                  <span className="text-green-700 font-medium">Email Us</span>
                </a>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Response Times
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Urgent:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>1-2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>High:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>4-6 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Medium:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Low:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>48 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          {!showLiveChat ? (
            <button
              onClick={() => setShowLiveChat(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <FaComments className="text-xl" />
            </button>
          ) : (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl w-80 h-96 flex flex-col`}>
              {/* Chat Header */}
              <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center">
                  <FaComments className="mr-2" />
                  <span className="font-medium">Live Chat</span>
                </div>
                <button
                  onClick={() => setShowLiveChat(false)}
                  className="text-white hover:text-gray-200"
                >
                  ×
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;