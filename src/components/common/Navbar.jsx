// src/components/common/Navbar.jsx - UPDATED: Added QR Tools navigation
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
  
  const dropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  const itemCount = getCartItemCount();
  const cartTotal = getCartTotal();
  
  // Check if user can access cart and create orders
  const userCanAccessCart = canAccessCart(user);
  const userCanCreateOrders = canCreateOrders(user);
  
  // Check if user can access QR tools (everyone can access, but admins/managers see more)
  const userCanAccessQR = true; // QR tools are available to everyone
  
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
  
  return (
    <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-indigo-700 to-indigo-600'}`}>
      {/* Top Bar with Search */}
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-indigo-800'} py-2 px-4 text-indigo-100`}>
        <div className="container mx-auto flex items-center justify-between text-sm">
          <p className="hidden md:block">Wholesaler | Premium Inventory Management with QR Tools</p>
          <div className="flex items-center space-x-3">
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            <span>|</span>
            <Link to="/qr-tools" className="hover:text-white transition-colors flex items-center">
              <span className="mr-1">📱</span>
              QR Tools
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center bg-white p-2 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
              </svg>
            </div>
            <Link to="/" className="text-2xl font-bold text-white">Wholesaler</Link>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search products, orders, customers, or scan QR codes..." 
                className={`w-full py-2 pl-4 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-indigo-400 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'}`}
              />
              <button className="absolute right-0 top-0 bottom-0 px-3 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/') ? 'border-b-2 border-white' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          


            <Link 
              to="/catalog" 
              className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/catalog') ? 'border-b-2 border-white' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Catalog
            </Link>
            
            <Link 
              to="/inventory" 
              className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/inventory') ? 'border-b-2 border-white' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Inventory
            </Link>
            
            <Link 
              to="/orders" 
              className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/orders') ? 'border-b-2 border-white' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Orders
            </Link>
             <Link 
              to="/feedback" 
              className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/feedback') ? 'border-b-2 border-white' : ''}`}
          >
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h8M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
  Feedback
</Link>

            {/* NEW: QR Tools Link */}
            {userCanAccessQR && (
              <Link 
                to="/qr-tools" 
                className={`text-indigo-100 hover:text-white font-medium transition-colors flex items-center ${isActive('/qr-tools') ? 'border-b-2 border-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                📱 QR Tools
              </Link>
            )}
            
            <div className="h-6 w-px bg-indigo-300"></div>
            
            {/* Enhanced Cart Dropdown - Only show if user can access cart */}
            {userCanAccessCart && (
              <div className="relative" ref={cartDropdownRef}>
                <button 
                  onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                  className={`relative inline-flex items-center px-3 py-2 rounded-lg font-medium text-white bg-white/10 hover:bg-white/20 transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Cart
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {cartDropdownOpen && (
                  <div className={`absolute right-0 mt-3 w-80 ${darkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-black ring-opacity-5'} rounded-lg shadow-xl py-2 z-50 transform transition-all duration-150 origin-top-right`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Shopping Cart ({itemCount})
                      </h3>
                      {cartTotal > 0 && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Total: ${cartTotal.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    {cart.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-4xl mb-2">🛒</div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Your cart is empty
                        </p>
                        <Link
                          to="/catalog"
                          onClick={() => setCartDropdownOpen(false)}
                          className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Cart Items */}
                        <div className="max-h-60 overflow-y-auto">
                          {cart.slice(0, 3).map((item) => (
                            <div key={item.id} className={`px-4 py-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                  ) : (
                                    <span>📦</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                    {item.name}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {cart.length > 3 && (
                            <div className={`px-4 py-2 text-center border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                              <span className="text-sm">
                                +{cart.length - 3} more item{cart.length - 3 !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Cart Actions */}
                        <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
                          <button
                            onClick={handleCheckoutFromDropdown}
                            className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Checkout (${cartTotal.toFixed(2)})
                          </button>
                          <Link
                            to="/cart"
                            onClick={() => setCartDropdownOpen(false)}
                            className={`block w-full py-2 px-4 text-center border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} text-sm font-medium rounded-lg transition-colors`}
                          >
                            View Cart
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Create Order button - Only show if user can create orders */}
            {userCanCreateOrders && (
              <Link 
                to="/create-order" 
                className={`bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Order
              </Link>
            )}
            
            {/* Dark mode toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
            
            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="h-10 w-10 rounded-full bg-white p-0.5 shadow-md overflow-hidden group-hover:ring-2 ring-white transition-all">
                    <div className="bg-indigo-200 h-full w-full rounded-full flex items-center justify-center text-indigo-800 font-bold text-lg">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {profileDropdownOpen && (
                  <div className={`absolute right-0 mt-3 w-64 ${darkMode ? 'bg-gray-800 ring-gray-700' : 'bg-white ring-black ring-opacity-5'} rounded-lg shadow-xl py-2 z-50 transform transition-all duration-150 origin-top-right`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Signed in as</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{user.email}</p>
                      {/* Show user type for clarity */}
                      <p className={`text-xs ${
                        user.accountType === 'admin' ? 'text-red-500' : 
                        user.accountType === 'manager' ? 'text-purple-500' : 
                        'text-green-500'
                      }`}>
                        {user.accountType === 'admin' ? '👑 Administrator' : 
                         user.accountType === 'manager' ? '👔 Manager' : 
                         user.accountType === 'business' ? '🏢 Business User' : 
                         '👤 Regular User'}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      {/* NEW: QR Tools in Profile Menu */}
                      <Link 
                        to="/qr-tools" 
                        className={`flex items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <span className="mr-3">📱</span>
                        QR Tools
                      </Link>
                    </div>
                    <div className={`py-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button 
                        onClick={handleSignOut}
                        className={`flex w-full items-center px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-red-900/30 hover:text-red-300' : 'text-gray-700 hover:bg-red-50 hover:text-red-700'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button - Only show if user can access cart */}
            {userCanAccessCart && (
              <Link 
                to="/cart"
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile QR Tools Button */}
            <Link 
              to="/qr-tools"
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              title="QR Tools"
            >
              <span className="text-lg">📱</span>
            </Link>
            
            <ThemeToggle className="mr-2" />
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        {mobileMenuOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search..." 
                className={`w-full py-2 pl-4 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-indigo-400 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800 placeholder-gray-500'}`}
              />
              <button className="absolute right-0 top-0 bottom-0 px-3 bg-indigo-500 text-white rounded-r-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Mobile Menu - Updated with QR Tools */}
      {mobileMenuOpen && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-indigo-800'} md:hidden`}>
          <div className="py-3 px-4 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/catalog"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link
              to="/inventory"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inventory
            </Link>
            <Link
              to="/orders"
              className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>

            {/* NEW: QR Tools in Mobile Menu */}
            <Link
              to="/qr-tools"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-2">📱</span>
              QR Tools
            </Link>
            
            {/* Only show Create Order for users who can create orders */}
            {userCanCreateOrders && (
              <Link
                to="/create-order"
                className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                New Order
              </Link>
            )}
            
            {user ? (
              <div className={`pt-4 pb-3 border-t ${darkMode ? 'border-gray-700' : 'border-indigo-700'}`}>
                <div className="flex items-center px-3">
                  <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-600 text-white' : 'bg-indigo-200 text-indigo-800'} flex items-center justify-center font-bold`}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.displayName || "User"}</div>
                    <div className="text-sm font-medium text-indigo-300">{user.email}</div>
                    {/* Show user type in mobile menu */}
                    <div className={`text-xs ${
                      user.accountType === 'admin' ? 'text-red-400' : 
                      user.accountType === 'manager' ? 'text-purple-400' : 
                      'text-green-400'
                    }`}>
                      {user.accountType === 'admin' ? '👑 Administrator' : 
                       user.accountType === 'manager' ? '👔 Manager' : 
                       user.accountType === 'business' ? '🏢 Business User' : 
                       '👤 Regular User'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/profile"
                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className={`block px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:${darkMode ? 'bg-gray-700' : 'bg-indigo-700'}`}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`block px-3 py-2 mt-2 rounded-md text-base font-medium ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-indigo-600'} hover:opacity-90`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Checkout Flow Selector Modal */}
      {showCheckoutSelector && (
        <CheckoutFlowSelector 
          showAsModal={true} 
          onClose={() => setShowCheckoutSelector(false)} 
        />
      )}
    </div>
  );
};

export default Navbar;