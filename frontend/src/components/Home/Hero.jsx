import React, { useState, useEffect } from 'react';
import { Camera, Play, ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative w-screen min-h-screen flex flex-col items-center justify-center px-4 md:px-16 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Dynamic background with parallax effect */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&h=1080&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: `${50 + (mousePosition.x - 50) * 0.02}% ${50 + (mousePosition.y - 50) * 0.02}%`,
          backgroundRepeat: "no-repeat",
          transition: 'background-position 0.3s ease-out'
        }}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Main content */}
      <div className="relative z-10 max-w-full md:max-w-6xl text-center">
        {/* Animated camera icon */}
        <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 animate-pulse">
            <Camera className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Main heading with enhanced animations */}
        <h1 className={`font-bold text-white leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-6 transition-all duration-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{transitionDelay: '300ms'}}>
          <span className="inline-block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient-x bg-300%">
            Your Shot, Your Story
          </span>
          <br />
          <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x bg-300%" style={{animationDelay: '1s'}}>
            Rent the Gear, Capture the Magic
          </span>
          
          {/* Glowing effect behind text */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-3xl -z-10 opacity-60"></div>
        </h1>

        {/* Subtitle with floating effect */}
        <p className={`mt-6 font-light text-gray-300 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '600ms'}}>
          High-quality cameras and lenses, flexible rentals, and
          <span className="text-purple-300 font-medium"> prices that fit your budget</span>
        </p>

        {/* Enhanced feature highlights */}
        <div className={`mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '800ms'}}>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Professional Grade
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Camera className="w-4 h-4 text-pink-400" />
            Latest Models
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            Instant Booking
          </div>
        </div>
      </div>

      

     

      {/* Custom styles */}
      <style jsx='true'>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
          background-size: 200% 200%;
        }
        
        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </section>
  );
}