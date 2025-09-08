import React from 'react';

const HeroSection = ({ searchTerm, onSearchChange }) => {
  const handleSearch = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Professional Photography Equipment
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Rent high-quality gear from top brands for your next photoshoot
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-12">
          <input
            type="text"
            placeholder="Search cameras, lenses, brands..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 focus:border-white/40 transition-all duration-200"
          />
          <button className="absolute right-2 top-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-md transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40">
            🔍 Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;