// components/MyRentals/MyRentalsLoadingState.jsx
import React from 'react';
import { Package, Calendar, CreditCard, Clock } from 'lucide-react';

const MyRentalsLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-48 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-56 mx-auto mb-8 animate-pulse" />
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[Package, Calendar, Clock, CreditCard].map((Icon, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-gray-600 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-700/50 rounded w-12 mx-auto mb-1 animate-pulse" />
                <div className="h-3 bg-gray-700/50 rounded w-20 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Large Stats Cards Skeleton */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gray-700/50 rounded-xl p-3 animate-pulse">
                    <div className="w-6 h-6 bg-gray-600 rounded" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="h-8 bg-gray-700/50 rounded w-20 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-700/50 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="mb-6 max-w-md mx-auto">
            <div className="h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse" />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl w-24 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Rental Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 bg-blue-500/20 rounded-full w-20 animate-pulse" />
                      <div className="h-4 bg-gray-700/50 rounded w-32 animate-pulse" />
                    </div>
                    
                    <div className="h-6 bg-gray-700/50 rounded w-48 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-700/50 rounded w-64 mb-3 animate-pulse" />
                    <div className="h-4 bg-gray-700/50 rounded w-40 animate-pulse" />
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col lg:items-end gap-3">
                    <div className="text-right">
                      <div className="h-8 bg-gray-700/50 rounded w-24 mb-1 animate-pulse" />
                      <div className="h-4 bg-gray-700/50 rounded w-20 animate-pulse" />
                    </div>
                    <div className="h-10 bg-white/10 border border-white/20 rounded-lg w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Text with Spinner */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-gray-400">Loading your rentals...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRentalsLoadingState;