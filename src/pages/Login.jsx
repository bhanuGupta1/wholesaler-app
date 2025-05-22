// src/pages/Login.jsx - Enhanced Login Page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading: authLoading } = useAuth();
  const { darkMode } = useTheme();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/";
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await login(credentials.email, credentials.password, rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to quick-fill credentials for demo accounts
  const useTestAccount = (role) => {
    let email = '';
    let password = 'password123';

    switch(role) {
      case 'admin':
        email = 'admin@wholesaler.com';
        break;
      case 'manager': 
        email = 'manager@wholesaler.com';
        break;
      case 'user':
        email = 'user@wholesaler.com';
        break;
      default:
        email = 'user@wholesaler.com';
    }

    setCredentials({
      email,
      password
    });
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Panel - Brand information */}
      <div className={`hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-12 flex-col justify-between`}>
        <div>
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold ml-3">Wholesaler</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">Premium Inventory Management</h2>
          <p className="text-indigo-100 mb-8">
            The complete solution for managing your wholesale inventory and customer orders in real-time.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Real-time Inventory Tracking</h3>
                <p className="text-indigo-100 text-sm mt-1">Keep track of your stock levels in real-time with automatic updates.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Seamless Order Management</h3>
                <p className="text-indigo-100 text-sm mt-1">Create and process orders with automatic stock adjustments.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Comprehensive Analytics</h3>
                <p className="text-indigo-100 text-sm mt-1">Gain insights into your business with detailed reports and analytics.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-12">
          <p className="text-sm text-indigo-100">© {new Date().getFullYear()} Wholesaler App. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className={`flex flex-col justify-center items-center p-6 md:p-12 w-full md:w-1/2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center mb-8">
            <div className={`h-10 w-10 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} rounded-lg flex items-center justify-center text-white`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-4v4h4V7zm1-2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h12z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold ml-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Wholesaler</h1>
          </div>
          
          <div className="text-center mb-10">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome back</h2>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Please sign in to your account</p>
          </div>
          
          {/* Demo accounts section */}
          <div className={`mb-6 ${darkMode ? 'bg-gray-800' : 'bg-indigo-50'} rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-indigo-700'} font-medium`}>
                Demo Application
              </p>
              <button 
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className={`text-xs ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                {showDemoAccounts ? 'Hide Accounts' : 'Show Test Accounts'}
              </button>
            </div>
            
            {showDemoAccounts && (
              <div className="mt-3 space-y-2">
                <button 
                  onClick={() => useTestAccount('admin')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  }`}
                >
                  Admin: admin@wholesaler.com / password123
                </button>
                <button 
                  onClick={() => useTestAccount('manager')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  }`}
                >
                  Manager: manager@wholesaler.com / password123
                </button>
                <button 
                  onClick={() => useTestAccount('user')}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-indigo-300' 
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  }`}
                >
                  User: user@wholesaler.com / password123
                </button>
              </div>
            )}
          </div>
          
          {(error || authError) && (
            <div className={`mb-6 ${darkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-500'} border-l-4 p-4 rounded-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    {error || authError}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className={`${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 sm:text-sm rounded-md`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className={`${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 sm:text-sm rounded-md`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || authLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${(loading || authLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {(loading || authLoading) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center py-2 px-4 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium`}
                  onClick={() => {
                    // Handle Google login
                    console.log('Google login clicked');
                  }}
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                  </svg>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className={`w-full inline-flex justify-center py-2 px-4 border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium`}
                  onClick={() => {
                    // Handle Facebook login
                    console.log('Facebook login clicked');
                  }}
                >
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/signup" className={`font-medium ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;