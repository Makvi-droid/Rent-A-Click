import React, { useState, useEffect, useRef } from 'react';
import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef(null);
  const heroImages = ['📸', '🎥', '📷', '🎬'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const FloatingParticle = ({ delay, size, color }) => (
    <div 
      className={`absolute ${size} ${color} rounded-full blur-sm animate-pulse opacity-20`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${3000 + Math.random() * 2000}ms`
      }}
    />
  );

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                     linear-gradient(135deg, #0f172a 0%, #581c87 35%, #1e1b4b 70%, #0f172a 100%)`
      }}
    >
      {/* Dynamic Background Grid */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <FloatingParticle 
          key={i} 
          delay={i * 200}
          size={Math.random() > 0.5 ? 'w-2 h-2' : 'w-1 h-1'}
          color={Math.random() > 0.5 ? 'bg-purple-400' : 'bg-pink-400'}
        />
      ))}

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-pink-500/15 rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: '15%',
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`,
            animation: 'pulse 3s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 via-pink-500/10 to-purple-500/5 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) rotate(${mousePosition.x * 0.1}deg)`,
            animation: 'spin 25s linear infinite'
          }}
        />
      </div>

      {/* Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 400px at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Enhanced Emoji Animation */}
        <div className="mb-8 relative">
          <div 
            className="text-9xl mb-6 filter drop-shadow-2xl transition-all duration-500 ease-out"
            style={{
              transform: `scale(${1 + Math.sin(Date.now() * 0.002) * 0.1}) rotate(${Math.sin(Date.now() * 0.001) * 5}deg)`,
              textShadow: `0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.3)`
            }}
          >
            {heroImages[currentImageIndex]}
          </div>
          
          {/* Orbit rings around emoji */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border border-purple-400/20 rounded-full animate-spin" style={{animationDuration: '8s'}} />
            <div className="absolute w-40 h-40 border border-pink-400/10 rounded-full animate-spin" style={{animationDuration: '12s', animationDirection: 'reverse'}} />
          </div>
        </div>
        
        {/* Enhanced Typography with Stagger Animation */}
        <div className="space-y-6">
          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tight">
            <div 
              className="inline-block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent filter drop-shadow-lg"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            >
              Capture
            </div>
            <br />
            <div 
              className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent filter drop-shadow-lg"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite 0.5s'
              }}
            >
              Every Moment
            </div>
          </h1>

          <p 
            className="text-xl md:text-2xl text-gray-300/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            Professional camera equipment at your fingertips. From DSLRs to cinema cameras, 
            we make professional photography accessible to everyone.
          </p>
        </div>

        {/* Enhanced Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button 
            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-5 rounded-full text-lg font-bold overflow-hidden transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000" />
            
            <span className="relative flex items-center">
              Rent Now
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </button>
          
          <button className="group relative flex items-center space-x-4 text-white border-2 border-purple-400/50 backdrop-blur-sm px-12 py-5 rounded-full text-lg font-bold hover:bg-purple-500/20 hover:border-purple-300 transition-all duration-500 transform hover:scale-110 hover:shadow-xl">
            <div className="relative">
              <Play className="w-6 h-6 relative z-10" />
              <div className="absolute inset-0 bg-purple-400/50 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
            </div>
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="relative">
          <div 
            className="w-8 h-8 text-purple-400 mx-auto cursor-pointer hover:text-purple-300 transition-colors duration-300"
            style={{
              animation: 'bounce 2s ease-in-out infinite'
            }}
          >
            <ChevronDown className="w-full h-full" />
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-purple-400/50 to-transparent" />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}

export default Hero;