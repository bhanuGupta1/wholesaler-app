// src/pages/GuestDashboard.jsx - 🚀 COMPLETE THEME INTEGRATION WITH SECRETINVASION
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import SecretInvasionBackground from '../components/common/SecretInvasionBackground';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  // Canvas refs for enhanced effects
  const heroCanvasRef = useRef(null);
  const statsCanvasRef = useRef(null);

  // Get theme prefix
  const themePrefix = darkMode ? 'cyber' : 'neumorph';
  const layoutPrefix = darkMode ? 'cyberpunk' : 'neumorph';

  // Enhanced hero content with theme awareness
  const heroSlides = [
    {
      title: darkMode ? 'NEURAL WHOLESALE' : 'Smart Wholesale',
      subtitle: darkMode ? 'QUANTUM INVENTORY MATRIX' : 'Advanced Inventory Management',
      description: darkMode 
        ? 'Experience next-generation wholesale operations through our advanced neural network interface with quantum processing capabilities.'
        : 'Discover intelligent wholesale management with our sophisticated platform designed for modern businesses.',
      cta: darkMode ? 'INITIALIZE NEURAL ACCESS' : 'Start Your Journey',
      bgGradient: darkMode 
        ? 'from-cyan-900/30 via-purple-900/20 to-yellow-900/30' 
        : 'from-blue-600/20 via-indigo-600/15 to-purple-600/20'
    },
    {
      title: darkMode ? 'AI-POWERED COMMERCE' : 'Smart Commerce',
      subtitle: darkMode ? 'AUTOMATED TRADE PROTOCOLS' : 'Automated Trading Solutions',
      description: darkMode 
        ? 'Harness the power of artificial intelligence for seamless wholesale operations with real-time market analysis.'
        : 'Leverage intelligent automation to streamline your wholesale operations and maximize efficiency.',
      cta: darkMode ? 'ACTIVATE AI PROTOCOLS' : 'Explore AI Features',
      bgGradient: darkMode 
        ? 'from-purple-900/30 via-cyan-900/20 to-pink-900/30' 
        : 'from-purple-600/20 via-blue-600/15 to-teal-600/20'
    },
    {
      title: darkMode ? 'QUANTUM MARKETPLACE' : 'Global Marketplace',
      subtitle: darkMode ? 'MULTI-DIMENSIONAL TRADING' : 'Connected Trading Network',
      description: darkMode 
        ? 'Connect to the global quantum marketplace with instantaneous transactions and multi-dimensional inventory tracking.'
        : 'Join our connected global marketplace for seamless trading experiences and real-time collaboration.',
      cta: darkMode ? 'ENTER QUANTUM REALM' : 'Join Network',
      bgGradient: darkMode 
        ? 'from-yellow-900/30 via-green-900/20 to-cyan-900/30' 
        : 'from-green-600/20 via-blue-600/15 to-indigo-600/20'
    }
  ];

  // Enhanced feature data with theme awareness
  const features = [
    {
      icon: '🤖', 
      title: darkMode ? 'AI NEURAL CORE' : 'AI-Powered Intelligence',
      description: darkMode 
        ? 'Advanced artificial intelligence algorithms optimize your wholesale operations through predictive analytics and automated decision-making protocols.'
        : 'Smart AI algorithms help optimize your wholesale operations with predictive analytics and intelligent automation.',
      color: darkMode ? 'cyan' : 'blue',
      delay: '0ms'
    },
    {
      icon: '📊', 
      title: darkMode ? 'QUANTUM ANALYTICS' : 'Advanced Analytics',
      description: darkMode 
        ? 'Real-time quantum data processing provides multi-dimensional insights into market trends, inventory flow, and profit optimization vectors.'
        : 'Comprehensive analytics dashboard provides real-time insights into your business performance and market trends.',
      color: darkMode ? 'purple' : 'indigo',
      delay: '100ms'
    },
    {
      icon: '🔒', 
      title: darkMode ? 'FORTRESS SECURITY' : 'Enterprise Security',
      description: darkMode 
        ? 'Military-grade encryption protocols with quantum entanglement security ensure your data remains protected in the neural network.'
        : 'Bank-level security with advanced encryption ensures your business data and transactions are completely protected.',
      color: darkMode ? 'green' : 'teal',
      delay: '200ms'
    },
    {
      icon: '⚡', 
      title: darkMode ? 'LIGHTNING PROTOCOLS' : 'Real-time Processing',
      description: darkMode 
        ? 'Instantaneous data synchronization across the quantum network enables real-time inventory updates and transaction processing.'
        : 'Lightning-fast processing ensures real-time inventory updates, order processing, and seamless user experience.',
      color: darkMode ? 'yellow' : 'orange',
      delay: '300ms'
    },
    {
      icon: '🌐', 
      title: darkMode ? 'GLOBAL NEURAL NET' : 'Global Connectivity',
      description: darkMode 
        ? 'Connect to suppliers and buyers across the quantum marketplace with instantaneous communication and transaction capabilities.'
        : 'Connect with suppliers and buyers worldwide through our integrated global trading platform and communication tools.',
      color: darkMode ? 'pink' : 'purple',
      delay: '400ms'
    },
    {
      icon: '📱', 
      title: darkMode ? 'QR MATRIX TOOLS' : 'QR Code Integration',
      description: darkMode 
        ? 'Advanced QR protocols enable instant product scanning, inventory tracking, and quantum data transfer capabilities.'
        : 'Integrated QR code tools for instant product scanning, inventory management, and seamless mobile integration.',
      color: darkMode ? 'indigo' : 'blue',
      delay: '500ms'
    }
  ];

  // Stats data with theme awareness
  const stats = [
    { 
      value: darkMode ? '100K+' : '50K+', 
      label: darkMode ? 'NEURAL USERS' : 'Active Users', 
      icon: '👥',
      color: darkMode ? 'cyan' : 'blue'
    },
    { 
      value: darkMode ? '500M+' : '250M+', 
      label: darkMode ? 'QUANTUM TRANSACTIONS' : 'Transactions Processed', 
      icon: '💰',
      color: darkMode ? 'green' : 'teal'
    },
    { 
      value: darkMode ? '99.9%' : '99.8%', 
      label: darkMode ? 'SYSTEM UPTIME' : 'Platform Uptime', 
      icon: '⚡',
      color: darkMode ? 'yellow' : 'orange'
    },
    { 
      value: darkMode ? '24/7' : '24/7', 
      label: darkMode ? 'NEURAL SUPPORT' : 'Customer Support', 
      icon: '🛡️',
      color: darkMode ? 'purple' : 'indigo'
    }
  ];

  // Enhanced particle system for hero section
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();

    const particles = Array(80).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      size: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
      color: darkMode 
        ? `hsl(${180 + Math.random() * 80}, 100%, ${50 + Math.random() * 30}%)` 
        : `hsl(${200 + Math.random() * 60}, 70%, ${40 + Math.random() * 20}%)`,
      life: Math.random()
    }));

    const animate = () => {
      ctx.fillStyle = darkMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(240, 240, 243, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;
        particle.life = Math.sin(particle.pulse) * 0.5 + 0.5;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

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
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  // Stats animation canvas
  useEffect(() => {
    const canvas = statsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();

    const waves = Array(3).fill(0).map((_, i) => ({
      amplitude: 20 + i * 10,
      frequency: 0.02 + i * 0.01,
      phase: i * Math.PI / 3,
      speed: 0.01 + i * 0.005,
      color: darkMode 
        ? `rgba(0, 255, 255, ${0.1 - i * 0.02})` 
        : `rgba(79, 70, 229, ${0.15 - i * 0.03})`
    }));

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = canvas.height / 2 + 
                   Math.sin(x * wave.frequency + wave.phase + time * wave.speed) * wave.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const dashboardPath = user.accountType === 'admin' ? '/admin-dashboard' :
                           user.accountType === 'manager' ? '/manager-dashboard' :
                           user.accountType === 'business' ? '/business-dashboard' :
                           '/user-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, navigate]);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className={`${layoutPrefix}-layout-wrapper min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* SECRET INVASION BACKGROUND - Always enabled */}
      <SecretInvasionBackground 
        intensity={darkMode ? 0.8 : 0.6} 
        enableGlitch={darkMode} 
      />

      {/* Theme-specific background effects */}
      {darkMode ? (
        <>
          <div className="fixed inset-0 z-2 opacity-15 pointer-events-none">
            <div className="cyberpunk-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 pointer-events-none">
            <div className="scanlines"></div>
          </div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 z-2 opacity-20 pointer-events-none">
            <div className="neumorph-grid"></div>
          </div>
          <div className="fixed inset-0 z-3 opacity-10 pointer-events-none">
            <div className="neumorph-gradient"></div>
          </div>
        </>
      )}

      {/* Enhanced Theme Toggle */}
      <div className="fixed top-6 right-6 z-50 animate-bounceIn">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Enhanced Hero Section with Carousel */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <canvas ref={heroCanvasRef} className="absolute inset-0 pointer-events-none opacity-60" />
          
          <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.bgGradient} transition-all duration-1000`}></div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Hero Content */}
                <div className="space-y-8 animate-slideInLeft">
                  <div className="space-y-4">
                    <h1 className={`text-6xl md:text-7xl font-bold leading-tight transition-all duration-1000 ${
                      darkMode ? 'cyber-title cyber-glow' : 'neumorph-title neumorph-text-shadow'
                    }`}>
                      <span className={`block ${
                        darkMode ? 'text-cyan-400' : 'text-blue-600'
                      }`}>
                        {currentHero.title}
                      </span>
                    </h1>
                    
                    <h2 className={`text-2xl md:text-3xl font-bold ${
                      darkMode ? 'text-purple-400 cyber-glow' : 'text-indigo-600 neumorph-text-shadow'
                    }`}>
                      {currentHero.subtitle}
                    </h2>
                    
                    <p className={`text-xl leading-relaxed ${
                      darkMode ? 'text-cyan-200' : 'text-gray-700'
                    }`}>
                      {currentHero.description}
                    </p>
                  </div>
                  
                  {/* Enhanced CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      to="/register" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-primary ${themePrefix}-btn-dashboard group transition-all duration-300 hover:scale-105 animate-pulse-slow`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                      <span className="btn-text font-bold text-lg">{currentHero.cta}</span>
                      <svg className="btn-icon ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    
                    <Link 
                      to="/catalog" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-outline group transition-all duration-300 hover:scale-105`}
                    >
                      <span className="btn-text font-bold text-lg">
                        {darkMode ? 'EXPLORE MATRIX' : 'Browse Products'}
                      </span>
                      <svg className="btn-icon ml-3 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </Link>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex space-x-3">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                          index === currentSlide
                            ? darkMode ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-blue-600 shadow-lg shadow-blue-600/50'
                            : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Hero Visual Element */}
                <div className="relative animate-slideInRight">
                  <div className={`${themePrefix}-card p-8 transform hover:scale-105 transition-all duration-500 hover:rotate-1`}>
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="text-center space-y-6">
                      <div className="text-8xl animate-float">
                        {darkMode ? '🤖' : '🚀'}
                      </div>
                      <h3 className={`text-2xl font-bold ${
                        darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                      }`}>
                        {darkMode ? 'NEURAL POWERED' : 'Future Ready'}
                      </h3>
                      <p className={`${
                        darkMode ? 'text-cyan-200' : 'text-gray-600'
                      }`}>
                        {darkMode 
                          ? 'Advanced AI algorithms optimizing every aspect of your wholesale operations.'
                          : 'Smart technology solutions designed for modern wholesale businesses.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className={`py-20 relative ${
          darkMode ? 'bg-black/50' : 'bg-white/70'
        } backdrop-blur-lg`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              
              {/* Section Header */}
              <div className="text-center mb-16 animate-slideInUp">
                <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                }`}>
                  {darkMode ? 'NEURAL CAPABILITIES' : 'Platform Features'}
                </h2>
                <p className={`text-xl ${
                  darkMode ? 'text-cyan-200' : 'text-gray-700'
                }`}>
                  {darkMode 
                    ? 'Discover the quantum-powered features that revolutionize wholesale operations'
                    : 'Explore the intelligent features that transform your wholesale business'
                  }
                </p>
              </div>
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`${themePrefix}-feature-card group transition-all duration-500 hover:scale-105 animate-slideInUp cursor-pointer`}
                    style={{ animationDelay: feature.delay }}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    {darkMode && <div className="card-glow"></div>}
                    {!darkMode && <div className="neumorph-card-glow"></div>}
                    
                    <div className="relative z-10">
                      <div className={`${themePrefix}-feature-icon mb-6 group-hover:scale-110 transition-all duration-300`}>
                        {darkMode && <div className="icon-glow"></div>}
                        {!darkMode && <div className="neumorph-icon-glow"></div>}
                        <span className="text-5xl block transform group-hover:rotate-12 transition-transform duration-300">
                          {feature.icon}
                        </span>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-4 transition-all duration-300 ${
                        darkMode ? 'cyber-title text-cyan-400' : 'neumorph-title text-blue-600'
                      } ${hoveredFeature === index ? 'cyber-glow' : ''}`}>
                        {feature.title}
                      </h3>
                      
                      <p className={`leading-relaxed ${
                        darkMode ? 'text-cyan-200' : 'text-gray-600'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-20 relative overflow-hidden">
          <canvas ref={statsCanvasRef} className="absolute inset-0 pointer-events-none opacity-50" />
          
          <div className={`absolute inset-0 ${
            darkMode ? 'bg-gradient-to-r from-gray-900/80 to-cyan-900/20' : 'bg-gradient-to-r from-blue-600/80 to-indigo-600/20'
          } backdrop-blur-sm`}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              
              {/* Stats Header */}
              <div className="text-center mb-16 animate-slideInUp">
                <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                  darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-white'
                }`}>
                  {darkMode ? 'NEURAL NETWORK STATS' : 'Platform Statistics'}
                </h2>
                <p className={`text-xl ${
                  darkMode ? 'text-cyan-200' : 'text-white/90'
                }`}>
                  {darkMode 
                    ? 'Real-time metrics from our quantum wholesale network'
                    : 'Real-time insights from our growing wholesale platform'
                  }
                </p>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`text-center group animate-slideInUp`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`${themePrefix}-card p-8 transition-all duration-500 hover:scale-110 hover:rotate-2`}>
                      {darkMode && <div className="card-glow"></div>}
                      {!darkMode && <div className="neumorph-card-glow"></div>}
                      
                      <div className="text-5xl mb-4 animate-bounce group-hover:scale-125 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                        darkMode ? 'cyber-glow text-cyan-400' : 'text-blue-600'
                      }`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm font-medium ${
                        darkMode ? 'text-cyan-200' : 'text-gray-600'
                      }`}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className={`py-20 relative ${
          darkMode ? 'bg-black/70' : 'bg-white/80'
        } backdrop-blur-lg`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`${themePrefix}-cta-card text-center p-12 transition-all duration-500 hover:scale-105 animate-slideInUp`}>
                {darkMode && <div className="cta-glow"></div>}
                {!darkMode && <div className="neumorph-cta-glow"></div>}
                
                <div className="relative z-10 space-y-8">
                  <div className="text-6xl animate-bounce mb-8">
                    {darkMode ? '🚀' : '✨'}
                  </div>
                  
                  <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                    darkMode ? 'cyber-title cyber-glow text-cyan-400' : 'neumorph-title text-blue-600'
                  }`}>
                    {darkMode ? 'JOIN THE NEURAL REVOLUTION' : 'Ready to Transform Your Business?'}
                  </h2>
                  
                  <p className={`text-xl leading-relaxed mb-8 ${
                    darkMode ? 'text-cyan-200' : 'text-gray-700'
                  }`}>
                    {darkMode 
                      ? 'Begin your journey into the future of wholesale operations. Request access to our advanced neural network and experience quantum-powered business management.'
                      : 'Start your journey with our intelligent wholesale platform. Join thousands of businesses already transforming their operations.'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link 
                      to="/register" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-primary ${themePrefix}-btn-dashboard group transition-all duration-300 hover:scale-110`}
                    >
                      {darkMode && <div className="btn-glow"></div>}
                      {!darkMode && <div className="neumorph-btn-glow"></div>}
                      <svg className="btn-icon mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="btn-text font-bold text-lg">
                        {darkMode ? 'REQUEST NEURAL ACCESS' : 'Get Started Free'}
                      </span>
                    </Link>
                    
                    <Link 
                      to="/login" 
                      className={`${themePrefix}-btn ${themePrefix}-btn-outline group transition-all duration-300 hover:scale-110`}
                    >
                      <svg className="btn-icon mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="btn-text font-bold text-lg">
                        {darkMode ? 'EXISTING USER LOGIN' : 'Sign In'}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.8s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default GuestDashboard;