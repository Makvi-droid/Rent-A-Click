import React, { useState, useEffect } from 'react';
import { Camera, Play, Star, Shield, Clock, Zap, ArrowRight, Menu, X, ChevronDown, Heart, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [particlePositions, setParticlePositions] = useState([]);

  

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticlePositions(prev => 
        prev.map(particle => ({
          ...particle,
          y: (particle.y + particle.speed) % 120,
          x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    const footerElement = document.getElementById('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  const socialLinks = [
    { icon: Twitter, href: '#', color: 'hover:text-blue-400', name: 'Twitter' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-400', name: 'Instagram' },
    { icon: Github, href: '#', color: 'hover:text-gray-300', name: 'GitHub' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-500', name: 'LinkedIn' }
  ];

  const footerLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Support Center', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Careers', href: '#' }
  ];

  return (
    <footer 
      id="footer"
      className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particlePositions.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              transform: `scale(${particle.size})`,
              boxShadow: '0 0 6px currentColor'
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Logo Section */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-center space-x-4 mb-6 group">
            <div className="relative">
              <Camera className="w-12 h-12 text-purple-400 transition-all duration-500 group-hover:text-pink-400 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute inset-0 w-12 h-12 bg-purple-400/20 rounded-full blur-xl group-hover:bg-pink-400/30 transition-all duration-500"></div>
            </div>
            <div className="relative">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient_3s_ease_infinite]">
                Rent-a-Click
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          </div>
          
          <p className={`text-xl text-gray-300 mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>
            Professional camera equipment rental made simple.
          </p>

          {/* Feature Pills */}
          <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '400ms' }}>
            {[
              { icon: Shield, text: 'Insured Equipment' },
              { icon: Clock, text: '24/7 Support' },
              { icon: Zap, text: 'Instant Booking' },
              { icon: Star, text: 'Premium Quality' }
            ].map((feature, index) => (
              <div 
                key={feature.text}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 group cursor-pointer"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <feature.icon className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className={`grid md:grid-cols-2 gap-12 mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '600ms' }}>
          
          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></div>
              Company
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {footerLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="group flex items-center text-gray-400 hover:text-purple-400 transition-all duration-300 py-2"
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span className="relative">
                    {link.name}
                    <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 ${
                      hoveredLink === link.name ? 'w-full' : 'w-0'
                    }`}></div>
                  </span>
                  <ArrowRight className={`w-4 h-4 ml-2 transition-all duration-300 ${
                    hoveredLink === link.name ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-0'
                  }`} />
                </a>
              ))}
            </div>
          </div>

          
        </div>

        {/* Social Media & Copyright */}
        <div className={`border-t border-white/10 pt-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '800ms' }}>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-6">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                className={`group relative p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 ${social.color} transition-all duration-300 hover:bg-white/10 hover:border-current hover:scale-110 hover:-translate-y-1`}
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <social.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  {social.name}
                </span>
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-500 flex items-center justify-center space-x-2">
              <span>© 2025 Rent-a-Click. Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span>All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"></div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </footer>
  );
}

export default Footer;