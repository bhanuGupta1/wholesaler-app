// src/pages/Login.jsx - CYBERPUNK VERSION with Matrix Rain and Neural Interface
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

  // Matrix Rain Effect
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
    const alphabet = katakana + latin;

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * canvas.height / fontSize;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        const gradient = ctx.createLinearGradient(0, rainDrops[i] * fontSize - 20, 0, rainDrops[i] * fontSize);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.5, '#00FF88');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 100);

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        color: `hsl(${180 + Math.random() * 60}, 100%, 50%)`,
        energy: Math.random()
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;
        particle.energy = Math.sin(particle.pulse) * 0.5 + 0.5;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const glowSize = particle.size + particle.energy * 2;
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
  }, []);

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
    <div className="cyberpunk-layout-wrapper min-h-screen relative overflow-hidden">
      {/* CYBERPUNK BACKGROUND EFFECTS */}
      <canvas 
        ref={matrixCanvasRef} 
        className="fixed inset-0 pointer-events-none z-0 opacity-20" 
      />
      <canvas 
        ref={particleCanvasRef} 
        className="fixed inset-0 pointer-events-none z-1 opacity-30" 
      />
      
      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-2 opacity-10">
        <div className="cyberpunk-grid"></div>
      </div>

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-3">
        <div className="scanlines"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">
        
        {/* Left Panel - Neural Interface Info */}
        <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
          {/* Background glow for left panel */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 backdrop-blur-sm"></div>
          
          <div className="relative z-10">
            {/* Cyberpunk Logo */}
            <div className="flex items-center mb-12">
              <div className="cyber-logo h-12 w-12">
                <div className="logo-glow"></div>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold ml-4 cyberpunk-title text-cyan-400 cyber-glow">
                WHOLESALER
              </h1>
            </div>
            
            {/* Main Title */}
            <h2 className="text-5xl font-bold mb-8 cyberpunk-title">
              <span className="text-cyan-400 cyber-glow">NEURAL</span>
              <br />
              <span className="text-pink-400 cyber-glow">INTERFACE</span>
              <br />
              <span className="text-yellow-400 cyber-glow">ACCESS</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Connect to the wholesale neural network and manage your business operations 
              through our advanced quantum commerce platform.
            </p>
            
            {/* Features */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2 cyberpunk-title">QUANTUM SECURITY</h3>
                  <p className="text-gray-400">Role-based neural authentication with quantum encryption</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-2 cyberpunk-title">MULTI-PROTOCOL SUPPORT</h3>
                  <p className="text-gray-400">Advanced dashboards for all business entity types</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="feature-icon mr-6">
                  <div className="icon-glow"></div>
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2 cyberpunk-title">NEURAL COMMERCE</h3>
                  <p className="text-gray-400">AI-powered buyer and seller ecosystem integration</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="relative z-10">
            <p className="text-sm text-gray-500 font-mono">
              © {new Date().getFullYear()} NEURAL WHOLESALER CORP. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
        
        {/* Right Panel - Login Interface */}
        <div className="flex flex-col justify-center items-center p-6 md:p-12 w-full md:w-1/2 relative">
          {/* Background for right panel */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>
          
          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center mb-12">
              <div className="cyber-logo h-12 w-12">
                <div className="logo-glow"></div>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold ml-3 cyberpunk-title text-cyan-400 cyber-glow">
                WHOLESALER
              </h1>
            </div>
            
            {/* Login Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 cyberpunk-title">
                <span className="text-cyan-400 cyber-glow">ACCESS</span>
                <br />
                <span className="text-pink-400 cyber-glow">TERMINAL</span>
              </h2>
              <p className="text-gray-400 text-lg">Initialize neural connection</p>
            </div>
            
            {/* Demo Accounts Card */}
            <div className="cyber-card mb-8">
              <div className="card-glow"></div>
              <div className="card-content p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-cyan-400 font-bold text-sm cyberpunk-title">
                    DEMO PROTOCOLS
                  </p>
                  <button 
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className="cyber-btn cyber-btn-ghost text-xs py-1 px-3"
                  >
                    <span className="btn-text">{showDemoAccounts ? 'HIDE' : 'SHOW'}</span>
                    <div className="btn-glow"></div>
                  </button>
                </div>
                
                {showDemoAccounts && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => useTestAccount('admin')}
                      className="cyber-btn cyber-btn-red w-full text-xs py-2"
                    >
                      <span className="btn-text">🔴 ADMIN PROTOCOL</span>
                      <div className="btn-glow"></div>
                    </button>
                    <button 
                      onClick={() => useTestAccount('manager')}
                      className="cyber-btn cyber-btn-purple w-full text-xs py-2"
                    >
                      <span className="btn-text">🟣 MANAGER PROTOCOL</span>
                      <div className="btn-glow"></div>
                    </button>
                    <button 
                      onClick={() => useTestAccount('business_buyer')}
                      className="cyber-btn cyber-btn-blue w-full text-xs py-2"
                    >
                      <span className="btn-text">🔵 BUYER PROTOCOL</span>
                      <div className="btn-glow"></div>
                    </button>
                    <button 
                      onClick={() => useTestAccount('business_seller')}
                      className="cyber-btn cyber-btn-green w-full text-xs py-2"
                    >
                      <span className="btn-text">🟠 SELLER PROTOCOL</span>
                      <div className="btn-glow"></div>
                    </button>
                    <button 
                      onClick={() => useTestAccount('user')}
                      className="cyber-btn cyber-btn-cyan w-full text-xs py-2"
                    >
                      <span className="btn-text">🟢 USER PROTOCOL</span>
                      <div className="btn-glow"></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Error Display */}
            {(error || authError) && (
              <div className="cyber-card mb-8 border-red-600">
                <div className="card-content p-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-red-400 font-bold text-sm cyberpunk-title mb-1">
                        CONNECTION ERROR
                      </h3>
                      <p className="text-red-300 text-sm">
                        {error || authError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Status */}
            {approvalStatus && !approvalStatus.canAccess && user && (
              <div className="cyber-card mb-8 border-yellow-600">
                <div className="card-content p-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 13.5C3.312 15.333 4.27 17 5.81 17z" />
                    </svg>
                    <div>
                      <h3 className="text-yellow-400 font-bold text-sm cyberpunk-title mb-1">
                        AUTHORIZATION STATUS: {approvalStatus.status?.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p className="text-yellow-300 text-sm">
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
                <label htmlFor="email-address" className="block text-sm font-bold text-cyan-400 cyberpunk-title mb-2">
                  EMAIL PROTOCOL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="pl-12 py-4 text-lg font-mono"
                    placeholder="neural.id@corp.net"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-cyan-400 cyberpunk-title mb-2">
                  ACCESS KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="pl-12 py-4 text-lg font-mono"
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
                    className="h-4 w-4 rounded border-cyan-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-400 cyberpunk-title">
                    MAINTAIN CONNECTION
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="text-pink-400 hover:text-pink-300 cyberpunk-title cyber-glow">
                    RESET ACCESS
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="cyber-btn cyber-btn-primary w-full py-4 text-lg"
                >
                  {(loading || authLoading) ? (
                    <>
                      <div className="cyber-loading-spinner w-6 h-6 mr-3"></div>
                      <span className="btn-text">CONNECTING...</span>
                    </>
                  ) : (
                    <span className="btn-text">INITIALIZE CONNECTION</span>
                  )}
                  <div className="btn-glow"></div>
                </button>
              </div>
            </form>
            
            {/* Registration Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Need neural access credentials?
              </p>
              <Link to="/register" className="cyber-btn cyber-btn-outline">
                <span className="btn-text">REQUEST ACCESS</span>
                <div className="btn-glow"></div>
              </Link>
              <p className="text-xs mt-4 text-gray-500 font-mono">
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