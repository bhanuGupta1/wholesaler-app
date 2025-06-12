// src/components/common/Navbar.jsx - ENHANCED: Full theme integration with animations
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { canAccessCart, canCreateOrders } from '../../utils/accessControl';
import ThemeToggle from './ThemeToggle';
import CheckoutFlowSelector from './CheckoutFlowSelector';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { cart, getCartItemCount, getCartTotal } = useCart();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckoutSelector, setShowCheckoutSelector] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  
  // Check permissions
  const userCanAccessCart = canAccessCart(user);
  const userCanCreateOrders = canCreateOrders(user);
  const userCanAccessQR = true; // QR tools available to everyone
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setCartDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle checkout from cart dropdown
  const handleCheckoutFromDropdown = () => {
    setCartDropdownOpen(false);
    setShowCheckoutSelector(true);
  };

  // Get theme prefix
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  
  return (
    <div className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? `${themePrefix}-navbar-scrolled shadow-2xl` 
        : ''
    }`}>
      
      {/* Theme-aware navbar wrapper */}
      <div className={`${themePrefix}-navbar-wrapper relative overflow-hidden`}>
        {/* Background glow effects */}
        {darkMode && <div className="cyber-navbar-glow"></div>}
        {!darkMode && <div className="neumorph-navbar-glow"></div>}
        
        {/* Top Bar with enhanced styling */}
        <div className={`py-2 px-4 transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-900/95 backdrop-blur-md border-b border-cyan-500/30' 
            : 'bg-indigo-800/95 backdrop-blur-md border-b border-indigo-300/30'
        }`}>
          <div className="container mx-auto flex items-center justify-between text-sm">
            <p className={`hidden md:block font-medium transition-all duration-300 ${
              darkMode 
                ? 'text-cyan-200 cyber-glow animate-pulse' 
                : 'text-indigo-100 neumorph-text-shadow'
            }`}>
              {darkMode 
                ? 'NEURAL WHOLESALER | QUANTUM INVENTORY MANAGEMENT WITH QR PROTOCOLS' 
                : 'Wholesaler | Premium Inventory Management with QR Tools'
              }
            </p>
            <div className="flex items-center space-x-3">
              {[
                { href: "#", text: darkMode ? "HELP MATRIX" : "Help Center" },
                { href: "#", text: darkMode ? "NEURAL SUPPORT" : "Contact Support" },
                { to: "/qr-tools", text: darkMode ? "QR PROTOCOLS" : "QR Tools", icon: "📱" }
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <span className={`${darkMode ? 'text-cyan-500' : 'text-indigo-300'}`}>|</span>}
                  {item.to ? (
                    <Link 
                      to={item.to} 
                      className={`ml-3 transition-all duration-300 hover:scale-105 flex items-center ${
                        darkMode 
                          ? 'text-cyan-300 hover:text-cyan-100 hover:text-glow' 
                          : 'text-indigo-100 hover:text-white'
                      }`}
                    >
                      {item.icon && <span className="mr-1 animate-pulse">{item.icon}</span>}
                      <span className="font-medium">{item.text}</span>
                    </Link>
                  ) : (
                    <a 
                      href={item.href} 
                      className={`ml-3 transition-all duration-300 hover:scale-105 ${
                        darkMode 
                          ? 'text-cyan-300 hover:text-cyan-100 hover:text-glow' 
                          : 'text-indigo-100 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{item.text}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Navigation with enhanced styling */}
        <nav className={`relative z-10 transition-all duration-500 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg' 
            : 'bg-gradient-to-r from-indigo-700/95 to-indigo-600/95 backdrop-blur-lg'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              
              {/* Enhanced Logo with theme styling */}
              <div className="flex items-center space-x-3 group">
                <div className={`${themePrefix}-logo transition-all duration-500 group-hover:scale-110 relative overflow-hidden`}>
                  {darkMode && <div className="logo-glow"></div>}
                  {!darkMode && <div className="neumorph-logo-glow"></div>}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-8 w-8 transition-all duration-700 ${
                      darkMode 
                        ? 'text-cyan-400 animate-spin-slow' 
                        : 'text-indigo-600 hover:animate-pulse'
                    }`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
                  </svg>
                </div>
                <Link 
                  to="/" 
                  className={`transition-all duration-500 group-hover:scale-105 ${
                    darkMode 
                      ? 'cyber-title text-cyan-400 cyber-glow text-2xl' 
                      : 'neumorph-title text-white text-2xl'
                  } font-bold hover:transform hover:rotate-1`}
                >
                  {darkMode ? 'NEURAL WHOLESALER' : 'Wholesaler'}
                </Link>
              </div>
              
              {/* Enhanced Search Bar */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-6">
                <div className={`relative w-full ${themePrefix}-search-container`}>
                  <input 
                    type="text" 
                    placeholder={darkMode 
                      ? "NEURAL SEARCH: PRODUCTS, ORDERS, ENTITIES, QR PROTOCOLS..." 
                      : "Search products, orders, customers, or scan QR codes..."
                    }
                    className={`w-full py-3 pl-4 pr-12 font-medium transition-all duration-500 focus:scale-105 ${
                      darkMode 
                        ? 'bg-gray-900/80 border-2 border-cyan-600/50 text-cyan-100 focus:border-cyan-400 rounded-lg placeholder-cyan-700 backdrop-blur-md cyber-glow' 
                        : 'bg-white/90 border-2 border-indigo-300 text-gray-800 focus:border-indigo-500 rounded-lg placeholder-gray-500 backdrop-blur-md neumorph-inset'
                    }`}
                  />
                  <button className={`absolute right-0 top-0 bottom-0 px-4 transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black rounded-r-lg cyber-btn-glow' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white rounded-r-lg neumorph-elevated'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Enhanced Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                
                {/* Navigation Links with theme styling */}
                {[
                  { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: darkMode ? 'NEURAL HUB' : 'Dashboard' },
                  { to: '/catalog', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: darkMode ? 'PRODUCT MATRIX' : 'Catalog' },
                  { to: '/inventory', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label: darkMode ? 'INVENTORY CORE' : 'Inventory' },
                  { to: '/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: darkMode ? 'ORDER STREAM' : 'Orders' },
                  { to: '/feedback', icon: 'M7 8h10M7 12h6m-6 4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: darkMode ? 'FEEDBACK MATRIX' : 'Feedback' }
                ].map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className={`transition-all duration-300 hover:scale-110 font-medium flex items-center relative group ${
                      isActive(link.to) 
                        ? darkMode 
                          ? 'text-cyan-400 cyber-glow border-b-2 border-cyan-400' 
                          : 'text-white border-b-2 border-white neumorph-text-shadow'
                        : darkMode 
                          ? 'text-cyan-200 hover:text-cyan-100 hover:cyber-glow' 
                          : 'text-indigo-100 hover:text-white hover:neumorph-text-shadow'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    <span className="font-bold tracking-wide">{link.label}</span>
                    {darkMode && <div className="absolute inset-0 bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded blur-sm -z-10"></div>}
                  </Link>
                ))}
                
                <div className={`h-8 w-px transition-all duration-300 ${
                  darkMode ? 'bg-cyan-500/50' : 'bg-indigo-300/50'
                }`}></div>
                
                {/* Enhanced Cart Dropdown */}
                {userCanAccessCart && (
                  <div className="relative" ref={cartDropdownRef}>
                    <button 
                      onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                      className={`${themePrefix}-btn ${themePrefix}-btn-primary relative transition-all duration-300 hover:scale-110 group`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      <span className="font-bold">{darkMode ? 'CART MATRIX' : 'Cart'}</span>
                      {itemCount > 0 && (
                        <span className={`absolute -top-2 -right-2 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse ${
                          darkMode ? 'bg-red-500 shadow-red-500/50 shadow-lg' : 'bg-red-500'
                        }`}>
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Enhanced Cart Dropdown */}
                    {cartDropdownOpen && (
                      <div className={`absolute right-0 mt-3 w-80 ${
                        darkMode ? 'cyber-card border-cyan-500/50' : 'neumorph-card'
                      } rounded-xl shadow-2xl py-2 z-50 transform transition-all duration-300 origin-top-right scale-100 animate-slideInDown`}>
                        {darkMode && <div className="card-glow"></div>}
                        
                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-cyan-700/50' : 'border-gray-200'}`}>
                          <h3 className={`text-lg font-bold ${
                            darkMode ? 'cyber-title text-cyan-400 cyber-glow' : 'neumorph-title text-gray-900'
                          }`}>
                            {darkMode ? 'CART MATRIX' : 'Shopping Cart'} ({itemCount})
                          </h3>
                          {cartTotal > 0 && (
                            <p className={`text-sm font-medium ${darkMode ? 'text-cyan-200' : 'text-gray-500'}`}>
                              Total: ${cartTotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        {cart.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <div className="text-4xl mb-2 animate-bounce">🛒</div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-cyan-300' : 'text-gray-500'}`}>
                              {darkMode ? 'CART MATRIX EMPTY' : 'Your cart is empty'}
                            </p>
                            <Link
                              to="/catalog"
                              onClick={() => setCartDropdownOpen(false)}
                              className={`mt-3 inline-block transition-all duration-300 hover:scale-105 ${
                                darkMode ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' : 'text-indigo-600 hover:text-indigo-800'
                              } text-sm hover:underline font-bold`}
                            >
                              {darkMode ? 'BROWSE PRODUCTS' : 'Browse Products'}
                            </Link>
                          </div>
                        ) : (
                          <>
                            {/* Cart Items */}
                            <div className="max-h-60 overflow-y-auto">
                              {cart.slice(0, 3).map((item) => (
                                <div key={item.id} className={`px-4 py-3 transition-all duration-300 ${
                                  darkMode ? 'hover:bg-cyan-900/20' : 'hover:bg-gray-50'
                                }`}>
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                                      darkMode ? 'bg-gray-800 border border-cyan-600/50' : 'bg-gray-200'
                                    }`}>
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                      ) : (
                                        <span className="text-lg">📦</span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-bold truncate ${
                                        darkMode ? 'text-cyan-100' : 'text-gray-900'
                                      }`}>
                                        {item.name}
                                      </p>
                                      <p className={`text-xs font-medium ${
                                        darkMode ? 'text-cyan-300' : 'text-gray-500'
                                      }`}>
                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className={`text-sm font-bold ${
                                      darkMode ? 'text-cyan-400 cyber-glow' : 'text-gray-900'
                                    }`}>
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {cart.length > 3 && (
                                <div className={`px-4 py-2 text-center border-t ${
                                  darkMode ? 'border-cyan-700/50 text-cyan-300' : 'border-gray-200 text-gray-500'
                                }`}>
                                  <span className="text-sm font-medium">
                                    +{cart.length - 3} more item{cart.length - 3 !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Cart Actions */}
                            <div className={`px-4 py-3 border-t ${
                              darkMode ? 'border-cyan-700/50' : 'border-gray-200'
                            } space-y-2`}>
                              <button
                                onClick={handleCheckoutFromDropdown}
                                className={`${themePrefix}-btn ${themePrefix}-btn-primary w-full py-3 transition-all duration-300 hover:scale-105`}
                              >
                                <span className="font-bold">
                                  {darkMode ? 'PROCESS ORDER' : 'Checkout'} (${cartTotal.toFixed(2)})
                                </span>
                              </button>
                              <Link
                                to="/cart"
                                onClick={() => setCartDropdownOpen(false)}
                                className={`${themePrefix}-btn ${themePrefix}-btn-outline w-full py-3 transition-all duration-300 hover:scale-105 block text-center`}
                              >
                                <span className="font-bold">{darkMode ? 'VIEW CART MATRIX' : 'View Cart'}</span>
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Enhanced Create Order button */}
                {userCanCreateOrders && (
                  <Link 
                    to="/create-order" 
                    className={`${themePrefix}-btn ${themePrefix}-btn-success transition-all duration-300 hover:scale-110 group`}
                  >
                    {darkMode && <div className="btn-glow"></div>}
                    {!darkMode && <div className="neumorph-btn-glow"></div>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-bold">{darkMode ? 'NEW ORDER' : 'New Order'}</span>
                  </Link>
                )}
                
                {/* Enhanced Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
                
                {/* Enhanced User Profile Dropdown */}
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none group transition-all duration-300 hover:scale-105"
                      aria-expanded={profileDropdownOpen}
                      aria-haspopup="true"
                    >
                      <div className={`h-12 w-12 rounded-full p-0.5 shadow-lg overflow-hidden transition-all duration-300 group-hover:ring-4 ${
                        darkMode 
                          ? 'bg-cyan-600 ring-cyan-400/50 cyber-glow' 
                          : 'bg-white ring-indigo-400/50 neumorph-elevated'
                      }`}>
                        <div className={`h-full w-full rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          darkMode 
                            ? 'bg-gray-900 text-cyan-400' 
                            : 'bg-indigo-200 text-indigo-800'
                        }`}>
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 group-hover:rotate-180 ${
                        darkMode ? 'text-cyan-400' : 'text-white'
                      }`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Enhanced Profile Dropdown */}
                    {profileDropdownOpen && (
                      <div className={`absolute right-0 mt-3 w-72 ${
                        darkMode ? 'cyber-card border-cyan-500/50' : 'neumorph-card'
                      } rounded-xl shadow-2xl py-2 z-50 transform transition-all duration-300 origin-top-right animate-slideInDown`}>
                        {darkMode && <div className="card-glow"></div>}
                        
                        <div className={`px-4 py-3 border-b ${darkMode ? 'border-cyan-700/50' : 'border-gray-200'}`}>
                          <p className={`text-sm font-medium ${darkMode ? 'text-cyan-300' : 'text-gray-500'}`}>
                            {darkMode ? 'NEURAL ACCESS GRANTED' : 'Signed in as'}
                          </p>
                          <p className={`text-sm font-bold truncate ${darkMode ? 'text-cyan-100 cyber-glow' : 'text-gray-900'}`}>
                            {user.email}
                          </p>
                          <p className={`text-xs font-bold ${
                            user.accountType === 'admin' ? 'text-red-400' : 
                            user.accountType === 'manager' ? 'text-purple-400' : 
                            'text-green-400'
                          }`}>
                            {user.accountType === 'admin' ? '👑 ADMINISTRATOR' : 
                             user.accountType === 'manager' ? '👔 MANAGER' : 
                             user.accountType === 'business' ? '🏢 BUSINESS USER' : 
                             '👤 REGULAR USER'}
                          </p>
                        </div>
                        
                        <div className="py-1">
                          {[
                            { to: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: darkMode ? 'NEURAL PROFILE' : 'Your Profile' },
                            { to: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: darkMode ? 'SYSTEM CONFIG' : 'Settings' }
                          ].map((item) => (
                            <Link 
                              key={item.to}
                              to={item.to} 
                              className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                                darkMode ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                              }`}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 transition-all duration-300 group-hover:rotate-12 ${
                                darkMode ? 'text-cyan-400' : 'text-gray-400'
                              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                              <span className="font-bold">{item.label}</span>
                            </Link>
                          ))}
                          
                          {/* QR Tools in Profile Menu */}
                          <Link 
                            to="/qr-tools" 
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                              darkMode ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <span className="mr-3 text-lg animate-pulse">📱</span>
                            <span className="font-bold">{darkMode ? 'QR PROTOCOLS' : 'QR Tools'}</span>
                          </Link>
                        </div>
                        
                        <div className={`py-1 border-t ${darkMode ? 'border-cyan-700/50' : 'border-gray-200'}`}>
                          <button 
                            onClick={handleSignOut}
                            className={`flex w-full items-center px-4 py-3 text-sm font-bold transition-all duration-300 hover:scale-105 group ${
                              darkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 transition-all duration-300 group-hover:rotate-180 ${
                              darkMode ? 'text-red-400' : 'text-gray-400'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {darkMode ? 'DISCONNECT' : 'Sign out'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className={`${themePrefix}-btn ${themePrefix}-btn-primary transition-all duration-300 hover:scale-110 group`}
                  >
                    {darkMode && <div className="btn-glow"></div>}
                    {!darkMode && <div className="neumorph-btn-glow"></div>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-bold">{darkMode ? 'NEURAL ACCESS' : 'Sign In'}</span>
                  </Link>
                )}
              </div>
              
              {/* Enhanced Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-3">
                {/* Mobile Cart Button */}
                {userCanAccessCart && (
                  <Link 
                    to="/cart"
                    className={`${themePrefix}-fab-button transition-all duration-300 hover:scale-110 relative`}
                  >
                    {darkMode && <div className="fab-glow"></div>}
                    {!darkMode && <div className="neumorph-fab-glow"></div>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Mobile QR Tools Button */}
                <Link 
                  to="/qr-tools"
                  className={`${themePrefix}-fab-button transition-all duration-300 hover:scale-110`}
                  title="QR Tools"
                >
                  {darkMode && <div className="fab-glow"></div>}
                  {!darkMode && <div className="neumorph-fab-glow"></div>}
                  <span className="text-lg animate-pulse">📱</span>
                </Link>
                
                <ThemeToggle className="mr-2" />
                
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`${themePrefix}-fab-button transition-all duration-300 hover:scale-110`}
                >
                  {darkMode && <div className="fab-glow"></div>}
                  {!darkMode && <div className="neumorph-fab-glow"></div>}
                  {mobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Enhanced Mobile Search */}
            {mobileMenuOpen && (
              <div className="mt-4 md:hidden animate-slideInDown">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    placeholder={darkMode ? "NEURAL SEARCH..." : "Search..."} 
                    className={`w-full py-3 pl-4 pr-12 font-medium transition-all duration-300 focus:scale-105 ${
                      darkMode 
                        ? 'bg-gray-900/80 border-2 border-cyan-600/50 text-cyan-100 focus:border-cyan-400 rounded-lg placeholder-cyan-700 backdrop-blur-md' 
                        : 'bg-white/90 border-2 border-indigo-300 text-gray-800 focus:border-indigo-500 rounded-lg placeholder-gray-500 backdrop-blur-md'
                    }`}
                  />
                  <button className={`absolute right-0 top-0 bottom-0 px-3 transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black rounded-r-lg' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white rounded-r-lg'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
        
        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${
            darkMode ? 'cyber-sidebar' : 'neumorph-sidebar'
          } animate-slideInDown`}>
            {darkMode && <div className="sidebar-glow"></div>}
            {!darkMode && <div className="neumorph-sidebar-glow"></div>}
            
            <div className="py-3 px-4 space-y-1">
              {[
                { to: '/', label: darkMode ? 'NEURAL HUB' : 'Dashboard' },
                { to: '/catalog', label: darkMode ? 'PRODUCT MATRIX' : 'Catalog' },
                { to: '/inventory', label: darkMode ? 'INVENTORY CORE' : 'Inventory' },
                { to: '/orders', label: darkMode ? 'ORDER STREAM' : 'Orders' },
                { to: '/qr-tools', label: darkMode ? 'QR PROTOCOLS' : 'QR Tools', icon: '📱' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${themePrefix}-nav-link ${isActive(item.to) ? 'active' : ''} animate-slideInLeft`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${Object.keys(item).indexOf('to') * 100}ms` }}
                >
                  {darkMode && <div className="nav-link-glow"></div>}
                  {!darkMode && <div className="neumorph-nav-link-glow"></div>}
                  {item.icon && <span className="mr-2 animate-pulse">{item.icon}</span>}
                  <span className="font-bold">{item.label}</span>
                </Link>
              ))}
              
              {userCanCreateOrders && (
                <Link
                  to="/create-order"
                  className={`${themePrefix}-nav-link animate-slideInLeft`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: '500ms' }}
                >
                  {darkMode && <div className="nav-link-glow"></div>}
                  {!darkMode && <div className="neumorph-nav-link-glow"></div>}
                  <span className="font-bold">{darkMode ? 'NEW ORDER' : 'New Order'}</span>
                </Link>
              )}
              
              {user ? (
                <div className={`pt-4 pb-3 border-t animate-fadeInUp ${
                  darkMode ? 'border-cyan-700/50' : 'border-gray-300'
                }`}>
                  <div className={`${themePrefix}-user-card mb-4`}>
                    {darkMode && <div className="user-card-glow"></div>}
                    {!darkMode && <div className="neumorph-user-card-glow"></div>}
                    
                    <div className={`${darkMode ? 'user-avatar' : 'neumorph-user-avatar'}`}>
                      {darkMode && <div className="avatar-glow"></div>}
                      {!darkMode && <div className="neumorph-avatar-glow"></div>}
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className={`${darkMode ? 'user-name' : 'neumorph-user-name'}`}>
                        {user.displayName || "User"}
                      </div>
                      <div className={`${darkMode ? 'user-email' : 'neumorph-user-email'}`}>
                        {user.email}
                      </div>
                      <div className={`${darkMode ? 'user-role' : 'neumorph-user-role'}`}>
                        {user.accountType === 'admin' ? '👑 ADMINISTRATOR' : 
                         user.accountType === 'manager' ? '👔 MANAGER' : 
                         user.accountType === 'business' ? '🏢 BUSINESS USER' : 
                         '👤 REGULAR USER'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { to: '/profile', label: darkMode ? 'NEURAL PROFILE' : 'Your Profile' },
                      { to: '/settings', label: darkMode ? 'SYSTEM CONFIG' : 'Settings' }
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`${themePrefix}-nav-link animate-slideInLeft`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {darkMode && <div className="nav-link-glow"></div>}
                        {!darkMode && <div className="neumorph-nav-link-glow"></div>}
                        <span className="font-bold">{item.label}</span>
                      </Link>
                    ))}
                    
                    <button
                      onClick={handleSignOut}
                      className={`${themePrefix}-signout-btn w-full animate-slideInLeft`}
                    >
                      {darkMode && <div className="signout-glow"></div>}
                      {!darkMode && <div className="neumorph-signout-glow"></div>}
                      <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-bold">{darkMode ? 'DISCONNECT' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`${themePrefix}-btn ${themePrefix}-btn-primary block text-center py-3 mt-4 animate-fadeInUp`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-bold">{darkMode ? 'NEURAL ACCESS' : 'Sign In'}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Checkout Flow Selector Modal */}
      {showCheckoutSelector && (
        <CheckoutFlowSelector 
          showAsModal={true} 
          onClose={() => setShowCheckoutSelector(false)} 
        />
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Navbar;