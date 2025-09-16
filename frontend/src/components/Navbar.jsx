import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown, Sparkles, Link, Search, Heart, ShoppingBag, User } from 'lucide-react';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Add useNavigate hook
  const navigate = useNavigate();
  
  // Navigation handlers - Fixed to actually navigate
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);

    // For React Router:
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Floating particles animation
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <>
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {particles.map((i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-40"
            style={{
              left: `${20 + (i * 15)}%`,
              animationDelay: `${i * 0.5}s`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent'
      }`}>
        {/* Animated gradient border */}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-opacity duration-700 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-purple-600/5 transition-opacity duration-700 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div 
              className="flex items-center space-x-3 group cursor-pointer"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => handleNavigation('/')}
            >
              <div className="relative">
                {/* Logo placeholder - replace with your actual logo */}
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 group-hover:scale-110">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                
                {/* Animated pulse rings */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 animate-ping opacity-20 group-hover:opacity-40" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping opacity-50" />
                </div>
                
                {/* Floating sparkles */}
                {isHovering && (
                  <div className="absolute -top-2 -left-2 w-3 h-3 text-yellow-300 animate-bounce">
                    <Sparkles className="w-3 h-3" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
                {isHovering && (
                  <div className="absolute -bottom-2 -right-2 w-2 h-2 text-pink-300 animate-bounce">
                    <div className="w-2 h-2 bg-pink-300 rounded-full" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
              
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent relative group-hover:scale-105 transition-transform duration-300">
                Rent-a-Click
                {/* Animated underline */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-500" />
              </span>
            </div>
            
            {/* Enhanced Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', href: '/homePage', icon: Sparkles },
                { name: 'Browse Cameras', href: '/productsPage', icon: Camera },
                { name: 'My Rentals', href: '/rentals', icon: Clock },
                { name: 'Wishlist', href: '/wishlistPage', icon: Heart }
              ].map((item, index) => (
                <button 
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="relative text-gray-300 hover:text-white transition-all duration-300 font-medium group py-2 px-3"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </span>
                  {/* Hover background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
                  {/* Animated border */}
                  <div className="absolute inset-0 border border-purple-400/0 group-hover:border-purple-400/50 rounded-lg transition-all duration-300" />
                  {/* Bottom glow */}
                  <div className="absolute -bottom-1 left-1/2 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300" />
                </button>
              ))}
              
              

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                {/* Cart */}
                <button 
                  className="relative p-2 text-gray-300 hover:text-white transition-all duration-300 group"
                  onClick={() => handleNavigation('/cartPage')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <ShoppingBag className="w-5 h-5 relative z-10" />
                  {/* Cart count badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                </button>

                {/* User Profile - Fixed navigation path */}
                <button 
                  className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  onClick={() => handleNavigation("/profilePage")}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </span>
                  
                  {/* Animated background layers */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  {/* Pulse effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-ping opacity-20" />
                </button>
              </div>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button 
              className="md:hidden relative p-2 text-gray-300 hover:text-white transition-all duration-300 group"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 relative z-10 transform rotate-0 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu - FIXED HEIGHT CONSTRAINTS */}
        <div className={`md:hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 transform translate-y-0' 
            : 'max-h-0 opacity-0 transform -translate-y-4'
        } overflow-hidden bg-black/95 backdrop-blur-xl border-t border-purple-500/30`}>
          {/* Menu background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-pink-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-pink-500/5" />
          
          <div className="px-6 py-6 space-y-4 relative z-10">
            {/* Mobile Search */}
            <div className="relative group mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search cameras..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = e.target.value;
                    if (searchTerm.trim()) {
                      handleNavigation(`/search?q=${encodeURIComponent(searchTerm)}`);
                      setIsMobileMenuOpen(false);
                    }
                  }
                }}
              />
            </div>

            {[
              { name: 'Home', href: '/homePage', icon: Sparkles },
              { name: 'Browse Cameras', href: '/productsPage', icon: Camera },
              { name: 'My Rentals', href: '/rentals', icon: Clock },
              { name: 'Wishlist', href: '/wishlistPage', icon: Heart }
            ].map((item, index) => (
              <button 
                key={item.name}
                onClick={() => {
                  handleNavigation(item.href);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-300 hover:text-white transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-transparent hover:border-purple-400/30 transform hover:translate-x-2"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: isMobileMenuOpen ? 'slideInLeft 0.5s ease-out forwards' : 'none'
                }}
              >
                <span className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-purple-400" />
                  <span>{item.name}</span>
                </span>
              </button>
            ))}

            {/* Mobile User Actions */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
              <button 
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
                onClick={() => {
                  handleNavigation("/cartPage");
                  setIsMobileMenuOpen(false);
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart (3)</span>
              </button>
              
              <button 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden group flex items-center justify-center space-x-2"
                onClick={() => {
                  handleNavigation("/profilePage");
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideInLeft {
          0% { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;