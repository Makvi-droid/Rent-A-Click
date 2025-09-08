import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Search products..." }) => {
  const handleSearch = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        className="w-full px-4 py-2 pl-10 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20 focus:border-white/40 transition-all duration-200"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;