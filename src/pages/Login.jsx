// src/pages/Login.jsx - CYBERPUNK VERSION with visible Matrix Rain and Theme Toggle
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading: authLoading, user, approvalStatus, clearError } = useAuth();
  const { darkMode } = useTheme();
  
  // Canvas refs for cyberpunk effects
  const matrixCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Matrix Rain Effect - Enhanced and Visible
  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * canvas.height / fontSize;
    }

    const draw = () => {
      // Semi-transparent black overlay for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        // Create gradient for each character
        const gradient = ctx.createLinearGradient(
          0, 
          rainDrops[i] * fontSize - 20, 
          0, 
          rainDrops[i] * fontSize + 10
        );
        
        if (darkMode) {
          gradient.addColorStop(0, '#00FFFF');
          gradient.addColorStop(0.7, '#00FF88');
          gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
        } else {
          gradient.addColorStop(0, '#0066CC');
          gradient.addColorStop(0.7, '#0088AA');
          gradient.addColorStop(1, 'rgba(0, 102, 204, 0.1)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        // Reset drop when it reaches bottom
        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 60); // Faster for more visible effect

    const handleResize = () => {
      updateCanvasSize();
      // Recalculate columns on resize
      const newColumns = Math.floor(canvas.width / fontSize);
      if (newColumns !== columns) {
        rainDrops.length = newColumns;
        for (let x = columns; x < newColumns; x++) {
          rainDrops[x] = Math.random() * canvas.height / fontSize;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode]); // Re-run when theme changes

  // Floating Particles Effect
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        color: darkMode ? `hsl(${180 + Math.random() * 60}, 100%, 50%)` : `hsl(${200 + Math.random() * 40}, 80%, 40%)`,
        energy: Math.random()
      });
    }

    const animate = () => {
      ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;
        particle.energy = Math.sin(particle.pulse) * 0.5 + 0.5;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const glowSize = particle.size + particle.energy * 3;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]); // Re-run when theme changes

  // Clear errors when component mounts or when user types
  useEffect(() => {
    clearError();
    setError('');
  }, [credentials.email, credentials.password, clearError]);

  // Handle successful login or approval status
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

    setCredentials({ email, password });
  };

  return (
    // SIMPLIFIED: Direct background without complex wrappers
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
      
      {/* MATRIX RAIN - TOP LAYER, MOST VISIBLE */}
      <canvas 
        ref={matrixCanvasRef} 
        className="fixed inset-0 z-0" 
        style={{ 
          opacity: darkMode ? 0.4 : 0.2,
          mixBlendMode: darkMode ? 'normal' : 'multiply'
        }}
      />
      
      {/* FLOATING PARTICLES */}
      <canvas 
        ref={particleCanvasRef} 
        className="fixed inset-0 z-1" 
        style={{ 
          opacity: darkMode ? 0.6 : 0.3 
        }}
      />
      
      {/* CYBERPUNK GRID - Only in dark mode */}
      {darkMode && (
        <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
          <div className="cyberpunk-grid"></div>
        </div>
      )}

      {/* SCANLINES - Only in dark mode */}
      {darkMode && (
        <div className="fixed inset-0 z-3 pointer-events-none">
          <div className="scanlines"></div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        
        {/* Left Panel - Neural Interface Info */}
        <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between">
          {/* Background overlay */}
          <div className={`absolute inset-0 ${
            darkMode 
              ? 'bg-gradient-to-br from-cyan-900/30 to-purple-900/30' 
              : 'bg-gradient-to-br from-blue-900/80 to-purple-900/80'
          } backdrop-blur-sm`}></div>
          
          <div className="relative z-10">
            {/* Cyberpunk Logo */}
            <div className="flex items-center mb-12">
              <div className={`cyber-logo h-12 w-12 ${darkMode ? '' : 'border-blue-600'}`}>
                <div className="logo-glow"></div>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
              <h1 className={`text-3xl font-bold ml-4 cyberpunk-title ${
                darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'
              }`}>
                WHOLESALER
              </h1>
            </div>
            
            {/* Main Title */}
            <h2 className="text-5xl font-bold mb-8 cyberpunk-title">
              <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>NEURAL</span>
              <br />
              <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-purple-700'}>INTERFACE</span>
              <br />
              <span className={darkMode ? 'text-yellow-400 cyber-glow' : 'text-yellow-600'}>ACCESS</span>
            </h2>
            
            <p className={`text-xl mb-12 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-white'
            }`}>
              Connect to the wholesale neural network and manage your business operations 
              through our advanced quantum commerce platform.
            </p>
            
            {/* Features */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-cyan-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 cyberpunk-title ${
                    darkMode ? 'text-cyan-400' : 'text-blue-600'
                  }`}>QUANTUM SECURITY</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-200'}>
                    Role-based neural authentication with quantum encryption
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 cyberpunk-title ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>MULTI-PROTOCOL SUPPORT</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-200'}>
                    Advanced dashboards for all business entity types
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold mb-2 cyberpunk-title ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>NEURAL COMMERCE</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-200'}>
                    AI-powered buyer and seller ecosystem integration
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="relative z-10">
            <p className={`text-sm font-mono ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>
              © {new Date().getFullYear()} NEURAL WHOLESALER CORP. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
        
        {/* Right Panel - Login Interface */}
        <div className="flex flex-col justify-center items-center p-6 md:p-12 w-full md:w-1/2 relative">
          {/* Background for right panel */}
          <div className={`absolute inset-0 ${
            darkMode ? 'bg-black/90' : 'bg-white/95'
          } backdrop-blur-md`}></div>
          
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>
          
          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center mb-12">
              <div className={`cyber-logo h-12 w-12 ${darkMode ? '' : 'border-blue-600'}`}>
                <div className="logo-glow"></div>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
              <h1 className={`text-2xl font-bold ml-3 cyberpunk-title ${
                darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'
              }`}>
                WHOLESALER
              </h1>
            </div>
            
            {/* Login Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 cyberpunk-title">
                <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>ACCESS</span>
                <br />
                <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-purple-700'}>TERMINAL</span>
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Initialize neural connection
              </p>
            </div>
            
            {/* Demo Accounts Card */}
            <div className={`${darkMode ? 'cyber-card' : 'bg-gray-50 border-2 border-gray-300 rounded-lg'} mb-8`}>
              {darkMode && <div className="card-glow"></div>}
              <div className="card-content p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className={`font-bold text-sm cyberpunk-title ${
                    darkMode ? 'text-cyan-400' : 'text-blue-600'
                  }`}>
                    DEMO PROTOCOLS
                  </p>
                  <button 
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded px-3 py-1'} text-xs`}
                  >
                    {darkMode && <div className="btn-glow"></div>}
                    <span className={darkMode ? 'btn-text' : ''}>{showDemoAccounts ? 'HIDE' : 'SHOW'}</span>
                  </button>
                </div>
                
                {showDemoAccounts && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => useTestAccount('admin')}
                      className={`${darkMode ? 'cyber-btn cyber-btn-red' : 'bg-red-100 hover:bg-red-200 border border-red-300 rounded px-3 py-2'} w-full text-xs`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>🔴 ADMIN PROTOCOL</span>
                    </button>
                    <button 
                      onClick={() => useTestAccount('manager')}
                      className={`${darkMode ? 'cyber-btn cyber-btn-purple' : 'bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded px-3 py-2'} w-full text-xs`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>🟣 MANAGER PROTOCOL</span>
                    </button>
                    <button 
                      onClick={() => useTestAccount('business_buyer')}
                      className={`${darkMode ? 'cyber-btn cyber-btn-blue' : 'bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded px-3 py-2'} w-full text-xs`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>🔵 BUYER PROTOCOL</span>
                    </button>
                    <button 
                      onClick={() => useTestAccount('business_seller')}
                      className={`${darkMode ? 'cyber-btn cyber-btn-green' : 'bg-green-100 hover:bg-green-200 border border-green-300 rounded px-3 py-2'} w-full text-xs`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>🟠 SELLER PROTOCOL</span>
                    </button>
                    <button 
                      onClick={() => useTestAccount('user')}
                      className={`${darkMode ? 'cyber-btn cyber-btn-cyan' : 'bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 rounded px-3 py-2'} w-full text-xs`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>🟢 USER PROTOCOL</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Error Display */}
            {(error || authError) && (
              <div className={`${darkMode ? 'cyber-card border-red-600' : 'bg-red-50 border-2 border-red-300 rounded-lg'} mb-8`}>
                <div className="card-content p-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className={`font-bold text-sm cyberpunk-title mb-1 ${
                        darkMode ? 'text-red-400' : 'text-red-700'
                      }`}>
                        CONNECTION ERROR
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {error || authError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            {approvalStatus && !approvalStatus.canAccess && user && (
              <div className={`${darkMode ? 'cyber-card border-yellow-600' : 'bg-yellow-50 border-2 border-yellow-300 rounded-lg'} mb-8`}>
                <div className="card-content p-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 13.5C3.312 15.333 4.27 17 5.81 17z" />
                    </svg>
                    <div>
                      <h3 className={`font-bold text-sm cyberpunk-title mb-1 ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-700'
                      }`}>
                        AUTHORIZATION STATUS: {approvalStatus.status?.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        {approvalStatus.message || 'Neural access requires admin approval.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Login Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className={`block text-sm font-bold cyberpunk-title mb-2 ${
                  darkMode ? 'text-cyan-400' : 'text-blue-600'
                }`}>
                  EMAIL PROTOCOL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${darkMode ? 'text-cyan-600' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className={`pl-12 py-4 text-lg font-mono w-full rounded-lg border-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-800 border-cyan-600 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500' 
                        : 'bg-white border-blue-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="neural.id@corp.net"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-bold cyberpunk-title mb-2 ${
                  darkMode ? 'text-cyan-400' : 'text-blue-600'
                }`}>
                  ACCESS KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${darkMode ? 'text-cyan-600' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
                    className={`pl-12 py-4 text-lg font-mono w-full rounded-lg border-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-800 border-cyan-600 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500' 
                        : 'bg-white border-blue-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                    }`}
                    placeholder="••••••••••••••••"
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
                    className={`h-4 w-4 rounded ${
                      darkMode 
                        ? 'border-cyan-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500' 
                        : 'border-blue-300 bg-white text-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  <label htmlFor="remember-me" className={`ml-3 block text-sm cyberpunk-title ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    MAINTAIN CONNECTION
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className={`cyberpunk-title transition-colors ${
                    darkMode 
                      ? 'text-purple-400 hover:text-purple-300 cyber-glow' 
                      : 'text-purple-600 hover:text-purple-700'
                  }`}>
                    RESET ACCESS
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className={`${
                    darkMode ? 'cyber-btn cyber-btn-primary' : 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 text-white rounded-lg transition-all'
                  } w-full py-4 text-lg font-bold`}
                >
                  {(loading || authLoading) ? (
                    <>
                      {darkMode && <div className="cyber-loading-spinner w-6 h-6 mr-3"></div>}
                      <span className={darkMode ? 'btn-text' : ''}>CONNECTING...</span>
                    </>
                  ) : (
                    <span className={darkMode ? 'btn-text' : ''}>INITIALIZE CONNECTION</span>
                  )}
                  {darkMode && <div className="btn-glow"></div>}
                </button>
              </div>
            </form>
            
            {/* Registration Link */}
            <div className="mt-10 text-center">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Need neural access credentials?
              </p>
              <Link to="/register" className={`${
                darkMode ? 'cyber-btn cyber-btn-outline' : 'bg-white border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg px-6 py-3 transition-all'
              }`}>
                {darkMode && <div className="btn-glow"></div>}
                <span className={darkMode ? 'btn-text' : ''}>REQUEST ACCESS</span>
              </Link>
              <p className={`text-xs mt-4 font-mono ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                ⚠️ Business and manager protocols require admin authorization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;