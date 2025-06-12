// src/components/common/Navbar.jsx - FIXED: Correct routing paths matching App.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { canAccessCart, canCreateOrders } from '../../utils/accessControl';
import ThemeToggle from './ThemeToggle';
import CheckoutFlowSelector from './CheckoutFlowSelector';
import SecretInvasionBackground from './SecretInvasionBackground';

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
  
  // FIXED: Get correct dashboard path based on user role (matching App.jsx)
  const getDashboardPath = () => {
    if (!user) return '/guest-dashboard';
    
    switch (user.accountType) {
      case 'admin':
        return '/admin-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'business':
        return '/business-dashboard';
      case 'user':
        return '/user-dashboard';
      default:
        return '/guest-dashboard';
    }
  };

  // FIXED: Get navigation links based on user permissions and role
  const getNavigationLinks = () => {
    const baseLinks = [
      { 
        to: getDashboardPath(), 
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
        label: darkMode ? 'NEURAL HUB' : 'Dashboard' 
      }
    ];

    // Add links based on user permissions
    if (user) {
      // Products (Product Catalog) - Available to all users
      baseLinks.push({
        to: '/catalog', // FIXED: Matching App.jsx route
        icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
        label: darkMode ? 'PRODUCT MATRIX' : 'Products' 
      });

      // FIXED: Different second menu item based on user role
      if (user.accountType === 'admin' || user.accountType === 'manager') {
        // Admins and Managers get Inventory
        baseLinks.push({
          to: '/inventory', 
          icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', 
          label: darkMode ? 'INVENTORY CORE' : 'Inventory' 
        });
      } else if (user.accountType === 'business') {
        // Business users get different options based on business type
        if (user.businessType === 'seller') {
          baseLinks.push({
            to: '/inventory', 
            icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', 
            label: darkMode ? 'MY INVENTORY' : 'My Products' 
          });
        } else {
          // Business buyers get Purchase History
          baseLinks.push({
            to: '/orders', 
            icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
            label: darkMode ? 'PURCHASE HISTORY' : 'Purchase History' 
          });
        }
      } else if (user.accountType === 'user') {
        // Regular users get My Account
        baseLinks.push({
          to: '/user-dashboard', 
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 
          label: darkMode ? 'MY ACCOUNT' : 'My Account' 
        });
      }

      // Orders - Available to all authenticated users
      baseLinks.push({
        to: '/orders', 
        icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', 
        label: darkMode ? 'ORDER STREAM' : 'Orders' 
      });

      // FIXED: Feedback instead of Support
      baseLinks.push({
        to: '/feedback', 
        icon: 'M7 8h10M7 12h6m-6 4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
        label: darkMode ? 'FEEDBACK MATRIX' : 'Feedback' 
      });

    } else {
      // Guest links
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
  
  // FIXED: Handle sign out with proper event handling
  const handleSignOut = async (e) => {
    e.stopPropagation(); // Prevent dropdown from closing immediately
    console.log('Sign out clicked');
    
    try {
      // Keep dropdown open momentarily to show the action is happening
      setTimeout(async () => {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
        
        await logout();
        navigate('/login', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if logout fails
      setTimeout(() => {
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
        navigate('/login', { replace: true });
      }, 100);
    }
  };

  // FIXED: Handle QR Tools navigation with proper event handling
  const handleQRToolsNavigation = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing immediately
    console.log('QR Tools clicked');
    
    setTimeout(() => {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      setCartDropdownOpen(false);
      navigate('/qr-tools');
    }, 100);
  };

  // FIXED: Handle navigation to profile with proper event handling
  const handleNavigateToProfile = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing immediately
    console.log('Profile clicked');
    
    setTimeout(() => {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      alert('Profile page not implemented yet');
    }, 100);
  };

  // FIXED: Handle navigation to settings with proper event handling
  const handleNavigateToSettings = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing immediately
    console.log('Settings clicked');
    
    setTimeout(() => {
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      alert('Settings page not implemented yet');
    }, 100);
  };

  // Handle checkout from cart dropdown
  const handleCheckoutFromDropdown = () => {
    setCartDropdownOpen(false);
    if (userCanCreateOrders) {
      setShowCheckoutSelector(true);
    } else {
      navigate('/checkout');
    }
  };

  // FIXED: Handle navigation with proper path resolution
  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setCartDropdownOpen(false);
    navigate(path);
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
      
      {/* Theme-aware navbar wrapper */}
      <div className={`${themePrefix}-navbar-wrapper relative overflow-hidden`}>
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
                { href: "/support-center", text: darkMode ? "HELP MATRIX" : "Help Center" },
                { href: "/feedback", text: darkMode ? "NEURAL SUPPORT" : "Contact Support" },
                { to: "/qr-tools", text: darkMode ? "QR PROTOCOLS" : "QR Tools", icon: "📱" } // FIXED: Matching App.jsx route
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
        
        {/* Main Navigation */}
        <nav className={`relative z-10 transition-all duration-500 backdrop-blur-lg overflow-hidden ${
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
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                
                {/* FIXED: Dynamic Navigation Links */}
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
                
                {/* Cart Dropdown */}
                {userCanAccessCart && (
                  <div className="relative" ref={cartDropdownRef}>
                    <button 
                      onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                      className={`relative transition-all duration-300 hover:scale-110 group inline-flex items-center gap-2 px-6 py-3 font-bold text-lg rounded-lg ${
                        darkMode 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-black border-2 border-cyan-400 shadow-lg shadow-cyan-500/25' 
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-indigo-600 shadow-lg shadow-indigo-500/50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      <span>{darkMode ? 'CART MATRIX' : 'Cart'}</span>
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </button>
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
                
                {/* User Profile Dropdown */}
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none group transition-all duration-300 hover:scale-110"
                    >
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
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${profileDropdownOpen ? 'rotate-180' : ''} ${
                        darkMode ? 'text-cyan-400' : 'text-indigo-100'
                      }`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
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

                {/* Mobile QR Tools Button - FIXED */}
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
        
        {/* INLINE CART DROPDOWN */}
        {cartDropdownOpen && (
          <div className={`transition-all duration-500 ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-900/98 via-cyan-900/20 to-gray-900/98 border-b border-cyan-500/30' 
              : 'bg-gradient-to-r from-indigo-700/98 via-blue-700/20 to-purple-700/98 border-b border-indigo-300/50'
          } backdrop-blur-lg animate-slideDown`}>
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-4xl mx-auto">
                
                {/* Cart Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${
                    darkMode ? 'cyber-title text-cyan-400 cyber-glow' : 'neumorph-title text-white'
                  }`}>
                    {darkMode ? 'CART MATRIX' : 'Shopping Cart'} ({itemCount})
                  </h3>
                  <button
                    onClick={() => setCartDropdownOpen(false)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-bounce">🛒</div>
                    <p className={`text-xl font-medium mb-6 ${darkMode ? 'text-cyan-300' : 'text-indigo-100'}`}>
                      {darkMode ? 'CART MATRIX EMPTY' : 'Your cart is empty'}
                    </p>
                    <Link
                      to="/catalog"
                      onClick={() => setCartDropdownOpen(false)}
                      className={`inline-flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 ${
                        darkMode 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-black' 
                          : 'bg-indigo-500 hover:bg-indigo-400 text-white'
                      }`}
                    >
                      <span>{darkMode ? 'BROWSE PRODUCTS' : 'Browse Products'}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    {cart.slice(0, 3).map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg ${
                        darkMode 
                          ? 'bg-gray-800/50 border border-cyan-600/30' 
                          : 'bg-indigo-600/20 border border-indigo-400/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${darkMode ? 'text-cyan-100' : 'text-white'}`}>
                            {item.name}
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-white'}`}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Cart Actions */}
                    <div className="flex gap-4 justify-center pt-4">
                      <button
                        onClick={handleCheckoutFromDropdown}
                        className={`px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 ${
                          darkMode 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-green-600 hover:bg-green-500 text-white'
                        }`}
                      >
                        {darkMode ? 'PROCESS ORDER' : 'Checkout'} (${cartTotal.toFixed(2)})
                      </button>
                      <Link
                        to="/cart"
                        onClick={() => setCartDropdownOpen(false)}
                        className={`px-8 py-4 font-bold text-lg rounded-lg transition-all duration-300 hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-cyan-300' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {darkMode ? 'VIEW FULL CART' : 'View Cart'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* INLINE PROFILE DROPDOWN */}
        {profileDropdownOpen && user && (
          <div className={`transition-all duration-500 ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-900/98 via-cyan-900/20 to-gray-900/98 border-b border-cyan-500/30' 
              : 'bg-gradient-to-r from-indigo-700/98 via-blue-700/20 to-purple-700/98 border-b border-indigo-300/50'
          } backdrop-blur-lg animate-slideDown`}>
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-4xl mx-auto">
                
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full p-1 ${
                      darkMode 
                        ? 'bg-cyan-600 ring-4 ring-cyan-400/50' 
                        : 'bg-indigo-500 ring-4 ring-indigo-400/50'
                    }`}>
                      <div className={`h-full w-full rounded-full flex items-center justify-center font-bold text-2xl ${
                        darkMode 
                          ? 'bg-gray-900 text-cyan-400' 
                          : 'bg-white text-indigo-700'
                      }`}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${darkMode ? 'text-cyan-100' : 'text-white'}`}>
                        {user.email}
                      </p>
                      <p className={`text-sm font-bold ${
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
                  </div>
                  <button
                    onClick={() => setProfileDropdownOpen(false)}
                    className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-cyan-400' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Profile Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* FIXED: Profile button with proper event handling */}
                  <button
                    onClick={handleNavigateToProfile}
                    className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800/50 hover:bg-cyan-900/20 border border-cyan-600/30' 
                        : 'bg-indigo-600/20 hover:bg-indigo-500/30 border border-indigo-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-cyan-400' : 'text-indigo-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className={`font-bold ${darkMode ? 'text-cyan-100' : 'text-white'}`}>
                        {darkMode ? 'NEURAL PROFILE' : 'Your Profile'}
                      </span>
                    </div>
                  </button>
                  
                  {/* FIXED: Settings button with proper event handling */}
                  <button
                    onClick={handleNavigateToSettings}
                    className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800/50 hover:bg-cyan-900/20 border border-cyan-600/30' 
                        : 'bg-indigo-600/20 hover:bg-indigo-500/30 border border-indigo-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-cyan-400' : 'text-indigo-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`font-bold ${darkMode ? 'text-cyan-100' : 'text-white'}`}>
                        {darkMode ? 'SYSTEM CONFIG' : 'Settings'}
                      </span>
                    </div>
                  </button>
                  
                  {/* FIXED: QR Tools button with proper event handling */}
                  <button
                    onClick={handleQRToolsNavigation}
                    className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800/50 hover:bg-cyan-900/20 border border-cyan-600/30' 
                        : 'bg-indigo-600/20 hover:bg-indigo-500/30 border border-indigo-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📱</span>
                      <span className={`font-bold ${darkMode ? 'text-cyan-100' : 'text-white'}`}>
                        {darkMode ? 'QR PROTOCOLS' : 'QR Tools'}
                      </span>
                    </div>
                  </button>
                  
                  {/* FIXED: Sign Out button with proper event handling */}
                  <button
                    onClick={handleSignOut}
                    className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
                      darkMode 
                        ? 'bg-red-900/30 hover:bg-red-900/50 border border-red-600/30' 
                        : 'bg-red-500/20 hover:bg-red-500/30 border border-red-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                        {darkMode ? 'DISCONNECT' : 'Sign Out'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden backdrop-blur-lg animate-slideInDown ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-900/98 to-cyan-900/20 border-b border-cyan-500/30' 
              : 'bg-gradient-to-r from-indigo-700/98 to-purple-700/20 border-b border-indigo-300/50'
          }`}>
            <div className="py-3 px-4 space-y-1">
              {getNavigationLinks().map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                    isActive(item.to)
                      ? darkMode 
                        ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-600/50' 
                        : 'bg-indigo-600/30 text-white border border-indigo-400/50'
                      : darkMode 
                        ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                        : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {userCanCreateOrders && (
                <Link
                  to="/create-order"
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-bold ${
                    darkMode 
                      ? 'text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100' 
                      : 'text-indigo-100 hover:bg-indigo-600/20 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {darkMode ? 'NEW ORDER' : 'New Order'}
                </Link>
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
                    onClick={handleNavigateToProfile}
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
                    onClick={handleNavigateToSettings}
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
                    onClick={handleQRToolsNavigation}
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
                    onClick={handleSignOut}
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
                <Link
                  to="/login"
                  className={`block text-center py-3 mt-4 font-bold rounded-lg transition-all duration-300 hover:scale-105 ${
                    darkMode 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {darkMode ? 'NEURAL ACCESS' : 'Sign In'}
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
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
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Navbar;