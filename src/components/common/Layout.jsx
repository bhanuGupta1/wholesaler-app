// src/components/common/Layout.jsx - Enhanced with dark mode support and user login state
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const { darkMode } = useTheme();
  
  const isActive = (path) => location.pathname === path;

  // Detect scrolling for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setSidebarOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Determine if we should show the full layout or just the main content
  // For login page, we only want to show content without the navbar and sidebar
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password';

  // If on a login/auth page, just render the content without the layout
  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`sticky top-0 z-40 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Mobile sidebar button */}
      <button
        className={`fixed bottom-4 right-4 p-3 rounded-full ${darkMode ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-white'} shadow-lg z-30 lg:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      
      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden z-30 w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl transition-transform duration-300 ease-in-out`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className={`h-8 w-8 ${darkMode ? 'bg-indigo-600' : 'bg-indigo-600'} rounded-md flex items-center justify-center text-white`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
                </svg>
              </div>
              <h2 className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Wholesaler</h2>
            </div>
            <button
              className={`text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1 rounded`}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* User info */}
          {user ? (
            <div className="mb-8">
              <div className={`flex items-center p-4 ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} rounded-lg`}>
                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-indigo-200'} flex items-center justify-center ${darkMode ? 'text-white' : 'text-indigo-800'} font-bold`}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.displayName || 'User'}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 flex justify-center">
              <Link to="/login" className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                Sign In
              </Link>
            </div>
          )}
          
          {/* Navigation links */}
          <nav className="space-y-1">
            <Link
              to="/"
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/') 
                  ? darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${isActive('/') ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/inventory"
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/inventory') 
                  ? darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${isActive('/inventory') ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Inventory
            </Link>
            <Link
              to="/orders"
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/orders') 
                  ? darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${isActive('/orders') ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Orders
            </Link>
            <Link
              to="/create-order"
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive('/create-order') 
                  ? darkMode ? 'bg-gray-700 text-indigo-400' : 'bg-indigo-50 text-indigo-700' 
                  : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${isActive('/create-order') ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Order
            </Link>
          </nav>
          
          {/* Theme toggle and sign out */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Theme</h3>
              <ThemeToggle />
            </div>
            
            {user && (
              <button
                onClick={handleSignOut}
                className={`mt-6 w-full flex items-center px-4 py-3 ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow py-6 px-4">
        {children}
      </main>
      
      <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t py-6 mt-auto`}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>About Us</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Careers</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Privacy Policy</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Documentation</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Guides</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>API Reference</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Support Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Features</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Inventory Management</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Order Processing</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Analytics</a></li>
                <li><a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Contact</h3>
              <ul className="space-y-3">
                <li className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (123) 456-7890
                </li>
                <li className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@wholesaler.com
                </li>
              </ul>
            <div className="mt-6">
  <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider mb-4`}>Connect</h3>
  <div className="flex space-x-4">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
      <Facebook className="h-5 w-5 hover:text-blue-500 transition-colors duration-200" />
    </a>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
      <Twitter className="h-5 w-5 hover:text-sky-500 transition-colors duration-200" />
    </a>
    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
      <Linkedin className="h-5 w-5 hover:text-blue-700 transition-colors duration-200" />
    </a>
  </div>
</div>       




            </div>
          </div>
          <div className={`mt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6 flex flex-col md:flex-row justify-between items-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>&copy; {new Date().getFullYear()} Wholesaler App. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Made with ❤️ by the Wholesaler Team</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;