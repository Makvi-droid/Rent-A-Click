// components/MyRentals/MyRentalsFilters.jsx
import React from 'react';
import { Search, Filter, SortDesc, Calendar, CheckCircle, Clock, AlertCircle, Package, CreditCard } from 'lucide-react';

const MyRentalsFilters = ({ 
  activeFilter, 
  setActiveFilter, 
  sortBy, 
  setSortBy, 
  searchQuery, 
  setSearchQuery, 
  totalResults,
  isVisible 
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Rentals', icon: Package, count: null },
    { value: 'active', label: 'Active', icon: Clock, count: null },
    { value: 'upcoming', label: 'Upcoming', icon: Calendar, count: null },
    { value: 'completed', label: 'Completed', icon: CheckCircle, count: null },
    { value: 'pending', label: 'Pending', icon: AlertCircle, count: null },
    { value: 'confirmed', label: 'Confirmed', icon: CreditCard, count: null }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'start-date', label: 'Start Date' },
    { value: 'amount-high', label: 'Amount: High to Low' },
    { value: 'amount-low', label: 'Amount: Low to High' }
  ];

  return (
    <div className={`mb-8 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} 
         style={{ transitionDelay: '600ms' }}>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, name, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>
      </div>

      {/* Filters and Sort Container */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {filterOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = activeFilter === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
                {option.count !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-400/20 text-blue-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sort and Results Count */}
        <div className="flex items-center space-x-4">
          {/* Results Count */}
          <div className="text-sm text-gray-400">
            <span className="font-medium text-white">{totalResults}</span> result{totalResults !== 1 ? 's' : ''}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
              <SortDesc className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className="bg-gray-800 text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilter !== 'all' || searchQuery.trim()) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          
          {activeFilter !== 'all' && (
            <div className="flex items-center space-x-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs px-3 py-1 rounded-full">
              <Filter className="w-3 h-3" />
              <span>{filterOptions.find(f => f.value === activeFilter)?.label}</span>
              <button
                onClick={() => setActiveFilter('all')}
                className="ml-1 hover:text-blue-300 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          {searchQuery.trim() && (
            <div className="flex items-center space-x-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs px-3 py-1 rounded-full">
              <Search className="w-3 h-3" />
              <span>"{searchQuery.trim()}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-purple-300 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Clear All */}
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRentalsFilters;