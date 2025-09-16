// components/MyRentals/MyRentalsHeader.jsx
import React from 'react';
import { Calendar, Package, User, Wallet } from 'lucide-react';

const MyRentalsHeader = ({ isVisible, user, stats, formatCurrency }) => {
  return (
    <div className={`text-center mb-12 transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Main Title */}
      <div className="relative inline-block mb-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
          My Rentals
        </h1>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>

      {/* Welcome Message */}
      <div className="mb-8">
        <p className="text-xl text-gray-300 mb-2">
          Welcome back, <span className="text-white font-semibold">{user?.displayName || 'Renter'}</span>!
        </p>
        <p className="text-gray-400">
          Track your rental history and manage your bookings
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {/* Total Rentals */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-center mb-2">
            <Package className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Rentals</div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.active}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Active</div>
        </div>

        {/* Upcoming Rentals */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.upcoming}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Upcoming</div>
        </div>

        {/* Total Spent */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group">
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-bold text-white mb-1">{formatCurrency(stats.totalSpent)}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Spent</div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default MyRentalsHeader;