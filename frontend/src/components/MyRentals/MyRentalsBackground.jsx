// components/MyRentals/MyRentalsBackground.jsx
import React from 'react';

const MyRentalsBackground = () => {
  return (
    <>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,69,19,0.1),transparent_50%)]" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orb */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '0s', animationDuration: '4s' }} />
        
        {/* Medium floating orb */}
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '2s', animationDuration: '3s' }} />
        
        {/* Small floating orb */}
        <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse" 
             style={{ animationDelay: '1s', animationDuration: '5s' }} />
        
        {/* Extra small orb */}
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-lg animate-pulse" 
             style={{ animationDelay: '3s', animationDuration: '2.5s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }} />
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             }} />
      </div>
    </>
  );
};

export default MyRentalsBackground;