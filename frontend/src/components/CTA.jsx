import { useState, useEffect } from 'react';

function CTA() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      const rect = e.currentTarget?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const section = document.getElementById('cta-section');
    section?.addEventListener('mousemove', handleMouseMove);

    return () => section?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const createRipple = (e, buttonType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
      buttonType
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  return (
    <section 
      id="cta-section"
      className="relative py-32 overflow-hidden bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.4) 0%, transparent 50%), 
                     linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #a855f7 50%, #c026d3 75%, #86198f 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full opacity-15 animate-bounce transform translate-x-1/2 translate-y-1/2" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-24 h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-25 animate-ping transform translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '2s' }}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 border-4 border-white/20 rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-30 animate-pulse transform rotate-12"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {[...Array(48)].map((_, i) => (
              <div 
                key={i} 
                className="border border-white/20 animate-pulse" 
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '4s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Animated Title */}
        <div className={`transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-100 mb-8 leading-tight">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>Ready</span>{' '}
            <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>to</span>{' '}
            <span className="inline-block animate-bounce" style={{ animationDelay: '400ms' }}>Create</span>{' '}
            <span className="inline-block animate-bounce bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent" style={{ animationDelay: '600ms' }}>Something</span>{' '}
            <span className="inline-block animate-bounce bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent" style={{ animationDelay: '800ms' }}>Amazing?</span>
          </h2>
        </div>

        {/* Animated Subtitle */}
        <div className={`transform transition-all duration-1500 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <p className="text-2xl text-purple-100/90 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Join <span className="text-yellow-300 font-bold animate-pulse">thousands</span> of creators who trust{' '}
            <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent font-bold">Rent-a-Click</span> for their professional equipment needs. 
            Your next <span className="text-cyan-300 font-bold">masterpiece</span> is just one click away.
          </p>
        </div>
        
        {/* Enhanced Buttons */}
        <div className={`flex flex-col sm:flex-row gap-8 justify-center transform transition-all duration-1500 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Primary Button */}
          <button 
            className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 text-purple-600 px-12 py-5 rounded-full text-xl font-black shadow-2xl transform hover:scale-110 transition-all duration-500 hover:shadow-purple-500/50"
            onClick={(e) => createRipple(e, 'primary')}
          >
            {/* Button Ripples */}
            {ripples
              .filter(ripple => ripple.buttonType === 'primary')
              .map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute bg-purple-400/30 rounded-full animate-ping"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                  }}
                />
              ))}
            
            {/* Sliding Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></span>
            
            {/* Button Text */}
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              🚀 Browse Equipment
            </span>
            
            {/* Shine Effect */}
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          </button>

          {/* Secondary Button */}
          <button 
            className="group relative overflow-hidden border-3 border-white text-white px-12 py-5 rounded-full text-xl font-black transform hover:scale-110 transition-all duration-500 hover:shadow-2xl hover:shadow-white/30"
            onClick={(e) => createRipple(e, 'secondary')}
          >
            {/* Button Ripples */}
            {ripples
              .filter(ripple => ripple.buttonType === 'secondary')
              .map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute bg-white/30 rounded-full animate-ping"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: ripple.size,
                    height: ripple.size,
                  }}
                />
              ))}
            
            {/* Animated Border */}
            <span className="absolute inset-0 rounded-full border-3 border-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
            
            {/* Sliding Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-white to-purple-100 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full transform scale-0 group-hover:scale-100"></span>
            
            {/* Button Text */}
            <span className="relative z-10 group-hover:text-purple-600 transition-colors duration-300">
              💬 Contact Us
            </span>
            
            {/* Particle Effect */}
            <span className="absolute inset-0 rounded-full">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${20 + (i % 2) * 60}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                ></span>
              ))}
            </span>
          </button>
        </div>

        {/* Floating Icons */}
        <div className={`mt-20 transform transition-all duration-1500 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex justify-center space-x-12 text-4xl">
            <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2s' }}>📸</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms', animationDuration: '2s' }}>🎥</span>
            <span className="animate-bounce" style={{ animationDelay: '600ms', animationDuration: '2s' }}>🎬</span>
            <span className="animate-bounce" style={{ animationDelay: '900ms', animationDuration: '2s' }}>🔥</span>
            <span className="animate-bounce" style={{ animationDelay: '1200ms', animationDuration: '2s' }}>⭐</span>
          </div>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-purple-500/30 to-transparent blur-xl"></div>
    </section>
  );
}

export default CTA;