// src/components/common/Navbar.jsx 
// 
//  MODERN APPROACH: ShadCN/Radix-style dropdown patterns


import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { canAccessCart, canCreateOrders } from '../../utils/accessControl';
import ThemeToggle from './ThemeToggle';
import CheckoutFlowSelector from './CheckoutFlowSelector';
import SecretInvasionBackground from './SecretInvasionBackground';

// BULLETPROOF DROPDOWN SYSTEM (ShadCN-style)
// ==============================================

const DropdownContext = createContext(null);

// Main Dropdown Container - FIXED: Added overflow handling
const Dropdown = ({ children, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  // Bulletproof outside click handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        contentRef.current?.contains(event.target)
      ) {
        return;
      }
      handleOpenChange(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    // Use capture phase for bulletproof event handling
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Auto-close on navigation
  const location = useLocation();
  useEffect(() => {
    handleOpenChange(false);
  }, [location]);

  const contextValue = {
    isOpen,
    setIsOpen: handleOpenChange,
    triggerRef,
    contentRef,
    timeoutRef
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      {/* FIXED: Added static class to prevent layout shifts */}
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
};

// Dropdown Trigger
const DropdownTrigger = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen, triggerRef } = useContext(DropdownContext);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <button
      ref={triggerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

// Dropdown Content - FIXED: Better positioning and z-index
const DropdownContent = ({ children, className = '', align = 'right', ...props }) => {
  const { isOpen, contentRef } = useContext(DropdownContext);

  if (!isOpen) return null;

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  };

  return (
    <div
      ref={contentRef}
      className={`absolute top-full mt-2 z-[9999] min-w-max ${alignmentClasses[align]} ${className}`}
      role="menu"
      aria-orientation="vertical"
      style={{ position: 'absolute' }}
      {...props}
    >
      <div className="animate-slideDown">
        {children}
      </div>
    </div>
  );
};

// Dropdown Item
const DropdownItem = ({ children, onSelect, className = '', disabled = false, ...props }) => {
  const { setIsOpen } = useContext(DropdownContext);

  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Close dropdown first, then execute action
    setIsOpen(false);
    
    // Use microtask to ensure dropdown closes before action
    Promise.resolve().then(() => {
      onSelect?.(e);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect(e);
    }
  };

  return (
    <button
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="menuitem"
      className={`w-full text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// MAIN NAVBAR COMPONENT
// ==============================================

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const { cart, getCartItemCount, getCartTotal } = useCart();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckoutSelector, setShowCheckoutSelector] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  
  // Check permissions
  const userCanAccessCart = canAccessCart(user);
  const userCanCreateOrders = canCreateOrders(user);

  // Safe navigation helper
  const safeNavigate = (path, options = {}) => {
    navigate(path, options);
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/guest-dashboard';
    
    switch (user.accountType) {
      case 'admin': return '/admin-dashboard';
      case 'manager': return '/manager-dashboard';
      case 'business': return '/business-dashboard';
      case 'user': return '/user-dashboard';
      default: return '/guest-dashboard';
    }
  };

  // Get navigation links - UPDATED with admin links including Deal Management
  const getNavigationLinks = () => {
    const baseLinks = [
      { 
        to: getDashboardPath(), 
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
        label: darkMode ? 'NEURAL HUB' : 'Dashboard' 
      }
    ];

    if (user) {
      baseLinks.push({
        to: '/catalog',
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
        label: darkMode ? 'PRODUCT MATRIX' : 'Products' 
      });

      // Admin-specific navigation links
      if (user.accountType === 'admin') {
        baseLinks.push(
          {
            to: '/admin/users', 
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', 
            label: darkMode ? 'USER CONTROL' : 'User Management' 
          },
          {
            to: '/admin/deals', 
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
            label: darkMode ? 'DEAL NEXUS' : 'Deal Management' 
          },
          {
            to: '/inventory', 
            icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', 
            label: darkMode ? 'INVENTORY CORE' : 'Inventory' 
          }
        );
      } else if (user.accountType === 'manager') {
        baseLinks.push({
          to: '/inventory', 
          icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', 
          label: darkMode ? 'INVENTORY CORE' : 'Inventory' 
        });
      } else if (user.accountType === 'business') {
        if (user.businessType === 'seller') {
          baseLinks.push({
            to: '/inventory', 
            icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', 
            label: darkMode ? 'MY INVENTORY' : 'My Products' 
          });
        } else {
          baseLinks.push({
            to: '/orders', 
            icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
            label: darkMode ? 'PURCHASE HISTORY' : 'Purchase History' 
          });
        }
      } else if (user.accountType === 'user') {
        baseLinks.push({
          to: '/user-dashboard', 
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 
          label: darkMode ? 'MY ACCOUNT' : 'My Account' 
        });
      }

      baseLinks.push({
        to: '/orders', 
        icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', 
        label: darkMode ? 'ORDER STREAM' : 'Orders' 
      });

      baseLinks.push({
        to: '/feedback', 
        icon: 'M7 8h10M7 12h6m-6 4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
        label: darkMode ? 'FEEDBACK MATRIX' : 'Feedback' 
      });

    } else {
      baseLinks.push(
        { 
          to: '/catalog', 
          icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
          label: darkMode ? 'PRODUCT MATRIX' : 'Browse Products' 
        },
        { 
          to: '/about-us', 
          icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
          label: darkMode ? 'ABOUT NEURAL' : 'About Us' 
        }
      );
    }

    return baseLinks;
  };
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const handleNavigateToProfile = () => {
  safeNavigate('/profile');
};

const handleNavigateToSettings = () => {
  safeNavigate('/settings');
};

  const handleQRToolsNavigation = () => {
    safeNavigate('/qr-tools');
  };

  const handleSignOut = async () => {
    try {
      await logout();
      safeNavigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      safeNavigate('/login', { replace: true });
    }
  };

  const handleCheckoutFromCart = () => {
    if (userCanCreateOrders) {
      setShowCheckoutSelector(true);
    } else {
      safeNavigate('/checkout');
    }
  };

  // Get theme prefix
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  
  return (
    <div className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? `${themePrefix}-navbar-scrolled shadow-2xl` 
        : ''
    }`}>
      
      {/* SecretInvasion Background Integration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <SecretInvasionBackground 
          intensity={0.6} 
          enableGlitch={darkMode} 
        />
      </div>
      
      {/* FIXED: Theme-aware navbar wrapper with proper overflow handling */}
      <div className={`${themePrefix}-navbar-wrapper relative overflow-visible`}>
        {/* Background glow effects */}
        {darkMode && <div className="cyber-navbar-glow animate-pulse"></div>}
        {!darkMode && <div className="neumorph-navbar-glow animate-pulse"></div>}
        
        {/* Enhanced Top Bar */}
        <div className={`py-3 px-4 transition-all duration-500 backdrop-blur-md relative overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-900/95 via-cyan-900/20 to-gray-900/95 border-b border-cyan-500/30' 
            : 'bg-gradient-to-r from-indigo-600/90 via-blue-600/85 to-purple-600/90 border-b border-indigo-300/50'
        }`}>
          <div className="container mx-auto flex items-center justify-between text-sm relative z-10">
            <p className={`hidden md:block font-medium transition-all duration-300 ${
              darkMode 
                ? 'text-cyan-200 cyber-glow' 
                : 'text-white neumorph-text-shadow'
            }`}>
              {darkMode 
                ? '🚀 NEURAL WHOLESALER | QUANTUM INVENTORY MANAGEMENT WITH QR PROTOCOLS' 
                : '✨ MEGA WHOLESALER | Premium Inventory Management with QR Tools'
              }
            </p>
            <div className="flex items-center space-x-3">
             {[
  { href: "/help-center", text: darkMode ? "HELP MATRIX" : "Help Center" },
  { href: "/contact-support", text: darkMode ? "NEURAL SUPPORT" : "Contact Support" },
  { to: "/qr-tools", text: darkMode ? "QR PROTOCOLS" : "QR Tools", icon: "📱" }
].map((item, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && <span className={`${darkMode ? 'text-cyan-500' : 'text-indigo-200'}`}>|</span>}
                  {item.to ? (
                    <Link 
                      to={item.to} 
                      className={`ml-3 transition-all duration-300 hover:scale-110 flex items-center group ${
                        darkMode 
                          ? 'text-cyan-300 hover:text-cyan-100 hover:text-glow' 
                          : 'text-white hover:text-indigo-100'
                      }`}
                    >
                      {item.icon && <span className="mr-1 group-hover:scale-125 transition-transform duration-300">{item.icon}</span>}
                      <span className="font-medium">{item.text}</span>
                    </Link>
                  ) : (
                    <Link 
                      to={item.href} 
                      className={`ml-3 transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-cyan-300 hover:text-cyan-100 hover:text-glow' 
                          : 'text-white hover:text-indigo-100'
                      }`}
                    >
                      <span className="font-medium">{item.text}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* FIXED: Main Navigation with proper overflow handling */}
        <nav className={`relative z-10 transition-all duration-500 backdrop-blur-lg overflow-visible ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-900/95 via-cyan-900/10 to-gray-900/95' 
            : 'bg-gradient-to-r from-indigo-700/95 via-blue-700/90 to-purple-700/95'
        }`}>
          
          <div className="container mx-auto px-4 py-4 relative z-20">
            <div className="flex justify-between items-center">
              
              {/* Enhanced Logo */}
              <div className="flex items-center space-x-3 group">
                <div className={`${themePrefix}-logo transition-all duration-300 group-hover:scale-110 relative overflow-hidden w-12 h-12 ${
                  darkMode ? '' : 'bg-indigo-400 border-4 border-indigo-600'
                }`}>
                  {darkMode && <div className="logo-glow"></div>}
                  {!darkMode && <div className="neumorph-logo-glow"></div>}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-8 w-8 transition-all duration-300 ${
                      darkMode 
                        ? 'text-cyan-400' 
                        : 'text-white'
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
                  className={`transition-all duration-300 group-hover:scale-110 ${
                    darkMode 
                      ? 'cyber-title text-cyan-400 cyber-glow text-3xl' 
                      : 'neumorph-title text-white text-3xl'
                  } font-bold hover:transform hover:rotate-1`}
                  style={{
                    textShadow: darkMode ? 'none' : '2px 2px 4px rgba(0,0,0,0.7)'
                  }}
                >
                  {darkMode ? 'NEURAL WHOLESALER' : 'MEGA WHOLESALER'}
                </Link>
              </div>
              
              {/* FIXED: Desktop Navigation with proper container overflow */}
              <div className="hidden md:flex items-center space-x-6 relative">
                
                {/* Dynamic Navigation Links */}
                {getNavigationLinks().map((link) => (
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
                  </Link>
                ))}
                
                <div className={`h-8 w-px transition-all duration-300 ${
                  darkMode ? 'bg-cyan-500/50' : 'bg-indigo-300/50'
                }`}></div>
                
                {/* 🔥 FIXED: BULLETPROOF CART DROPDOWN */}
                {userCanAccessCart && (
                  <div className="relative">
                    <Dropdown onOpenChange={() => {}}>
                      <DropdownTrigger className={`relative transition-all duration-300 hover:scale-110 group inline-flex items-center gap-2 px-6 py-3 font-bold text-lg rounded-lg ${
                        darkMode 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-black border-2 border-cyan-400 shadow-lg shadow-cyan-500/25' 
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-indigo-600 shadow-lg shadow-indigo-500/50'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                        <span>{darkMode ? 'CART MATRIX' : 'Cart'}</span>
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                            {itemCount > 99 ? '99+' : itemCount}
                          </span>
                        )}
                      </DropdownTrigger>
                      
                      <DropdownContent className={`w-80 ${
                        darkMode ? 'cyber-card border-cyan-500/50' : 'neumorph-card'
                      } rounded-xl shadow-2xl py-2`}>
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
                            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-cyan-300' : 'text-gray-500'}`}>
                              {darkMode ? 'CART MATRIX EMPTY' : 'Your cart is empty'}
                            </p>
                            <DropdownItem
                              onSelect={() => safeNavigate('/catalog')}
                              className={`inline-block transition-all duration-300 hover:scale-105 px-4 py-2 rounded ${
                                darkMode ? 'text-cyan-400 hover:text-cyan-300 cyber-glow' : 'text-indigo-600 hover:text-indigo-800'
                              } text-sm hover:underline font-bold`}
                            >
                              {darkMode ? 'BROWSE PRODUCTS' : 'Browse Products'}
                            </DropdownItem>
                          </div>
                        ) : (
                          <>
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
                            
                            <div className={`px-4 py-3 border-t ${
                              darkMode ? 'border-cyan-700/50' : 'border-gray-200'
                            } space-y-2`}>
                              <DropdownItem
                                onSelect={handleCheckoutFromCart}
                                className={`${themePrefix}-btn ${themePrefix}-btn-primary w-full py-3 transition-all duration-300 hover:scale-105 rounded text-center`}
                              >
                                <span className="font-bold">
                                  {darkMode ? 'PROCESS ORDER' : 'Checkout'} (${cartTotal.toFixed(2)})
                                </span>
                              </DropdownItem>
                              <DropdownItem
                                onSelect={() => safeNavigate('/cart')}
                                className={`${themePrefix}-btn ${themePrefix}-btn-outline w-full py-3 transition-all duration-300 hover:scale-105 rounded text-center`}
                              >
                                <span className="font-bold">{darkMode ? 'VIEW CART MATRIX' : 'View Cart'}</span>
                              </DropdownItem>
                            </div>
                          </>
                        )}
                      </DropdownContent>
                    </Dropdown>
                  </div>
                )}
                
                {/* Create Order button */}
                {userCanCreateOrders && (
                  <Link 
                    to="/create-order" 
                    className={`transition-all duration-300 hover:scale-110 group inline-flex items-center gap-2 px-6 py-3 font-bold text-lg rounded-lg ${
                      darkMode 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-black border-2 border-yellow-400 shadow-lg shadow-yellow-500/25' 
                        : 'bg-blue-500 hover:bg-blue-400 text-white border-2 border-blue-600 shadow-lg shadow-blue-500/50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{darkMode ? 'NEW ORDER' : 'New Order'}</span>
                  </Link>
                )}
                
                {/* Theme Toggle */}
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
                
                {/* 🔥 FIXED: BULLETPROOF USER PROFILE DROPDOWN */}
                {user ? (
                  <div className="relative">
                    <Dropdown onOpenChange={() => {}}>
                      <DropdownTrigger className="flex items-center space-x-2 focus:outline-none group transition-all duration-300 hover:scale-110">
                        <div className={`h-12 w-12 rounded-full p-0.5 shadow-lg overflow-hidden transition-all duration-300 group-hover:ring-4 ${
                          darkMode 
                            ? 'bg-cyan-600 ring-cyan-400/50 cyber-glow' 
                            : 'bg-indigo-500 ring-indigo-400/50 neumorph-elevated'
                        }`}>
                          <div className={`h-full w-full rounded-full flex items-center justify-center font-bold text-lg ${
                            darkMode 
                              ? 'bg-gray-900 text-cyan-400' 
                              : 'bg-white text-indigo-700'
                          }`}>
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${
                          darkMode ? 'text-cyan-400' : 'text-indigo-100'
                        }`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </DropdownTrigger>
                      
                      <DropdownContent className={`w-72 ${
                        darkMode ? 'cyber-card border-cyan-500/50' : 'neumorph-card'
                      } rounded-xl shadow-2xl py-2`}>
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
                          <DropdownItem
                            onSelect={handleNavigateToProfile}
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                              darkMode ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 transition-all duration-300 group-hover:rotate-12 ${
                              darkMode ? 'text-cyan-400' : 'text-gray-400'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-bold">{darkMode ? 'NEURAL PROFILE' : 'Your Profile'}</span>
                          </DropdownItem>
                          
                          <DropdownItem
                            onSelect={handleNavigateToSettings}
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                              darkMode ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 transition-all duration-300 group-hover:rotate-12 ${
                              darkMode ? 'text-cyan-400' : 'text-gray-400'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-bold">{darkMode ? 'SYSTEM CONFIG' : 'Settings'}</span>
                          </DropdownItem>
                          
                          <DropdownItem
                            onSelect={handleQRToolsNavigation}
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 group ${
                              darkMode ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            <span className="mr-3 text-lg animate-pulse">📱</span>
                            <span className="font-bold">{darkMode ? 'QR PROTOCOLS' : 'QR Tools'}</span>
                          </DropdownItem>
                        </div>
                        
                        <div className={`py-1 border-t ${darkMode ? 'border-cyan-700/50' : 'border-gray-200'}`}>
                          <DropdownItem
                            onSelect={handleSignOut}
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
                          </DropdownItem>
                        </div>
                      </DropdownContent>
                    </Dropdown>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className={`transition-all duration-300 hover:scale-110 group inline-flex items-center gap-2 px-6 py-3 font-bold text-lg rounded-lg ${
                      darkMode 
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-black border-2 border-cyan-400 shadow-lg shadow-cyan-500/25' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-700 shadow-lg shadow-purple-600/50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>{darkMode ? 'NEURAL ACCESS' : 'Sign In'}</span>
                  </Link>
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-3">
                {/* Mobile Cart Button */}
                {userCanAccessCart && (
                  <Link 
                    to="/cart"
                    className={`relative transition-all duration-300 hover:scale-110 w-14 h-14 rounded-full flex items-center justify-center ${
                      darkMode 
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-black border-2 border-cyan-400' 
                        : 'bg-indigo-500 hover:bg-indigo-400 text-white border-3 border-indigo-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Mobile QR Tools Button */}
                <Link 
                  to="/qr-tools"
                  className={`transition-all duration-300 hover:scale-110 w-14 h-14 rounded-full flex items-center justify-center ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-400' 
                      : 'bg-blue-500 hover:bg-blue-400 text-white border-3 border-blue-600'
                  }`}
                  title="QR Tools"
                >
                  <span className="text-lg">📱</span>
                </Link>
                
                <ThemeToggle className="mr-2" />
                
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`transition-all duration-300 hover:scale-110 w-14 h-14 rounded-full flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400 border-2 border-gray-600' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white border-3 border-purple-700'
                  }`}
                >
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
          </div>
        </nav>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden backdrop-blur-lg animate-slideInDown ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-900/98 to-cyan-900/20 border-b border-cyan-500/30' 
              : 'bg-gradient-to-r from-indigo-700/98 to-purple-700/20 border-b border-indigo-300/50'
          }`}>
            <div className="py-3 px-4 space-y-1">
              {getNavigationLinks().map((item, index) => (
                <button
                  key={item.to}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    safeNavigate(item.to);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                    isActive(item.to)
                      ? darkMode 
                        ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-600/50' 
                        : 'bg-indigo-600/30 text-white border border-indigo-400/50'
                      : darkMode 
                        ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                        : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {userCanCreateOrders && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    safeNavigate('/create-order');
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                    darkMode 
                      ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                      : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                  }`}
                >
                  {darkMode ? 'NEW ORDER' : 'New Order'}
                </button>
              )}
              
              {user ? (
                <div className={`pt-4 pb-3 border-t ${
                  darkMode ? 'border-cyan-700/50' : 'border-indigo-300/50'
                } space-y-2`}>
                  <div className="px-4 py-2">
                    <p className={`text-sm font-medium ${darkMode ? 'text-cyan-300' : 'text-indigo-200'}`}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavigateToProfile();
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                      darkMode 
                        ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                        : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{darkMode ? 'NEURAL PROFILE' : 'Your Profile'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavigateToSettings();
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                      darkMode 
                        ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                        : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{darkMode ? 'SYSTEM CONFIG' : 'Settings'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleQRToolsNavigation();
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                      darkMode 
                        ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                        : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📱</span>
                      <span>{darkMode ? 'QR PROTOCOLS' : 'QR Tools'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                      darkMode 
                        ? 'text-red-400 hover:bg-red-900/30' 
                        : 'text-red-600 hover:bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{darkMode ? 'DISCONNECT' : 'Sign out'}</span>
                    </div>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    safeNavigate('/login');
                  }}
                  className={`block w-full text-center py-3 mt-4 font-bold rounded-lg transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {darkMode ? 'NEURAL ACCESS' : 'Sign In'}
                </button>
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Export compound components for use elsewhere
export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem };
export default Navbar;