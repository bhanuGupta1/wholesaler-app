// src/components/common/Layout.jsx - COMPLETE INTEGRATION with SecretInvasionBackground
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';
import SecretInvasionBackground from './SecretInvasionBackground'; // ← NEW IMPORT

const Layout = ({ children }) => {
  // All original layout state and functionality
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // SecretInvasionBackground enabled by default
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, userRole } = useAuth();
  const { darkMode } = useTheme();
  
  // Cyberpunk effect refs (only for dark mode)
  const canvasRef = useRef(null);
  const matrixRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Get theme prefix based on current theme
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  const layoutPrefix = darkMode ? 'cyberpunk' : 'neumorph';

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

  // Advanced Particle System (ONLY FOR DARK MODE)
  useEffect(() => {
    if (!darkMode) return; // Skip effects in light mode
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const particles = [];
    const particleCount = 60;
    
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
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
  }, [darkMode]); // Re-run when theme changes

  // Matrix Rain Effect (ONLY FOR DARK MODE)
  useEffect(() => {
    if (!darkMode) return; // Skip effects in light mode
    
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

    const interval = setInterval(draw, 80);

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode]); // Re-run when theme changes

  // For login pages, render with appropriate theme
  if (isLoginPage) {
    return (
      <div className={`${layoutPrefix}-login-wrapper`}>
        {/* Secret Invasion Background always enabled */}
        <SecretInvasionBackground 
          intensity={0.7} 
          enableGlitch={darkMode} 
        />
        
        {/* Background effects - only for dark mode */}
        {darkMode && (
          <>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
            <canvas ref={matrixRef} className="fixed inset-0 pointer-events-none z-1 opacity-5" />
            
            <div className="fixed inset-0 pointer-events-none z-2 opacity-10">
              <div className="cyberpunk-grid"></div>
            </div>
            
            <div className="fixed inset-0 pointer-events-none z-3">
              <div className="scanlines"></div>
            </div>
          </>
        )}
        
        {/* Light mode subtle background */}
        {!darkMode && (
          <div className="fixed inset-0 pointer-events-none z-2 opacity-30">
            <div className="neumorph-grid"></div>
          </div>
        )}
        
        <main className="relative z-10">{children}</main>
      </div>
    );
  }

  return (
    <div className={`${layoutPrefix}-layout-wrapper`}>
      {/* CSS OVERRIDE FOR TRANSPARENCY */}
      <style>{`
        /* Force transparency with higher specificity */
        .layout-wrapper .force-transparent.main-content-wrapper,
        .layout-wrapper .force-transparent.neumorph-main-content-wrapper,
        .layout-wrapper main .force-transparent {
          background: transparent !important;
          border: none !important;
          backdrop-filter: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          min-height: auto !important;
        }
      `}</style>

      {/* SECRET INVASION BACKGROUND - Always enabled */}
      <SecretInvasionBackground 
        intensity={darkMode ? 0.8 : 0.6} 
        enableGlitch={darkMode} 
      />

      {/* BACKGROUND EFFECTS - Theme aware */}
      {darkMode ? (
        <>
          {/* Cyberpunk effects */}
          <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
          <canvas ref={matrixRef} className="fixed inset-0 pointer-events-none z-1 opacity-8" />
          
          <div className="fixed inset-0 pointer-events-none z-2 opacity-15">
            <div className="cyberpunk-grid"></div>
          </div>

          <div className="fixed inset-0 pointer-events-none z-3">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <>
          {/* Neumorphism effects */}
          <div className="fixed inset-0 pointer-events-none z-2 opacity-20">
            <div className="neumorph-grid"></div>
          </div>
          
          <div className="fixed inset-0 pointer-events-none z-3 opacity-10">
            <div className="neumorph-gradient"></div>
          </div>
        </>
      )}

      {/* LAYOUT CONTENT WITH THEME STYLING */}
      <div className={`${layoutPrefix}-layout-content layout-wrapper relative z-10 min-h-screen flex flex-col`}>
        
        {/* THEME-AWARE NAVBAR WITH ENHANCED MODE TOGGLE */}
        <div className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled 
            ? `${themePrefix}-navbar-scrolled shadow-lg` 
            : ''
        }`}>
          <div className={`${themePrefix}-navbar-wrapper`}>
            {darkMode && <div className="cyber-navbar-glow"></div>}
            {!darkMode && <div className="neumorph-navbar-glow"></div>}
            <div className="relative z-50">
              <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
          </div>
        </div>
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className={`fixed inset-0 z-20 ${
              darkMode 
                ? 'bg-black bg-opacity-70 backdrop-blur-sm' 
                : 'bg-white bg-opacity-70 backdrop-blur-sm'
            } lg:hidden`}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* THEME-AWARE MOBILE SIDEBAR BUTTON */}
        <button
          className={`${themePrefix}-fab-button fixed bottom-6 right-6 z-30 lg:hidden`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {darkMode && <div className="fab-glow"></div>}
          {!darkMode && <div className="neumorph-fab-glow"></div>}
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        {/* THEME-AWARE SIDEBAR */}
        <div className={`${themePrefix}-sidebar fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden z-30 w-64 transition-transform duration-300 ease-in-out`}>
          {darkMode && <div className="sidebar-glow"></div>}
          {!darkMode && <div className="neumorph-sidebar-glow"></div>}
          <div className={`${darkMode ? 'sidebar-content' : 'neumorph-sidebar-content'} p-6`}>
            
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`${themePrefix}-logo`}>
                  {darkMode && <div className="logo-glow"></div>}
                  {!darkMode && <div className="neumorph-logo-glow"></div>}
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-xl font-bold ${
                  darkMode 
                    ? 'text-cyan-400 cyber-glow' 
                    : 'text-indigo-600 neumorph-text-shadow'
                }`}>
                  WHOLESALER
                </h2>
              </div>
              <button
                className={`${themePrefix}-close-btn`}
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
                <div className={`${themePrefix}-user-card`}>
                  {darkMode && <div className="user-card-glow"></div>}
                  {!darkMode && <div className="neumorph-user-card-glow"></div>}
                  <div className={`${darkMode ? 'user-avatar' : 'neumorph-user-avatar'}`}>
                    {darkMode && <div className="avatar-glow"></div>}
                    {!darkMode && <div className="neumorph-avatar-glow"></div>}
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-info">
                    <p className={darkMode ? 'user-name' : 'neumorph-user-name'}>{user.displayName || 'User'}</p>
                    <p className={darkMode ? 'user-email' : 'neumorph-user-email'}>{user.email}</p>
                    <p className={darkMode ? 'user-role' : 'neumorph-user-role'}>{userRole}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex justify-center">
                <Link to="/login" className={`${themePrefix}-btn ${themePrefix}-btn-primary`}>
                  <span className={darkMode ? 'btn-text' : 'neumorph-btn-text'}>SIGN IN</span>
                  {darkMode && <div className="btn-glow"></div>}
                  {!darkMode && <div className="neumorph-btn-glow"></div>}
                </Link>
              </div>
            )}
            
            {/* Navigation Links */}
            <nav className="space-y-2">
              {[
                { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'DASHBOARD' },
                { to: '/inventory', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label: 'INVENTORY' },
                { to: '/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', label: 'ORDERS' },
                { to: '/create-order', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', label: 'NEW ORDER' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${themePrefix}-nav-link ${isActive(item.to) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {darkMode && <div className="nav-link-glow"></div>}
                  {!darkMode && <div className="neumorph-nav-link-glow"></div>}
                  <svg className={darkMode ? 'nav-icon' : 'neumorph-nav-icon'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Theme Toggle and Sign Out */}
            <div className={`mt-10 pt-6 border-t ${
              darkMode ? 'border-cyan-900/30' : 'border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {darkMode ? 'NEURAL THEME' : 'Interface Theme'}
                </h3>
                <ThemeToggle />
              </div>
              
              {user && (
                <button
                  onClick={handleSignOut}
                  className={`${themePrefix}-signout-btn w-full`}
                >
                  {darkMode && <div className="signout-glow"></div>}
                  {!darkMode && <div className="neumorph-signout-glow"></div>}
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{darkMode ? 'DISCONNECT' : 'Sign Out'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* MAIN CONTENT */}
        <main className="flex-grow py-6 px-4 relative z-1">
          <div 
            className={`${darkMode ? 'main-content-wrapper' : 'neumorph-main-content-wrapper'} force-transparent`}
          >
            {children}
          </div>
        </main>
        
        {/* THEME-AWARE FOOTER */}
        <footer className={`${themePrefix}-footer relative z-10 mt-auto`}>
          {darkMode && <div className="footer-glow"></div>}
          {!darkMode && <div className="neumorph-footer-glow"></div>}
          <div className={darkMode ? 'footer-content' : 'neumorph-footer-content'}>
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className={darkMode ? 'footer-heading' : 'neumorph-footer-heading'}>
                    {darkMode ? 'CORPORATION' : 'Company'}
                  </h3>
                  <ul className={darkMode ? 'footer-links' : 'neumorph-footer-links'}>
                    <li><Link to="/about-us" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'About Neural Corp' : 'About Us'}
                    </Link></li>
                    <li><a href="#" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Digital Careers' : 'Careers'}
                    </a></li>
                    <li><Link to="/privacy-policy" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Privacy Protocol' : 'Privacy Policy'}
                    </Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className={darkMode ? 'footer-heading' : 'neumorph-footer-heading'}>
                    {darkMode ? 'RESOURCES' : 'Resources'}
                  </h3>
                  <ul className={darkMode ? 'footer-links' : 'neumorph-footer-links'}>
                    <li><Link to="/documentation" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Neural Documentation' : 'Documentation'}
                    </Link></li>
                    <li><Link to="/support-center" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Support Matrix' : 'Support Center'}
                    </Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className={darkMode ? 'footer-heading' : 'neumorph-footer-heading'}>
                    {darkMode ? 'FEATURES' : 'Features'}
                  </h3>
                  <ul className={darkMode ? 'footer-links' : 'neumorph-footer-links'}>
                    <li><a href="#" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Quantum Inventory' : 'Inventory Management'}
                    </a></li>
                    <li><Link to="/order-processing" className={darkMode ? 'footer-link' : 'neumorph-footer-link'}>
                      {darkMode ? 'Neural Processing' : 'Order Processing'}
                    </Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className={darkMode ? 'footer-heading' : 'neumorph-footer-heading'}>
                    {darkMode ? 'CONNECT' : 'Contact'}
                  </h3>
                  <ul className={darkMode ? 'footer-links' : 'neumorph-footer-links'}>
                    <li className={darkMode ? 'footer-contact' : 'neumorph-footer-contact'}>
                      <svg className={darkMode ? 'contact-icon' : 'neumorph-contact-icon'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {darkMode ? '+1 (555) NEURAL' : '+1 (555) 123-4567'}
                    </li>
                    <li className={darkMode ? 'footer-contact' : 'neumorph-footer-contact'}>
                      <svg className={darkMode ? 'contact-icon' : 'neumorph-contact-icon'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {darkMode ? 'contact@neural-corp.net' : 'hello@wholesaler.com'}
                    </li>
                  </ul>
                  <div className={darkMode ? 'cyber-social-links' : 'neumorph-social-links'}>
                    {['FB', 'TW', 'LI'].map((social) => (
                      <a key={social} href="#" className={darkMode ? 'social-link' : 'neumorph-social-link'}>
                        {darkMode && <div className="social-glow"></div>}
                        {!darkMode && <div className="neumorph-social-glow"></div>}
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className={darkMode ? 'footer-bottom' : 'neumorph-footer-bottom'}>
                <p className={darkMode ? 'footer-copyright' : 'neumorph-footer-copyright'}>
                  &copy; {new Date().getFullYear()} {darkMode ? 'NEURAL WHOLESALER CORP. ALL RIGHTS RESERVED.' : 'Wholesaler Inc. All rights reserved.'}
                </p>
                <div className={darkMode ? 'footer-made-by' : 'neumorph-footer-made-by'}>
                  <p>{darkMode ? 'ENGINEERED WITH ⚡ BY THE NEURAL TEAM' : 'Made with ❤️ by our team'}</p>
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