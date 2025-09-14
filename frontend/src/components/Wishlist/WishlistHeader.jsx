import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Star, Filter, Search, Grid, List, Package, SortAsc } from 'lucide-react';

// WishlistHeader Component
const WishlistHeader = ({ itemCount, viewMode, setViewMode, sortBy, setSortBy, searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8 rounded-2xl mb-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
            <p className="text-white/90">{itemCount} items saved for later</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search wishlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            >
              <option value="dateAdded" className="text-gray-800">Date Added</option>
              <option value="name" className="text-gray-800">Name</option>
              <option value="price" className="text-gray-800">Price</option>
            </select>
            
            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default WishlistHeader