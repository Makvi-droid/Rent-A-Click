import React, { useState, useEffect } from 'react';
import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

function Featured() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Professional Grade Equipment",
      description: "Access to top-tier cameras from Canon, Nikon, Sony, and more. All equipment is regularly maintained and updated.",
      gradient: "from-blue-500 to-cyan-500",
      delay: "0ms"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Rental Periods",
      description: "From hourly rentals to monthly packages. Choose what works best for your project timeline and budget.",
      gradient: "from-purple-500 to-pink-500",
      delay: "100ms"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Full Insurance Coverage",
      description: "Complete protection for both you and our equipment. Rent with confidence knowing you're fully covered.",
      gradient: "from-emerald-500 to-teal-500",
      delay: "200ms"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Availability",
      description: "Real-time inventory tracking and instant booking. Get the equipment you need when you need it.",
      gradient: "from-orange-500 to-red-500",
      delay: "300ms"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse bg-300% animate-gradient-x">
              Why Choose Us?
            </span>
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-2xl -z-10"></div>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're not just another rental service. We're your creative partners in bringing visions to life.
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center mt-8">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: feature.delay }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card background with enhanced gradients */}
              <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 p-8 rounded-3xl border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:rotate-1 hover:shadow-2xl backdrop-blur-sm h-full">
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-sm -z-10"></div>
                
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Icon container with enhanced effects */}
                <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative overflow-hidden`}>
                  {/* Icon glow effect */}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-white">
                    {feature.icon}
                  </div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 group-hover:text-gray-300 transition-all duration-300 leading-relaxed group-hover:transform group-hover:translate-x-1">
                  {feature.description}
                </p>
                
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" style={{animationDelay: '0.5s'}}></div>
                
                {/* Interactive arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:transform group-hover:translate-x-1">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action section */}
        <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '600ms'}}>
          <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Get Started Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            {/* Button shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-700"></div>
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </section>
  );
}

export default Featured;