import { Camera, Zap, Star, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Category() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { 
      id: 1, 
      name: "DIGITAL CAMERA", 
      description: "Modern convenience meets innovation",
      image: "https://www.sony.com.ph/image/9179835e50d48589408a5d9c54c5a990?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
      color: "from-blue-400 to-cyan-400",
      bgGradient: "from-blue-900/30 to-cyan-900/30",
      glowColor: "shadow-blue-500/40",
      features: ["Smart Tech", "WiFi Ready", "Touch Screen"]
    },
    { 
      id: 2, 
      name: "DSLR CAMERA", 
      description: "Professional quality for creators",
      image: "https://m.media-amazon.com/images/I/81bWOuRQtmL._UF894,1000_QL80_.jpg",
      color: "from-purple-400 to-pink-400",
      bgGradient: "from-purple-900/30 to-pink-900/30",
      glowColor: "shadow-purple-500/40",
      features: ["Full Frame", "4K Video", "Pro Lenses"]
    },
    { 
      id: 3, 
      name: "INSTANT CAMERA", 
      description: "Capture the moment instantly",
      image: "https://www.sweelee.ph/cdn/shop/files/products_2FP16-009077_2FP16-009077_1710367373021_1200x1200.jpg?v=1717081113",
      color: "from-green-400 to-emerald-400",
      bgGradient: "from-green-900/30 to-emerald-900/30",
      glowColor: "shadow-green-500/40",
      features: ["Print Ready", "Retro Style", "Fun Filters"]
    },
    { 
      id: 4, 
      name: "LENSES", 
      description: "Perfect vision for every shot",
      image: "https://dtz3um9jw7ngl.cloudfront.net/p/m/G242329E/G242329E.jpg",
      color: "from-orange-400 to-red-400",
      bgGradient: "from-orange-900/30 to-red-900/30",
      glowColor: "shadow-orange-500/40",
      features: ["Wide Angle", "Telephoto", "Prime Lens"]
    },
    { 
      id: 5, 
      name: "MEDIA STORAGE", 
      description: "Secure your memories forever",
      image: "https://multimedia.bbycastatic.ca/multimedia/products/500x500/125/12568/12568458.jpeg",
      color: "from-teal-400 to-blue-400",
      bgGradient: "from-teal-900/30 to-blue-900/30",
      glowColor: "shadow-teal-500/40",
      features: ["High Speed", "Large Capacity", "Reliable"]
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-bold uppercase tracking-widest">Categories</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Discover Cameras
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-3xl -z-10"></div>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Browse by style, purpose, or photography type
            <span className="block text-sm text-gray-500 mt-2 italic">
              Find the perfect camera for your creative journey
            </span>
          </p>
        </div>

        {/* Category cards */}
        <div className="w-full max-w-[1400px] mx-auto">
          {/* Top row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {categories.slice(0, 3).map((category, index) => (
              <div
                key={category.id}
                className={`group relative transition-all duration-700 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glowing border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`}></div>
                
                {/* Main card */}
                <article className={`relative overflow-hidden rounded-3xl h-[500px] cursor-pointer border border-gray-700/50 hover:border-transparent transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-lg ${hoveredCard === index ? `shadow-2xl ${category.glowColor}` : 'shadow-xl shadow-black/50'}`}>
                  
                  {/* Background image with overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  </div>

                  {/* Content overlay */}
                  <div className="relative h-full flex flex-col justify-end p-8 z-10">
                    {/* Main content */}
                    <div className="transform transition-all duration-500 group-hover:-translate-y-2">
                      <h3 className={`text-4xl font-bold text-white mb-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:${category.color} group-hover:bg-clip-text group-hover:text-transparent`}>
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-300 text-lg mb-4 group-hover:text-white transition-colors duration-300">
                        {category.description}
                      </p>

                      {/* Feature tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {category.features.map((feature, featureIndex) => (
                          <span 
                            key={featureIndex}
                            className={`px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full backdrop-blur-sm border border-white/20 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:${category.color} group-hover:text-white transition-all duration-300 transform ${hoveredCard === index ? 'scale-105' : ''}`}
                            style={{ transitionDelay: `${featureIndex * 100}ms` }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Action button */}
                      <button className={`relative overflow-hidden bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105 hover:${category.glowColor} group/btn opacity-0 group-hover:opacity-100`}>
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                        
                        <span className="relative flex items-center justify-center gap-2">
                          Explore {category.name}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>


                </article>
              </div>
            ))}
          </div>

          {/* Bottom row - 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.slice(3, 5).map((category, index) => (
              <div
                key={category.id}
                className={`group relative transition-all duration-700 transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: `${(index + 3) * 200}ms` }}
                onMouseEnter={() => setHoveredCard(index + 3)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glowing border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm`}></div>
                
                {/* Main card */}
                <article className={`relative overflow-hidden rounded-3xl h-[500px] cursor-pointer border border-gray-700/50 hover:border-transparent transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-lg ${hoveredCard === index + 3 ? `shadow-2xl ${category.glowColor}` : 'shadow-xl shadow-black/50'}`}>
                  
                  {/* Background image with overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  </div>

                  {/* Content overlay */}
                  <div className="relative h-full flex flex-col justify-end p-8 z-10">
                    {/* Main content */}
                    <div className="transform transition-all duration-500 group-hover:-translate-y-2">
                      <h3 className={`text-4xl font-bold text-white mb-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:${category.color} group-hover:bg-clip-text group-hover:text-transparent`}>
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-300 text-lg mb-4 group-hover:text-white transition-colors duration-300">
                        {category.description}
                      </p>

                      {/* Feature tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {category.features.map((feature, featureIndex) => (
                          <span 
                            key={featureIndex}
                            className={`px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full backdrop-blur-sm border border-white/20 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:${category.color} group-hover:text-white transition-all duration-300 transform ${hoveredCard === index + 3 ? 'scale-105' : ''}`}
                            style={{ transitionDelay: `${featureIndex * 100}ms` }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Action button */}
                      <button className={`relative overflow-hidden bg-gradient-to-r ${category.color} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105 hover:${category.glowColor} group/btn opacity-0 group-hover:opacity-100`}>
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                        
                        <span className="relative flex items-center justify-center gap-2">
                          Explore {category.name}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className={`text-center mt-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Premium equipment rentals for every creative vision</span>
          </div>
        </div>
      </div>
    </section>
  );
}