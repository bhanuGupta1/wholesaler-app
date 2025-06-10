// src/components/common/Layout.jsx - Clean version using external CSS
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  // All original layout state and functionality
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const { darkMode } = useTheme();
  
  // Cyberpunk effect refs
  const canvasRef = useRef(null);
  const matrixRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Handle scrolling for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Detect login pages
  const isLoginPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/register' ||
                     location.pathname === '/forgot-password';

  // Advanced Particle System with Neural Networks (ENHANCED)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const particles = [];
    const particleCount = 60; // Reduced for better performance with layout
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        color: `hsl(${180 + Math.random() * 60}, 100%, 50%)`,
        energy: Math.random()
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // Lighter trail for better readability
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;
        particle.energy = Math.sin(particle.pulse) * 0.5 + 0.5;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle with glow
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

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const opacity = (1 - distance / 100) * particle.energy * 0.2;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
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

  // Matrix Rain Effect (OPTIMIZED)
  useEffect(() => {
    const canvas = matrixRef.current;
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

    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * canvas.height / fontSize;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        const gradient = ctx.createLinearGradient(0, rainDrops[i] * fontSize - 15, 0, rainDrops[i] * fontSize);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.5, '#00FF88');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 80); // Slower for better performance

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // For login pages, render without layout
  if (isLoginPage) {
    return (
      <div className="cyberpunk-login-wrapper">
        {/* Background effects for login pages too */}
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
        <canvas ref={matrixRef} className="fixed inset-0 pointer-events-none z-1 opacity-5" />
        
        <div className="fixed inset-0 pointer-events-none z-2 opacity-10">
          <div className="cyberpunk-grid"></div>
        </div>
        
        <div className="fixed inset-0 pointer-events-none z-3">
          <div className="scanlines"></div>
        </div>
        
        <main className="relative z-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="cyberpunk-layout-wrapper">
      {/* CYBERPUNK BACKGROUND EFFECTS - ALWAYS ON TOP */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <canvas ref={matrixRef} className="fixed inset-0 pointer-events-none z-1 opacity-8" />
      
      {/* Animated Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-2 opacity-15">
        <div className="cyberpunk-grid"></div>
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-3">
        <div className="scanlines"></div>
      </div>

      {/* LAYOUT CONTENT WITH CYBERPUNK STYLING */}
      <div className="cyberpunk-layout-content relative z-10 min-h-screen flex flex-col">
        
        {/* FIXED CYBERPUNK NAVBAR */}
<div className={`sticky top-0 z-40 transition-all duration-300 ${
  scrolled 
    ? 'cyber-navbar-scrolled shadow-lg' 
    : ''
}`}>
  <div className="cyber-navbar-wrapper">
    <div className="cyber-navbar-glow"></div>
    <div className="relative z-50"> {/* Ensure navbar is above glow effects */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  </div>
</div>
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-70 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* CYBERPUNK MOBILE SIDEBAR BUTTON */}
        <button
          className="cyber-fab-button fixed bottom-6 right-6 z-30 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <div className="fab-glow"></div>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        {/* CYBERPUNK SIDEBAR */}
        <div className={`cyber-sidebar fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden z-30 w-64 transition-transform duration-300 ease-in-out`}>
          <div className="sidebar-glow"></div>
          <div className="sidebar-content p-6">
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="cyber-logo">
                  <div className="logo-glow"></div>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                  </svg>
                </div>
                <h2 className="ml-3 text-xl font-bold text-cyan-400 cyber-glow">
                  WHOLESALER
                </h2>
              </div>
              <button
                className="cyber-close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* User Info */}
            {user ? (
              <div className="mb-8">
                <div className="cyber-user-card">
                  <div className="user-card-glow"></div>
                  <div className="user-avatar">
                    <div className="avatar-glow"></div>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-info">
                    <p className="user-name">{user.displayName || 'User'}</p>
                    <p className="user-email">{user.email}</p>
                    <p className="user-role">{userRole}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex justify-center">
                <Link to="/login" className="cyber-btn cyber-btn-primary">
                  <span className="btn-text">SIGN IN</span>
                  <div className="btn-glow"></div>
                </Link>
              </div>
            )}
            
            {/* Navigation Links */}
            <nav className="space-y-2">
              <Link
                to="/"
                className={`cyber-nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-link-glow"></div>
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>DASHBOARD</span>
              </Link>
              
              <Link
                to="/inventory"
                className={`cyber-nav-link ${isActive('/inventory') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-link-glow"></div>
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>INVENTORY</span>
              </Link>
              
              <Link
                to="/orders"
                className={`cyber-nav-link ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-link-glow"></div>
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>ORDERS</span>
              </Link>
              
              <Link
                to="/create-order"
                className={`cyber-nav-link ${isActive('/create-order') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-link-glow"></div>
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>NEW ORDER</span>
              </Link>
            </nav>
            
            {/* Theme Toggle and Sign Out */}
            <div className="mt-10 pt-6 border-t border-cyan-900/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">NEURAL THEME</h3>
                <ThemeToggle />
              </div>
              
              {user && (
                <button
                  onClick={handleSignOut}
                  className="cyber-signout-btn w-full"
                >
                  <div className="signout-glow"></div>
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>DISCONNECT</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* MAIN CONTENT */}
        <main className="flex-grow py-6 px-4 relative z-10">
          <div className="main-content-wrapper">
            {children}
          </div>
        </main>
        
        {/* CYBERPUNK FOOTER */}
        <footer className="cyber-footer relative z-10 mt-auto">
          <div className="footer-glow"></div>
          <div className="footer-content">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="footer-heading">CORPORATION</h3>
                  <ul className="footer-links">
                    <li><Link to="/about-us" className="footer-link">About Neural Corp</Link></li>
                    <li><a href="#" className="footer-link">Digital Careers</a></li>
                    <li><Link to="/privacy-policy" className="footer-link">Privacy Protocol</Link></li>
                    <li><Link to="/terms-of-service" className="footer-link">Terms of Interface</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="footer-heading">RESOURCES</h3>
                  <ul className="footer-links">
                    <li><Link to="/documentation" className="footer-link">Neural Documentation</Link></li>
                    <li><a href="#" className="footer-link">Interface Guides</a></li>
                    <li><a href="#" className="footer-link">API Gateway</a></li>
                    <li><Link to="/support-center" className="footer-link">Support Matrix</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="footer-heading">FEATURES</h3>
                  <ul className="footer-links">
                    <li><a href="#" className="footer-link">Quantum Inventory</a></li>
                    <li><Link to="/order-processing" className="footer-link">Neural Processing</Link></li>
                    <li><a href="#" className="footer-link">Data Analytics</a></li>
                    <li><a href="#" className="footer-link">System Integration</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="footer-heading">CONNECT</h3>
                  <ul className="footer-links">
                    <li className="footer-contact">
                      <svg className="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      +1 (555) NEURAL
                    </li>
                    <li className="footer-contact">
                      <svg className="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      contact@neural-corp.net
                    </li>
                  </ul>
                  <div className="cyber-social-links">
                    <a href="#" className="social-link">
                      <div className="social-glow"></div>
                      FB
                    </a>
                    <a href="#" className="social-link">
                      <div className="social-glow"></div>
                      TW
                    </a>
                    <a href="#" className="social-link">
                      <div className="social-glow"></div>
                      LI
                    </a>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p className="footer-copyright">
                  &copy; {new Date().getFullYear()} NEURAL WHOLESALER CORP. ALL RIGHTS RESERVED.
                </p>
                <div className="footer-made-by">
                  <p>ENGINEERED WITH ⚡ BY THE NEURAL TEAM</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;