import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaEnvelope, FaClock, FaMapMarkerAlt, FaComments, FaPaperPlane, FaUser, FaRobot, FaPaperclip, FaTimes, FaFileAlt, FaHistory, FaQuestionCircle, FaExclamationTriangle, FaCheckCircle, FaHeadset, FaSearch, FaBell } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

// FIREBASE IMPORTS
import { addDoc, collection, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

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

  // TICKETS STATES WITH BETTER ERROR HANDLING
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);

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

  // ENHANCED FETCH USER'S TICKETS WITH BETTER ERROR HANDLING
  useEffect(() => {
    if (activeTab === 'tickets' && user?.uid) {
      fetchUserTickets();
    }
  }, [activeTab, user?.uid]);

  const fetchUserTickets = async () => {
    // Check if user is authenticated
    if (!user || !user.uid) {
      setTicketsError('Please log in to view your tickets.');
      return;
    }

    try {
      setLoadingTickets(true);
      setTicketsError(null);
      
      console.log('Fetching tickets for user:', user.uid);

      // Test Firebase connection first
      try {
        const testQuery = query(
          collection(db, 'supportTickets'),
          limit(1)
        );
        await getDocs(testQuery);
        console.log('Firebase connection successful');
      } catch (connectionError) {
        console.error('Firebase connection failed:', connectionError);
        throw new Error('Unable to connect to database. Please check your internet connection.');
      }

      // Query tickets for current user with better error handling
      const ticketsRef = collection(db, 'supportTickets');
      const userTicketsQuery = query(
        ticketsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(userTicketsQuery);
      const userTickets = [];

      console.log(`Found ${querySnapshot.size} tickets for user ${user.uid}`);

      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          console.log('Processing ticket:', doc.id, data);
          
          userTickets.push({
            id: doc.id,
            ...data,
            // Handle different timestamp formats
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                      data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                      data.updatedAt ? new Date(data.updatedAt) : new Date()
          });
        } catch (docError) {
          console.error('Error processing document:', doc.id, docError);
        }
      });

      console.log('Final tickets array:', userTickets);
      setTickets(userTickets);

      // Show helpful message if no tickets found
      if (userTickets.length === 0) {
        console.log('No tickets found for user');
      }

    } catch (error) {
      console.error('Error fetching user tickets:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to load your tickets. ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to access this data. Please contact support.';
      } else if (error.code === 'failed-precondition') {
        errorMessage += 'Database index may be missing. Please contact support.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Service is temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or contact support if the problem persists.';
      }
      
      setTicketsError(errorMessage);
    } finally {
      setLoadingTickets(false);
    }
  };

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

  // ENHANCED SUBMIT WITH BETTER ERROR HANDLING AND LOGGING
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check authentication
    if (!user || !user.uid) {
      alert('Please log in to submit a support ticket.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate unique ticket ID
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      console.log('Creating ticket with ID:', ticketId);
      console.log('User data:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      });

      // Create ticket document for Firebase
      const ticketDoc = {
        ticketId,
        userId: user.uid,
        userEmail: user.email || 'unknown@example.com',
        userName: user.displayName || formData.name || 'Unknown User',
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        message: formData.message,
        status: 'open',
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'web_form'
      };

      console.log('Saving ticket document:', ticketDoc);

      // Save to Firebase with better error handling
      const docRef = await addDoc(collection(db, 'supportTickets'), ticketDoc);
      console.log('Ticket saved successfully with ID:', docRef.id);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
      });
      setAttachments([]);

      // Refresh tickets if on tickets tab
      if (activeTab === 'tickets') {
        console.log('Refreshing tickets list...');
        await fetchUserTickets();
      }

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Error saving ticket to Firebase:', error);
      
      let errorMessage = 'Failed to submit ticket. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to create tickets.';
      } else if (error.code === 'failed-precondition') {
        errorMessage += 'Database configuration error. Please contact support.';
      } else {
        errorMessage += 'Please try again or contact support directly.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendChatMessage = () => {
  if (newMessage.trim() === '') return;

  const userMessage = {
    id: Date.now() + Math.random(),
    type: 'user',
    message: newMessage,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, userMessage]);
  setNewMessage('');
  setIsTyping(true);

  const responseDelay = Math.random() * 1000 + 1000;
  setTimeout(() => {
    setIsTyping(false);
    const botResponse = {
      id: Date.now() + Math.random(),
      type: 'bot',
      message: getBotResponse(newMessage),
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botResponse]);
  }, responseDelay);
};

const getBotResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
    return "Hello! 👋 I'm your virtual assistant for the Wholesaler App. I'm here to help you with orders, payments, inventory, and any other questions you might have. How can I assist you today?";
  }
  
  // Affirmative responses
  if (lowerMessage.match(/^(yes|yeah|yep|ok|okay|sure|sounds good|that helps|thanks|thank you)$/)) {
    return "Great! I'm happy I could help. Is there anything else you'd like to know about using the Wholesaler App? I can assist with orders, payments, inventory management, or account settings.";
  }
  
  // Negative responses
  if (lowerMessage.match(/^(no|nope|not really|that's all)$/)) {
    return "No problem! Feel free to reach out anytime if you have questions. I'm always here to help make your wholesale experience smoother. Have a great day! 😊";
  }

  // How to place orders
  if (lowerMessage.includes('how to order') || lowerMessage.includes('place order') || lowerMessage.includes('make order')) {
    return `Here's how to place an order step by step:

📋 **Placing an Order:**
1. Go to **Products** or **Inventory** section
2. Browse or search for items you need
3. Click **Add to Cart** for each product
4. Set quantities in your cart
5. Click **Checkout** when ready
6. Fill in shipping and billing details
7. Review your order and confirm

💡 **Pro tip:** You can save frequently ordered items to your favorites for quicker reordering!

Would you like me to explain any specific step in more detail?`;
  }

  // Payment information
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('billing') || lowerMessage.includes('credit card')) {
    return `Here's everything about payments:

💳 **Payment Methods:**
• Credit/Debit Cards (Visa, MasterCard, Amex)
• Bank transfers
• Net payment terms (for approved accounts)
• PayPal (select accounts)

🔐 **Payment Process:**
1. During checkout, select your payment method
2. Enter payment details securely
3. Review charges and confirm
4. Receive instant confirmation

💰 **Billing Info:**
• Invoices are generated automatically
• Payment receipts sent via email
• Track payment status in your account
• Set up auto-payment for recurring orders

Need help with a specific payment issue?`;
  }

  // Shipping and delivery
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('tracking')) {
    return `Here's your shipping guide:

🚚 **Shipping Options:**
• Standard shipping (3-5 business days)
• Express shipping (1-2 business days)
• Overnight delivery (next business day)
• Bulk/freight shipping for large orders

📦 **Tracking Your Order:**
1. Check **My Orders** in your dashboard
2. Click on any order for tracking details
3. Receive tracking numbers via email
4. Real-time status updates

🏠 **Delivery Details:**
• Signature required for orders over $500
• Safe drop-off available
• Schedule delivery windows
• Special handling for fragile items

What would you like to know about your delivery?`;
  }

  // Account and login issues
  if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('account') || lowerMessage.includes('forgot')) {
    return `I can help with account issues:

🔑 **Login Problems:**
• Click "Forgot Password" on login page
• Check your email for reset link
• Use the temporary password provided
• Update to a new secure password

👤 **Account Management:**
• Update profile in Account Settings
• Manage shipping addresses
• Set payment preferences
• View order history

🛡️ **Security Tips:**
• Use strong, unique passwords
• Enable two-factor authentication
• Log out on shared devices
• Report suspicious activity immediately

Still having trouble accessing your account?`;
  }

  // Inventory and products
  if (lowerMessage.includes('inventory') || lowerMessage.includes('product') || lowerMessage.includes('stock') || lowerMessage.includes('catalog')) {
    return `Here's how to navigate our inventory:

📦 **Finding Products:**
• Use the search bar for specific items
• Filter by category, price, or brand
• Check product availability in real-time
• View detailed product specifications

📊 **Stock Information:**
• Green indicator = In stock
• Yellow indicator = Low stock
• Red indicator = Out of stock
• Get notified when items restock

🏷️ **Product Details:**
• High-resolution product images
• Wholesale pricing tiers
• Bulk discount information
• Technical specifications
• Customer reviews and ratings

Need help finding a specific product?`;
  }

  // Pricing and discounts
  if (lowerMessage.includes('price') || lowerMessage.includes('discount') || lowerMessage.includes('wholesale') || lowerMessage.includes('bulk')) {
    return `Let me explain our pricing structure:

💰 **Wholesale Pricing:**
• Tiered pricing based on quantity
• Volume discounts for bulk orders
• Special rates for verified businesses
• Seasonal promotional pricing

🎯 **Discount Programs:**
• First-time buyer discounts
• Loyalty program rewards
• Early payment discounts
• Referral bonuses

📈 **Bulk Benefits:**
• Higher quantities = better prices
• Free shipping on large orders
• Priority customer support
• Extended payment terms

Want to know about pricing for specific products?`;
  }

  // Returns and refunds
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange') || lowerMessage.includes('warranty')) {
    return `Our return policy is designed to be fair and simple:

↩️ **Return Process:**
• 30-day return window for most items
• Items must be unused and in original packaging
• Start return request in **My Orders**
• Print prepaid return label

💰 **Refunds:**
• Full refund for defective items
• Return shipping covered for our errors
• Refunds processed within 3-5 business days
• Original payment method credited

🔄 **Exchanges:**
• Exchange for different size/color
• Upgrade to different model (pay difference)
• Quick exchange process available

🛡️ **Warranty Coverage:**
• Manufacturer warranties honored
• Extended warranty options available
• Detailed warranty terms per product

Need to start a return or have questions about a specific item?`;
  }

  // Contact and support
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
    return `I'm here to help! Here are all the ways to get support:

🤖 **Instant Help (Me!):**
• Available 24/7 for quick questions
• Product information and guidance
• Order status and tracking
• Account assistance

📧 **Email Support:**
• support@wholesaler-app.com
• Response within 4-6 hours
• Detailed technical assistance
• Order modifications and special requests

📞 **Phone Support:**
• 1-800-WHOLESALE (Mon-Fri, 8AM-6PM)
• Immediate assistance for urgent issues
• Speak with product specialists
• Account managers for business customers

💬 **Live Chat:**
• Business hours: Mon-Fri, 9AM-5PM
• Real-time support with human agents
• Screen sharing for technical issues

What's the best way I can help you right now?`;
  }

  // Order status and tracking
  if (lowerMessage.includes('order status') || lowerMessage.includes('where is my order') || lowerMessage.includes('order tracking')) {
    return `Let me help you track your order:

📋 **Check Order Status:**
1. Go to **My Orders** in your dashboard
2. Find your order by order number or date
3. Click **View Details** for full information
4. See real-time status updates

📦 **Order Statuses:**
• **Processing** - We're preparing your order
• **Shipped** - On its way to you
• **Out for Delivery** - Arriving today
• **Delivered** - Successfully delivered

🔍 **Tracking Details:**
• Carrier information and tracking number
• Estimated delivery date and time
• Current location of your package
• Delivery attempt history

If you have your order number, I can help you look up specific details. What's your order number?`;
  }

  // Technical issues
  if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('not working') || lowerMessage.includes('problem')) {
    return `I'm sorry you're experiencing technical issues. Let me help:

🔧 **Quick Fixes:**
• Try refreshing the page (Ctrl+F5)
• Clear your browser cache and cookies
• Disable browser extensions temporarily
• Try using an incognito/private window

🌐 **Browser Support:**
• Chrome, Firefox, Safari, Edge (latest versions)
• JavaScript must be enabled
• Pop-up blocker should allow our site

📱 **Mobile Issues:**
• Update to the latest app version
• Check your internet connection
• Restart the app
• Free up device storage space

🆘 **Still Having Problems?**
Please describe the specific error message or issue you're seeing, and I'll provide more targeted help or escalate to our technical team.

What exactly is happening when you try to use the app?`;
  }

  // Business/wholesale specific
  if (lowerMessage.includes('business account') || lowerMessage.includes('wholesale account') || lowerMessage.includes('tax exempt')) {
    return `Here's information about business accounts:

🏢 **Business Account Benefits:**
• Wholesale pricing access
• Extended payment terms (NET 30/60)
• Dedicated account manager
• Priority customer support
• Bulk order capabilities

📋 **Account Setup:**
• Business license verification required
• Tax ID number needed
• Credit check for payment terms
• Professional references

💼 **Business Features:**
• Multi-user account access
• Approval workflows for orders
• Custom pricing agreements
• Purchase order integration
• Detailed reporting and analytics

🧾 **Tax Benefits:**
• Tax-exempt status available
• Resale certificate upload
• Automated tax calculations
• Detailed tax reporting

Would you like help setting up a business account or upgrading your current account?`;
  }

  // General order/purchase questions
  if (lowerMessage.includes('order') || lowerMessage.includes('purchase') || lowerMessage.includes('buy')) {
    return "I can help you with all order-related questions! 🛒 Whether you need help placing a new order, tracking an existing one, modifying quantities, or understanding our ordering process, I'm here to assist. \n\nWhat specifically would you like to know about orders? You can ask me about:\n• How to place orders\n• Payment methods\n• Shipping options\n• Order tracking\n• Returns and exchanges";
  }

  // Default response with suggestions
  return `I want to make sure I give you the most helpful information! 🤔 

I can assist you with:
• **Orders** - Placing, tracking, modifying orders
• **Payments** - Methods, billing, payment issues
• **Products** - Finding items, pricing, availability
• **Shipping** - Delivery options, tracking, schedules
• **Account** - Login help, settings, business accounts
• **Returns** - Return process, exchanges, refunds
• **Technical** - App issues, troubleshooting

Could you tell me more specifically what you need help with? For example, you could ask:
"How do I place an order?" or "What payment methods do you accept?" or "How do I track my order?"

I'm here to make your wholesale experience as smooth as possible! 😊`;
};
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return darkMode ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return darkMode ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return darkMode ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return darkMode ? 'bg-gray-900/20 text-gray-400 border-gray-800' : 'bg-gray-100 text-gray-800 border-gray-200';
      default: return darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'high': return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
                  {/* Show count for tickets */}
                  {tab.id === 'tickets' && tickets.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full ml-1">
                      {tickets.length}
                    </span>
                  )}
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
                  <div className={`mb-6 p-4 rounded-lg border ${
                    darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center">
                      <FaCheckCircle className={`mr-3 text-xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                          Ticket submitted successfully!
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          We'll get back to you within 24 hours. Your ticket has been saved and will appear in "My Tickets".
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Authentication Warning */}
                {!user && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center">
                      <FaExclamationTriangle className={`mr-3 text-xl ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                          Please log in to submit tickets
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          You need to be logged in to submit and track support tickets.
                        </p>
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
                    disabled={isSubmitting || !user}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isSubmitting || !user
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving to Database...
                      </div>
                    ) : !user ? (
                      'Please Log In to Submit'
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ENHANCED My Tickets Tab with Better Error Display */}
            {activeTab === 'tickets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Your Support Tickets
                  </h2>
                  <button
                    onClick={fetchUserTickets}
                    disabled={loadingTickets || !user}
                    className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                      loadingTickets || !user
                        ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                        : darkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className={`w-4 h-4 mr-2 ${loadingTickets ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loadingTickets ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Authentication Check */}
                {!user && (
                  <div className="text-center py-12">
                    <FaExclamationTriangle className={`mx-auto text-6xl mb-4 ${darkMode ? 'text-yellow-600' : 'text-yellow-400'}`} />
                    <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                      Please log in to view tickets
                    </h3>
                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
                      You need to be authenticated to view your support tickets.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loadingTickets && user && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your tickets...</p>
                  </div>
                )}

                {/* Error State with Detailed Information */}
                {ticketsError && user && (
                  <div className={`p-6 rounded-lg border mb-6 ${
                    darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start">
                      <FaExclamationTriangle className={`mr-3 text-xl mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${darkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>
                          Unable to Load Tickets
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'} mb-4`}>
                          {ticketsError}
                        </p>
                        <div className="space-y-2">
                          <button 
                            onClick={fetchUserTickets}
                            className={`text-sm underline hover:no-underline ${darkMode ? 'text-red-300' : 'text-red-800'}`}
                          >
                            Try Again
                          </button>
                          <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            <p>Troubleshooting tips:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Check your internet connection</li>
                              <li>Refresh the page</li>
                              <li>Log out and log back in</li>
                              <li>Contact support if the issue persists</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tickets Display */}
                {!loadingTickets && !ticketsError && user && (
                  <>
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
                                  {ticket.ticketId}
                                </h3>
                                <span className={`px-3 py-1 text-xs rounded-full border font-medium ${getStatusColor(ticket.status)}`}>
                                  {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                                </span>
                                <span className={`text-sm font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority} Priority
                                </span>
                              </div>
                              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 md:mt-0`}>
                                Created: {formatDate(ticket.createdAt)}
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                              } mr-2`}>
                                {ticket.category}
                              </span>
                            </div>
                            
                            <h4 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                              {ticket.subject}
                            </h4>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-3`}>
                              {ticket.message}
                            </p>
                            
                            {/* Show attachments if any */}
                            {ticket.attachments && ticket.attachments.length > 0 && (
                              <div className="mb-4">
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                  Attachments:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {ticket.attachments.map((attachment, index) => (
                                    <span key={index} className={`text-xs px-2 py-1 rounded ${
                                      darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      📎 {attachment.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Last updated: {formatDate(ticket.updatedAt)}
                              </span>
                              <div className="flex space-x-2">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                  View Details →
                                </button>
                              </div>
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
                  </>
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
                        <button 
                          onClick={() => setActiveTab('contact')}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
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
                        <p className="text-sm whitespace-pre-line">{msg.message}</p>
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