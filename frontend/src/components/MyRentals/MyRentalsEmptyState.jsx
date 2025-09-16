// MyRentalsEmptyState.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Calendar, Sparkles } from 'lucide-react';

const MyRentalsEmptyState = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBrowseItems = () => {
    navigate('/productsPage');
  };

  const handleExploreCategories = () => {
    navigate('/categories');
  };

  return (
    <div className={`
      transition-all duration-1000 transform
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      <div className="text-center py-16 px-6">
        {/* Main Icon with Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-8 rounded-full border border-gray-600/50">
              <Package className="w-20 h-20 text-gray-400" />
            </div>
            {/* Floating sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-purple-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-blue-400 animate-bounce delay-500" />
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          No Rentals Yet
        </h2>
        
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Start your rental journey! Browse our extensive collection of items and make your first booking.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Browse Items</h3>
            <p className="text-gray-400 text-sm">
              Discover thousands of items available for rent in various categories
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Booking</h3>
            <p className="text-gray-400 text-sm">
              Simple booking process with flexible dates and instant confirmation
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300 group">
            <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <Package className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Rentals</h3>
            <p className="text-gray-400 text-sm">
              Monitor your bookings, payments, and rental history all in one place
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            onClick={handleBrowseItems}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative flex items-center justify-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Browse Items</span>
            </div>
          </button>

          
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Getting Started Tips</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Find What You Need</p>
                <p className="text-gray-400">Use our search and filters to find the perfect items for your needs</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Select Your Dates</p>
                <p className="text-gray-400">Choose your rental period and check availability instantly</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Complete Booking</p>
                <p className="text-gray-400">Fill in your details and complete the secure payment process</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">4</span>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Track & Enjoy</p>
                <p className="text-gray-400">Monitor your booking status and enjoy your rental experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRentalsEmptyState;