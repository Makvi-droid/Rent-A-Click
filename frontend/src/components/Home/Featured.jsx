import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, ShoppingCart, Eye } from 'lucide-react';

export default function Featured() {
  const [products, setProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    fetchProductsFromAPI();
    return () => clearTimeout(timer);
  }, []);

  const fetchProductsFromAPI = async () => {
    try {
      const response = await fetch('/api/featured-products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      await fetch('/api/featured-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct)
      });
      fetchProductsFromAPI();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
        />
      );
    }
    
    return stars;
  };

  const getBadgeColors = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'new':
        return 'from-emerald-500 to-teal-500';
      case 'popular':
        return 'from-blue-500 to-cyan-500';
      case 'best seller':
        return 'from-orange-500 to-red-500';
      case 'video pro':
        return 'from-purple-500 to-pink-500';
      case 'compact':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-emerald-500 to-teal-500';
    }
  };

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-full flex items-center justify-center border border-gray-700/50">
        <ShoppingCart className="w-12 h-12 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No Featured Products</h3>
      <p className="text-lg text-center max-w-sm">
        Products will appear here once they are added through the admin panel.
      </p>
    </div>
  );

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
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
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4">Featured Products</p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse bg-300% animate-gradient-x">
              Featured Rentals
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-2xl -z-10"></div>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our most popular cameras and gear — ready for your next capture
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center mt-8">
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id}
                className={`group relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card background */}
                <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-900/80 to-black/90 rounded-3xl border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm h-full overflow-hidden">
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-sm -z-10"></div>
                  
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Product Image */}
                  <div className="relative h-64 overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-700 to-gray-800">
                    <img 
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${getBadgeColors(product.badge)} rounded-full text-white text-xs font-bold uppercase tracking-wide shadow-lg`}>
                      {product.badge}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors duration-200">
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-baseline mb-2">
                      <div className="text-gray-400 text-xs uppercase font-semibold tracking-wide">
                        {product.specs}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-white">${product.price?.toFixed(2)}</span>
                        <span className="text-gray-400 text-sm ml-1">/ day</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-gray-400 text-sm">({product.reviews})</span>
                      </div>
                      
                      <button className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-sm hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <ShoppingCart className="w-4 h-4" />
                        Rent Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-500/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300" style={{animationDelay: '0.5s'}}></div>
                  
                  {/* Interactive arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:transform group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
        
        {/* Call to action section */}
        {products.length > 0 && (
          <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '600ms'}}>
            <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Browse All Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:-translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        )}
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