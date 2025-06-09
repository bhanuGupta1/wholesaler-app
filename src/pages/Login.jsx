// src/pages/Login.jsx - CLEAN: Using existing cyberpunk CSS classes with proper JSX
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading: authLoading, user, approvalStatus, clearError } = useAuth();
  const { darkMode } = useTheme();
  
  const from = "/home";
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    clearError();
    setError('');
  }, [credentials.email, credentials.password, clearError]);

  useEffect(() => {
    if (user && loginAttempted) {
      if (user.canAccess) {
        navigate('/home', { replace: true, state: {} });
      } else if (approvalStatus && !approvalStatus.canAccess) {
        navigate('/home', { replace: true, state: {} });
      }
    }
  }, [user, approvalStatus, loginAttempted, navigate]);

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
    setLoginAttempted(true);
    
    try {
      await login(credentials.email, credentials.password, rememberMe);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
      setLoginAttempted(false);
    } finally {
      setLoading(false);
    }
  };

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
      case 'business_buyer':
        email = 'buyer@wholesaler.com';
        break;
      case 'business_seller':
        email = 'seller@wholesaler.com';
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
    <div className="cyberpunk-login-wrapper">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex relative z-10">
        {/* Left Panel - Cyberpunk Brand */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/5"></div>
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            {/* Header */}
            <div>
              <div className="flex items-center mb-12">
                <div className="cyber-logo">
                  <div className="logo-glow"></div>
                  <svg className="h-8 w-8 text-cyan-400 cyber-glow animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-4xl font-bold cyberpunk-title">
                    <span className="text-cyan-400 cyber-glow">WHOLESALER</span>
                  </h1>
                  <div className="text-sm text-yellow-400 font-mono typewriter-text">2077 EDITION</div>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-6xl font-bold leading-tight mb-8 cyberpunk-title">
                  <span className="text-cyan-400 cyber-glow animate-float">NEURAL</span>
                  <br />
                  <span className="text-purple-400 cyber-glow animate-float">ACCESS</span>
                  <br />
                  <span className="text-yellow-400 cyber-glow hacker-text animate-float" data-text="PORTAL">PORTAL</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed font-mono typewriter-text">
                  Secure authentication to your quantum commerce platform
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4 animate-float">
                  <div className="feature-icon">
                    <div className="icon-glow"></div>
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-green-400 text-glow">QUANTUM SECURITY</h3>
                    <p className="text-gray-300 font-mono text-sm">Military-grade encryption with neural authentication protocols</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 animate-float">
                  <div className="feature-icon">
                    <div className="icon-glow"></div>
                    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-purple-400 text-glow">MULTI-ROLE MATRIX</h3>
                    <p className="text-gray-300 font-mono text-sm">Dynamic access levels for admins, managers, and operatives</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 animate-float">
                  <div className="feature-icon">
                    <div className="icon-glow"></div>
                    <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-yellow-400 text-glow">REAL-TIME NEURAL NET</h3>
                    <p className="text-gray-300 font-mono text-sm">Instant data synchronization across quantum networks</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-cyan-400/20 pt-8">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 font-mono text-sm text-glow">
                  © 2077 WHOLESALER CORP
                </p>
                <div className="flex space-x-4">
                  <div className="status-indicator">
                    <div className="status-dot status-online"></div>
                    <span className="status-text text-xs">SECURE</span>
                  </div>
                  <div className="status-indicator">
                    <div className="status-dot status-neural"></div>
                    <span className="status-text text-xs">NEURAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Holograms */}
          <div className="absolute top-20 left-20 hologram-float">
            <div className="hologram-cube"></div>
          </div>
          <div className="absolute bottom-20 right-20 hologram-float">
            <div className="hologram-pyramid"></div>
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative">
          <div className="mx-auto w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="cyber-logo">
                <div className="logo-glow"></div>
                <svg className="h-8 w-8 text-cyan-400 cyber-glow animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold cyberpunk-title">
                  <span className="text-cyan-400 cyber-glow">WHOLESALER</span>
                </h1>
                <div className="text-xs text-yellow-400 font-mono typewriter-text">2077 EDITION</div>
              </div>
            </div>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 cyberpunk-title">
                <span className="text-cyan-400 cyber-glow animate-float">ACCESS</span>
                <span className="text-purple-400 cyber-glow animate-float"> GRANTED</span>
              </h2>
              <p className="text-lg text-gray-300 font-mono typewriter-text">
                Initialize neural connection
              </p>
            </div>
            
            {/* Demo Accounts Panel */}
            <div className="mb-8">
              <div className="border border-cyan-400/30 rounded-lg p-6 relative overflow-hidden bg-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-400/20 rounded-lg flex items-center justify-center mr-3 border border-green-400/50">
                      <svg className="h-4 w-4 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-green-400 font-mono text-glow animate-float">DEMO MATRIX</h3>
                  </div>
                  <button 
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className="text-sm font-mono text-cyan-400 hover:text-cyan-300 transition-colors text-glow holographic-text"
                  >
                    {showDemoAccounts ? '[HIDE]' : '[SHOW]'} TEST ACCOUNTS
                  </button>
                </div>
                
                {showDemoAccounts && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => useTestAccount('admin')}
                      className="cyber-btn cyber-btn-red w-full justify-between bg-transparent animate-float"
                    >
                      <span>🔴 ADMIN</span>
                      <span className="text-xs opacity-80">admin@wholesaler.com</span>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <button 
                      onClick={() => useTestAccount('manager')}
                      className="cyber-btn cyber-btn-purple w-full justify-between bg-transparent animate-float"
                    >
                      <span>🟣 MANAGER</span>
                      <span className="text-xs opacity-80">manager@wholesaler.com</span>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <button 
                      onClick={() => useTestAccount('business_buyer')}
                      className="cyber-btn cyber-btn-blue w-full justify-between bg-transparent animate-float"
                    >
                      <span>🔵 BUYER</span>
                      <span className="text-xs opacity-80">buyer@wholesaler.com</span>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <button 
                      onClick={() => useTestAccount('business_seller')}
                      className="cyber-btn cyber-btn-success w-full justify-between bg-transparent animate-float"
                    >
                      <span>🟠 SELLER</span>
                      <span className="text-xs opacity-80">seller@wholesaler.com</span>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <button 
                      onClick={() => useTestAccount('user')}
                      className="cyber-btn cyber-btn-green w-full justify-between bg-transparent animate-float"
                    >
                      <span>🟢 USER</span>
                      <span className="text-xs opacity-80">user@wholesaler.com</span>
                      <div className="btn-glow"></div>
                    </button>
                    
                    <div className="text-xs text-center pt-3 text-gray-400 font-mono bg-black/10 rounded p-2">
                      PASSWORD: <span className="text-cyan-400 text-glow holographic-text">password123</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Error Display */}
            {(error || authError) && (
              <div className="mb-6 p-4 border border-red-500/50 rounded-lg relative overflow-hidden bg-red-900/10 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-mono text-red-300 text-glow hacker-text">
                      ERROR: {error || authError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            {approvalStatus && !approvalStatus.canAccess && user && (
              <div className="mb-6 p-4 border border-yellow-500/50 rounded-lg relative overflow-hidden bg-yellow-900/10 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-yellow-400 font-mono text-glow typewriter-text">
                      STATUS: {approvalStatus.status?.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm mt-1 text-yellow-300 font-mono holographic-text">
                      {approvalStatus.message || 'AWAITING ADMIN CLEARANCE'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="animate-float">
                <label htmlFor="email-address" className="block text-sm font-bold mb-3 text-cyan-400 font-mono text-glow">
                  EMAIL.ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
                    className="block w-full pl-12 pr-3 py-3 font-mono bg-transparent border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:bg-black/10 transition-all backdrop-blur-sm"
                    placeholder="neural.user@domain.com"
                  />
                </div>
              </div>

              <div className="animate-float">
                <label htmlFor="password" className="block text-sm font-bold mb-3 text-cyan-400 font-mono text-glow">
                  ACCESS.CODE
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                    className="block w-full pl-12 pr-3 py-3 font-mono bg-transparent border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:bg-black/10 transition-all backdrop-blur-sm"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between animate-float">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-cyan-400 focus:ring-cyan-500 border-cyan-400/50 bg-transparent rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-300 font-mono">
                    REMEMBER SESSION
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-mono text-yellow-400 hover:text-yellow-300 transition-colors text-glow holographic-text"
                  >
                    RESET.ACCESS.CODE
                  </Link>
                </div>
              </div>

              <div className="animate-float">
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className={`cyber-btn cyber-btn-primary w-full bg-transparent ${
                    (loading || authLoading) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="btn-glow"></div>
                  {(loading || authLoading) ? (
                    <div className="flex items-center justify-center">
                      <div className="cyber-loading-spinner w-5 h-5 mr-3"></div>
                      <span className="btn-text font-mono text-glow hacker-text">AUTHENTICATING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="btn-text font-mono text-glow hacker-text">INITIALIZE CONNECTION</span>
                      <svg className="ml-2 h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>
            
            {/* Sign Up Section */}
            <div className="mt-8 animate-float">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/20 backdrop-blur-sm text-gray-300 font-mono rounded text-glow holographic-text">OR</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300 font-mono typewriter-text">
                  NO NEURAL.PROFILE?{' '}
                  <Link 
                    to="/register" 
                    className="font-bold text-green-400 hover:text-green-300 transition-colors text-glow hacker-text holographic-text"
                  >
                    CREATE.ACCOUNT
                  </Link>
                </p>
                <p className="text-xs mt-3 text-gray-400 font-mono bg-black/10 rounded p-2 animate-float">
                  <span className="inline-flex items-center">
                    <svg className="h-3 w-3 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="holographic-text">BUSINESS.ACCOUNTS REQUIRE ADMIN.CLEARANCE</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;