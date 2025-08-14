import React, { useState, useEffect } from 'react';
import { Camera, Search, X, Zap, ArrowRight } from 'lucide-react';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Sample images with different aspect ratios to create the masonry effect
  const images = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop&crop=entropy&auto=format",
      alt: "Mountain landscape at sunrise",
      span: "row-span-2",
      category: "Landscape"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Dense forest canopy",
      span: "row-span-1",
      category: "Nature"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Ocean waves",
      span: "row-span-1",
      category: "Seascape"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=800&fit=crop&crop=entropy&auto=format",
      alt: "Rolling hills",
      span: "row-span-2",
      category: "Landscape"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Tropical beach",
      span: "row-span-1",
      category: "Travel"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Desert dunes",
      span: "row-span-1",
      category: "Desert"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Misty lake",
      span: "row-span-1",
      category: "Nature"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&crop=entropy&auto=format",
      alt: "Wide mountain vista",
      span: "col-span-2 row-span-1",
      category: "Panorama"
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop&crop=entropy&auto=format",
      alt: "Starry night sky",
      span: "row-span-1",
      category: "Astrophotography"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-50"></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-pink-900/10"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6">
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-bold uppercase tracking-widest">Gallery</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Your Next Masterpiece
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-3xl -z-10"></div>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Be inspired by the incredible moments our customers have captured
            <span className="block text-sm text-gray-500 mt-2 italic">
              Shot with our professional equipment
            </span>
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[200px]">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`${image.span} group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              } hover:scale-[1.02] hover:-translate-y-2`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setSelectedImage(image)}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm -z-10"></div>
              
              {/* Main image container */}
              <div className="relative h-full border border-gray-700/50 group-hover:border-transparent rounded-3xl overflow-hidden backdrop-blur-lg shadow-xl shadow-black/50 group-hover:shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-500">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Purple/pink gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                  {image.category}
                </div>

                {/* Search icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border border-white/20">
                  <Search className="w-5 h-5 text-white" />
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                  <h3 className="text-white font-bold text-lg mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text group-hover:text-white transition-all duration-300">
                    {image.alt}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Camera className="w-4 h-4" />
                    <span>Professional Shot</span>
                  </div>
                </div>

                {/* Hover effect particles */}
                {hoveredImage === image.id && (
                  <>
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-60"></div>
                    <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-60"></div>
                  </>
                )}

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-br-3xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for selected image */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] animate-in fade-in zoom-in duration-500">
              {/* Glowing effect around modal */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-3xl blur-2xl animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl overflow-hidden border border-purple-400/30 backdrop-blur-lg">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-full object-contain rounded-3xl"
                />
                
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-full flex items-center justify-center hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 border border-purple-400/30"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {selectedImage.alt}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <span>{selectedImage.category}</span>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full border border-purple-400/30">
                          Professional Equipment
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className={`text-center mt-20 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
          {/* Main CTA container with enhanced styling */}
          <div className="relative inline-block">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-xl animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 rounded-2xl p-8 border border-purple-400/30 backdrop-blur-lg">
              {/* Decorative elements */}
              <div className="absolute top-0 left-1/4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-lg"></div>
              <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-lg"></div>
              
              <div className="relative z-10">
                {/* Enhanced heading */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Ready to Create Magic?
                </h3>
                
                <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Join thousands of creators who trust our equipment to bring their vision to life
                </p>
                
                {/* Enhanced CTA button */}
                <button className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 mb-6">
                  {/* Button shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Button glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
                  
                  <span className="relative flex items-center gap-3">
                    <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Start Creating Today
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                
                {/* Statistics or features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">500+</div>
                    <div className="text-gray-400 text-sm">Professional Cameras</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
                    <div className="text-gray-400 text-sm">Customer Support</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">4.9★</div>
                    <div className="text-gray-400 text-sm">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline - moved to very bottom */}
        <div className={`text-center mt-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '1200ms' }}>
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">Professional Equipment</span>
            </div>
            <div className="w-1 h-4 bg-gradient-to-b from-purple-400/50 to-pink-400/50 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300 font-medium">Amazing Results</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}