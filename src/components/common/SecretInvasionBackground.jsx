// src/components/common/SecretInvasionBackground.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const SecretInvasionBackground = ({ intensity = 1, enableGlitch = true }) => {
  const { darkMode } = useTheme();
  const [morphingShapes, setMorphingShapes] = useState([]);
  const [dataNodes, setDataNodes] = useState([]);
  const [liquidBlobs, setLiquidBlobs] = useState([]);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Business/commerce morphing elements
  const businessIcons = ['📦', '🏢', '💼', '📊', '🔗', '⚡', '🌐', '🎯', '💹', '🔄', '💰', '📈'];
  const suspiciousTexts = [
    'ANALYZING MARKET PATTERNS',
    'WHO CONTROLS THE SUPPLY CHAIN',
    'DIGITAL TRANSFORMATION DETECTED',
    'TRUST NO VENDOR',
    'THE COMMERCIAL INVASION',
    'QUANTUM COMMERCE NETWORK'
  ];

  // Initialize morphing shapes
  useEffect(() => {
    const shapes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: businessIcons[Math.floor(Math.random() * businessIcons.length)],
      size: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      morphSpeed: 0.5 + Math.random() * 1,
      glitchPhase: Math.random() * Math.PI * 2
    }));
    setMorphingShapes(shapes);

    // Initialize data nodes - FIXED: corrected syntax error
    const nodes = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
      hue: Math.random() * 60 + (darkMode ? 180 : 200),
      intensity: Math.random()
    }));
    setDataNodes(nodes);

    // Initialize liquid blobs for morphing background
    const blobs = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 25 + Math.random() * 50,
      y: 25 + Math.random() * 50,
      size: 20 + Math.random() * 30,
      morphPhase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      hue: darkMode ? 180 + Math.random() * 80 : 200 + Math.random() * 60
    }));
    setLiquidBlobs(blobs);
  }, [darkMode]);

  // Continuous morphing animation
  useEffect(() => {
    const animateElements = () => {
      // Morph business icons
      setMorphingShapes(prev => prev.map(shape => ({
        ...shape,
        glitchPhase: shape.glitchPhase + shape.morphSpeed * 0.02,
        rotation: shape.rotation + shape.morphSpeed * 0.5,
        icon: Math.random() < 0.003 ? businessIcons[Math.floor(Math.random() * businessIcons.length)] : shape.icon
      })));

      // Animate data nodes
      setDataNodes(prev => prev.map(node => ({
        ...node,
        x: node.x + node.vx,
        y: node.y + node.vy,
        pulse: node.pulse + 0.05,
        vx: node.x <= 0 || node.x >= 100 ? -node.vx : node.vx,
        vy: node.y <= 0 || node.y >= 100 ? -node.vy : node.vy,
        intensity: Math.sin(node.pulse) * 0.5 + 0.5
      })));

      // Animate liquid blobs
      setLiquidBlobs(prev => prev.map(blob => ({
        ...blob,
        morphPhase: blob.morphPhase + blob.speed * 0.01,
        x: blob.x + Math.sin(blob.morphPhase) * 0.05,
        y: blob.y + Math.cos(blob.morphPhase * 0.7) * 0.05,
        size: blob.size + Math.sin(blob.morphPhase * 2) * 3
      })));

      // Random glitch intensity spikes (only if enabled)
      if (enableGlitch) {
        setGlitchIntensity(prev => {
          if (Math.random() < 0.01) return Math.random() * 5;
          return prev * 0.95;
        });
      }
    };

    const interval = setInterval(animateElements, 50);
    return () => clearInterval(interval);
  }, [enableGlitch]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: intensity }}
    >
      
      {/* Morphing liquid background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <filter id="secretInvasionGooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
              <feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7"/>
              <feBlend in="SourceGraphic" in2="gooey"/>
            </filter>
            <radialGradient id="morphingGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor={darkMode ? "#00FFFF" : "#4F46E5"} stopOpacity="0.6"/>
              <stop offset="50%" stopColor={darkMode ? "#FF00FF" : "#7C3AED"} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={darkMode ? "#FFFF00" : "#3B82F6"} stopOpacity="0.2"/>
            </radialGradient>
          </defs>
          
          <g filter="url(#secretInvasionGooey)">
            {liquidBlobs.map(blob => (
              <circle
                key={blob.id}
                cx={`${blob.x}%`}
                cy={`${blob.y}%`}
                r={`${blob.size}%`}
                fill="url(#morphingGradient)"
                style={{
                  transform: `scale(${0.8 + Math.sin(blob.morphPhase) * 0.3})`,
                  filter: `hue-rotate(${blob.hue + blob.morphPhase * 10}deg)`,
                  opacity: 0.6 + Math.sin(blob.morphPhase * 0.5) * 0.2
                }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Floating business icons with glitch effect */}
      <div className="absolute inset-0">
        {morphingShapes.map(shape => (
          <div
            key={shape.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              fontSize: `${shape.size * 2}rem`,
              transform: `translate(-50%, -50%) rotate(${shape.rotation}deg) scale(${0.8 + Math.sin(shape.glitchPhase) * 0.2})`,
              filter: `
                hue-rotate(${shape.glitchPhase * 30}deg) 
                brightness(${1.2 + Math.sin(shape.glitchPhase * 2) * 0.3})
                ${glitchIntensity > 2 ? `blur(${glitchIntensity * 0.5}px)` : ''}
              `,
              textShadow: darkMode 
                ? `0 0 ${10 + glitchIntensity * 5}px #00FFFF, 0 0 ${20 + glitchIntensity * 10}px #FF00FF`
                : `0 0 ${8 + glitchIntensity * 3}px #4F46E5, 0 0 ${15 + glitchIntensity * 6}px #7C3AED`,
              opacity: 0.3 + Math.sin(shape.glitchPhase) * 0.2,
              animation: glitchIntensity > 3 ? 'morphGlitch 0.1s infinite' : 'none'
            }}
          >
            {shape.icon}
            
            {/* Glitch overlay */}
            {glitchIntensity > 1 && (
              <>
                <div 
                  className="absolute inset-0"
                  style={{
                    color: darkMode ? '#FF00FF' : '#EC4899',
                    transform: `translate(${glitchIntensity}px, -${glitchIntensity}px)`,
                    opacity: 0.7,
                    filter: 'blur(0.5px)'
                  }}
                >
                  {shape.icon}
                </div>
                <div 
                  className="absolute inset-0"
                  style={{
                    color: darkMode ? '#00FFFF' : '#06B6D4',
                    transform: `translate(-${glitchIntensity}px, ${glitchIntensity}px)`,
                    opacity: 0.5,
                    filter: 'blur(0.5px)'
                  }}
                >
                  {shape.icon}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Data network nodes */}
      <div className="absolute inset-0">
        {dataNodes.map(node => (
          <div
            key={node.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              background: `radial-gradient(circle, hsl(${node.hue}, 100%, 70%) 0%, transparent 70%)`,
              opacity: node.intensity * 0.6,
              boxShadow: `0 0 ${8 + node.intensity * 10}px hsl(${node.hue}, 100%, 70%)`,
              transform: `scale(${0.5 + node.intensity * 0.8})`,
              filter: `hue-rotate(${node.pulse * 20}deg)`
            }}
          />
        ))}
        
        {/* Connection lines between nodes */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <defs>
            <linearGradient id="connectionGradient">
              <stop offset="0%" stopColor={darkMode ? "#00FFFF" : "#4F46E5"} stopOpacity="0"/>
              <stop offset="50%" stopColor={darkMode ? "#FF00FF" : "#7C3AED"} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={darkMode ? "#FFFF00" : "#3B82F6"} stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {dataNodes.slice(0, 8).map((node, i) => {
            const nextNode = dataNodes[(i + 1) % 8];
            return (
              <line
                key={i}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${nextNode.x}%`}
                y2={`${nextNode.y}%`}
                stroke="url(#connectionGradient)"
                strokeWidth="1"
                opacity={Math.max(node.intensity, nextNode.intensity) * 0.5}
              />
            );
          })}
        </svg>
      </div>

      {/* Suspicious text overlay (appears occasionally) */}
      {enableGlitch && glitchIntensity > 3 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`text-center ${darkMode ? 'text-cyan-400' : 'text-indigo-600'} font-mono text-lg font-bold`}
            style={{
              textShadow: darkMode 
                ? '0 0 10px #00FFFF, 0 0 20px #FF00FF' 
                : '0 0 8px #4F46E5, 0 0 15px #7C3AED',
              opacity: (glitchIntensity - 3) * 0.3,
              filter: `blur(${Math.max(0, glitchIntensity - 4)}px)`,
              animation: 'textFlicker 0.1s infinite'
            }}
          >
            {suspiciousTexts[Math.floor(Math.random() * suspiciousTexts.length)]}
          </div>
        </div>
      )}

      {/* Styles for enhanced effects */}
      <style jsx>{`
        @keyframes morphGlitch {
          0%, 100% { 
            transform: translate(-50%, -50%) rotate(0deg) scale(1) skew(0deg); 
          }
          25% { 
            transform: translate(-50%, -50%) rotate(2deg) scale(1.1) skew(1deg); 
          }
          50% { 
            transform: translate(-50%, -50%) rotate(-1deg) scale(0.9) skew(-0.5deg); 
          }
          75% { 
            transform: translate(-50%, -50%) rotate(1deg) scale(1.05) skew(0.5deg); 
          }
        }

        @keyframes textFlicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default SecretInvasionBackground;