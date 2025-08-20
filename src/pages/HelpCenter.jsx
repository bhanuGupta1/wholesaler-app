import React, { useState, useMemo } from "react";
import {
  FaQuestionCircle,
  FaBook,
  FaVideo,
  FaDownload,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaShoppingCart,
  FaBoxes,
  FaCog,
  FaLightbulb,
  FaPlayCircle,
  FaFileAlt,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const HelpCenter = () => {
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // Comprehensive FAQ data from user perspective
  const faqData = [
    // Getting Started
    {
      id: 1,
      category: "getting-started",
      question: "How do I create my first order as a new user?",
      answer:
        'Welcome! To create your first order: 1) Go to "Products" or "Catalog" from the main menu, 2) Browse products and click "Add to Cart" on items you want, 3) Click the Cart icon in the top-right, 4) Review your items and click "Checkout", 5) Fill in customer details and confirm your order. Your order will be processed immediately!',
      tags: ["order", "beginner", "first-time", "checkout"],
      difficulty: "beginner",
      readTime: "2 min",
    },
    {
      id: 2,
      category: "getting-started",
      question:
        "What's the difference between guest access and creating an account?",
      answer:
        "Guest access lets you browse products and view sample orders, but you can't place real orders or save data. Creating an account gives you full access to place orders, track order history, manage inventory (if you're a seller), and save your preferences. We recommend creating an account for the best experience.",
      tags: ["account", "guest", "registration", "access"],
      difficulty: "beginner",
      readTime: "1 min",
    },
    {
      id: 3,
      category: "getting-started",
      question: "How do I navigate the dashboard? It looks overwhelming.",
      answer:
        'Don\'t worry! The dashboard is designed to be intuitive: 1) Use the main navigation bar at the top (Dashboard, Products, Orders, etc.), 2) Your role determines what you see - buyers see purchasing tools, sellers see inventory tools, 3) Start with "Products" to browse what\'s available, 4) Use the search bar to find specific items quickly, 5) Check "Orders" to see your purchase history.',
      tags: ["dashboard", "navigation", "interface", "beginner"],
      difficulty: "beginner",
      readTime: "3 min",
    },

    // Ordering & Purchasing
    {
      id: 4,
      category: "ordering",
      question: "Can I modify or cancel an order after placing it?",
      answer:
        'It depends on the order status: Orders with "Pending" status can usually be modified or cancelled - contact support immediately. Orders marked "Processing" or "Shipped" cannot be changed. Check your order status in the "Orders" section. For urgent changes, use the emergency contact number in the top-right corner.',
      tags: ["cancel", "modify", "order-status", "urgent"],
      difficulty: "intermediate",
      readTime: "2 min",
    },
    {
      id: 5,
      category: "ordering",
      question:
        'Why do some products show "Out of Stock" when I try to order them?',
      answer:
        "Our inventory updates in real-time. If a product shows \"Out of Stock\", it means: 1) Another customer just purchased the last items, 2) The supplier hasn't restocked yet, 3) There's a temporary hold on that product. Try checking again later, or contact the seller directly. You can also set up stock alerts for when items become available again.",
      tags: ["stock", "inventory", "availability", "alerts"],
      difficulty: "intermediate",
      readTime: "2 min",
    },
    {
      id: 6,
      category: "ordering",
      question:
        "How do bulk orders work? Can I get discounts for large quantities?",
      answer:
        "Yes! Bulk ordering often gets you better prices: 1) Add large quantities to your cart - many products show bulk pricing automatically, 2) For very large orders (500+ items), contact the seller directly for custom pricing, 3) Business accounts often get automatic bulk discounts, 4) Check the product details page for quantity break pricing. Some sellers offer 5-20% discounts for wholesale quantities.",
      tags: ["bulk", "wholesale", "discounts", "pricing", "business"],
      difficulty: "intermediate",
      readTime: "3 min",
    },

    // Account & Profile
    {
      id: 7,
      category: "account",
      question: "How do I upgrade from a regular user to a business account?",
      answer:
        'To upgrade to a business account: 1) Go to your Profile (click your avatar in top-right), 2) Click "Account Settings", 3) Select "Upgrade to Business", 4) Provide your business registration details, tax ID, and business address, 5) Wait for admin approval (usually 24-48 hours). Business accounts get access to wholesale pricing, bulk ordering tools, and seller features.',
      tags: ["business", "upgrade", "account-type", "wholesale"],
      difficulty: "intermediate",
      readTime: "3 min",
    },
    {
      id: 8,
      category: "account",
      question: "I forgot my password. How do I reset it?",
      answer:
        'To reset your password: 1) Go to the login page, 2) Click "Forgot Password?", 3) Enter your email address, 4) Check your email for a reset link (check spam folder too), 5) Click the link and create a new password. If you don\'t receive an email within 10 minutes, contact support - you might have used a different email address.',
      tags: ["password", "reset", "login", "email"],
      difficulty: "beginner",
      readTime: "2 min",
    },

    // Selling & Inventory (for business users)
    {
      id: 9,
      category: "selling",
      question: "How do I add my products to sell on the platform?",
      answer:
        'To start selling (requires business account): 1) Go to "Inventory" in the main menu, 2) Click "Add Product", 3) Upload product photos, write descriptions, set prices, 4) Set your stock quantities, 5) Choose categories and tags, 6) Click "Publish". Your products will be visible to buyers immediately. You can also bulk upload using CSV files for many products at once.',
      tags: ["selling", "add-products", "inventory", "upload", "business"],
      difficulty: "advanced",
      readTime: "4 min",
    },
    {
      id: 10,
      category: "selling",
      question: "How do I track which of my products are selling well?",
      answer:
        'Use the built-in analytics: 1) Go to "Inventory" or your dashboard, 2) Check the "Popular Products" section, 3) Look for view counts and order numbers on each product, 4) Use the date filters to see trends over time, 5) Products with low stock and high demand are your best sellers. Consider restocking these first or raising prices if demand is very high.',
      tags: ["analytics", "tracking", "sales", "performance", "business"],
      difficulty: "advanced",
      readTime: "3 min",
    },

    // Technical Issues
    {
      id: 11,
      category: "technical",
      question:
        "The website is loading slowly or not working properly. What should I do?",
      answer:
        "Try these troubleshooting steps: 1) Refresh the page (Ctrl+R or Cmd+R), 2) Clear your browser cache and cookies, 3) Try a different browser (Chrome, Firefox, Safari), 4) Check your internet connection, 5) Disable browser extensions temporarily, 6) Try using incognito/private browsing mode. If problems persist, contact support with details about your browser and what you were trying to do.",
      tags: ["slow", "loading", "technical", "browser", "troubleshooting"],
      difficulty: "intermediate",
      readTime: "3 min",
    },
    {
      id: 12,
      category: "technical",
      question: "How do I use the QR code features? What are they for?",
      answer:
        'QR codes help with inventory and order management: 1) Click "QR Tools" in the top menu, 2) Generate QR codes for your products (sellers) or orders, 3) Print and attach them to physical items, 4) Use your phone camera or QR scanner to quickly look up product info, check stock, or update inventory, 5) Great for warehouse management and quick product identification.',
      tags: ["qr-code", "inventory", "scanning", "mobile", "tools"],
      difficulty: "intermediate",
      readTime: "3 min",
    },

    // Payments & Pricing
    {
      id: 13,
      category: "payments",
      question: "What payment methods do you accept?",
      answer:
        "We accept multiple payment methods: 1) Credit/Debit cards (Visa, MasterCard, American Express), 2) Bank transfers for large orders, 3) Business accounts can set up NET 30 payment terms, 4) Some sellers accept PayPal, 5) Cash on delivery for local orders (if available in your area). Payment options may vary by seller and order size.",
      tags: ["payment", "credit-card", "bank-transfer", "paypal"],
      difficulty: "beginner",
      readTime: "2 min",
    },
    {
      id: 14,
      category: "payments",
      question: "Why do prices change? I saw a different price yesterday.",
      answer:
        "Prices can change for several reasons: 1) Sellers adjust prices based on supply and demand, 2) Bulk discounts apply when you order larger quantities, 3) Your account type affects pricing (business accounts often get wholesale rates), 4) Seasonal promotions or sales events, 5) Currency fluctuations for international products. Always check the current price before checkout.",
      tags: [
        "pricing",
        "price-changes",
        "wholesale",
        "discounts",
        "account-type",
      ],
      difficulty: "intermediate",
      readTime: "2 min",
    },

    // Shipping & Logistics
    {
      id: 15,
      category: "shipping",
      question: "How long does shipping take and how can I track my order?",
      answer:
        'Shipping times vary by seller and location: 1) Check the estimated delivery time on each product page, 2) After ordering, you\'ll get a tracking number via email, 3) Go to "Orders" to see tracking info and delivery status, 4) Local orders: 1-3 days, domestic: 3-7 days, international: 7-21 days, 5) Contact the seller directly for urgent delivery questions.',
      tags: ["shipping", "delivery", "tracking", "timeline"],
      difficulty: "beginner",
      readTime: "2 min",
    },
  ];

  // Categories for filtering
  const categories = [
    {
      id: "all",
      name: "All Topics",
      icon: FaQuestionCircle,
      count: faqData.length,
    },
    {
      id: "getting-started",
      name: "Getting Started",
      icon: FaUser,
      count: faqData.filter((f) => f.category === "getting-started").length,
    },
    {
      id: "ordering",
      name: "Orders & Purchasing",
      icon: FaShoppingCart,
      count: faqData.filter((f) => f.category === "ordering").length,
    },
    {
      id: "account",
      name: "Account & Profile",
      icon: FaCog,
      count: faqData.filter((f) => f.category === "account").length,
    },
    {
      id: "selling",
      name: "Selling & Inventory",
      icon: FaBoxes,
      count: faqData.filter((f) => f.category === "selling").length,
    },
    {
      id: "technical",
      name: "Technical Issues",
      icon: FaCog,
      count: faqData.filter((f) => f.category === "technical").length,
    },
    {
      id: "payments",
      name: "Payments & Pricing",
      icon: FaUser,
      count: faqData.filter((f) => f.category === "payments").length,
    },
    {
      id: "shipping",
      name: "Shipping & Delivery",
      icon: FaBoxes,
      count: faqData.filter((f) => f.category === "shipping").length,
    },
  ];

  // Quick start guides
  const quickGuides = [
    {
      title: "Complete Beginner's Guide",
      description: "New to wholesale? Start here for a complete walkthrough",
      duration: "10 min read",
      difficulty: "Beginner",
      icon: FaUser,
      color: "green",
    },
    {
      title: "How to Place Your First Order",
      description: "Step-by-step guide to buying products",
      duration: "5 min read",
      difficulty: "Beginner",
      icon: FaShoppingCart,
      color: "blue",
    },
    {
      title: "Setting Up Your Business Account",
      description: "Unlock wholesale pricing and selling features",
      duration: "7 min read",
      difficulty: "Intermediate",
      icon: FaBoxes,
      color: "purple",
    },
    {
      title: "Selling Products: Complete Guide",
      description: "Everything you need to know about selling on our platform",
      duration: "15 min read",
      difficulty: "Advanced",
      icon: FaCog,
      color: "orange",
    },
  ];

  // Popular help topics (based on view counts)
  const popularTopics = [
    {
      title: "How to create your first order",
      views: 1243,
      category: "ordering",
    },
    { title: "Understanding bulk pricing", views: 892, category: "payments" },
    { title: "Account upgrade process", views: 756, category: "account" },
    {
      title: "Troubleshooting login issues",
      views: 654,
      category: "technical",
    },
    { title: "Setting up product listings", views: 543, category: "selling" },
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100";
      case "advanced":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getGuideColor = (color) => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "purple":
        return "bg-purple-500";
      case "orange":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} py-8`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Help Center
          </h1>
          <p
            className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"} max-w-2xl mx-auto`}
          >
            Get help with orders, account setup, selling products, and
            everything else you need to succeed
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["overview", "faq", "guides", "videos"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === section
                  ? darkMode
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-600 text-white"
                  : darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === "overview" && (
          <>
            {/* Search Bar */}
            <div
              className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-8`}
            >
              <div className="relative max-w-2xl mx-auto">
                <FaSearch
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <input
                  type="text"
                  placeholder="Search for help with orders, products, account setup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 border rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Start Guides */}
            <div className="mb-12">
              <h2
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}
              >
                Quick Start Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickGuides.map((guide, index) => {
                  const Icon = guide.icon;
                  return (
                    <div
                      key={index}
                      className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${getGuideColor(guide.color)}`}
                    >
                      <div className="flex items-center mb-4">
                        <div
                          className={`w-10 h-10 ${getGuideColor(guide.color)} rounded-lg flex items-center justify-center mr-3`}
                        >
                          <Icon className="text-white text-lg" />
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(guide.difficulty.toLowerCase())}`}
                        >
                          {guide.difficulty}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
                      >
                        {guide.title}
                      </h3>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-3`}
                      >
                        {guide.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaClock className="mr-1" />
                        {guide.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Help Topics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}
                >
                  Popular Help Topics
                </h2>
                <div className="space-y-4">
                  {popularTopics.map((topic, index) => (
                    <div
                      key={index}
                      className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3
                            className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {topic.title}
                          </h3>
                          <span
                            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} capitalize`}
                          >
                            {topic.category.replace("-", " ")}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-gray-500">
                            <FaUser className="mr-1 text-xs" />
                            <span className="text-sm">
                              {topic.views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2
                  className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-6`}
                >
                  Browse by Category
                </h2>
                <div className="space-y-3">
                  {categories.slice(1).map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveSection("faq");
                        }}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          darkMode
                            ? "bg-gray-800 hover:bg-gray-700 text-white"
                            : "bg-white hover:bg-gray-50 text-gray-900"
                        } shadow-md hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="mr-3 text-indigo-600" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span
                            className={`text-sm px-2 py-1 rounded-full ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                          >
                            {category.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* FAQ Section */}
        {activeSection === "faq" && (
          <>
            {/* Search and Filter */}
            <div
              className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-8`}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedCategory !== "all") && (
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Found {filteredFAQs.length} result
                    {filteredFAQs.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* FAQ List */}
            <div
              className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-8`}
            >
              <h2
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-8`}
              >
                {selectedCategory === "all"
                  ? "All Questions"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>

              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`border rounded-lg ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className={`w-full px-6 py-4 text-left flex justify-between items-center hover:${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-colors rounded-lg`}
                    >
                      <div className="flex-1 pr-4">
                        <h3
                          className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
                        >
                          {faq.question}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(faq.difficulty)}`}
                          >
                            {faq.difficulty}
                          </span>
                          <span
                            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} flex items-center`}
                          >
                            <FaClock className="mr-1" />
                            {faq.readTime}
                          </span>
                        </div>
                      </div>
                      <FaChevronDown
                        className={`text-gray-400 transition-transform duration-200 ${
                          expandedFAQ === faq.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="pt-4">
                          <p
                            className={`${darkMode ? "text-gray-300" : "text-gray-600"} leading-relaxed mb-4`}
                          >
                            {faq.answer}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {faq.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  darkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                            <span
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              Was this helpful?
                            </span>
                            <div className="flex items-center space-x-4">
                              <button className="text-green-600 hover:text-green-800 font-medium text-sm">
                                👍 Yes
                              </button>
                              <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                                👎 No
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <FaQuestionCircle
                    className={`text-6xl ${darkMode ? "text-gray-600" : "text-gray-300"} mx-auto mb-4`}
                  />
                  <p
                    className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}
                  >
                    No FAQs found for your search.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear search and show all FAQs
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Guides Section */}
        {activeSection === "guides" && (
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-8`}
          >
            <h2
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-8`}
            >
              Step-by-Step Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickGuides.map((guide, index) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={index}
                    className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-12 h-12 ${getGuideColor(guide.color)} rounded-lg flex items-center justify-center mr-4`}
                      >
                        <Icon className="text-white text-xl" />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {guide.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(guide.difficulty.toLowerCase())}`}
                        >
                          {guide.difficulty}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}
                    >
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        {guide.duration}
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                        Read Guide →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {activeSection === "videos" && (
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-8`}
          >
            <h2
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-8`}
            >
              Video Tutorials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Getting Started: Your First Order",
                  duration: "3:45",
                  views: "12.5K",
                },
                {
                  title: "Setting Up Your Business Account",
                  duration: "5:20",
                  views: "8.2K",
                },
                {
                  title: "Managing Your Inventory",
                  duration: "7:15",
                  views: "15.3K",
                },
                {
                  title: "Understanding Bulk Pricing",
                  duration: "4:30",
                  views: "6.8K",
                },
                {
                  title: "Using QR Codes for Inventory",
                  duration: "6:00",
                  views: "9.1K",
                },
                {
                  title: "Troubleshooting Common Issues",
                  duration: "8:45",
                  views: "11.7K",
                },
              ].map((video, index) => (
                <div
                  key={index}
                  className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer`}
                >
                  <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <FaPlayCircle className="text-white text-4xl" />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className={`font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
                    >
                      {video.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUser className="mr-1" />
                      {video.views} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Link */}
        <div className="mt-12 text-center">
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-8`}
          >
            <h3
              className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
            >
              Still need help?
            </h3>
            <p
              className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}
            >
              Can't find what you're looking for? Our support team is here to
              help with personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact-support"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/contact-support"
                className={`inline-block border font-medium py-3 px-6 rounded-lg transition-colors ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
