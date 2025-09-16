// OrdersLoadingState.jsx
import React from 'react';
import { Package, BarChart3, Users, DollarSign, Loader, Sparkles } from 'lucide-react';

const OrdersLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-500/30 animate-pulse">
                <Package className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <div>
                <div className="h-8 w-64 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse"></div>
                <div className="h-4 w-40 bg-gray-700 rounded mt-2 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Package, color: 'from-blue-500 to-blue-600', title: 'Total Orders' },
            { icon: BarChart3, color: 'from-green-500 to-green-600', title: 'Revenue' },
            { icon: Users, color: 'from-purple-500 to-purple-600', title: 'Customers' },
            { icon: DollarSign, color: 'from-yellow-500 to-yellow-600', title: 'Pending' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30 relative overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="h-8 w-20 bg-gradient-to-r from-gray-600 to-gray-500 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slow"></div>
          
          <div className="flex flex-wrap items-center gap-4 relative z-10">
            {/* Search bar skeleton */}
            <div className="flex-1 min-w-[300px]">
              <div className="h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Filter dropdowns skeleton */}
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-slower"></div>
          
          {/* Table Header */}
          <div className="p-6 border-b border-gray-700/50 relative z-10">
            <div className="grid grid-cols-7 gap-4">
              {['Order ID', 'Customer', 'Status', 'Payment', 'Amount', 'Date', 'Actions'].map((_, index) => (
                <div key={index} className="h-4 bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="relative z-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, rowIndex) => (
              <div 
                key={rowIndex} 
                className="p-6 border-b border-gray-700/30 last:border-b-0"
                style={{ animationDelay: `${rowIndex * 100}ms` }}
              >
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Order ID */}
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                  
                  {/* Customer */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-32 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse"></div>
                  
                  {/* Payment Badge */}
                  <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse"></div>
                  
                  {/* Amount */}
                  <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                  
                  {/* Date */}
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-6">
          <div className="h-4 w-40 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Floating Loading Indicator */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl shadow-2xl border border-blue-500/30 flex items-center space-x-3">
            <Loader className="w-5 h-5 text-white animate-spin" />
            <span className="text-white font-medium">Loading orders...</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        @keyframes shimmer-slower {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite;
        }
        
        .animate-shimmer-slower {
          animation: shimmer-slower 4s infinite;
        }
        
        /* Staggered animation for table rows */
        .p-6:nth-child(1) { animation-delay: 0ms; }
        .p-6:nth-child(2) { animation-delay: 100ms; }
        .p-6:nth-child(3) { animation-delay: 200ms; }
        .p-6:nth-child(4) { animation-delay: 300ms; }
        .p-6:nth-child(5) { animation-delay: 400ms; }
        .p-6:nth-child(6) { animation-delay: 500ms; }
        .p-6:nth-child(7) { animation-delay: 600ms; }
        .p-6:nth-child(8) { animation-delay: 700ms; }
        
        /* Pulse animation with different speeds */
        .animate-pulse:nth-child(odd) {
          animation-duration: 1.5s;
        }
        
        .animate-pulse:nth-child(even) {
          animation-duration: 2s;
        }
      `}</style>
    </div>
  );
};

export default OrdersLoadingState;