// src/pages/Login.jsx - ENHANCED with MORE ANIMATIONS
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError, loading: authLoading, user, approvalStatus, clearError } = useAuth();
  const { darkMode } = useTheme();
  
  // Canvas refs for enhanced effects
  const matrixCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Enhanced Matrix Rain with more animations
  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0).map(() => Math.random() * canvas.height / fontSize);
    const speeds = Array(columns).fill(0).map(() => 0.5 + Math.random() * 1);
    const brightness = Array(columns).fill(0).map(() => Math.random());

    const draw = () => {
      ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(240, 240, 243, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'Orbitron', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        
        // Animated brightness
        brightness[i] += (Math.random() - 0.5) * 0.1;
        brightness[i] = Math.max(0.3, Math.min(1, brightness[i]));
        
        const alpha = brightness[i];
        if (darkMode) {
          ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(34, 102, 187, ${alpha * 0.6})`;
        }
        
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        
        drops[i] += speeds[i];
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.5 + Math.random() * 1;
        }
      }
    };

    const interval = setInterval(draw, 50);
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [darkMode]);

  // Enhanced Floating Particles with interactions
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const particles = Array(60).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      pulse: Math.random() * Math.PI * 2,
      color: darkMode 
        ? `hsl(${180 + Math.random() * 80}, 100%, ${50 + Math.random() * 30}%)` 
        : `hsl(${200 + Math.random() * 60}, 70%, ${40 + Math.random() * 20}%)`,
      life: Math.random()
    }));

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(240, 240, 243, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          particle.vx += dx * 0.00005;
          particle.vy += dy * 0.00005;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.03;
        particle.life = Math.sin(particle.pulse) * 0.5 + 0.5;

        // Boundary bouncing with energy
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        const glowSize = particle.size * (1 + particle.life * 2);
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

        // Connection lines
        particles.slice(i + 1).forEach(other => {
          const dist = Math.sqrt((particle.x - other.x) ** 2 + (particle.y - other.y) ** 2);
          if (dist < 120) {
            ctx.strokeStyle = darkMode 
              ? `rgba(0, 255, 255, ${(1 - dist / 120) * 0.3})` 
              : `rgba(34, 102, 187, ${(1 - dist / 120) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [darkMode]);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Clear errors and handle login
  useEffect(() => {
    clearError();
    setError('');
  }, [credentials.email, credentials.password, clearError]);

  useEffect(() => {
    if (user && loginAttempted) {
      if (user.canAccess || (approvalStatus && !approvalStatus.canAccess)) {
        navigate('/home', { replace: true });
      }
    }
  }, [user, approvalStatus, loginAttempted, navigate]);

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      setError(error.message || 'Failed to login. Please check your credentials.');
      setLoginAttempted(false);
    } finally {
      setLoading(false);
    }
  };

  const useTestAccount = (role) => {
    const accounts = {
      admin: 'admin@wholesaler.com',
      manager: 'manager@wholesaler.com',
      business_buyer: 'buyer@wholesaler.com',
      business_seller: 'seller@wholesaler.com',
      user: 'user@wholesaler.com'
    };
    setCredentials({ email: accounts[role], password: 'password123' });
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      darkMode ? 'bg-black' : 'bg-gradient-to-br from-gray-50 to-blue-50'
    }`}>
      
      {/* Enhanced Background Effects */}
      <canvas ref={matrixCanvasRef} className="fixed inset-0 z-0" style={{ 
        opacity: darkMode ? 0.6 : 0.3,
        filter: `blur(${darkMode ? 0 : 0.5}px)`
      }} />
      <canvas ref={particleCanvasRef} className="fixed inset-0 z-1" style={{ opacity: 0.8 }} />
      
      {/* Theme-specific overlays */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-2 opacity-20 pointer-events-none animate-pulse">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 pointer-events-none">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <div className="fixed inset-0 z-2 opacity-30 pointer-events-none">
          <div className="neumorph-grid animate-pulse"></div>
        </div>
      )}

      {/* Main Content with entrance animation */}
      <div className={`relative z-10 min-h-screen flex transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 relative p-12 flex-col justify-between">
          <div className={`absolute inset-0 backdrop-blur-sm transition-all duration-700 ${
            darkMode 
              ? 'bg-gradient-to-br from-cyan-900/20 to-purple-900/20' 
              : 'bg-gradient-to-br from-blue-900/10 to-indigo-900/10'
          }`}></div>
          
          <div className="relative z-10 space-y-8 animate-fadeInLeft">
            {/* Animated Logo */}
            <div className="flex items-center group">
              <div className={`${darkMode ? 'cyber-logo' : 'neumorph-logo'} h-12 w-12 transition-all duration-300 group-hover:scale-110`}>
                {darkMode && <div className="logo-glow"></div>}
                <svg className="h-8 w-8 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                </svg>
              </div>
              <h1 className={`text-3xl font-bold ml-4 transition-all duration-300 group-hover:scale-105 ${
                darkMode ? 'cyber-title text-cyan-400 cyber-glow' : 'neumorph-title text-blue-600'
              }`}>
                WHOLESALER
              </h1>
            </div>
            
            {/* Animated Title */}
            <div className="space-y-4">
              <h2 className={`text-5xl font-bold animate-slideInUp ${darkMode ? 'cyber-title' : 'neumorph-title'}`}>
                <div className={`${darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'} animate-pulse`}>
                  {darkMode ? 'NEURAL' : 'QUANTUM'}
                </div>
                <div className={`${darkMode ? 'text-purple-400 cyber-glow' : 'text-teal-600'} animate-bounce`}>
                  INTERFACE
                </div>
                <div className={`${darkMode ? 'text-yellow-400 cyber-glow' : 'text-indigo-600'} animate-pulse`}>
                  ACCESS
                </div>
              </h2>
              
              <p className={`text-xl leading-relaxed animate-fadeIn ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {darkMode 
                  ? 'Connect to the wholesale neural network through our advanced quantum platform.'
                  : 'Experience next-generation wholesale management with sophisticated design.'
                }
              </p>
            </div>

            {/* Animated Features */}
            <div className="space-y-6">
              {[
                { icon: "🛡️", title: darkMode ? "QUANTUM SECURITY" : "ENTERPRISE SECURITY", delay: "100ms" },
                { icon: "⚡", title: darkMode ? "NEURAL PROTOCOLS" : "SMART INTERFACE", delay: "200ms" },
                { icon: "🚀", title: darkMode ? "AI COMMERCE" : "ADVANCED FEATURES", delay: "300ms" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center group animate-slideInLeft" style={{ animationDelay: feature.delay }}>
                  <div className="text-4xl mr-4 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold transition-all duration-300 group-hover:translate-x-2 ${
                    darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="flex flex-col justify-center items-center p-6 md:p-12 w-full md:w-1/2 relative">
          <div className={`absolute inset-0 backdrop-blur-md transition-all duration-700 ${
            darkMode ? 'bg-black/80' : 'bg-white/90'
          }`}></div>
          
          {/* Animated Theme Toggle */}
          <div className="absolute top-6 right-6 z-20 animate-bounceIn">
            <ThemeToggle />
          </div>
          
          <div className="w-full max-w-md relative z-10 space-y-8">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center animate-fadeInDown">
              <div className={`${darkMode ? 'cyber-logo' : 'neumorph-logo'} h-10 w-10`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h1 className={`text-2xl font-bold ml-3 ${
                darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
              }`}>WHOLESALER</h1>
            </div>
            
            {/* Login Title */}
            <div className="text-center animate-slideInUp">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'cyber-title' : 'neumorph-title'}`}>
                <span className={darkMode ? 'text-cyan-400 cyber-glow' : 'text-blue-600'}>ACCESS</span>
                <br />
                <span className={darkMode ? 'text-purple-400 cyber-glow' : 'text-indigo-600'}>
                  {darkMode ? 'TERMINAL' : 'PORTAL'}
                </span>
              </h2>
            </div>
            
            {/* Demo Accounts - Enhanced Animation */}
            <div className={`${darkMode ? 'cyber-card' : 'neumorph-card'} transition-all duration-500 hover:scale-105 animate-slideInRight`}>
              {darkMode && <div className="card-glow"></div>}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className={`font-bold text-sm ${
                    darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {darkMode ? 'DEMO PROTOCOLS' : 'TEST ACCOUNTS'}
                  </p>
                  <button 
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} text-xs transition-all duration-300 hover:scale-110`}
                  >
                    <span>{showDemoAccounts ? 'HIDE' : 'SHOW'}</span>
                  </button>
                </div>
                
                <div className={`transition-all duration-500 overflow-hidden ${
                  showDemoAccounts ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-2">
                    {[
                      { role: 'admin', emoji: '🔴', label: 'ADMIN' },
                      { role: 'manager', emoji: '🟣', label: 'MANAGER' },
                      { role: 'business_buyer', emoji: '🔵', label: 'BUYER' },
                      { role: 'business_seller', emoji: '🟠', label: 'SELLER' },
                      { role: 'user', emoji: '🟢', label: 'USER' }
                    ].map((account, i) => (
                      <button 
                        key={account.role}
                        onClick={() => useTestAccount(account.role)}
                        className={`${darkMode ? 'cyber-btn cyber-btn-ghost' : 'neumorph-btn'} w-full text-xs 
                          transition-all duration-300 hover:scale-105 animate-slideInLeft`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span>{account.emoji} {account.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error Display */}
            {(error || authError) && (
              <div className={`${darkMode ? 'cyber-card border-red-600' : 'neumorph-card border-red-400'} 
                animate-shake transition-all duration-300`}>
                <div className="p-4 flex items-center">
                  <svg className="h-6 w-6 text-red-400 mr-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className={`font-bold text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {darkMode ? 'CONNECTION ERROR' : 'Authentication Error'}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      {error || authError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6 animate-slideInUp" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label className={`block text-sm font-bold mb-2 ${
                    darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {darkMode ? 'EMAIL PROTOCOL' : 'Email'}
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    className={`w-full py-3 px-4 font-mono transition-all duration-300 group-hover:scale-105 focus:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800 border-cyan-600 text-white focus:border-cyan-400 rounded-lg border-2' 
                        : 'neumorph-input'
                    }`}
                    placeholder={darkMode ? "neural.id@corp.net" : "your@email.com"}
                    required
                  />
                </div>

                <div className="group">
                  <label className={`block text-sm font-bold mb-2 ${
                    darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {darkMode ? 'ACCESS KEY' : 'Password'}
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    className={`w-full py-3 px-4 font-mono transition-all duration-300 group-hover:scale-105 focus:scale-105 ${
                      darkMode 
                        ? 'bg-gray-800 border-cyan-600 text-white focus:border-cyan-400 rounded-lg border-2' 
                        : 'neumorph-input'
                    }`}
                    placeholder="••••••••••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`h-4 w-4 rounded transition-all duration-300 group-hover:scale-110 ${
                      darkMode ? 'text-cyan-500' : 'text-blue-500'
                    }`}
                  />
                  <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {darkMode ? 'MAINTAIN CONNECTION' : 'Remember me'}
                  </span>
                </label>

                <Link to="/forgot-password" className={`text-sm transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-800'
                }`}>
                  {darkMode ? 'RESET ACCESS' : 'Forgot password?'}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className={`${darkMode ? 'cyber-btn cyber-btn-primary' : 'neumorph-btn neumorph-btn-primary'} 
                  w-full py-4 text-lg font-bold transition-all duration-300 hover:scale-105 animate-pulse-slow
                  ${(loading || authLoading) ? 'animate-spin' : ''}`}
              >
                {(loading || authLoading) ? (
                  <span>{darkMode ? 'CONNECTING...' : 'Signing in...'}</span>
                ) : (
                  <span>{darkMode ? 'INITIALIZE CONNECTION' : 'Sign In'}</span>
                )}
              </button>
            </form>
            
            {/* Registration Link */}
            <div className="text-center animate-fadeInUp">
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {darkMode ? 'Need neural access?' : 'Need an account?'}
              </p>
              <Link to="/register" className={`${
                darkMode ? 'cyber-btn cyber-btn-outline' : 'neumorph-btn neumorph-btn-outline'
              } transition-all duration-300 hover:scale-105`}>
                <span>{darkMode ? 'REQUEST ACCESS' : 'Create Account'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-fadeInLeft { animation: fadeInLeft 0.8s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.7s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Login;