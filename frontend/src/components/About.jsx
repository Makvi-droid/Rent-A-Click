import { useState, useEffect } from 'react';

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = [
    { icon: "📸", name: "Photography", gradient: "from-blue-400 to-purple-600", delay: "0s" },
    { icon: "🎥", name: "Videography", gradient: "from-purple-400 to-pink-600", delay: "0.1s" },
    { icon: "💡", name: "Lighting", gradient: "from-pink-400 to-red-500", delay: "0.2s" },
    { icon: "🎬", name: "Cinema", gradient: "from-red-400 to-orange-500", delay: "0.3s" },
  ];

  const stats = [
    { value: "50+", label: "Equipment Pieces", color: "text-purple-400", gradient: "from-purple-400 to-purple-600" },
    { value: "Ready", label: "For Launch", color: "text-pink-400", gradient: "from-pink-400 to-pink-600" },
    { value: "24/7", label: "Support", color: "text-blue-400", gradient: "from-blue-400 to-blue-600" },
  ];

  return (
    <section id="about" className="relative py-24 overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                About Rent-a-Click
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur-xl opacity-20 animate-pulse" />
            </h2>
            
            <div className="space-y-6 mb-12">
              <p className="text-xl text-gray-300 leading-relaxed transform transition-all duration-700 hover:text-white hover:scale-105 hover:translate-x-2">
                Founded by passionate photographers and filmmakers, Rent-a-Click bridges the gap between 
                professional equipment and creative ambition. We believe that great ideas shouldn't be 
                limited by access to expensive gear.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed transform transition-all duration-700 hover:text-gray-200 hover:scale-105 hover:translate-x-2">
                Our mission is simple: make professional photography and videography equipment accessible 
                to creators at every level. Whether you're a seasoned professional or just starting your 
                creative journey, we have the tools you need to bring your vision to life.
              </p>
            </div>

            {/* Enhanced Stats */}
            <div className="flex space-x-8 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className={`relative text-4xl font-bold ${stat.color} mb-2 transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`}>
                    <span className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
                  </div>
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Interactive Visual Side */}
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="relative bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-3xl p-8 backdrop-blur-xl border border-purple-500/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
              
              {/* Glowing Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/50 to-pink-500/50 opacity-0 blur-xl transition-opacity duration-500 hover:opacity-30" />
              
              {/* Grid of Category Cards */}
              <div className="relative grid grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className={`relative bg-gray-900/50 rounded-2xl p-6 text-center backdrop-blur-sm border border-gray-700/50 cursor-pointer transform transition-all duration-500 hover:scale-110 hover:rotate-3 hover:border-white/50 group overflow-hidden`}
                    style={{ animationDelay: category.delay }}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Card Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 transition-all duration-500 rounded-2xl`} />
                    
                    {/* Animated Icon */}
                    <div className={`text-6xl mb-4 transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ${hoveredCard === index ? 'animate-bounce' : ''}`}>
                      {category.icon}
                    </div>
                    
                    {/* Category Name */}
                    <div className={`text-white font-semibold text-lg transform transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r ${category.gradient} group-hover:bg-clip-text`}>
                      {category.name}
                    </div>
                    
                    {/* Floating Particles for Each Card */}
                    {hoveredCard === index && [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Central Glow Effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl animate-pulse" />
            </div>
            
            {/* Floating Ring Animation */}
            <div className="absolute -top-4 -left-4 w-20 h-20 border-2 border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 border-2 border-pink-500/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-300% { background-size: 300% 300%; }
      `}</style>
    </section>
  );
}

export default About;